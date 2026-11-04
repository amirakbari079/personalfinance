package com.personalfinance.intelligence.dto;

import com.personalfinance.intelligence.entity.Asset;
import com.personalfinance.intelligence.entity.AssetCategory;
import com.personalfinance.intelligence.entity.AssetType;

import java.time.Instant;

public class AssetResponse {

    private Long id;
    private String symbol;
    private String name;
    private String nameEn;
    private AssetType assetType;
    private AssetCategory assetCategory;
    private String country;
    private String currency;
    private String unit;
    private String market;
    private boolean tradable;
    private boolean active;
    private Instant createdAt;

    public static AssetResponse from(Asset asset) {
        AssetResponse r = new AssetResponse();
        r.id = asset.getId();
        r.symbol = asset.getSymbol();
        r.name = asset.getName();
        r.nameEn = asset.getNameEn();
        r.assetType = asset.getAssetType();
        r.assetCategory = asset.getAssetCategory();
        r.country = asset.getCountry();
        r.currency = asset.getCurrency();
        r.unit = asset.getUnit();
        r.market = asset.getMarket();
        r.tradable = asset.isTradable();
        r.active = asset.isActive();
        r.createdAt = asset.getCreatedAt();
        return r;
    }

    public Long getId() { return id; }
    public String getSymbol() { return symbol; }
    public String getName() { return name; }
    public String getNameEn() { return nameEn; }
    public AssetType getAssetType() { return assetType; }
    public AssetCategory getAssetCategory() { return assetCategory; }
    public String getCountry() { return country; }
    public String getCurrency() { return currency; }
    public String getUnit() { return unit; }
    public String getMarket() { return market; }
    public boolean isTradable() { return tradable; }
    public boolean isActive() { return active; }
    public Instant getCreatedAt() { return createdAt; }
}
