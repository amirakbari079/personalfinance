package com.personalfinance.business.entity;

import com.personalfinance.common.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "biz_products")
public class BizProduct extends BaseEntity {

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "unit", nullable = false, length = 30)
    private String unit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private BizCategory category;

    @Column(name = "default_purchase_price")
    private Long defaultPurchasePrice;

    @Column(name = "default_sale_price")
    private Long defaultSalePrice;

    @Column(name = "min_stock_alert", precision = 15, scale = 3)
    private BigDecimal minStockAlert;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public BizProduct() {}

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public BizCategory getCategory() {
        return category;
    }

    public void setCategory(BizCategory category) {
        this.category = category;
    }

    public Long getDefaultPurchasePrice() {
        return defaultPurchasePrice;
    }

    public void setDefaultPurchasePrice(Long defaultPurchasePrice) {
        this.defaultPurchasePrice = defaultPurchasePrice;
    }

    public Long getDefaultSalePrice() {
        return defaultSalePrice;
    }

    public void setDefaultSalePrice(Long defaultSalePrice) {
        this.defaultSalePrice = defaultSalePrice;
    }

    public BigDecimal getMinStockAlert() {
        return minStockAlert;
    }

    public void setMinStockAlert(BigDecimal minStockAlert) {
        this.minStockAlert = minStockAlert;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
