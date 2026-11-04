package com.personalfinance.intelligence.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "fi_legacy_market_symbols")
public class LegacyMarketSymbol {

    @Id
    @Column(name = "market_symbol", length = 32)
    private String marketSymbol;

    @Column(name = "asset_id", nullable = false)
    private Long assetId;

    @Column(name = "quote_currency", nullable = false, length = 8)
    private String quoteCurrency;

    public String getMarketSymbol() { return marketSymbol; }
    public void setMarketSymbol(String marketSymbol) { this.marketSymbol = marketSymbol; }

    public Long getAssetId() { return assetId; }
    public void setAssetId(Long assetId) { this.assetId = assetId; }

    public String getQuoteCurrency() { return quoteCurrency; }
    public void setQuoteCurrency(String quoteCurrency) { this.quoteCurrency = quoteCurrency; }
}
