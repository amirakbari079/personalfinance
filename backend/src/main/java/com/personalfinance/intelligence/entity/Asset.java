package com.personalfinance.intelligence.entity;

import com.personalfinance.common.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "fi_assets")
public class Asset extends BaseEntity {

    @Column(nullable = false, unique = true, length = 32)
    private String symbol;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "name_en", length = 100)
    private String nameEn;

    @Enumerated(EnumType.STRING)
    @Column(name = "asset_type", nullable = false, length = 30)
    private AssetType assetType;

    @Enumerated(EnumType.STRING)
    @Column(name = "asset_category", nullable = false, length = 30)
    private AssetCategory assetCategory;

    @Column(length = 8)
    private String country;

    @Column(nullable = false, length = 8)
    private String currency;

    @Column(nullable = false, length = 32)
    private String unit;

    @Column(length = 32)
    private String market;

    @Column(name = "is_tradable", nullable = false)
    private boolean tradable = true;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getNameEn() { return nameEn; }
    public void setNameEn(String nameEn) { this.nameEn = nameEn; }

    public AssetType getAssetType() { return assetType; }
    public void setAssetType(AssetType assetType) { this.assetType = assetType; }

    public AssetCategory getAssetCategory() { return assetCategory; }
    public void setAssetCategory(AssetCategory assetCategory) { this.assetCategory = assetCategory; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public String getMarket() { return market; }
    public void setMarket(String market) { this.market = market; }

    public boolean isTradable() { return tradable; }
    public void setTradable(boolean tradable) { this.tradable = tradable; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
