package com.personalfinance.expense.service;

import com.personalfinance.balance.service.BalanceSheetService;
import com.personalfinance.common.JalaliDateConverter;
import com.personalfinance.expense.dto.PendingExpenseRequest;
import com.personalfinance.expense.dto.PendingExpenseResponse;
import com.personalfinance.expense.entity.PendingExpense;
import com.personalfinance.expense.repository.PendingExpenseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class PendingExpenseService {

    private final PendingExpenseRepository pendingExpenseRepository;
    private final JalaliDateConverter jalaliDateConverter;
    private final BalanceSheetService balanceSheetService;

    public PendingExpenseService(PendingExpenseRepository pendingExpenseRepository,
                                 JalaliDateConverter jalaliDateConverter,
                                 BalanceSheetService balanceSheetService) {
        this.pendingExpenseRepository = pendingExpenseRepository;
        this.jalaliDateConverter = jalaliDateConverter;
        this.balanceSheetService = balanceSheetService;
    }

    public List<PendingExpenseResponse> findAll() {
        return pendingExpenseRepository.findAll()
                .stream()
                .map(e -> PendingExpenseResponse.from(e, jalaliDateConverter.toJalali(e.getDueDate())))
                .toList();
    }

    @Transactional
    public PendingExpenseResponse create(PendingExpenseRequest request) {
        PendingExpense expense = new PendingExpense();
        apply(expense, request);
        PendingExpenseResponse response = toResponse(pendingExpenseRepository.save(expense));
        balanceSheetService.recordTodaySnapshot();
        return response;
    }

    @Transactional
    public PendingExpenseResponse update(Long id, PendingExpenseRequest request) {
        PendingExpense expense = pendingExpenseRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("هزینه یافت نشد: " + id));
        apply(expense, request);
        PendingExpenseResponse response = toResponse(pendingExpenseRepository.save(expense));
        balanceSheetService.recordTodaySnapshot();
        return response;
    }

    @Transactional
    public void delete(Long id) {
        if (!pendingExpenseRepository.existsById(id)) {
            throw new NoSuchElementException("هزینه یافت نشد: " + id);
        }
        pendingExpenseRepository.deleteById(id);
        balanceSheetService.recordTodaySnapshot();
    }

    public Long totalPlannedAmount() {
        return pendingExpenseRepository.sumAllPlannedAmounts();
    }

    private void apply(PendingExpense expense, PendingExpenseRequest request) {
        expense.setLabel(request.getLabel());
        expense.setPlannedAmount(request.getPlannedAmount());
        expense.setDueDate(jalaliDateConverter.toGregorian(request.getDueDate()));
        expense.setNotes(request.getNotes());
    }

    private PendingExpenseResponse toResponse(PendingExpense expense) {
        return PendingExpenseResponse.from(expense, jalaliDateConverter.toJalali(expense.getDueDate()));
    }
}
