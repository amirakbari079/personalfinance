package com.personalfinance.account.service;

import com.personalfinance.account.dto.AccountRequest;
import com.personalfinance.account.dto.AccountResponse;
import com.personalfinance.account.entity.Account;
import com.personalfinance.account.repository.AccountRepository;
import com.personalfinance.history.SnapshotEntityType;
import com.personalfinance.history.service.ValueSnapshotService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final ValueSnapshotService snapshotService;

    public AccountService(AccountRepository accountRepository, ValueSnapshotService snapshotService) {
        this.accountRepository = accountRepository;
        this.snapshotService = snapshotService;
    }

    public List<AccountResponse> findAll() {
        return accountRepository.findAll()
                .stream()
                .map(AccountResponse::from)
                .toList();
    }

    @Transactional
    public AccountResponse create(AccountRequest request) {
        Account account = new Account();
        apply(account, request);
        account = accountRepository.save(account);
        recordBalanceSnapshot(account, request);
        return AccountResponse.from(accountRepository.save(account));
    }

    @Transactional
    public AccountResponse update(Long id, AccountRequest request) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("حساب یافت نشد: " + id));
        apply(account, request);
        recordBalanceSnapshot(account, request);
        return AccountResponse.from(accountRepository.save(account));
    }

    @Transactional
    public void delete(Long id) {
        if (!accountRepository.existsById(id)) {
            throw new NoSuchElementException("حساب یافت نشد: " + id);
        }
        snapshotService.deleteByEntity(SnapshotEntityType.ACCOUNT, id);
        accountRepository.deleteById(id);
    }

    public Long totalBalance() {
        return accountRepository.sumAllBalances();
    }

    private void apply(Account account, AccountRequest request) {
        account.setName(request.getName());
        account.setType(request.getType());
        account.setNotes(request.getNotes());
        account.setBankCode(request.getBankCode());
    }

    private void recordBalanceSnapshot(Account account, AccountRequest request) {
        LocalDate recordedDate = snapshotService.resolveRecordedDate(request.getBalanceRecordedDate());
        snapshotService.upsert(
                SnapshotEntityType.ACCOUNT,
                account.getId(),
                request.getBalance(),
                recordedDate,
                request.getNotes());
        account.setBalance(snapshotService.getLatestValue(SnapshotEntityType.ACCOUNT, account.getId()));
    }
}
