package com.personalfinance.expense.entity;

import com.personalfinance.common.BaseEntity;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "pending_expenses")
public class PendingExpense extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String label;

    @Column(name = "planned_amount", nullable = false)
    private Long plannedAmount;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public PendingExpense() {}

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public Long getPlannedAmount() { return plannedAmount; }
    public void setPlannedAmount(Long plannedAmount) { this.plannedAmount = plannedAmount; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
