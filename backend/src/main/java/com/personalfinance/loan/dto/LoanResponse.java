package com.personalfinance.loan.dto;

import com.personalfinance.loan.entity.Loan;

import java.time.Instant;
import java.util.List;

public class LoanResponse {

    private Long id;
    private String creditor;
    private Long monthlyAmount;
    private Integer totalInstallments;
    private Integer paidInstallments;
    private String startDate;
    private String notes;
    private Instant createdAt;

    // Computed fields:
    private Long paidAmount;
    private Long remainingAmount;
    private Integer remainingInstallments;
    private String lastPaymentDate;
    private boolean completed;

    /** Monthly installments list — for the front-end checklist. */
    private List<InstallmentView> installments;

    public static LoanResponse from(Loan loan,
                                    String startDateJalali,
                                    String lastPaymentDateJalali,
                                    List<InstallmentView> installments) {
        LoanResponse r = new LoanResponse();
        r.id                = loan.getId();
        r.creditor          = loan.getCreditor();
        r.monthlyAmount     = loan.getMonthlyAmount();
        r.totalInstallments = loan.getTotalInstallments();
        r.paidInstallments  = loan.getPaidInstallments();
        r.startDate         = startDateJalali;
        r.notes             = loan.getNotes();
        r.createdAt         = loan.getCreatedAt();

        r.paidAmount             = (long) loan.getPaidInstallments() * loan.getMonthlyAmount();
        r.remainingInstallments  = loan.getTotalInstallments() - loan.getPaidInstallments();
        r.remainingAmount        = (long) r.remainingInstallments * loan.getMonthlyAmount();
        r.completed              = loan.getPaidInstallments() >= loan.getTotalInstallments();
        r.lastPaymentDate        = lastPaymentDateJalali;
        r.installments           = installments;
        return r;
    }

    public Long getId() { return id; }
    public String getCreditor() { return creditor; }
    public Long getMonthlyAmount() { return monthlyAmount; }
    public Integer getTotalInstallments() { return totalInstallments; }
    public Integer getPaidInstallments() { return paidInstallments; }
    public String getStartDate() { return startDate; }
    public String getNotes() { return notes; }
    public Instant getCreatedAt() { return createdAt; }
    public Long getPaidAmount() { return paidAmount; }
    public Long getRemainingAmount() { return remainingAmount; }
    public Integer getRemainingInstallments() { return remainingInstallments; }
    public String getLastPaymentDate() { return lastPaymentDate; }
    public boolean isCompleted() { return completed; }
    public List<InstallmentView> getInstallments() { return installments; }
}
