package com.personalfinance.balance.dto;

public class BalanceResponse {

    private Long cash;
    private Long investments;
    private Long standby;
    private Long receivablesOutstanding;
    private Long totalCapital;
    private Long monthlyInstallments;
    private Long pendingExpenses;
    private Long netWorth;

    public static BalanceResponse of(
            Long cash,
            Long investments,
            Long standby,
            Long receivablesOutstanding,
            Long monthlyInstallments,
            Long pendingExpenses) {
        BalanceResponse r = new BalanceResponse();
        r.cash = cash;
        r.investments = investments;
        r.standby = standby;
        r.receivablesOutstanding = receivablesOutstanding;
        r.totalCapital = cash + investments + standby + receivablesOutstanding;
        r.monthlyInstallments = monthlyInstallments;
        r.pendingExpenses = pendingExpenses;
        r.netWorth = r.totalCapital - monthlyInstallments - pendingExpenses;
        return r;
    }

    public Long getCash() { return cash; }
    public Long getInvestments() { return investments; }
    public Long getStandby() { return standby; }
    public Long getReceivablesOutstanding() { return receivablesOutstanding; }
    public Long getTotalCapital() { return totalCapital; }
    public Long getMonthlyInstallments() { return monthlyInstallments; }
    public Long getPendingExpenses() { return pendingExpenses; }
    public Long getNetWorth() { return netWorth; }
}
