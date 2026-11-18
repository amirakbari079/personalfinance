package com.personalfinance.business.dto;

import java.time.LocalDate;
import java.util.Map;

public class BizSummaryResponse {

    private String period;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long salesTotal;
    private Long grossProfit;
    private Long cashLiquidity;
    private Long receivables;
    private Long payables;
    private Long inventoryValue;
    private long activeProductsCount;
    private long activeCounterpartiesCount;
    private long activeAccountsCount;
    private LocalDate asOfDate;
    private Map<String, String> calculationDefinitions;

    public BizSummaryResponse() {}

    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public Long getSalesTotal() { return salesTotal; }
    public void setSalesTotal(Long salesTotal) { this.salesTotal = salesTotal; }

    public Long getGrossProfit() { return grossProfit; }
    public void setGrossProfit(Long grossProfit) { this.grossProfit = grossProfit; }

    public Long getCashLiquidity() { return cashLiquidity; }
    public void setCashLiquidity(Long cashLiquidity) { this.cashLiquidity = cashLiquidity; }

    public Long getReceivables() { return receivables; }
    public void setReceivables(Long receivables) { this.receivables = receivables; }

    public Long getPayables() { return payables; }
    public void setPayables(Long payables) { this.payables = payables; }

    public Long getInventoryValue() { return inventoryValue; }
    public void setInventoryValue(Long inventoryValue) { this.inventoryValue = inventoryValue; }

    public long getActiveProductsCount() { return activeProductsCount; }
    public void setActiveProductsCount(long activeProductsCount) { this.activeProductsCount = activeProductsCount; }

    public long getActiveCounterpartiesCount() { return activeCounterpartiesCount; }
    public void setActiveCounterpartiesCount(long activeCounterpartiesCount) { this.activeCounterpartiesCount = activeCounterpartiesCount; }

    public long getActiveAccountsCount() { return activeAccountsCount; }
    public void setActiveAccountsCount(long activeAccountsCount) { this.activeAccountsCount = activeAccountsCount; }

    public LocalDate getAsOfDate() { return asOfDate; }
    public void setAsOfDate(LocalDate asOfDate) { this.asOfDate = asOfDate; }

    public Map<String, String> getCalculationDefinitions() { return calculationDefinitions; }
    public void setCalculationDefinitions(Map<String, String> calculationDefinitions) { this.calculationDefinitions = calculationDefinitions; }
}
