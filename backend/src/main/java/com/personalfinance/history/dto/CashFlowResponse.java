package com.personalfinance.history.dto;

public record CashFlowResponse(
        String monthLabel,
        Long startOfMonthTotal,
        Long currentTotal,
        Long delta,
        Double percentChange,
        boolean positive
) {}
