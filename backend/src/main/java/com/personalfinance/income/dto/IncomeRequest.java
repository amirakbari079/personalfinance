package com.personalfinance.income.dto;

import com.personalfinance.income.entity.IncomeType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class IncomeRequest {

    @NotBlank(message = "عنوان درآمد الزامی است")
    @Size(max = 100, message = "عنوان درآمد حداکثر ۱۰۰ کاراکتر")
    private String source;

    @NotNull(message = "مبلغ الزامی است")
    @Positive(message = "مبلغ باید بزرگتر از صفر باشد")
    private Long amount;

    @NotNull(message = "نوع درآمد الزامی است")
    private IncomeType incomeType;

    /** Jalali string "YYYY/MM/DD" — converted to Gregorian in the service layer. */
    private String receivedDate;

    private String notes;

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public Long getAmount() { return amount; }
    public void setAmount(Long amount) { this.amount = amount; }

    public IncomeType getIncomeType() { return incomeType; }
    public void setIncomeType(IncomeType incomeType) { this.incomeType = incomeType; }

    public String getReceivedDate() { return receivedDate; }
    public void setReceivedDate(String receivedDate) { this.receivedDate = receivedDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
