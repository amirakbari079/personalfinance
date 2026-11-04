package com.personalfinance.intelligence.provider;

import com.personalfinance.intelligence.ProviderCodes;
import com.personalfinance.marketdata.provider.CoinGeckoProvider;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Component
public class CoinGeckoFinancialDataAdapter implements FinancialDataProvider {

    private final CoinGeckoProvider coinGeckoProvider;

    public CoinGeckoFinancialDataAdapter(CoinGeckoProvider coinGeckoProvider) {
        this.coinGeckoProvider = coinGeckoProvider;
    }

    @Override
    public String code() {
        return ProviderCodes.COINGECKO;
    }

    @Override
    public ProviderMetadata fetchMetadata() {
        return new ProviderMetadata(code(), "CoinGecko", false, true);
    }

    @Override
    public List<CurrentQuote> fetchCurrentData() {
        Instant now = Instant.now();
        List<CurrentQuote> quotes = new ArrayList<>();
        coinGeckoProvider.fetchBtcUsd().ifPresent(q ->
                quotes.add(new CurrentQuote("BTC", "USD", q.value(), "BTC", code(), q.observedAt(), q.source())));
        coinGeckoProvider.fetchPaxgUsd().ifPresent(q -> {
            quotes.add(new CurrentQuote("PAXG", "USD", q.value(), "OZ", code(), q.observedAt(), q.source()));
            quotes.add(new CurrentQuote("GOLD_SPOT", "USD", q.value(), "OZ", code(), q.observedAt(), q.source()));
        });
        return quotes;
    }
}
