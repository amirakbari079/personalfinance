package com.personalfinance.marketdata.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record MarketHistoryPointDto(Instant recordedAt, BigDecimal value) {}
