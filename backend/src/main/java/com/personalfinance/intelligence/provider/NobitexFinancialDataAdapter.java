package com.personalfinance.intelligence.provider;

import com.personalfinance.intelligence.ProviderCodes;
import com.personalfinance.marketdata.provider.NobitexProvider;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Component
public class NobitexFinancialDataAdapter implements FinancialDataProvider {

    private final NobitexProvider nobitexProvider;

    public NobitexFinancialDataAdapter(NobitexProvider nobitexProvider) {
        this.nobitexProvider = nobitexProvider;
    }

    @Override
    public String code() {
        return ProviderCodes.NOBITEX;
    }

    @Override
    public ProviderMetadata fetchMetadata() {
        return new ProviderMetadata(code(), "Nobitex", false, true);
    }

    @Override
    public List<CurrentQuote> fetchCurrentData() {
        Instant now = Instant.now();
        List<CurrentQuote> quotes = new ArrayList<>();
        nobitexProvider.fetchBtcIrr().ifPresent(q ->
                quotes.add(new CurrentQuote("BTC", "IRT", q.value(), "BTC", code(), now, q.source())));
        nobitexProvider.fetchUsdIrr().ifPresent(q -> {
            quotes.add(new CurrentQuote("USDT", "IRT", q.value(), "USDT", code(), now, q.source()));
            quotes.add(new CurrentQuote("USD", "IRT", q.value(), "USD", code(), now, q.source()));
        });
        return quotes;
    }
}
