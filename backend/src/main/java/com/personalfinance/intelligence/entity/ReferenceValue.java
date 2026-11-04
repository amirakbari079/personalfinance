package com.personalfinance.intelligence.entity;

import com.personalfinance.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "fi_reference_values")
public class ReferenceValue extends BaseEntity {

    @Column(name = "asset_id", nullable = false)
    private Long assetId;

    @Column(name = "observed_at", nullable = false)
    private Instant observedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "quote_type", nullable = false, length = 16)
    private QuoteType quoteType = QuoteType.REFERENCE;

    @Column(nullable = false, precision = 20, scale = 8)
    private BigDecimal value;

    @Column(nullable = false, length = 8)
    private String currency;

    @Column(nullable = false, length = 32)
    private String unit;

    @Column(name = "selected_provider_id")
    private Long selectedProviderId;

    @Column(name = "selection_reason", columnDefinition = "TEXT")
    private String selectionReason;

    private Short confidence;

    @Column(name = "market_snapshot_id")
    private Long marketSnapshotId;

    public Long getAssetId() { return assetId; }
    public void setAssetId(Long assetId) { this.assetId = assetId; }

    public Instant getObservedAt() { return observedAt; }
    public void setObservedAt(Instant observedAt) { this.observedAt = observedAt; }

    public QuoteType getQuoteType() { return quoteType; }
    public void setQuoteType(QuoteType quoteType) { this.quoteType = quoteType; }

    public BigDecimal getValue() { return value; }
    public void setValue(BigDecimal value) { this.value = value; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public Long getSelectedProviderId() { return selectedProviderId; }
    public void setSelectedProviderId(Long selectedProviderId) { this.selectedProviderId = selectedProviderId; }

    public String getSelectionReason() { return selectionReason; }
    public void setSelectionReason(String selectionReason) { this.selectionReason = selectionReason; }

    public Short getConfidence() { return confidence; }
    public void setConfidence(Short confidence) { this.confidence = confidence; }

    public Long getMarketSnapshotId() { return marketSnapshotId; }
    public void setMarketSnapshotId(Long marketSnapshotId) { this.marketSnapshotId = marketSnapshotId; }
}
