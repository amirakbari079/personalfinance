package com.personalfinance.intelligence.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class AssetPriceResponse {

    private Long assetId;
    private String symbol;
    private String name;
    private String currency;
    private String unit;
    private BigDecimal price;
    private Instant observedAt;
    private Integer confidence;
    private BigDecimal change1d;
    private BigDecimal change7d;
    private BigDecimal change30d;

    public Long getAssetId() { return assetId; }
    public void setAssetId(Long assetId) { this.assetId = assetId; }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public Instant getObservedAt() { return observedAt; }
    public void setObservedAt(Instant observedAt) { this.observedAt = observedAt; }

    public Integer getConfidence() { return confidence; }
    public void setConfidence(Integer confidence) { this.confidence = confidence; }

    public BigDecimal getChange1d() { return change1d; }
    public void setChange1d(BigDecimal change1d) { this.change1d = change1d; }

    public BigDecimal getChange7d() { return change7d; }
    public void setChange7d(BigDecimal change7d) { this.change7d = change7d; }

    public BigDecimal getChange30d() { return change30d; }
    public void setChange30d(BigDecimal change30d) { this.change30d = change30d; }
}
