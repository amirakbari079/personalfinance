package com.personalfinance.standby.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class StandbyRequest {

    @NotBlank(message = "عنوان کالا الزامی است")
    @Size(max = 100, message = "عنوان کالا حداکثر ۱۰۰ کاراکتر")
    private String itemLabel;

    @NotNull(message = "تعداد الزامی است")
    @Positive(message = "تعداد باید بزرگتر از صفر باشد")
    private Integer quantity;

    @NotNull(message = "قیمت واحد الزامی است")
    @Positive(message = "قیمت واحد باید بزرگتر از صفر باشد")
    private Long expectedUnitPrice;

    /** Jalali string "YYYY/MM/DD" — converted to Gregorian in the service layer. */
    private String dateAdded;

    private String notes;

    public String getItemLabel() { return itemLabel; }
    public void setItemLabel(String itemLabel) { this.itemLabel = itemLabel; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Long getExpectedUnitPrice() { return expectedUnitPrice; }
    public void setExpectedUnitPrice(Long expectedUnitPrice) { this.expectedUnitPrice = expectedUnitPrice; }

    public String getDateAdded() { return dateAdded; }
    public void setDateAdded(String dateAdded) { this.dateAdded = dateAdded; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
