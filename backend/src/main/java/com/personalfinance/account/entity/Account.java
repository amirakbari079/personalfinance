package com.personalfinance.account.entity;

import com.personalfinance.common.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "accounts")
public class Account extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AccountType type;

    @Column(nullable = false)
    private Long balance = 0L;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "bank_code", length = 50)
    private String bankCode;

    public Account() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public AccountType getType() { return type; }
    public void setType(AccountType type) { this.type = type; }

    public Long getBalance() { return balance; }
    public void setBalance(Long balance) { this.balance = balance; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getBankCode() { return bankCode; }
    public void setBankCode(String bankCode) { this.bankCode = bankCode; }
}
