package com.personalfinance.expense.dto;

import com.personalfinance.expense.entity.PendingExpense;

import java.time.Instant;

public class PendingExpenseResponse {

    private Long id;
    private String label;
    private Long plannedAmount;
    /** Jalali string "YYYY/MM/DD". */
    private String dueDate;
    private String notes;
    private Instant createdAt;

    public static PendingExpenseResponse from(PendingExpense expense, String dueDateJalali) {
        PendingExpenseResponse r = new PendingExpenseResponse();
        r.id            = expense.getId();
        r.label         = expense.getLabel();
        r.plannedAmount = expense.getPlannedAmount();
        r.dueDate       = dueDateJalali;
        r.notes         = expense.getNotes();
        r.createdAt     = expense.getCreatedAt();
        return r;
    }

    public Long getId() { return id; }
    public String getLabel() { return label; }
    public Long getPlannedAmount() { return plannedAmount; }
    public String getDueDate() { return dueDate; }
    public String getNotes() { return notes; }
    public Instant getCreatedAt() { return createdAt; }
}
