package com.personalfinance.balance.service;

import com.github.mfathi91.time.PersianDate;
import com.personalfinance.account.repository.AccountRepository;
import com.personalfinance.account.repository.InvestmentRepository;
import com.personalfinance.balance.dto.BalanceSheetHistoryPoint;
import com.personalfinance.balance.entity.BalanceSheetSnapshot;
import com.personalfinance.balance.repository.BalanceSheetSnapshotRepository;
import com.personalfinance.common.JalaliDateConverter;
import com.personalfinance.expense.repository.PendingExpenseRepository;
import com.personalfinance.history.dto.CashFlowResponse;
import com.personalfinance.loan.repository.LoanRepository;
import com.personalfinance.receivable.repository.ReceivableRepository;
import com.personalfinance.standby.repository.StandbyRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class BalanceSheetService {

    private final AccountRepository accountRepository;
    private final InvestmentRepository investmentRepository;
    private final StandbyRepository standbyRepository;
    private final ReceivableRepository receivableRepository;
    private final LoanRepository loanRepository;
    private final PendingExpenseRepository pendingExpenseRepository;
    private final BalanceSheetSnapshotRepository snapshotRepository;
    private final JalaliDateConverter jalali;

    public BalanceSheetService(
            AccountRepository accountRepository,
            InvestmentRepository investmentRepository,
            StandbyRepository standbyRepository,
            ReceivableRepository receivableRepository,
            LoanRepository loanRepository,
            PendingExpenseRepository pendingExpenseRepository,
            BalanceSheetSnapshotRepository snapshotRepository,
            JalaliDateConverter jalali) {
        this.accountRepository = accountRepository;
        this.investmentRepository = investmentRepository;
        this.standbyRepository = standbyRepository;
        this.receivableRepository = receivableRepository;
        this.loanRepository = loanRepository;
        this.pendingExpenseRepository = pendingExpenseRepository;
        this.snapshotRepository = snapshotRepository;
        this.jalali = jalali;
    }

    public long computeTotalAssets() {
        return accountRepository.sumAllBalances()
                + investmentRepository.sumAllTomanEquivalents()
                + standbyRepository.sumTotalValue()
                + receivableRepository.sumOutstanding();
    }

    public long computeTotalLiabilities() {
        return loanRepository.sumActiveRemainingAmounts()
                + pendingExpenseRepository.sumAllPlannedAmounts();
    }

    public long computeNetBalance() {
        return computeTotalAssets() - computeTotalLiabilities();
    }

    @Transactional
    public void recordTodaySnapshot() {
        LocalDate today = LocalDate.now();
        long totalAssets = computeTotalAssets();
        long totalLiabilities = computeTotalLiabilities();
        long netBalance = totalAssets - totalLiabilities;

        BalanceSheetSnapshot snapshot = snapshotRepository.findByRecordedDate(today)
                .orElseGet(BalanceSheetSnapshot::new);

        snapshot.setRecordedDate(today);
        snapshot.setTotalAssets(totalAssets);
        snapshot.setTotalLiabilities(totalLiabilities);
        snapshot.setNetBalance(netBalance);
        snapshotRepository.save(snapshot);
    }

    @Scheduled(cron = "0 5 0 * * *")
    @Transactional
    public void scheduledDailySnapshot() {
        recordTodaySnapshot();
    }

    public List<BalanceSheetHistoryPoint> getHistorySeries() {
        recordTodaySnapshot();

        List<BalanceSheetSnapshot> snapshots = snapshotRepository.findAllByOrderByRecordedDateAsc();
        List<BalanceSheetHistoryPoint> series = new ArrayList<>();
        Long previousNet = null;

        for (BalanceSheetSnapshot s : snapshots) {
            Long delta = previousNet == null ? null : s.getNetBalance() - previousNet;
            series.add(new BalanceSheetHistoryPoint(
                    jalali.toJalali(s.getRecordedDate()),
                    s.getTotalAssets(),
                    s.getTotalLiabilities(),
                    s.getNetBalance(),
                    delta));
            previousNet = s.getNetBalance();
        }

        return series;
    }

    public CashFlowResponse getCashFlow() {
        recordTodaySnapshot();

        LocalDate today = LocalDate.now();
        PersianDate persianToday = PersianDate.fromGregorian(today);
        LocalDate monthStart = PersianDate.of(persianToday.getYear(), persianToday.getMonthValue(), 1)
                .toGregorian();

        long currentNet = computeNetBalance();

        long startOfMonthNet = snapshotRepository.findAllByOrderByRecordedDateAsc().stream()
                .filter(s -> !s.getRecordedDate().isBefore(monthStart))
                .findFirst()
                .map(BalanceSheetSnapshot::getNetBalance)
                .orElseGet(() -> snapshotRepository.findAllByOrderByRecordedDateAsc().stream()
                        .filter(s -> !s.getRecordedDate().isAfter(monthStart))
                        .reduce((a, b) -> b)
                        .map(BalanceSheetSnapshot::getNetBalance)
                        .orElse(currentNet));

        long delta = currentNet - startOfMonthNet;
        Double percentChange = startOfMonthNet == 0L
                ? null
                : (delta * 100.0) / Math.abs(startOfMonthNet);

        String monthLabel = jalali.jalaliMonthLabel(jalali.toJalali(today));

        return new CashFlowResponse(
                monthLabel,
                startOfMonthNet,
                currentNet,
                delta,
                percentChange,
                delta >= 0);
    }
}
