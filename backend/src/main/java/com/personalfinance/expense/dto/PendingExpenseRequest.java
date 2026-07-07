package com.personalfinance.expense.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class PendingExpenseRequest {

    @NotBlank(message = "عنوان هزینه الزامی است")
    @Size(max = 100, message = "عنوان هزینه حداکثر ۱۰۰ کاراکتر")
    private String label;

    @NotNull(message = "مبلغ الزامی است")
    @Positive(message = "مبلغ باید بزرگتر از صفر باشد")
    private Long plannedAmount;

    /** Jalali string "YYYY/MM/DD" — converted to Gregorian in the service layer. */
    private String dueDate;

    private String notes;

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public Long getPlannedAmount() { return plannedAmount; }
    public void setPlannedAmount(Long plannedAmount) { this.plannedAmount = plannedAmount; }

    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
