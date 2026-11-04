package com.personalfinance.intelligence.provider;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class QuoteSelectorTest {

    @Test
    void usesPrimaryWhenPresent() {
        CurrentQuote primary = quote("TGJU", "100");
        CurrentQuote fallback = quote("NOBITEX", "101");
        Optional<CurrentQuote> chosen = QuoteSelector.firstAvailable(
                List.of("TGJU", "NOBITEX"),
                Map.of("TGJU", primary, "NOBITEX", fallback));
        assertTrue(chosen.isPresent());
        assertEquals("TGJU", chosen.get().providerCode());
        assertEquals(new BigDecimal("100"), chosen.get().value());
    }

    @Test
    void fallsBackWhenPrimaryMissingOrZero() {
        CurrentQuote zero = quote("TGJU", "0");
        CurrentQuote fallback = quote("NOBITEX", "101");
        Optional<CurrentQuote> chosen = QuoteSelector.firstAvailable(
                List.of("TGJU", "NOBITEX"),
                Map.of("TGJU", zero, "NOBITEX", fallback));
        assertTrue(chosen.isPresent());
        assertEquals("NOBITEX", chosen.get().providerCode());
    }

    @Test
    void emptyWhenAllSourcesFail() {
        Optional<CurrentQuote> chosen = QuoteSelector.firstAvailable(
                List.of("TGJU", "NOBITEX"),
                Map.of());
        assertTrue(chosen.isEmpty());
    }

    private static CurrentQuote quote(String provider, String value) {
        return new CurrentQuote("USD", "IRT", new BigDecimal(value), "USD", provider, Instant.parse("2026-08-17T09:00:00Z"), null);
    }
}
