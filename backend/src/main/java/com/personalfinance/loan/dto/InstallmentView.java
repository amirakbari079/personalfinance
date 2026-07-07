package com.personalfinance.loan.dto;

/**
 * A single installment slot in a loan's payment checklist.
 * Used by the front-end to render the per-month tick list.
 */
public class InstallmentView {

    private final int number;            // 1-based installment index
    private final String dueDateJalali;  // "YYYY/MM/DD"
    private final String monthLabel;     // e.g. "اردیبهشت ۱۴۰۳"
    private final String status;         // PAID | NEXT | UPCOMING

    public InstallmentView(int number, String dueDateJalali, String monthLabel, String status) {
        this.number = number;
        this.dueDateJalali = dueDateJalali;
        this.monthLabel = monthLabel;
        this.status = status;
    }

    public int getNumber() { return number; }
    public String getDueDateJalali() { return dueDateJalali; }
    public String getMonthLabel() { return monthLabel; }
    public String getStatus() { return status; }
}
