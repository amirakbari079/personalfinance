package com.personalfinance.advisor.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class AdvisorHoldingRequest {

    @NotBlank(message = "نام دارایی الزامی است")
    @Size(max = 100, message = "نام دارایی حداکثر ۱۰۰ کاراکتر است")
    private String name;

    @NotBlank(message = "نوع دارایی الزامی است")
    @Size(max = 24, message = "نوع دارایی نامعتبر است")
    private String kind;

    @Size(max = 32, message = "طبقه دارایی نامعتبر است")
    private String type;

    @NotNull(message = "مبلغ تومانی الزامی است")
    @Min(value = 0, message = "مبلغ نمی‌تواند منفی باشد")
    private Long amountToman;

    private BigDecimal quantity;

    @Size(max = 32, message = "واحد نامعتبر است")
    private String unit;

    @Size(max = 32, message = "نماد نامعتبر است")
    private String symbol;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getKind() { return kind; }
    public void setKind(String kind) { this.kind = kind; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Long getAmountToman() { return amountToman; }
    public void setAmountToman(Long amountToman) { this.amountToman = amountToman; }

    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }
}
