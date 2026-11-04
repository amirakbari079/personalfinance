package com.personalfinance.intelligence.metrics;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class FinancialMetrics {

    private static final BigDecimal HUNDRED = new BigDecimal("100");

    private FinancialMetrics() {}

    public static BigDecimal returnPercent(BigDecimal start, BigDecimal end) {
        if (start == null || end == null || start.compareTo(BigDecimal.ZERO) == 0) {
            return null;
        }
        return end.subtract(start)
                .multiply(HUNDRED)
                .divide(start, 4, RoundingMode.HALF_UP);
    }

    public static BigDecimal premiumPercent(BigDecimal market, BigDecimal reference) {
        return returnPercent(reference, market);
    }

    /** Symmetric percent difference: |a-b| / ((a+b)/2) * 100. */
    public static BigDecimal differencePercent(BigDecimal a, BigDecimal b) {
        if (a == null || b == null) {
            return null;
        }
        BigDecimal mid = a.add(b).divide(new BigDecimal("2"), 8, RoundingMode.HALF_UP);
        if (mid.compareTo(BigDecimal.ZERO) == 0) {
            return null;
        }
        return a.subtract(b).abs()
                .multiply(HUNDRED)
                .divide(mid, 4, RoundingMode.HALF_UP);
    }
}
