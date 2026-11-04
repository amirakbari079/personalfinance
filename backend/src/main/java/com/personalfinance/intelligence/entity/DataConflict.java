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
@Table(name = "fi_data_conflicts")
public class DataConflict extends BaseEntity {

    @Column(name = "asset_id", nullable = false)
    private Long assetId;

    @Column(nullable = false, length = 8)
    private String currency = "IRT";

    @Column(name = "provider_a_id", nullable = false)
    private Long providerAId;

    @Column(name = "value_a", nullable = false, precision = 20, scale = 8)
    private BigDecimal valueA;

    @Column(name = "provider_b_id", nullable = false)
    private Long providerBId;

    @Column(name = "value_b", nullable = false, precision = 20, scale = 8)
    private BigDecimal valueB;

    @Column(name = "difference_percent", nullable = false, precision = 12, scale = 4)
    private BigDecimal differencePercent;

    @Column(name = "detected_at", nullable = false)
    private Instant detectedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "resolution_status", nullable = false, length = 16)
    private ConflictResolutionStatus resolutionStatus = ConflictResolutionStatus.OPEN;

    public Long getAssetId() { return assetId; }
    public void setAssetId(Long assetId) { this.assetId = assetId; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public Long getProviderAId() { return providerAId; }
    public void setProviderAId(Long providerAId) { this.providerAId = providerAId; }

    public BigDecimal getValueA() { return valueA; }
    public void setValueA(BigDecimal valueA) { this.valueA = valueA; }

    public Long getProviderBId() { return providerBId; }
    public void setProviderBId(Long providerBId) { this.providerBId = providerBId; }

    public BigDecimal getValueB() { return valueB; }
    public void setValueB(BigDecimal valueB) { this.valueB = valueB; }

    public BigDecimal getDifferencePercent() { return differencePercent; }
    public void setDifferencePercent(BigDecimal differencePercent) { this.differencePercent = differencePercent; }

    public Instant getDetectedAt() { return detectedAt; }
    public void setDetectedAt(Instant detectedAt) { this.detectedAt = detectedAt; }

    public ConflictResolutionStatus getResolutionStatus() { return resolutionStatus; }
    public void setResolutionStatus(ConflictResolutionStatus resolutionStatus) {
        this.resolutionStatus = resolutionStatus;
    }
}
