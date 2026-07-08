package com.personalfinance.receivable.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class ReceivableRequest {

    @NotBlank(message = "نام بدهکار الزامی است")
    @Size(max = 100, message = "نام بدهکار حداکثر ۱۰۰ کاراکتر")
    private String debtorName;

    @NotNull(message = "مبلغ اصلی الزامی است")
    @Positive(message = "مبلغ اصلی باید بزرگتر از صفر باشد")
    private Long originalAmount;

    /** Jalali string "YYYY/MM/DD" — converted to Gregorian in the service layer. */
    private String createdDate;

    @NotNull(message = "مبلغ دریافتی الزامی است")
    @Min(value = 0, message = "مبلغ دریافتی نمی‌تواند منفی باشد")
    private Long receivedAmount;

    private String notes;

    public String getDebtorName() { return debtorName; }
    public void setDebtorName(String debtorName) { this.debtorName = debtorName; }

    public Long getOriginalAmount() { return originalAmount; }
    public void setOriginalAmount(Long originalAmount) { this.originalAmount = originalAmount; }

    public String getCreatedDate() { return createdDate; }
    public void setCreatedDate(String createdDate) { this.createdDate = createdDate; }

    public Long getReceivedAmount() { return receivedAmount; }
    public void setReceivedAmount(Long receivedAmount) { this.receivedAmount = receivedAmount; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
