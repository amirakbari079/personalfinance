package com.personalfinance.loan.entity;

import com.personalfinance.common.BaseEntity;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "loans")
public class Loan extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String creditor;

    @Column(name = "monthly_amount", nullable = false)
    private Long monthlyAmount;

    @Column(name = "total_installments", nullable = false)
    private Integer totalInstallments;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "paid_installments", nullable = false)
    private Integer paidInstallments = 0;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public Loan() {}

    public String getCreditor() { return creditor; }
    public void setCreditor(String creditor) { this.creditor = creditor; }

    public Long getMonthlyAmount() { return monthlyAmount; }
    public void setMonthlyAmount(Long monthlyAmount) { this.monthlyAmount = monthlyAmount; }

    public Integer getTotalInstallments() { return totalInstallments; }
    public void setTotalInstallments(Integer totalInstallments) { this.totalInstallments = totalInstallments; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public Integer getPaidInstallments() { return paidInstallments; }
    public void setPaidInstallments(Integer paidInstallments) { this.paidInstallments = paidInstallments; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
