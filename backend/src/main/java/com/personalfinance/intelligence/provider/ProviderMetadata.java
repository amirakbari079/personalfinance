package com.personalfinance.intelligence.provider;

public record ProviderMetadata(
        String code,
        String name,
        boolean supportsHistory,
        boolean supportsCurrent) {
}
