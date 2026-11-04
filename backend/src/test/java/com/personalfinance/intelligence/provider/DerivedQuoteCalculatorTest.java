package com.personalfinance.intelligence.provider;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DerivedQuoteCalculatorTest {

    @Test
    void multipliesBtcUsdByUsdIrt() {
        CurrentQuote btcUsd = new CurrentQuote("BTC", "USD", new BigDecimal("100000"), "BTC", "COINGECKO", Instant.now(), null);
        CurrentQuote usdIrt = new CurrentQuote("USD", "IRT", new BigDecimal("90000"), "USD", "TGJU", Instant.now(), null);
        Optional<CurrentQuote> derived = new DerivedQuoteCalculator().btcIrt(btcUsd, usdIrt);
        assertTrue(derived.isPresent());
        assertEquals(new BigDecimal("9000000000"), derived.get().value());
        assertEquals("IRT", derived.get().currency());
        assertEquals("DERIVED", derived.get().providerCode());
    }
}
