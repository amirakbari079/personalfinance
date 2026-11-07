package com.personalfinance.account.service;

import com.personalfinance.account.dto.AccountRequest;
import com.personalfinance.account.dto.AccountResponse;
import com.personalfinance.account.entity.Account;
import com.personalfinance.account.repository.AccountRepository;
import com.personalfinance.balance.service.BalanceSheetService;
import com.personalfinance.foundation.LedgerService;
import com.personalfinance.history.SnapshotEntityType;
import com.personalfinance.history.service.ValueSnapshotService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.*;

@Service
public class AccountService {
    private final AccountRepository repository;
    private final ValueSnapshotService snapshots;
    private final BalanceSheetService balances;
    private final LedgerService ledger;
    public AccountService(AccountRepository repository, ValueSnapshotService snapshots,
                          BalanceSheetService balances, LedgerService ledger) {
        this.repository=repository; this.snapshots=snapshots; this.balances=balances; this.ledger=ledger;
    }
    public List<AccountResponse> findAll() { return findAll(false); }
    public List<AccountResponse> findAll(boolean archived) {
        return (archived ? repository.findByArchivedAtIsNotNullOrderByIdDesc() : repository.findAll())
            .stream().map(this::response).toList();
    }
    public List<AccountResponse> findByIds(Collection<Long> ids) {
        if(ids==null || ids.isEmpty()) return List.of();
        return repository.findAllById(ids).stream().map(this::response).toList();
    }
    @Transactional
    public AccountResponse create(AccountRequest request) {
        if(request.getBalance()==null || request.getBalance()>9007199254740991L || request.getBalance() < -9007199254740991L)
            throw new IllegalArgumentException("موجودی خارج از محدودهٔ پشتیبانی‌شده است");
        var today=LedgerService.today();
        if(!today.equals(snapshots.resolveRecordedDate(request.getBalanceRecordedDate())))
            throw new IllegalArgumentException("ماندهٔ افتتاحیه برای امروز ثبت می‌شود؛ تاریخچهٔ قدیمی جداگانه نگهداری می‌شود");
        var account=new Account(); apply(account,request); account.setBalance(request.getBalance());
        repository.saveAndFlush(account);
        ledger.open(account.getId(),account.getBalance(),today);
        snapshots.upsert(SnapshotEntityType.ACCOUNT,account.getId(),account.getBalance(),today,"ماندهٔ افتتاحیه");
        balances.recordTodaySnapshot();
        return response(account);
    }
    @Transactional
    public AccountResponse update(Long id,AccountRequest request) {
        var account=locked(id,request.getVersion());
        if(account.getArchivedAt()!=null) throw new IllegalStateException("ابتدا حساب را از بایگانی برگردانید");
        if(!Objects.equals(account.getBalance(),request.getBalance()))
            throw new IllegalArgumentException("تغییر موجودی فقط با ثبت تراکنش یا اصلاح موجودی همراه با دلیل انجام می‌شود");
        apply(account,request);
        return response(repository.saveAndFlush(account));
    }
    @Transactional
    public void archive(Long id,Long version) {
        var account=locked(id,version);
        if(account.getBalance()!=0) throw new IllegalStateException("ابتدا موجودی حساب را منتقل یا با دلیل اصلاح کنید؛ حساب غیرصفر بایگانی نمی‌شود");
        account.setArchivedAt(Instant.now()); repository.saveAndFlush(account);
        balances.recordTodaySnapshot();
    }
    @Transactional
    public AccountResponse restore(Long id,Long version) {
        var account=locked(id,version); account.setArchivedAt(null);
        repository.saveAndFlush(account); balances.recordTodaySnapshot(); return response(account);
    }
    public Long totalBalance() { return repository.sumAllBalances(); }
    private Account locked(Long id,Long version) {
        if(version==null) throw new IllegalArgumentException("نسخهٔ رکورد الزامی است؛ صفحه را تازه کنید");
        var account=repository.findLockedById(id).orElseThrow(()->new NoSuchElementException("حساب یافت نشد"));
        if(!version.equals(account.getVersion())) throw new IllegalStateException("حساب تغییر کرده است؛ دوباره بارگذاری کنید");
        return account;
    }
    private void apply(Account account,AccountRequest request) {
        account.setName(request.getName()); account.setType(request.getType());
        account.setNotes(request.getNotes()); account.setBankCode(request.getBankCode());
    }
    private AccountResponse response(Account account) {
        var result=AccountResponse.from(account);
        snapshots.getLatestRecordedDateJalali(SnapshotEntityType.ACCOUNT,account.getId()).ifPresent(result::setBalanceRecordedDate);
        return result;
    }
}
