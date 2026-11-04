package com.personalfinance.intelligence.dto;

import com.personalfinance.intelligence.entity.ConflictResolutionStatus;

import java.math.BigDecimal;
import java.time.Instant;

public class DataConflictResponse {

    private Long id;
    private String assetSymbol;
    private String assetName;
    private String currency;
    private String providerA;
    private BigDecimal valueA;
    private String providerB;
    private BigDecimal valueB;
    private BigDecimal differencePercent;
    private Instant detectedAt;
    private ConflictResolutionStatus resolutionStatus;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAssetSymbol() { return assetSymbol; }
    public void setAssetSymbol(String assetSymbol) { this.assetSymbol = assetSymbol; }

    public String getAssetName() { return assetName; }
    public void setAssetName(String assetName) { this.assetName = assetName; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getProviderA() { return providerA; }
    public void setProviderA(String providerA) { this.providerA = providerA; }

    public BigDecimal getValueA() { return valueA; }
    public void setValueA(BigDecimal valueA) { this.valueA = valueA; }

    public String getProviderB() { return providerB; }
    public void setProviderB(String providerB) { this.providerB = providerB; }

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
