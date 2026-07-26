package com.personalfinance.export.dto;

public class AiPortfolioSummary {

    private long totalAssets;
    private long totalLiabilities;
    private long netWorth;

    public AiPortfolioSummary() {}

    public AiPortfolioSummary(long totalAssets, long totalLiabilities, long netWorth) {
        this.totalAssets = totalAssets;
        this.totalLiabilities = totalLiabilities;
        this.netWorth = netWorth;
    }

    public long getTotalAssets() { return totalAssets; }
    public long getTotalLiabilities() { return totalLiabilities; }
    public long getNetWorth() { return netWorth; }
}
