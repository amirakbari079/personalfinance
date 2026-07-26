package com.personalfinance.marketdata.dto;

import com.personalfinance.marketdata.MarketSymbol;

import java.math.BigDecimal;
import java.time.Instant;

public record MarketQuoteDto(
        MarketSymbol symbol,
        String label,
        BigDecimal value,
        String currency,
        String source,
        Instant recordedAt,
        BigDecimal changePercentMonth) {}
