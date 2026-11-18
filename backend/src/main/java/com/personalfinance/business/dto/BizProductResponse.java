package com.personalfinance.business.dto;

import com.personalfinance.business.entity.BizProduct;
import java.math.BigDecimal;
import java.time.Instant;

public class BizProductResponse {

    private Long id;
    private String code;
    private String name;
    private String unit;
    private Long categoryId;
    private String categoryName;
    private Long defaultPurchasePrice;
    private Long defaultSalePrice;
    private BigDecimal minStockAlert;
    private boolean isActive;
    private String notes;
    private Instant createdAt;

    public BizProductResponse() {}

    public static BizProductResponse fromEntity(BizProduct p) {
        if (p == null) return null;
        BizProductResponse r = new BizProductResponse();
        r.id = p.getId();
        r.code = p.getCode();
        r.name = p.getName();
        r.unit = p.getUnit();
        if (p.getCategory() != null) {
            r.categoryId = p.getCategory().getId();
            r.categoryName = p.getCategory().getName();
        }
        r.defaultPurchasePrice = p.getDefaultPurchasePrice();
        r.defaultSalePrice = p.getDefaultSalePrice();
        r.minStockAlert = p.getMinStockAlert();
        r.isActive = p.isActive();
        r.notes = p.getNotes();
        r.createdAt = p.getCreatedAt();
        return r;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public String getUnit() { return unit; }
    public Long getCategoryId() { return categoryId; }
    public String getCategoryName() { return categoryName; }
    public Long getDefaultPurchasePrice() { return defaultPurchasePrice; }
    public Long getDefaultSalePrice() { return defaultSalePrice; }
    public BigDecimal getMinStockAlert() { return minStockAlert; }
    public boolean isActive() { return isActive; }
    public String getNotes() { return notes; }
    public Instant getCreatedAt() { return createdAt; }
}
