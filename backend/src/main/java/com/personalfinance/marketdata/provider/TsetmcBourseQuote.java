package com.personalfinance.marketdata.provider;

import java.math.BigDecimal;

public record TsetmcBourseQuote(
        BigDecimal priceToman,
        BigDecimal changePercent, java.time.Instant observedAt) {}
