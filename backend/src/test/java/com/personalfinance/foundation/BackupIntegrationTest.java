package com.personalfinance.foundation;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.personalfinance.backup.BackupService;
import com.personalfinance.backup.BackupStorage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import javax.sql.DataSource;
import java.nio.file.Path;
import java.util.UUID;
import static org.assertj.core.api.Assertions.*;

@EnabledIfEnvironmentVariable(named="PF_TEST_DB_PASSWORD",matches=".+")
@DataJpaTest(showSql=false,properties={
 "spring.datasource.url=jdbc:postgresql://127.0.0.1:5432/personalfinance_foundation_integration_test",
 "spring.datasource.username=postgres","spring.datasource.password=${PF_TEST_DB_PASSWORD}",
 "spring.jpa.hibernate.ddl-auto=validate","logging.level.root=WARN"})
@AutoConfigureTestDatabase(replace=AutoConfigureTestDatabase.Replace.NONE)
@Transactional(propagation=Propagation.NOT_SUPPORTED)
class BackupIntegrationTest {
 @Autowired DataSource dataSource;
 @Autowired JdbcTemplate jdbc;
 @TempDir Path directory;

 @Test void roundTripPreservesLedgerHistoryJsonAndAudit() throws Exception {
  assertThat(jdbc.queryForObject("select current_database()",String.class)).isEqualTo("personalfinance_foundation_integration_test");
  var service=new BackupService(dataSource,new BackupStorage(directory.toString()),new ObjectMapper().findAndRegisterModules());
  var baseline=service.create();
  try {
   long account=jdbc.queryForObject("insert into accounts(name,type,balance,created_at) values('backup test','CASH',1200,now()) returning id",Long.class);
   jdbc.update("insert into pf_ledger_accounts(account_id,opening_date,opening_balance) values(?,current_date,1000)",account);
   long tx=jdbc.queryForObject("insert into pf_transactions(request_key,request_hash,kind,effective_date,description) values(?,'test','INCOME',current_date,'backup integration') returning id",Long.class,UUID.randomUUID());
   jdbc.update("insert into pf_transaction_entries(transaction_id,account_id,amount) values(?,?,200)",tx,account);
   String original=fingerprint("accounts");
   String ledger=fingerprint("pf_transactions");
   String audit=fingerprint("pf_audit_events");
   String catalog=fingerprint("pf_catalog");
   var saved=service.create();
   jdbc.update("update accounts set name='changed' where id=?",account);
   service.restore(saved.getFilename());
   assertThat(fingerprint("accounts")).isEqualTo(original);
   assertThat(fingerprint("pf_transactions")).isEqualTo(ledger);
   assertThat(fingerprint("pf_catalog")).isEqualTo(catalog);
   assertThat(fingerprint("pf_audit_events")).isEqualTo(audit);
   assertThat(jdbc.queryForObject("select amount from pf_transaction_entries where transaction_id=?",Long.class,tx)).isEqualTo(200);
   assertThat(jdbc.queryForObject("select safety_backup_filename from pf_restore_events order by id desc limit 1",String.class))
       .satisfies(name -> assertThat(directory.resolve(name)).exists());

   // Missing tables must be rejected before any data is removed.
   var mapper=new ObjectMapper().findAndRegisterModules();
   var document=mapper.readTree(directory.resolve(saved.getFilename()).toFile());
   ((com.fasterxml.jackson.databind.node.ObjectNode)document.get("tables")).remove("accounts");
   String incomplete=new BackupStorage(directory.toString()).newFilename();
   mapper.writeValue(directory.resolve(incomplete).toFile(),document);
   assertThatThrownBy(()->service.restore(incomplete)).isInstanceOf(IllegalArgumentException.class);
   assertThat(fingerprint("accounts")).isEqualTo(original);
   assertThat(fingerprint("pf_audit_events")).isEqualTo(audit);

   // A constraint error during restore must roll back the entire replacement.
   document=mapper.readTree(directory.resolve(saved.getFilename()).toFile());
   var entries=document.get("tables").get("pf_transaction_entries");
   ((com.fasterxml.jackson.databind.node.ObjectNode)entries.get(0)).put("account_id",Long.MAX_VALUE);
   String invalid=new BackupStorage(directory.toString()).newFilename();
   mapper.writeValue(directory.resolve(invalid).toFile(),document);
   assertThatThrownBy(()->service.restore(invalid)).isInstanceOf(IllegalStateException.class);
   assertThat(fingerprint("accounts")).isEqualTo(original);
   assertThat(fingerprint("pf_transactions")).isEqualTo(ledger);
   assertThat(fingerprint("pf_audit_events")).isEqualTo(audit);
  } finally { service.restore(baseline.getFilename()); }
 }
 private String fingerprint(String table) {
  return jdbc.queryForObject("select md5(coalesce(string_agg(to_jsonb(t)::text,'' order by to_jsonb(t)::text),'')) from "+table+" t",String.class);
 }
}
