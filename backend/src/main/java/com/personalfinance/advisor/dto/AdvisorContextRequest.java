package com.personalfinance.advisor.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;

import java.util.ArrayList;
import java.util.List;

public class AdvisorContextRequest {

    @Size(max = 256, message = "فهرست دارایی‌های بازار بیش از حد طولانی است")
    private String symbols;

    @Size(max = 50, message = "تعداد حساب‌های انتخابی بیش از حد است")
    private List<Long> accountIds = new ArrayList<>();

    @Size(max = 50, message = "تعداد سرمایه‌گذاری‌های انتخابی بیش از حد است")
    private List<Long> investmentIds = new ArrayList<>();

    @Valid
    @Size(max = 20, message = "تعداد دارایی‌های موقت بیش از حد است")
    private List<AdvisorHoldingRequest> customHoldings = new ArrayList<>();

    public String getSymbols() { return symbols; }
    public void setSymbols(String symbols) { this.symbols = symbols; }

    public List<Long> getAccountIds() { return accountIds; }
    public void setAccountIds(List<Long> accountIds) { this.accountIds = accountIds; }

    public List<Long> getInvestmentIds() { return investmentIds; }
    public void setInvestmentIds(List<Long> investmentIds) { this.investmentIds = investmentIds; }

    public List<AdvisorHoldingRequest> getCustomHoldings() { return customHoldings; }
    public void setCustomHoldings(List<AdvisorHoldingRequest> customHoldings) { this.customHoldings = customHoldings; }
}
