package com.personalfinance.loan.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class LoanRequest {

    @NotBlank(message = "نام طلبکار الزامی است")
    @Size(max = 100, message = "نام طلبکار حداکثر ۱۰۰ کاراکتر")
    private String creditor;

    @NotNull(message = "مبلغ قسط ماهانه الزامی است")
    @Positive(message = "مبلغ قسط باید بزرگتر از صفر باشد")
    private Long monthlyAmount;

    @NotNull(message = "تعداد کل اقساط الزامی است")
    @Min(value = 1, message = "تعداد اقساط باید حداقل ۱ باشد")
    private Integer totalInstallments;

    @NotBlank(message = "تاریخ شروع الزامی است")
    private String startDate;

    private String notes;

    public String getCreditor() { return creditor; }
    public void setCreditor(String creditor) { this.creditor = creditor; }

    public Long getMonthlyAmount() { return monthlyAmount; }
    public void setMonthlyAmount(Long monthlyAmount) { this.monthlyAmount = monthlyAmount; }

    public Integer getTotalInstallments() { return totalInstallments; }
    public void setTotalInstallments(Integer totalInstallments) { this.totalInstallments = totalInstallments; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
