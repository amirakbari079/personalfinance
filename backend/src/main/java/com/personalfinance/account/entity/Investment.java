package com.personalfinance.account.entity;

import com.personalfinance.common.BaseEntity;
import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "investments")
public class Investment extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "asset_type", nullable = false, length = 30)
    private InvestmentType assetType;

    @Column(name = "native_amount", precision = 20, scale = 4)
    private BigDecimal nativeAmount;

    @Column(name = "native_unit", length = 20)
    private String nativeUnit;

    @Column(name = "toman_equivalent", nullable = false)
    private Long tomanEquivalent = 0L;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public Investment() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public InvestmentType getAssetType() { return assetType; }
    public void setAssetType(InvestmentType assetType) { this.assetType = assetType; }

    public BigDecimal getNativeAmount() { return nativeAmount; }
    public void setNativeAmount(BigDecimal nativeAmount) { this.nativeAmount = nativeAmount; }

    public String getNativeUnit() { return nativeUnit; }
    public void setNativeUnit(String nativeUnit) { this.nativeUnit = nativeUnit; }

    public Long getTomanEquivalent() { return tomanEquivalent; }
    public void setTomanEquivalent(Long tomanEquivalent) { this.tomanEquivalent = tomanEquivalent; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
