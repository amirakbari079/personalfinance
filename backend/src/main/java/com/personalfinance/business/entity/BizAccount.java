package com.personalfinance.business.entity;

import com.personalfinance.common.BaseEntity;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "biz_accounts")
public class BizAccount extends BaseEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "type", nullable = false, length = 30)
    private String type; // CASH, BANK, WALLET, PETTY_CASH

    @Column(name = "account_number", length = 50)
    private String accountNumber;

    @Column(name = "opening_balance", nullable = false)
    private Long openingBalance = 0L;

    @Column(name = "opening_balance_date", nullable = false)
    private LocalDate openingBalanceDate = LocalDate.now();

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public BizAccount() {}

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public Long getOpeningBalance() {
        return openingBalance;
    }

    public void setOpeningBalance(Long openingBalance) {
        this.openingBalance = openingBalance;
    }

    public LocalDate getOpeningBalanceDate() {
        return openingBalanceDate;
    }

    public void setOpeningBalanceDate(LocalDate openingBalanceDate) {
        this.openingBalanceDate = openingBalanceDate;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
