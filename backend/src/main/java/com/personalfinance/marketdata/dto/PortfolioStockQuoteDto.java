package com.personalfinance.marketdata.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record PortfolioStockQuoteDto(
        Long investmentId,
        String name,
        String insCode,
        BigDecimal value,
        String currency,
        String source,
        Instant recordedAt,
        String errorMessage) {}
