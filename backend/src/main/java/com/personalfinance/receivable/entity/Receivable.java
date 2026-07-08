package com.personalfinance.receivable.entity;

import com.personalfinance.common.BaseEntity;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "receivables")
public class Receivable extends BaseEntity {

    @Column(name = "debtor_name", nullable = false, length = 100)
    private String debtorName;

    @Column(name = "original_amount", nullable = false)
    private Long originalAmount;

    @Column(name = "created_date")
    private LocalDate createdDate;

    @Column(name = "received_amount", nullable = false)
    private Long receivedAmount = 0L;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public Receivable() {}

    public String getDebtorName() { return debtorName; }
    public void setDebtorName(String debtorName) { this.debtorName = debtorName; }

    public Long getOriginalAmount() { return originalAmount; }
    public void setOriginalAmount(Long originalAmount) { this.originalAmount = originalAmount; }

    public LocalDate getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDate createdDate) { this.createdDate = createdDate; }

    public Long getReceivedAmount() { return receivedAmount; }
    public void setReceivedAmount(Long receivedAmount) { this.receivedAmount = receivedAmount; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
