package com.personalfinance.history.service;

import com.github.mfathi91.time.PersianDate;

import com.personalfinance.account.repository.AccountRepository;

import com.personalfinance.account.repository.InvestmentRepository;

import com.personalfinance.common.JalaliDateConverter;

import com.personalfinance.history.SnapshotEntityType;

import com.personalfinance.history.dto.CashFlowResponse;

import com.personalfinance.history.dto.TotalSeriesPoint;

import com.personalfinance.history.repository.ValueSnapshotRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;

import java.util.ArrayList;

import java.util.List;

@Service

public class AggregateHistoryService {

    private final ValueSnapshotRepository snapshotRepository;

    private final AccountRepository accountRepository;

    private final InvestmentRepository investmentRepository;

    private final ValueSnapshotService snapshotService;

    private final JalaliDateConverter jalaliDateConverter;
    private final org.springframework.jdbc.core.JdbcTemplate jdbc;

    public AggregateHistoryService(

            ValueSnapshotRepository snapshotRepository,

            AccountRepository accountRepository,

            InvestmentRepository investmentRepository,

            ValueSnapshotService snapshotService,

            JalaliDateConverter jalaliDateConverter, org.springframework.jdbc.core.JdbcTemplate jdbc) {

        this.snapshotRepository = snapshotRepository;

        this.accountRepository = accountRepository;

        this.investmentRepository = investmentRepository;

        this.snapshotService = snapshotService;

        this.jalaliDateConverter = jalaliDateConverter;
        this.jdbc = jdbc;

    }

    public List<TotalSeriesPoint> getAccountTotalSeries() {

        List<Long> ids = accountRepository.findAllIncludingArchived().stream().map(a -> a.getId()).toList();

        return getTotalSeries(SnapshotEntityType.ACCOUNT, ids);

    }

    public List<TotalSeriesPoint> getInvestmentTotalSeries() {

        List<Long> ids = investmentRepository.findAll().stream().map(i -> i.getId()).toList();

        return getTotalSeries(SnapshotEntityType.INVESTMENT, ids);

    }

    public CashFlowResponse getAccountCashFlow() {

        List<Long> ids = accountRepository.findAllIncludingArchived().stream().map(a -> a.getId()).toList();

        return getCashFlow(SnapshotEntityType.ACCOUNT, ids);

    }

    public CashFlowResponse getInvestmentCashFlow() {

        List<Long> ids = investmentRepository.findAll().stream().map(i -> i.getId()).toList();

        return getCashFlow(SnapshotEntityType.INVESTMENT, ids);

    }

    private List<TotalSeriesPoint> getTotalSeries(SnapshotEntityType entityType, List<Long> entityIds) {

        List<LocalDate> dates = recordedDates(entityType);

        if (dates.isEmpty()) {

            return List.of();

        }

        List<TotalSeriesPoint> series = new ArrayList<>();

        Long previousTotal = null;

        for (LocalDate date : dates) {

            long total = computeTotalOnOrBefore(entityType, entityIds, date);

            Long delta = previousTotal == null ? null : total - previousTotal;

            series.add(new TotalSeriesPoint(jalaliDateConverter.toJalali(date), total, delta));

            previousTotal = total;

        }

        return series;

    }

    private CashFlowResponse getCashFlow(SnapshotEntityType entityType, List<Long> entityIds) {

        LocalDate today = com.personalfinance.foundation.LedgerService.today();

        PersianDate persianToday = PersianDate.fromGregorian(today);

        LocalDate monthStart = PersianDate.of(persianToday.getYear(), persianToday.getMonthValue(), 1)

                .toGregorian();

        long currentTotal = entityIds.stream()

                .mapToLong(id -> snapshotService.getLatestValue(entityType, id))

                .sum();

        long startOfMonthTotal = computeTotalOnOrBefore(entityType, entityIds, monthStart);

        if (startOfMonthTotal == 0L && currentTotal == 0L) {

            List<LocalDate> dates = recordedDates(entityType);

            if (!dates.isEmpty()) {

                LocalDate firstInMonth = dates.stream()

                        .filter(d -> !d.isBefore(monthStart))

                        .findFirst()

                        .orElse(null);

                if (firstInMonth != null) {

                    startOfMonthTotal = computeTotalOnOrBefore(entityType, entityIds, firstInMonth);

                }

            }

        }

        long delta = currentTotal - startOfMonthTotal;

        Double percentChange = startOfMonthTotal == 0L

                ? null

                : (delta * 100.0) / startOfMonthTotal;

        String monthLabel = jalaliDateConverter.jalaliMonthLabel(jalaliDateConverter.toJalali(today));

        return new CashFlowResponse(

                monthLabel,

                startOfMonthTotal,

                currentTotal,

                delta,

                percentChange,

                delta >= 0);

    }

    private long computeTotalOnOrBefore(

            SnapshotEntityType entityType,

            List<Long> entityIds,

            LocalDate asOf) {

        long total = 0L;

        for (Long entityId : entityIds) {

            total += snapshotService.getValueOnOrBefore(entityType, entityId, asOf);

        }

        return total;

    }

    private List<LocalDate> recordedDates(SnapshotEntityType type) {
        if(type != SnapshotEntityType.ACCOUNT) return snapshotRepository.findDistinctRecordedDates(type);
        return jdbc.query("SELECT recorded_date d FROM value_snapshots WHERE entity_type='ACCOUNT' UNION SELECT opening_date FROM pf_ledger_accounts UNION SELECT t.effective_date FROM pf_transactions t JOIN pf_transaction_entries e ON e.transaction_id=t.id ORDER BY d", (rs,n)->rs.getDate(1).toLocalDate());
    }
}
