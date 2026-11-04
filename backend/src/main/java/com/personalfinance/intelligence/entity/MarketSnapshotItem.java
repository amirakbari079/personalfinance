package com.personalfinance.intelligence.entity;

import com.personalfinance.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.math.BigDecimal;

@Entity
@Table(
        name = "fi_market_snapshot_items",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"market_snapshot_id", "asset_id", "currency", "quote_type"}))
public class MarketSnapshotItem extends BaseEntity {

    @Column(name = "market_snapshot_id", nullable = false)
    private Long marketSnapshotId;

    @Column(name = "asset_id", nullable = false)
    private Long assetId;

    @Column(name = "reference_value_id")
    private Long referenceValueId;

    @Column(nullable = false, precision = 20, scale = 8)
    private BigDecimal price;

    @Column(nullable = false, length = 8)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(name = "quote_type", nullable = false, length = 16)
    private QuoteType quoteType = QuoteType.REFERENCE;

    public Long getMarketSnapshotId() { return marketSnapshotId; }
    public void setMarketSnapshotId(Long marketSnapshotId) { this.marketSnapshotId = marketSnapshotId; }

    public Long getAssetId() { return assetId; }
    public void setAssetId(Long assetId) { this.assetId = assetId; }

    public Long getReferenceValueId() { return referenceValueId; }
    public void setReferenceValueId(Long referenceValueId) { this.referenceValueId = referenceValueId; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public QuoteType getQuoteType() { return quoteType; }
    public void setQuoteType(QuoteType quoteType) { this.quoteType = quoteType; }
}
