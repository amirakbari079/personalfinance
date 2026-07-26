package com.personalfinance.account.service;

import com.personalfinance.account.repository.InvestmentRepository;
import com.personalfinance.history.SnapshotEntityType;
import com.personalfinance.history.dto.SnapshotRequest;
import com.personalfinance.history.dto.SnapshotResponse;
import com.personalfinance.history.service.ValueSnapshotService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class InvestmentSnapshotService {

    private final InvestmentRepository investmentRepository;
    private final ValueSnapshotService snapshotService;

    public InvestmentSnapshotService(
            InvestmentRepository investmentRepository,
            ValueSnapshotService snapshotService) {
        this.investmentRepository = investmentRepository;
        this.snapshotService = snapshotService;
    }

    public List<SnapshotResponse> list(Long investmentId) {
        requireInvestment(investmentId);
        return snapshotService.findHistory(SnapshotEntityType.INVESTMENT, investmentId);
    }

    @Transactional
    public SnapshotResponse create(Long investmentId, SnapshotRequest request) {
        requireInvestment(investmentId);
        SnapshotResponse response = snapshotService.create(SnapshotEntityType.INVESTMENT, investmentId, request);
        syncTomanEquivalent(investmentId);
        return response;
    }

    @Transactional
    public SnapshotResponse update(Long investmentId, Long snapshotId, SnapshotRequest request) {
        requireInvestment(investmentId);
        SnapshotResponse response = snapshotService.update(
                SnapshotEntityType.INVESTMENT, investmentId, snapshotId, request);
        syncTomanEquivalent(investmentId);
        return response;
    }

    @Transactional
    public void delete(Long investmentId, Long snapshotId) {
        requireInvestment(investmentId);
        snapshotService.delete(SnapshotEntityType.INVESTMENT, investmentId, snapshotId);
        syncTomanEquivalent(investmentId);
    }

    private void syncTomanEquivalent(Long investmentId) {
        var investment = investmentRepository.findById(investmentId).orElseThrow();
        investment.setTomanEquivalent(
                snapshotService.getLatestValue(SnapshotEntityType.INVESTMENT, investmentId));
        investmentRepository.save(investment);
    }

    private void requireInvestment(Long investmentId) {
        if (!investmentRepository.existsById(investmentId)) {
            throw new NoSuchElementException("سرمایه‌گذاری یافت نشد: " + investmentId);
        }
    }
}
