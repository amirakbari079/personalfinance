package com.personalfinance.account.dto;

import com.personalfinance.account.entity.AccountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AccountRequest {

    @NotBlank(message = "نام حساب الزامی است")
    @Size(max = 100, message = "نام حساب حداکثر ۱۰۰ کاراکتر")
    private String name;

    @NotNull(message = "نوع حساب الزامی است")
    private AccountType type;

    @NotNull(message = "موجودی الزامی است")
    private Long balance;

    private String notes;

    /** Optional key from frontend Iranian bank logo catalog. */
    private String bankCode;

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
