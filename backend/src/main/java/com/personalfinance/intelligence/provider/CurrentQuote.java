package com.personalfinance.intelligence.provider;

import java.math.BigDecimal;
import java.time.Instant;

public record CurrentQuote(
        String assetSymbol,
        String currency,
        BigDecimal value,
        String unit,
        String providerCode,
        Instant observedAt,
        String rawExcerpt) {

    public boolean hasPositiveValue() {
        return value != null && value.compareTo(BigDecimal.ZERO) > 0;
    }
}
