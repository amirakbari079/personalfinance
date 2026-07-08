package com.personalfinance.balance.service;

import com.personalfinance.account.service.AccountService;
import com.personalfinance.account.service.InvestmentService;
import com.personalfinance.balance.dto.BalanceResponse;
import com.personalfinance.expense.service.PendingExpenseService;
import com.personalfinance.loan.service.LoanService;
import com.personalfinance.receivable.service.ReceivableService;
import com.personalfinance.standby.service.StandbyService;
import org.springframework.stereotype.Service;

@Service
public class BalanceService {

    private final AccountService accountService;
    private final InvestmentService investmentService;
    private final StandbyService standbyService;
    private final ReceivableService receivableService;
    private final LoanService loanService;
    private final PendingExpenseService pendingExpenseService;

    public BalanceService(AccountService accountService,
                          InvestmentService investmentService,
                          StandbyService standbyService,
                          ReceivableService receivableService,
                          LoanService loanService,
                          PendingExpenseService pendingExpenseService) {
        this.accountService = accountService;
        this.investmentService = investmentService;
        this.standbyService = standbyService;
        this.receivableService = receivableService;
        this.loanService = loanService;
        this.pendingExpenseService = pendingExpenseService;
    }

    public BalanceResponse getNetWorth() {
        return BalanceResponse.of(
                accountService.totalBalance(),
                investmentService.totalTomanValue(),
                standbyService.totalValue(),
                receivableService.totalOutstanding(),
                loanService.activeMonthlyTotal(),
                pendingExpenseService.totalPlannedAmount());
    }
}
