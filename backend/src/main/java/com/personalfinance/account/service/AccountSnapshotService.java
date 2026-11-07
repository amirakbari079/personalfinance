package com.personalfinance.account.service;

import com.personalfinance.account.repository.AccountRepository;
import com.personalfinance.history.SnapshotEntityType;
import com.personalfinance.history.dto.SnapshotRequest;
import com.personalfinance.history.dto.SnapshotResponse;
import com.personalfinance.history.service.ValueSnapshotService;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.NoSuchElementException;

/** Legacy snapshots remain readable, including those of archived accounts. */
@Service
public class AccountSnapshotService {
    private final AccountRepository accounts;
    private final ValueSnapshotService snapshots;
    public AccountSnapshotService(AccountRepository accounts,ValueSnapshotService snapshots) {
        this.accounts=accounts;this.snapshots=snapshots;
    }
    public List<SnapshotResponse> list(Long id) {
        if(!accounts.existsById(id)) throw new NoSuchElementException("حساب یافت نشد");
        return snapshots.findHistory(SnapshotEntityType.ACCOUNT,id);
    }
    public SnapshotResponse create(Long id,SnapshotRequest request) { throw readOnly(); }
    public SnapshotResponse update(Long id,Long snapshotId,SnapshotRequest request) { throw readOnly(); }
    public void delete(Long id,Long snapshotId) { throw readOnly(); }
    private IllegalStateException readOnly() {
        return new IllegalStateException("سوابق حساب محفوظ و فقط خواندنی هستند؛ برای تغییر موجودی، تراکنش یا اصلاح موجودی با دلیل ثبت کنید");
    }
}
