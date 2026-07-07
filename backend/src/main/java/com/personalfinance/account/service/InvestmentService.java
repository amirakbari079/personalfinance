package com.personalfinance.account.service;

import com.personalfinance.account.dto.InvestmentRequest;
import com.personalfinance.account.dto.InvestmentResponse;
import com.personalfinance.account.entity.Investment;
import com.personalfinance.account.repository.InvestmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class InvestmentService {

    private final InvestmentRepository investmentRepository;

    public InvestmentService(InvestmentRepository investmentRepository) {
        this.investmentRepository = investmentRepository;
    }

    public List<InvestmentResponse> findAll() {
        return investmentRepository.findAll()
                .stream()
                .map(InvestmentResponse::from)
                .toList();
    }

    @Transactional
    public InvestmentResponse create(InvestmentRequest request) {
        Investment investment = new Investment();
        apply(investment, request);
        return InvestmentResponse.from(investmentRepository.save(investment));
    }

    @Transactional
    public InvestmentResponse update(Long id, InvestmentRequest request) {
        Investment investment = investmentRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("سرمایه‌گذاری یافت نشد: " + id));
        apply(investment, request);
        return InvestmentResponse.from(investmentRepository.save(investment));
    }

    @Transactional
    public void delete(Long id) {
        if (!investmentRepository.existsById(id)) {
            throw new NoSuchElementException("سرمایه‌گذاری یافت نشد: " + id);
        }
        investmentRepository.deleteById(id);
    }

    public Long totalTomanValue() {
        return investmentRepository.sumAllTomanEquivalents();
    }

    private void apply(Investment investment, InvestmentRequest request) {
        investment.setName(request.getName());
        investment.setAssetType(request.getAssetType());
        investment.setNativeAmount(request.getNativeAmount());
        investment.setNativeUnit(request.getNativeUnit());
        investment.setTomanEquivalent(request.getTomanEquivalent());
        investment.setNotes(request.getNotes());
    }
}
