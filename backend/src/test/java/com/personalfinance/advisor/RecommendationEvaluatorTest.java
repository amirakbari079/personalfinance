package com.personalfinance.advisor;

import com.personalfinance.advisor.entity.EvaluationStatus;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RecommendationEvaluatorTest {

    @Test
    void computesAssetAndBenchmarkReturnsWithoutLlm() {
        LocalDate start = LocalDate.of(2026, 2, 1);
        LocalDate end = LocalDate.of(2026, 8, 1);
        RecommendationEvaluator.Result result = RecommendationEvaluator.evaluate(
                new RecommendationEvaluator.PricePoint(start, new BigDecimal("100")),
                new RecommendationEvaluator.PricePoint(end, new BigDecimal("110")),
                new RecommendationEvaluator.PricePoint(start, new BigDecimal("100")),
                new RecommendationEvaluator.PricePoint(end, new BigDecimal("105")),
                new RecommendationEvaluator.PricePoint(start, new BigDecimal("50")),
                new RecommendationEvaluator.PricePoint(end, new BigDecimal("55")),
                new RecommendationEvaluator.PricePoint(start, new BigDecimal("200")),
                new RecommendationEvaluator.PricePoint(end, new BigDecimal("180")),
                "6M",
                start,
                end);

        assertEquals(EvaluationStatus.EVALUATED, result.status());
        assertEquals(new BigDecimal("10.0000"), result.assetReturnPercent());
        assertEquals(new BigDecimal("5.0000"), result.goldReturnPercent());
        assertEquals(new BigDecimal("10.0000"), result.usdReturnPercent());
        assertEquals(new BigDecimal("-10.0000"), result.btcReturnPercent());
        assertEquals("UP", result.assetMove());
        assertTrue(result.horizonElapsed());
        assertEquals(LocalDate.of(2026, 8, 1), result.horizonEnd());
    }

    @Test
    void missingPrimaryPricesIsInsufficient() {
        RecommendationEvaluator.Result result = RecommendationEvaluator.evaluate(
                null,
                new RecommendationEvaluator.PricePoint(LocalDate.of(2026, 8, 1), new BigDecimal("10")),
                null, null, null, null, null, null,
                "1Y",
                LocalDate.of(2026, 1, 1),
                LocalDate.of(2026, 6, 1));
        assertEquals(EvaluationStatus.INSUFFICIENT_DATA, result.status());
        assertNull(result.assetReturnPercent());
        assertFalse(result.horizonElapsed());
        assertEquals(LocalDate.of(2027, 1, 1), result.horizonEnd());
    }
}
