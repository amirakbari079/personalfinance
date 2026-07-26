package com.personalfinance.history.dto;

public record TotalSeriesPoint(
        String recordedDateJalali,
        Long total,
        Long delta
) {}
