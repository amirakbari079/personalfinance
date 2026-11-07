package com.personalfinance.foundation;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.personalfinance.account.service.AccountService;
import com.personalfinance.account.service.AccountSnapshotService;
import com.personalfinance.balance.service.BalanceSheetService;
import com.personalfinance.common.JalaliDateConverter;
import com.personalfinance.history.service.ValueSnapshotService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

/** Real PostgreSQL, fixed disposable database, opt-in only. Every test rolls back. */
@EnabledIfEnvironmentVariable(named = "PF_TEST_DB_PASSWORD", matches = ".+")
@DataJpaTest(showSql = false, properties = {
    "spring.datasource.url=jdbc:postgresql://127.0.0.1:5432/personalfinance_foundation_integration_test",
    "spring.datasource.username=postgres", "spring.datasource.password=${PF_TEST_DB_PASSWORD}",
    "spring.jpa.hibernate.ddl-auto=validate", "logging.level.root=WARN"
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import({LedgerService.class, ManagementService.class, ValueSnapshotService.class,
    BalanceSheetService.class, JalaliDateConverter.class, AuditTransactionAspect.class,
    AccountService.class, AccountSnapshotService.class, com.personalfinance.history.service.AggregateHistoryService.class, LedgerIntegrationTest.Config.class})
class LedgerIntegrationTest {
    @TestConfiguration
    @EnableAspectJAutoProxy
    @EnableTransactionManagement(order = 0)
    static class Config {
        @Bean ObjectMapper objectMapper() { return new ObjectMapper().findAndRegisterModules(); }
    }
    @Autowired LedgerService ledger;
    @Autowired JdbcTemplate jdbc;
    @Autowired AccountService accounts;
    @Autowired AccountSnapshotService history;
    @Autowired com.personalfinance.history.service.AggregateHistoryService analytics;
    @Autowired org.springframework.transaction.PlatformTransactionManager transactions;

    private long account(long balance) {
        assertThat(jdbc.queryForObject("select current_database()", String.class))
            .isEqualTo("personalfinance_foundation_integration_test");
        long id = jdbc.queryForObject("insert into accounts(name,type,balance,created_at) values('integration','BANK',?,now()) returning id", Long.class, balance);
        ledger.open(id, balance, LedgerService.today());
        return id;
    }
    private long balance(long id) {
        return jdbc.queryForObject("select balance from accounts where id=?", Long.class, id);
    }
    private LedgerService.Command command(UUID key, String kind, long account, Long destination, long amount, Long version) {
        return new LedgerService.Command(key,kind,account,destination,amount,LedgerService.today(),"integration",null,null,version);
    }

    @Test void transferIsBalancedIdempotentAndReversible() {
        long a=account(1000), b=account(200);
        var c=command(UUID.randomUUID(),"TRANSFER",a,b,300,0L);
        var first=ledger.post(c);
        assertThat(ledger.post(c).get("id")).isEqualTo(first.get("id"));
        assertThat(balance(a)).isEqualTo(700);
        assertThat(balance(b)).isEqualTo(500);
        assertThat(jdbc.queryForObject("select sum(amount) from pf_transaction_entries where transaction_id=?",Long.class,first.get("id"))).isZero();
        ledger.reverse(((Number)first.get("id")).longValue(), new LedgerService.Reversal(UUID.randomUUID(),"test reversal"));
        assertThat(balance(a)).isEqualTo(1000);
        assertThat(balance(b)).isEqualTo(200);
    }

    @Test void rejectsReusingIdempotencyKeyForDifferentData() {
        long a=account(1000); UUID key=UUID.randomUUID();
        ledger.post(command(key,"EXPENSE",a,null,20,0L));
        assertThatThrownBy(()->ledger.post(command(key,"EXPENSE",a,null,30,null))).isInstanceOf(IllegalStateException.class);
        assertThat(balance(a)).isEqualTo(980);
    }

    @Test void rejectsStaleBalanceAndDatesBeforeCutover() {
        long a=account(1000);
        assertThatThrownBy(()->ledger.post(command(UUID.randomUUID(),"EXPENSE",a,null,20,5L))).isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(()->ledger.post(new LedgerService.Command(UUID.randomUUID(),"INCOME",a,null,50L,LocalDate.of(2020,1,1),"old",null,null,0L))).isInstanceOf(IllegalArgumentException.class);
        assertThat(balance(a)).isEqualTo(1000);
    }

    @Test void correctionCreatesTraceableDelta() {
        long a=account(1000);
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("integration-user","",java.util.List.of()));
        try {
            var result=ledger.adjust(new LedgerService.Adjustment(UUID.randomUUID(),a,1200L,LedgerService.today(),"counted cash",0L));
            assertThat(balance(a)).isEqualTo(1200);
            assertThat(jdbc.queryForObject("select amount from pf_transaction_entries where transaction_id=?",Long.class,result.get("id"))).isEqualTo(200);
            assertThat(jdbc.queryForObject("select actor from pf_audit_events where entity_type='accounts' and entity_id=? order by id desc limit 1",String.class,Long.toString(a))).isEqualTo("integration-user");
        } finally { SecurityContextHolder.clearContext(); }
    }

    @Test void ledgerMustNotOverwritePreExistingHistoryEvenOnCutoverDay() {
        long a=account(1000);
        jdbc.update("insert into value_snapshots(entity_type,entity_id,value,recorded_date,notes,created_at) values('ACCOUNT',?,1000,?,'original history',now())",a,LedgerService.today());
        String before=jdbc.queryForObject("select row_to_json(t)::text from value_snapshots t where entity_type='ACCOUNT' and entity_id=?",String.class,a);
        ledger.post(command(UUID.randomUUID(),"INCOME",a,null,50,0L));
        assertThat(jdbc.queryForObject("select row_to_json(t)::text from value_snapshots t where entity_type='ACCOUNT' and entity_id=?",String.class,a)).isEqualTo(before);
        assertThat(history.list(a)).hasSize(2);
        assertThat(history.list(a).getFirst().value()).isEqualTo(1050);
    }

    private com.personalfinance.account.dto.AccountRequest request(String name,long balance,Long version) {
        var r=new com.personalfinance.account.dto.AccountRequest();
        r.setName(name);r.setBalance(balance);r.setVersion(version);
        r.setType(com.personalfinance.account.entity.AccountType.BANK);return r;
    }

    @Test void createdAccountOpensLedgerAndMetadataEditPreservesBalance() {
        var a=accounts.create(request("new account",1000,null));
        var updated=accounts.update(a.getId(),request("renamed",1000,a.getVersion()));
        assertThat(updated.getVersion()).isEqualTo(a.getVersion()+1);
        ledger.post(command(UUID.randomUUID(),"EXPENSE",a.getId(),null,100,updated.getVersion()));
        assertThat(balance(a.getId())).isEqualTo(900);
        assertThat(history.list(a.getId())).hasSize(2);
        assertThat(analytics.getAccountTotalSeries()).isNotEmpty();
    }

    @Test void archiveAndRestoreRetainHistoryAndOpeningState() {
        var a=accounts.create(request("archive test",0,null));
        int count=history.list(a.getId()).size();
        accounts.archive(a.getId(),a.getVersion());
        assertThat(accounts.findAll()).noneMatch(r->r.getId().equals(a.getId()));
        var archived=accounts.findAll(true).stream().filter(r->r.getId().equals(a.getId())).findFirst().orElseThrow();
        assertThat(history.list(a.getId())).hasSize(count);
        assertThat(jdbc.queryForObject("select count(*) from pf_ledger_accounts where account_id=?",Long.class,a.getId())).isEqualTo(1);
        accounts.restore(a.getId(),archived.getVersion());
        assertThat(accounts.findAll()).anyMatch(r->r.getId().equals(a.getId()));
    }

    @Test void legacyWritePathsCannotEraseHistoryOrBypassLedger() {
        var a=accounts.create(request("protected",1000,null));
        assertThatThrownBy(()->accounts.update(a.getId(),request("bypass",400,a.getVersion()))).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(()->accounts.archive(a.getId(),a.getVersion())).isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(()->history.delete(a.getId(),history.list(a.getId()).getFirst().id())).isInstanceOf(IllegalStateException.class);
        assertThat(balance(a.getId())).isEqualTo(1000);
        assertThat(history.list(a.getId())).hasSize(1);
    }

    @Test
    @org.springframework.transaction.annotation.Transactional(propagation=org.springframework.transaction.annotation.Propagation.NOT_SUPPORTED)
    void failedTransferRollsBackBothSidesAndAudit() {
        long before=jdbc.queryForObject("select count(*) from pf_audit_events",Long.class);
        long[] ids=new long[2];
        var tx=new org.springframework.transaction.support.TransactionTemplate(transactions);
        assertThatThrownBy(()->tx.execute(status->{
            ids[0]=account(1000);ids[1]=account(9007199254740991L);
            ledger.post(command(UUID.randomUUID(),"TRANSFER",ids[0],ids[1],100,0L));
            return null;
        })).isInstanceOf(IllegalArgumentException.class);
        assertThat(jdbc.queryForObject("select count(*) from accounts where id in (?,?)",Long.class,ids[0],ids[1])).isZero();
        assertThat(jdbc.queryForObject("select count(*) from pf_audit_events",Long.class)).isEqualTo(before);
    }

    @Test void reversingTodayDoesNotRewriteYesterdayIncome() {
        long a=jdbc.queryForObject("insert into accounts(name,type,balance,created_at) values('historical test','CASH',0,now()) returning id",Long.class);
        var yesterday=LedgerService.today().minusDays(1);
        ledger.open(a,0,yesterday);
        var tx=ledger.post(new LedgerService.Command(UUID.randomUUID(),"INCOME",a,null,80L,yesterday,"yesterday",null,null,0L));
        var income=ledger.summary(yesterday,yesterday).get("income");
        ledger.reverse(((Number)tx.get("id")).longValue(),new LedgerService.Reversal(UUID.randomUUID(),"correct today"));
        assertThat(ledger.summary(yesterday,yesterday).get("income")).isEqualTo(income);
        assertThat(balance(a)).isZero();
    }
}
