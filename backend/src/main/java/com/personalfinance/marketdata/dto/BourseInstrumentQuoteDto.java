package com.personalfinance.marketdata.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record BourseInstrumentQuoteDto(
        String insCode,
        String symbol,
        String name,
        BigDecimal value,
        String currency,
        BigDecimal changePercent,
        String source,
        Instant recordedAt,
        String errorMessage) {}
