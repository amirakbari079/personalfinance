package com.personalfinance.export.dto;

import java.time.Instant;
import java.util.List;

public class AiPortfolioExportResponse {

    private Instant exportedAt;
    private String currency;
    private AiPortfolioSummary summary;
    private AiPortfolioAssets assets;
    private AiPortfolioLiabilities liabilities;
    private List<AiPortfolioItem> income;

    public AiPortfolioExportResponse() {}

    public AiPortfolioExportResponse(Instant exportedAt,
                                     String currency,
                                     AiPortfolioSummary summary,
                                     AiPortfolioAssets assets,
                                     AiPortfolioLiabilities liabilities,
                                     List<AiPortfolioItem> income) {
        this.exportedAt = exportedAt;
        this.currency = currency;
        this.summary = summary;
        this.assets = assets;
        this.liabilities = liabilities;
        this.income = income;
    }

    public Instant getExportedAt() { return exportedAt; }
    public String getCurrency() { return currency; }
    public AiPortfolioSummary getSummary() { return summary; }
    public AiPortfolioAssets getAssets() { return assets; }
    public AiPortfolioLiabilities getLiabilities() { return liabilities; }
    public List<AiPortfolioItem> getIncome() { return income; }
}
