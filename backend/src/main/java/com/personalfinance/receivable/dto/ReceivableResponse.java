package com.personalfinance.receivable.dto;

import com.personalfinance.receivable.entity.Receivable;

import java.time.Instant;

public class ReceivableResponse {

    private Long id;
    private String debtorName;
    private Long originalAmount;
    /** Jalali string "YYYY/MM/DD". */
    private String createdDate;
    private Long receivedAmount;
    private Long outstanding;
    private String notes;
    private Instant createdAt;

    public static ReceivableResponse from(Receivable receivable, String createdDateJalali) {
        ReceivableResponse r = new ReceivableResponse();
        r.id              = receivable.getId();
        r.debtorName      = receivable.getDebtorName();
        r.originalAmount  = receivable.getOriginalAmount();
        r.createdDate     = createdDateJalali;
        r.receivedAmount  = receivable.getReceivedAmount();
        r.outstanding     = receivable.getOriginalAmount() - receivable.getReceivedAmount();
        r.notes           = receivable.getNotes();
        r.createdAt       = receivable.getCreatedAt();
        return r;
    }

    public Long getId() { return id; }
    public String getDebtorName() { return debtorName; }
    public Long getOriginalAmount() { return originalAmount; }
    public String getCreatedDate() { return createdDate; }
    public Long getReceivedAmount() { return receivedAmount; }
    public Long getOutstanding() { return outstanding; }
    public String getNotes() { return notes; }
    public Instant getCreatedAt() { return createdAt; }
}
