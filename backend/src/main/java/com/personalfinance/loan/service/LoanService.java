package com.personalfinance.loan.service;

import com.personalfinance.common.JalaliDateConverter;
import com.personalfinance.loan.dto.InstallmentView;
import com.personalfinance.loan.dto.LoanRequest;
import com.personalfinance.loan.dto.LoanResponse;
import com.personalfinance.loan.entity.Loan;
import com.personalfinance.loan.repository.LoanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class LoanService {

    private final LoanRepository loanRepository;
    private final JalaliDateConverter jalali;

    public LoanService(LoanRepository loanRepository, JalaliDateConverter jalali) {
        this.loanRepository = loanRepository;
        this.jalali = jalali;
    }

    public List<LoanResponse> findAll() {
        return loanRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public LoanResponse create(LoanRequest request) {
        Loan loan = new Loan();
        apply(loan, request);
        return toResponse(loanRepository.save(loan));
    }

    @Transactional
    public LoanResponse update(Long id, LoanRequest request) {
        Loan loan = loanRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("وام یافت نشد: " + id));
        apply(loan, request);
        return toResponse(loanRepository.save(loan));
    }

    @Transactional
    public void delete(Long id) {
        if (!loanRepository.existsById(id)) {
            throw new NoSuchElementException("وام یافت نشد: " + id);
        }
        loanRepository.deleteById(id);
    }

    /**
     * Records payment of the next installment (sequential only).
     * Throws IllegalStateException if the loan is already fully paid.
     */
    @Transactional
    public LoanResponse payNextInstallment(Long id) {
        Loan loan = loanRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("وام یافت نشد: " + id));
        if (loan.getPaidInstallments() >= loan.getTotalInstallments()) {
            throw new IllegalStateException("همه اقساط این وام پرداخت شده");
        }
        loan.setPaidInstallments(loan.getPaidInstallments() + 1);
        return toResponse(loanRepository.save(loan));
    }

    /** Sum of monthly installments across all active (incomplete) loans — for the dashboard. */
    public Long activeMonthlyTotal() {
        return loanRepository.sumActiveMonthlyAmounts();
    }

    private void apply(Loan loan, LoanRequest request) {
        loan.setCreditor(request.getCreditor());
        loan.setMonthlyAmount(request.getMonthlyAmount());
        loan.setTotalInstallments(request.getTotalInstallments());
        loan.setStartDate(jalali.toGregorian(request.getStartDate()));
        loan.setNotes(request.getNotes());
    }

    private LoanResponse toResponse(Loan loan) {
        String startJalali = jalali.toJalali(loan.getStartDate());
        int total = loan.getTotalInstallments();
        int paid = loan.getPaidInstallments();

        // Last installment date = startDate + (total - 1) months, in Jalali months.
        String lastPaymentDate = (total > 0)
                ? jalali.addMonthsToJalali(startJalali, total - 1)
                : null;

        return LoanResponse.from(loan, startJalali, lastPaymentDate, buildInstallments(loan));
    }

    /** Builds the full installment checklist (one slot per installment). */
    private List<InstallmentView> buildInstallments(Loan loan) {
        String startJalali = jalali.toJalali(loan.getStartDate());
        int total = loan.getTotalInstallments();
        int paid = loan.getPaidInstallments();
        List<InstallmentView> list = new ArrayList<>(total);

        for (int i = 0; i < total; i++) {
            int number = i + 1;
            String dueDate = jalali.addMonthsToJalali(startJalali, i);
            String monthLabel = jalali.jalaliMonthLabel(dueDate);
            String status;
            if (number <= paid) {
                status = "PAID";
            } else if (number == paid + 1) {
                status = "NEXT";
            } else {
                status = "UPCOMING";
            }
            list.add(new InstallmentView(number, dueDate, monthLabel, status));
        }
        return list;
    }
}
