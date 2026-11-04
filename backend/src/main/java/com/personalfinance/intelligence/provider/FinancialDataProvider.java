package com.personalfinance.intelligence.provider;

import java.time.Instant;
import java.util.List;

public interface FinancialDataProvider {

    String code();

    ProviderMetadata fetchMetadata();

    List<CurrentQuote> fetchCurrentData();

    /**
     * Historical fetch is optional. Providers without history return an empty list.
     * Callers must request a delta window, never a full unbounded dump.
     */
    default List<CurrentQuote> fetchHistoricalData(Instant from, Instant to) {
        return List.of();
    }
}
