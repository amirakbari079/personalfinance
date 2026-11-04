package com.personalfinance.intelligence.macro;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CpiYoyCalculatorTest {

    @Test
    void july2026VersusJuly2025() {
        List<CpiYoyCalculator.Observation> rows = CpiYoyCalculator.yearOverYear(List.of(
                new BlsCpiParser.IndexPoint("2026-07", new BigDecimal("333.918")),
                new BlsCpiParser.IndexPoint("2025-07", new BigDecimal("323.048"))));
        assertEquals(1, rows.size());
        assertEquals("2026-07", rows.getFirst().period());
        assertEquals(
                com.personalfinance.intelligence.metrics.FinancialMetrics.returnPercent(
                        new BigDecimal("323.048"), new BigDecimal("333.918")),
                rows.getFirst().value());
    }
}
