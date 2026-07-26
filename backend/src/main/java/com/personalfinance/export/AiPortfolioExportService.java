package com.personalfinance.export;

import com.personalfinance.account.dto.AccountResponse;
import com.personalfinance.account.dto.InvestmentResponse;
import com.personalfinance.account.service.AccountService;
import com.personalfinance.account.service.InvestmentService;
import com.personalfinance.balance.service.BalanceSheetService;
import com.personalfinance.expense.dto.PendingExpenseResponse;
import com.personalfinance.expense.service.PendingExpenseService;
import com.personalfinance.export.dto.*;
import com.personalfinance.history.SnapshotEntityType;
import com.personalfinance.history.service.ValueSnapshotService;
import com.personalfinance.income.dto.IncomeResponse;
import com.personalfinance.income.service.IncomeService;
import com.personalfinance.loan.dto.LoanResponse;
import com.personalfinance.loan.service.LoanService;
import com.personalfinance.receivable.dto.ReceivableResponse;
import com.personalfinance.receivable.service.ReceivableService;
import com.personalfinance.standby.dto.StandbyResponse;
import com.personalfinance.standby.service.StandbyService;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

import static com.personalfinance.export.ExportLabels.*;

@Service
public class AiPortfolioExportService {

    private final AccountService accountService;
    private final InvestmentService investmentService;
    private final StandbyService standbyService;
    private final ReceivableService receivableService;
    private final LoanService loanService;
    private final PendingExpenseService pendingExpenseService;
    private final IncomeService incomeService;
    private final BalanceSheetService balanceSheetService;
    private final ValueSnapshotService snapshotService;

    public AiPortfolioExportService(AccountService accountService,
                                    InvestmentService investmentService,
                                    StandbyService standbyService,
                                    ReceivableService receivableService,
                                    LoanService loanService,
                                    PendingExpenseService pendingExpenseService,
                                    IncomeService incomeService,
                                    BalanceSheetService balanceSheetService,
                                    ValueSnapshotService snapshotService) {
        this.accountService = accountService;
        this.investmentService = investmentService;
        this.standbyService = standbyService;
        this.receivableService = receivableService;
        this.loanService = loanService;
        this.pendingExpenseService = pendingExpenseService;
        this.incomeService = incomeService;
        this.balanceSheetService = balanceSheetService;
        this.snapshotService = snapshotService;
    }

    public AiPortfolioExportResponse buildExport() {
        long totalAssets = balanceSheetService.computeTotalAssets();
        long totalLiabilities = balanceSheetService.computeTotalLiabilities();

        return new AiPortfolioExportResponse(
                Instant.now(),
                "IRR",
                new AiPortfolioSummary(totalAssets, totalLiabilities, totalAssets - totalLiabilities),
                new AiPortfolioAssets(
                        mapAccounts(accountService.findAll()),
                        mapInvestments(investmentService.findAll()),
                        mapStandby(standbyService.findAll()),
                        mapReceivables(receivableService.findAll())),
                new AiPortfolioLiabilities(
                        mapLoans(loanService.findAll()),
                        mapPendingExpenses(pendingExpenseService.findAll())),
                mapIncome(incomeService.findAll()));
    }

    private List<AiPortfolioItem> mapAccounts(List<AccountResponse> accounts) {
        return accounts.stream()
                .map(a -> new AiPortfolioItem(
                        a.getId(),
                        a.getName(),
                        a.getBalance(),
                        nullSafe(a.getNotes()),
                        a.getType().name(),
                        ACCOUNT_TYPE_FA.getOrDefault(a.getType(), a.getType().name()),
                        CATEGORY_ASSET,
                        CATEGORY_ASSET_FA,
                        snapshotService.getLatestRecordedDateJalali(SnapshotEntityType.ACCOUNT, a.getId())
                                .orElse(null)))
                .toList();
    }

    private List<AiPortfolioItem> mapInvestments(List<InvestmentResponse> investments) {
        return investments.stream()
                .map(i -> new AiPortfolioItem(
                        i.getId(),
                        i.getName(),
                        i.getTomanEquivalent(),
                        nullSafe(i.getNotes()),
                        i.getAssetType().name(),
                        INVESTMENT_TYPE_FA.getOrDefault(i.getAssetType(), i.getAssetType().name()),
                        CATEGORY_ASSET,
                        CATEGORY_ASSET_FA,
                        snapshotService.getLatestRecordedDateJalali(SnapshotEntityType.INVESTMENT, i.getId())
                                .orElse(null)))
                .toList();
    }

    private List<AiPortfolioItem> mapStandby(List<StandbyResponse> items) {
        return items.stream()
                .map(s -> new AiPortfolioItem(
                        s.getId(),
                        s.getItemLabel(),
                        s.getTotalValue(),
                        nullSafe(s.getNotes()),
                        "STANDBY",
                        "کالای معوق",
                        CATEGORY_ASSET,
                        CATEGORY_ASSET_FA,
                        s.getDateAdded()))
                .toList();
    }

    private List<AiPortfolioItem> mapReceivables(List<ReceivableResponse> items) {
        return items.stream()
                .filter(r -> r.getOutstanding() > 0)
                .map(r -> new AiPortfolioItem(
                        r.getId(),
                        r.getDebtorName(),
                        r.getOutstanding(),
                        nullSafe(r.getNotes()),
                        "RECEIVABLE",
                        "مطالبات",
                        CATEGORY_ASSET,
                        CATEGORY_ASSET_FA,
                        r.getCreatedDate()))
                .toList();
    }

    private List<AiPortfolioItem> mapLoans(List<LoanResponse> loans) {
        return loans.stream()
                .filter(l -> !l.isCompleted() && l.getRemainingAmount() > 0)
                .map(l -> new AiPortfolioItem(
                        l.getId(),
                        l.getCreditor(),
                        l.getRemainingAmount(),
                        nullSafe(l.getNotes()),
                        "LOAN",
                        "وام",
                        CATEGORY_LIABILITY,
                        CATEGORY_LIABILITY_FA,
                        l.getStartDate()))
                .toList();
    }

    private List<AiPortfolioItem> mapPendingExpenses(List<PendingExpenseResponse> items) {
        return items.stream()
                .map(e -> new AiPortfolioItem(
                        e.getId(),
                        e.getLabel(),
                        e.getPlannedAmount(),
                        nullSafe(e.getNotes()),
                        "PENDING_EXPENSE",
                        "هزینه برنامه‌ریزی‌شده",
                        CATEGORY_LIABILITY,
                        CATEGORY_LIABILITY_FA,
                        e.getDueDate()))
                .toList();
    }

    private List<AiPortfolioItem> mapIncome(List<IncomeResponse> items) {
        return items.stream()
                .map(i -> new AiPortfolioItem(
                        i.getId(),
                        i.getSource(),
                        i.getAmount(),
                        nullSafe(i.getNotes()),
                        i.getIncomeType().name(),
                        INCOME_TYPE_FA.getOrDefault(i.getIncomeType(), i.getIncomeType().name()),
                        CATEGORY_INCOME,
                        CATEGORY_INCOME_FA,
                        i.getReceivedDate()))
                .toList();
    }
}
