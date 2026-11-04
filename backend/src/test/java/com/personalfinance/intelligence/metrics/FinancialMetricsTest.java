package com.personalfinance.intelligence.metrics;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class FinancialMetricsTest {

    @Test
    void returnPercentIsDeterministic() {
        assertEquals(new BigDecimal("10.0000"), FinancialMetrics.returnPercent(
                new BigDecimal("100"), new BigDecimal("110")));
        assertEquals(new BigDecimal("-25.0000"), FinancialMetrics.returnPercent(
                new BigDecimal("80"), new BigDecimal("60")));
    }

    @Test
    void premiumIsMarketOverReference() {
        assertEquals(new BigDecimal("2.0000"), FinancialMetrics.premiumPercent(
                new BigDecimal("102"), new BigDecimal("100")));
    }

    @Test
    void missingOrZeroStartIsNull() {
        assertNull(FinancialMetrics.returnPercent(BigDecimal.ZERO, new BigDecimal("10")));
        assertNull(FinancialMetrics.returnPercent(null, new BigDecimal("10")));
    }

    @Test
    void differencePercentIsSymmetric() {
        assertEquals(new BigDecimal("2.9557"), FinancialMetrics.differencePercent(
                new BigDecimal("100"), new BigDecimal("103")));
        assertEquals(new BigDecimal("2.9557"), FinancialMetrics.differencePercent(
                new BigDecimal("103"), new BigDecimal("100")));
    }
}
