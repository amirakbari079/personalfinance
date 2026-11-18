package com.personalfinance.business.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public class BizProductRequest {

    @NotBlank(message = "کد کالا الزامی است")
    @Size(max = 50, message = "کد کالا حداکثر ۵۰ کاراکتر است")
    private String code;

    @NotBlank(message = "نام کالا الزامی است")
    @Size(max = 150, message = "نام کالا حداکثر ۱۵۰ کاراکتر است")
    private String name;

    @NotBlank(message = "واحد شمارش کالا الزامی است")
    @Size(max = 30, message = "واحد کالا حداکثر ۳۰ کاراکتر است")
    private String unit;

    private Long categoryId;

    @Min(value = 0, message = "قیمت پیش‌فرض خرید نمی‌تواند منفی باشد")
    private Long defaultPurchasePrice;

    @Min(value = 0, message = "قیمت پیش‌فرض فروش نمی‌تواند منفی باشد")
    private Long defaultSalePrice;

    @Min(value = 0, message = "حد هشدار موجودی نمی‌تواند منفی باشد")
    private BigDecimal minStockAlert;

    private Boolean isActive = true;

    private String notes;

    public BizProductRequest() {}

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public Long getDefaultPurchasePrice() { return defaultPurchasePrice; }
    public void setDefaultPurchasePrice(Long defaultPurchasePrice) { this.defaultPurchasePrice = defaultPurchasePrice; }

    public Long getDefaultSalePrice() { return defaultSalePrice; }
    public void setDefaultSalePrice(Long defaultSalePrice) { this.defaultSalePrice = defaultSalePrice; }

    public BigDecimal getMinStockAlert() { return minStockAlert; }
    public void setMinStockAlert(BigDecimal minStockAlert) { this.minStockAlert = minStockAlert; }

    public Boolean getIsActive() { return isActive != null ? isActive : true; }
    public void setIsActive(Boolean active) { isActive = active; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
