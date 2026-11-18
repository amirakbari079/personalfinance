package com.personalfinance.business.dto;

import com.personalfinance.business.entity.BizAccount;
import java.time.Instant;
import java.time.LocalDate;

public class BizAccountResponse {

    private Long id;
    private String name;
    private String type;
    private String accountNumber;
    private Long openingBalance;
    private LocalDate openingBalanceDate;
    private boolean isActive;
    private String notes;
    private Instant createdAt;

    public BizAccountResponse() {}

    public static BizAccountResponse fromEntity(BizAccount a) {
        if (a == null) return null;
        BizAccountResponse r = new BizAccountResponse();
        r.id = a.getId();
        r.name = a.getName();
        r.type = a.getType();
        r.accountNumber = a.getAccountNumber();
        r.openingBalance = a.getOpeningBalance();
        r.openingBalanceDate = a.getOpeningBalanceDate();
        r.isActive = a.isActive();
        r.notes = a.getNotes();
        r.createdAt = a.getCreatedAt();
        return r;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getType() { return type; }
    public String getAccountNumber() { return accountNumber; }
    public Long getOpeningBalance() { return openingBalance; }
    public LocalDate getOpeningBalanceDate() { return openingBalanceDate; }
    public boolean isActive() { return isActive; }
    public String getNotes() { return notes; }
    public Instant getCreatedAt() { return createdAt; }
}
