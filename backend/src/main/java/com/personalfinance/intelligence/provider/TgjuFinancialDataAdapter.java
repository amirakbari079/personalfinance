package com.personalfinance.intelligence.provider;

import com.personalfinance.intelligence.ProviderCodes;
import com.personalfinance.marketdata.MarketSymbol;
import com.personalfinance.marketdata.provider.CoinGeckoProvider;
import com.personalfinance.marketdata.provider.TgjuProvider;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Component
public class TgjuFinancialDataAdapter implements FinancialDataProvider {

    private final TgjuProvider tgjuProvider;

    public TgjuFinancialDataAdapter(TgjuProvider tgjuProvider) {
        this.tgjuProvider = tgjuProvider;
    }

    @Override
    public String code() {
        return ProviderCodes.TGJU;
    }

    @Override
    public ProviderMetadata fetchMetadata() {
        return new ProviderMetadata(code(), "TGJU", false, true);
    }

    @Override
    public List<CurrentQuote> fetchCurrentData() {
        Instant now = Instant.now();
        List<CurrentQuote> quotes = new ArrayList<>();
        for (CoinGeckoProvider.QuoteFetch fetch : tgjuProvider.fetchLiveIranianQuotes()) {
            if (fetch.symbol() == MarketSymbol.GOLD_18K_IRR) {
                quotes.add(new CurrentQuote("GOLD_18K", "IRT", fetch.value(), "GRAM", code(), fetch.observedAt(), fetch.source()));
            } else if (fetch.symbol() == MarketSymbol.USD_IRR) {
                quotes.add(new CurrentQuote("USD", "IRT", fetch.value(), "USD", code(), fetch.observedAt(), fetch.source()));
            }
        }
        return quotes;
    }
}
