package com.personalfinance.marketdata.dto;

import java.math.BigDecimal;

public record MarketCalcResponse(
        String assetType,
        BigDecimal amount,
        String unit,
        BigDecimal unitPrice,
        String priceCurrency,
        BigDecimal tomanEquivalent,
        boolean priceOverridden) {}
