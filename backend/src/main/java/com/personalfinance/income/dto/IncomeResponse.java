package com.personalfinance.income.dto;

import com.personalfinance.income.entity.Income;
import com.personalfinance.income.entity.IncomeType;

import java.time.Instant;

public class IncomeResponse {

    private Long id;
    private String source;
    private Long amount;
    private IncomeType incomeType;
    /** Jalali string "YYYY/MM/DD". */
    private String receivedDate;
    private String notes;
    private Instant createdAt;

    public static IncomeResponse from(Income income, String receivedDateJalali) {
        IncomeResponse r = new IncomeResponse();
        r.id            = income.getId();
        r.source        = income.getSource();
        r.amount        = income.getAmount();
        r.incomeType    = income.getIncomeType();
        r.receivedDate  = receivedDateJalali;
        r.notes         = income.getNotes();
        r.createdAt     = income.getCreatedAt();
        return r;
    }

    public Long getId() { return id; }
    public String getSource() { return source; }
    public Long getAmount() { return amount; }
    public IncomeType getIncomeType() { return incomeType; }
    public String getReceivedDate() { return receivedDate; }
    public String getNotes() { return notes; }
    public Instant getCreatedAt() { return createdAt; }
}
