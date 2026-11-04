package com.personalfinance.intelligence.provider;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public final class QuoteSelector {

    private QuoteSelector() {}

    public static Optional<CurrentQuote> firstAvailable(
            List<String> providerOrder,
            Map<String, CurrentQuote> quotesByProvider) {
        if (providerOrder == null || quotesByProvider == null) {
            return Optional.empty();
        }
        for (String code : providerOrder) {
            CurrentQuote quote = quotesByProvider.get(code);
            if (quote != null && quote.hasPositiveValue()) {
                return Optional.of(quote);
            }
        }
        return Optional.empty();
    }
}
