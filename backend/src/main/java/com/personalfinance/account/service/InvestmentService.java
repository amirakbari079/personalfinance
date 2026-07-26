package com.personalfinance.account.service;

import com.personalfinance.account.dto.InvestmentRequest;
import com.personalfinance.account.dto.InvestmentResponse;
import com.personalfinance.account.entity.Investment;
import com.personalfinance.account.repository.InvestmentRepository;
import com.personalfinance.balance.service.BalanceSheetService;
import com.personalfinance.history.SnapshotEntityType;
import com.personalfinance.history.service.ValueSnapshotService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class InvestmentService {

    private final InvestmentRepository investmentRepository;
    private final ValueSnapshotService snapshotService;
    private final BalanceSheetService balanceSheetService;

    public InvestmentService(InvestmentRepository investmentRepository,
                             ValueSnapshotService snapshotService,
                             BalanceSheetService balanceSheetService) {
        this.investmentRepository = investmentRepository;
        this.snapshotService = snapshotService;
        this.balanceSheetService = balanceSheetService;
    }

    public List<InvestmentResponse> findAll() {
        return investmentRepository.findAll()
                .stream()
                .map(investment -> enrich(InvestmentResponse.from(investment)))
                .toList();
    }

    @Transactional
    public InvestmentResponse create(InvestmentRequest request) {
        Investment investment = new Investment();
        apply(investment, request);
        investment = investmentRepository.save(investment);
        recordValueSnapshot(investment, request);
        balanceSheetService.recordTodaySnapshot();
        return enrich(InvestmentResponse.from(investmentRepository.save(investment)));
    }

    @Transactional
    public InvestmentResponse update(Long id, InvestmentRequest request) {
        Investment investment = investmentRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("سرمایه‌گذاری یافت نشد: " + id));
        apply(investment, request);
        recordValueSnapshot(investment, request);
        balanceSheetService.recordTodaySnapshot();
        return enrich(InvestmentResponse.from(investmentRepository.save(investment)));
    }

    @Transactional
    public void delete(Long id) {
        if (!investmentRepository.existsById(id)) {
            throw new NoSuchElementException("سرمایه‌گذاری یافت نشد: " + id);
        }
        snapshotService.deleteByEntity(SnapshotEntityType.INVESTMENT, id);
        investmentRepository.deleteById(id);
        balanceSheetService.recordTodaySnapshot();
    }

    public Long totalTomanValue() {
        return investmentRepository.sumAllTomanEquivalents();
    }

    private void apply(Investment investment, InvestmentRequest request) {
        investment.setName(request.getName());
        investment.setAssetType(request.getAssetType());
        investment.setNativeAmount(request.getNativeAmount());
        investment.setNativeUnit(request.getNativeUnit());
        investment.setNotes(request.getNotes());
    }

    private void recordValueSnapshot(Investment investment, InvestmentRequest request) {
        LocalDate recordedDate = snapshotService.resolveRecordedDate(request.getValueRecordedDate());
        snapshotService.upsert(
                SnapshotEntityType.INVESTMENT,
                investment.getId(),
                request.getTomanEquivalent(),
                recordedDate,
                request.getNotes());
        investment.setTomanEquivalent(
                snapshotService.getLatestValue(SnapshotEntityType.INVESTMENT, investment.getId()));
    }

    private InvestmentResponse enrich(InvestmentResponse response) {
        snapshotService.getLatestRecordedDateJalali(SnapshotEntityType.INVESTMENT, response.getId())
                .ifPresent(response::setValueRecordedDate);
        return response;
    }
}
