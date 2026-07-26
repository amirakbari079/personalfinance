package com.personalfinance.balance.entity;

import com.personalfinance.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "balance_sheet_snapshots")
public class BalanceSheetSnapshot extends BaseEntity {

    @Column(name = "recorded_date", nullable = false, unique = true)
    private LocalDate recordedDate;

    @Column(name = "total_assets", nullable = false)
    private Long totalAssets;

    @Column(name = "total_liabilities", nullable = false)
    private Long totalLiabilities;

    @Column(name = "net_balance", nullable = false)
    private Long netBalance;

    public LocalDate getRecordedDate() { return recordedDate; }
    public void setRecordedDate(LocalDate recordedDate) { this.recordedDate = recordedDate; }

    public Long getTotalAssets() { return totalAssets; }
    public void setTotalAssets(Long totalAssets) { this.totalAssets = totalAssets; }

    public Long getTotalLiabilities() { return totalLiabilities; }
    public void setTotalLiabilities(Long totalLiabilities) { this.totalLiabilities = totalLiabilities; }

    public Long getNetBalance() { return netBalance; }
    public void setNetBalance(Long netBalance) { this.netBalance = netBalance; }
}
