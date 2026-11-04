package com.personalfinance.intelligence;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Locale;

public final class HistoryRange {

    public static final ZoneId TEHRAN = ZoneId.of("Asia/Tehran");

    private HistoryRange() {}

    public static LocalDate startDate(String range, LocalDate today) {
        String normalized = range == null ? "1M" : range.trim().toUpperCase(Locale.ROOT);
        return switch (normalized) {
            case "1W" -> today.minusWeeks(1);
            case "1M" -> today.minusMonths(1);
            case "3M" -> today.minusMonths(3);
            case "6M" -> today.minusMonths(6);
            case "YTD" -> today.withDayOfYear(1);
            case "1Y" -> today.minusYears(1);
            case "3Y" -> today.minusYears(3);
            case "MAX" -> LocalDate.of(1970, 1, 1);
            default -> throw new IllegalArgumentException("بازه نامعتبر است: " + range);
        };
    }
}
