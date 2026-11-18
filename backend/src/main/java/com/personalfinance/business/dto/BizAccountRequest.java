package com.personalfinance.business.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class BizAccountRequest {

    @NotBlank(message = "نام حساب کسب‌وکار الزامی است")
    @Size(max = 100, message = "نام حساب حداکثر ۱۰۰ کاراکتر است")
    private String name;

    @NotBlank(message = "نوع حساب الزامی است")
    @Pattern(regexp = "^(CASH|BANK|WALLET|PETTY_CASH)$", message = "نوع حساب باید صندوق (CASH)، بانک (BANK)، کیف‌پول (WALLET) یا تنخواه (PETTY_CASH) باشد")
    private String type;

    @Size(max = 50, message = "شماره حساب حداکثر ۵۰ کاراکتر است")
    private String accountNumber;

    @NotNull(message = "مانده افتتاحیه الزامی است")
    private Long openingBalance = 0L;

    private LocalDate openingBalanceDate;

    private Boolean isActive = true;

    private String notes;

    public BizAccountRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public Long getOpeningBalance() { return openingBalance; }
    public void setOpeningBalance(Long openingBalance) { this.openingBalance = openingBalance; }

    public LocalDate getOpeningBalanceDate() { return openingBalanceDate; }
    public void setOpeningBalanceDate(LocalDate openingBalanceDate) { this.openingBalanceDate = openingBalanceDate; }

    public Boolean getIsActive() { return isActive != null ? isActive : true; }
    public void setIsActive(Boolean active) { isActive = active; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
