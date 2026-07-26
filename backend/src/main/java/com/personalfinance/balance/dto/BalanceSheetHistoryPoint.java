package com.personalfinance.balance.dto;

public record BalanceSheetHistoryPoint(
        String recordedDateJalali,
        Long totalAssets,
        Long totalLiabilities,
        Long netBalance,
        Long delta
) {}
