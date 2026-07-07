package com.personalfinance.account.dto;

import com.personalfinance.account.entity.InvestmentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class InvestmentRequest {

    @NotBlank(message = "نام سرمایه‌گذاری الزامی است")
    @Size(max = 100, message = "نام سرمایه‌گذاری حداکثر ۱۰۰ کاراکتر")
    private String name;

    @NotNull(message = "نوع دارایی الزامی است")
    private InvestmentType assetType;

    private BigDecimal nativeAmount;

    private String nativeUnit;

    @NotNull(message = "معادل تومانی الزامی است")
    private Long tomanEquivalent;

    private String notes;

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
