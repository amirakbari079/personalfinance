package com.personalfinance.loan.repository;

import com.personalfinance.loan.entity.Loan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface LoanRepository extends JpaRepository<Loan, Long> {

    /** Sum of all monthly installment amounts across active (incomplete) loans. */
    @Query("SELECT COALESCE(SUM(l.monthlyAmount), 0) FROM Loan l WHERE l.paidInstallments < l.totalInstallments")
    Long sumActiveMonthlyAmounts();

    /** Sum of remaining debt across active (incomplete) loans. */
    @Query("SELECT COALESCE(SUM((l.totalInstallments - l.paidInstallments) * l.monthlyAmount), 0) FROM Loan l WHERE l.paidInstallments < l.totalInstallments")
    Long sumActiveRemainingAmounts();
}
