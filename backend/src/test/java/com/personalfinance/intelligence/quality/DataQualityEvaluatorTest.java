package com.personalfinance.intelligence.quality;

import com.personalfinance.intelligence.provider.CurrentQuote;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DataQualityEvaluatorTest {

    @Test
    void closeQuotesAreNotConflicts() {
        Map<String, CurrentQuote> quotes = Map.of(
                "TGJU", quote("TGJU", "4391"),
                "NOBITEX", quote("NOBITEX", "4405"));
        var conflicts = DataQualityEvaluator.findConflicts(quotes, new BigDecimal("0.5"));
        assertTrue(conflicts.isEmpty());
    }

    @Test
    void largeGapCreatesConflictAndKeepsPrimary() {
        Map<String, CurrentQuote> quotes = Map.of(
                "TGJU", quote("TGJU", "100"),
                "NOBITEX", quote("NOBITEX", "103"));
        var assessed = DataQualityEvaluator.assess(
                List.of("TGJU", "NOBITEX"), quotes, new BigDecimal("0.5"));
        assertTrue(assessed.isPresent());
        assertEquals("TGJU", assessed.get().selected().providerCode());
        assertEquals("CONFLICT_PRIMARY_KEPT", assessed.get().selectionReason());
        assertEquals(55, assessed.get().confidence());
        assertEquals(1, assessed.get().conflicts().size());
        assertEquals(new BigDecimal("2.9557"), assessed.get().conflicts().getFirst().differencePercent());
    }

    @Test
    void fallbackIsMarkedWhenPrimaryMissing() {
        Map<String, CurrentQuote> quotes = Map.of("NOBITEX", quote("NOBITEX", "100"));
        var assessed = DataQualityEvaluator.assess(
                List.of("TGJU", "NOBITEX"), quotes, new BigDecimal("0.5"));
        assertTrue(assessed.isPresent());
        assertEquals("FALLBACK_ROUTE", assessed.get().selectionReason());
        assertEquals("NOBITEX", assessed.get().selected().providerCode());
        assertEquals(78, assessed.get().confidence());
        assertTrue(assessed.get().conflicts().isEmpty());
    }

    @Test
    void agreeingSourcesUsePrimaryRoute() {
        Map<String, CurrentQuote> quotes = Map.of(
                "TGJU", quote("TGJU", "100"),
                "NOBITEX", quote("NOBITEX", "100.2"));
        var assessed = DataQualityEvaluator.assess(
                List.of("TGJU", "NOBITEX"), quotes, new BigDecimal("0.5"));
        assertTrue(assessed.isPresent());
        assertEquals("PRIMARY_ROUTE", assessed.get().selectionReason());
        assertEquals(94, assessed.get().confidence());
    }

    private static CurrentQuote quote(String provider, String value) {
        return new CurrentQuote(
                "USD", "IRT", new BigDecimal(value), "USD", provider,
                Instant.parse("2026-08-17T09:00:00Z"), null);
    }
}
