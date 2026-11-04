package com.personalfinance.advisor;

import com.personalfinance.advisor.entity.EvaluationStatus;
import com.personalfinance.intelligence.metrics.FinancialMetrics;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Locale;

public final class RecommendationEvaluator {

    private RecommendationEvaluator() {}

    public record PricePoint(LocalDate date, BigDecimal close) {}

    public record Result(
            EvaluationStatus status,
            LocalDate startDate,
            LocalDate endDate,
            BigDecimal startPrice,
            BigDecimal endPrice,
            BigDecimal assetReturnPercent,
            BigDecimal goldReturnPercent,
            BigDecimal usdReturnPercent,
            BigDecimal btcReturnPercent,
            String assetMove,
            LocalDate horizonEnd,
            boolean horizonElapsed) {}

    public static LocalDate horizonEnd(String timeHorizon, LocalDate adviceDate) {
        if (timeHorizon == null || timeHorizon.isBlank() || adviceDate == null) {
            return null;
        }
        return switch (timeHorizon.trim().toUpperCase(Locale.ROOT)) {
            case "1M" -> adviceDate.plusMonths(1);
            case "3M" -> adviceDate.plusMonths(3);
            case "6M" -> adviceDate.plusMonths(6);
            case "1Y" -> adviceDate.plusYears(1);
            case "3Y" -> adviceDate.plusYears(3);
            default -> null;
        };
    }

    public static String assetMove(BigDecimal returnPercent) {
        if (returnPercent == null) {
            return null;
        }
        int sign = returnPercent.compareTo(BigDecimal.ZERO);
        if (sign > 0) {
            return "UP";
        }
        if (sign < 0) {
            return "DOWN";
        }
        return "FLAT";
    }

    public static Result evaluate(
            PricePoint assetStart,
            PricePoint assetEnd,
            PricePoint goldStart,
            PricePoint goldEnd,
            PricePoint usdStart,
            PricePoint usdEnd,
            PricePoint btcStart,
            PricePoint btcEnd,
            String timeHorizon,
            LocalDate adviceDate,
            LocalDate asOfDate) {
        LocalDate horizon = horizonEnd(timeHorizon, adviceDate);
        boolean elapsed = horizon == null || asOfDate == null || !asOfDate.isBefore(horizon);
        if (assetStart == null || assetEnd == null || assetStart.close() == null || assetEnd.close() == null) {
            return new Result(
                    EvaluationStatus.INSUFFICIENT_DATA,
                    null, null, null, null, null, null, null, null, null,
                    horizon, elapsed);
        }
        BigDecimal assetReturn = FinancialMetrics.returnPercent(assetStart.close(), assetEnd.close());
        return new Result(
                EvaluationStatus.EVALUATED,
                assetStart.date(),
                assetEnd.date(),
                assetStart.close(),
                assetEnd.close(),
                assetReturn,
                returnOf(goldStart, goldEnd),
                returnOf(usdStart, usdEnd),
                returnOf(btcStart, btcEnd),
                assetMove(assetReturn),
                horizon,
                elapsed);
    }

    private static BigDecimal returnOf(PricePoint start, PricePoint end) {
        if (start == null || end == null) {
            return null;
        }
        return FinancialMetrics.returnPercent(start.close(), end.close());
    }
}
