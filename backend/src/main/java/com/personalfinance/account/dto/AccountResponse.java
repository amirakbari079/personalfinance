package com.personalfinance.account.dto;

import com.personalfinance.account.entity.Account;
import com.personalfinance.account.entity.AccountType;

import java.time.Instant;

public class AccountResponse {

    private Long id;
    private String name;
    private AccountType type;
    private Long balance;
    private String notes;
    private Instant createdAt;

    public static AccountResponse from(Account account) {
        AccountResponse r = new AccountResponse();
        r.id        = account.getId();
        r.name      = account.getName();
        r.type      = account.getType();
        r.balance   = account.getBalance();
        r.notes     = account.getNotes();
        r.createdAt = account.getCreatedAt();
        return r;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public AccountType getType() { return type; }
    public Long getBalance() { return balance; }
    public String getNotes() { return notes; }
    public Instant getCreatedAt() { return createdAt; }
}
