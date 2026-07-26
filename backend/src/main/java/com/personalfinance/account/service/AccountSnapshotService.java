package com.personalfinance.account.service;

import com.personalfinance.account.repository.AccountRepository;
import com.personalfinance.history.SnapshotEntityType;
import com.personalfinance.history.dto.SnapshotRequest;
import com.personalfinance.history.dto.SnapshotResponse;
import com.personalfinance.history.service.ValueSnapshotService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class AccountSnapshotService {

    private final AccountRepository accountRepository;
    private final ValueSnapshotService snapshotService;

    public AccountSnapshotService(AccountRepository accountRepository, ValueSnapshotService snapshotService) {
        this.accountRepository = accountRepository;
        this.snapshotService = snapshotService;
    }

    public List<SnapshotResponse> list(Long accountId) {
        requireAccount(accountId);
        return snapshotService.findHistory(SnapshotEntityType.ACCOUNT, accountId);
    }

    @Transactional
    public SnapshotResponse create(Long accountId, SnapshotRequest request) {
        requireAccount(accountId);
        SnapshotResponse response = snapshotService.create(SnapshotEntityType.ACCOUNT, accountId, request);
        syncAccountBalance(accountId);
        return response;
    }

    @Transactional
    public SnapshotResponse update(Long accountId, Long snapshotId, SnapshotRequest request) {
        requireAccount(accountId);
        SnapshotResponse response = snapshotService.update(
                SnapshotEntityType.ACCOUNT, accountId, snapshotId, request);
        syncAccountBalance(accountId);
        return response;
    }

    @Transactional
    public void delete(Long accountId, Long snapshotId) {
        requireAccount(accountId);
        snapshotService.delete(SnapshotEntityType.ACCOUNT, accountId, snapshotId);
        syncAccountBalance(accountId);
    }

    /**
     * موجودی حساب همیشه از آخرین snapshot (بر اساس recorded_date) محاسبه می‌شود.
     * ویرایش/حذف رکوردهای قدیمی موجودی فعلی را تغییر نمی‌دهد مگر اینکه آن رکورد آخرین باشد.
     */
    private void syncAccountBalance(Long accountId) {
        var account = accountRepository.findById(accountId).orElseThrow();
        account.setBalance(snapshotService.getLatestValue(SnapshotEntityType.ACCOUNT, accountId));
        accountRepository.save(account);
    }

    private void requireAccount(Long accountId) {
        if (!accountRepository.existsById(accountId)) {
            throw new NoSuchElementException("حساب یافت نشد: " + accountId);
        }
    }
}
