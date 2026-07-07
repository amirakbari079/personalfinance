package com.personalfinance.income.service;

import com.personalfinance.common.JalaliDateConverter;
import com.personalfinance.income.dto.IncomeRequest;
import com.personalfinance.income.dto.IncomeResponse;
import com.personalfinance.income.entity.Income;
import com.personalfinance.income.entity.IncomeType;
import com.personalfinance.income.repository.IncomeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class IncomeService {

    private final IncomeRepository incomeRepository;
    private final JalaliDateConverter jalaliDateConverter;

    public IncomeService(IncomeRepository incomeRepository, JalaliDateConverter jalaliDateConverter) {
        this.incomeRepository = incomeRepository;
        this.jalaliDateConverter = jalaliDateConverter;
    }

    public List<IncomeResponse> findAll() {
        return incomeRepository.findAll()
                .stream()
                .map(i -> IncomeResponse.from(i, jalaliDateConverter.toJalali(i.getReceivedDate())))
                .toList();
    }

    @Transactional
    public IncomeResponse create(IncomeRequest request) {
        Income income = new Income();
        apply(income, request);
        return toResponse(incomeRepository.save(income));
    }

    @Transactional
    public IncomeResponse update(Long id, IncomeRequest request) {
        Income income = incomeRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("درآمد یافت نشد: " + id));
        apply(income, request);
        return toResponse(incomeRepository.save(income));
    }

    @Transactional
    public void delete(Long id) {
        if (!incomeRepository.existsById(id)) {
            throw new NoSuchElementException("درآمد یافت نشد: " + id);
        }
        incomeRepository.deleteById(id);
    }

    /** Total of all recurring (monthly) income sources. */
    public Long monthlyRecurringTotal() {
        return incomeRepository.sumByType(IncomeType.RECURRING);
    }

    private void apply(Income income, IncomeRequest request) {
        income.setSource(request.getSource());
        income.setAmount(request.getAmount());
        income.setIncomeType(request.getIncomeType());
        income.setReceivedDate(jalaliDateConverter.toGregorian(request.getReceivedDate()));
        income.setNotes(request.getNotes());
    }

    private IncomeResponse toResponse(Income income) {
        return IncomeResponse.from(income, jalaliDateConverter.toJalali(income.getReceivedDate()));
    }
}
