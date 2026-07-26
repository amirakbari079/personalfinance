package com.personalfinance.export.dto;

import java.util.List;

public class AiPortfolioLiabilities {

    private List<AiPortfolioItem> loans;
    private List<AiPortfolioItem> pendingExpenses;

    public AiPortfolioLiabilities() {}

    public AiPortfolioLiabilities(List<AiPortfolioItem> loans,
                                  List<AiPortfolioItem> pendingExpenses) {
        this.loans = loans;
        this.pendingExpenses = pendingExpenses;
    }

    public List<AiPortfolioItem> getLoans() { return loans; }
    public List<AiPortfolioItem> getPendingExpenses() { return pendingExpenses; }
}
