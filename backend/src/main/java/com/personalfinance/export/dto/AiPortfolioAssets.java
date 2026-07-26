package com.personalfinance.export.dto;

import java.util.List;

public class AiPortfolioAssets {

    private List<AiPortfolioItem> cash;
    private List<AiPortfolioItem> investments;
    private List<AiPortfolioItem> standby;
    private List<AiPortfolioItem> receivables;

    public AiPortfolioAssets() {}

    public AiPortfolioAssets(List<AiPortfolioItem> cash,
                             List<AiPortfolioItem> investments,
                             List<AiPortfolioItem> standby,
                             List<AiPortfolioItem> receivables) {
        this.cash = cash;
        this.investments = investments;
        this.standby = standby;
        this.receivables = receivables;
    }

    public List<AiPortfolioItem> getCash() { return cash; }
    public List<AiPortfolioItem> getInvestments() { return investments; }
    public List<AiPortfolioItem> getStandby() { return standby; }
    public List<AiPortfolioItem> getReceivables() { return receivables; }
}
