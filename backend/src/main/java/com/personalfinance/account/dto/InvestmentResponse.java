package com.personalfinance.account.dto;

import com.personalfinance.account.entity.Investment;
import com.personalfinance.account.entity.InvestmentType;

import java.math.BigDecimal;
import java.time.Instant;

public class InvestmentResponse {

    private Long id;
    private String name;
    private InvestmentType assetType;
    private BigDecimal nativeAmount;
    private String nativeUnit;
    private Long tomanEquivalent;
    private String notes;
    private Instant createdAt;

    public static InvestmentResponse from(Investment investment) {
        InvestmentResponse r = new InvestmentResponse();
        r.id              = investment.getId();
        r.name            = investment.getName();
        r.assetType       = investment.getAssetType();
        r.nativeAmount    = investment.getNativeAmount();
        r.nativeUnit      = investment.getNativeUnit();
        r.tomanEquivalent = investment.getTomanEquivalent();
        r.notes           = investment.getNotes();
        r.createdAt       = investment.getCreatedAt();
        return r;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public InvestmentType getAssetType() { return assetType; }
    public BigDecimal getNativeAmount() { return nativeAmount; }
    public String getNativeUnit() { return nativeUnit; }
    public Long getTomanEquivalent() { return tomanEquivalent; }
    public String getNotes() { return notes; }
    public Instant getCreatedAt() { return createdAt; }
}
