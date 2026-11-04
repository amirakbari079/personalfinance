package com.personalfinance.intelligence.provider;

import com.personalfinance.intelligence.ProviderCodes;
import com.personalfinance.marketdata.provider.BourseInstrumentResolver;
import com.personalfinance.marketdata.provider.TsetmcBourseProvider;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Component
public class TsetmcFinancialDataAdapter implements FinancialDataProvider {

    private final TsetmcBourseProvider tsetmcBourseProvider;
    private final BourseInstrumentResolver bourseInstrumentResolver;

    public TsetmcFinancialDataAdapter(
            TsetmcBourseProvider tsetmcBourseProvider,
            BourseInstrumentResolver bourseInstrumentResolver) {
        this.tsetmcBourseProvider = tsetmcBourseProvider;
        this.bourseInstrumentResolver = bourseInstrumentResolver;
    }

    @Override
    public String code() {
        return ProviderCodes.TSETMC;
    }

    @Override
    public ProviderMetadata fetchMetadata() {
        return new ProviderMetadata(code(), "TSETMC", false, true);
    }

    @Override
    public List<CurrentQuote> fetchCurrentData() {
        Instant now = Instant.now();
        List<CurrentQuote> quotes = new ArrayList<>();
        addEtf(quotes, "AYAR", "ETF_AYAR", now);
        addEtf(quotes, "NARANGE", "ETF_NARANGE", now);
        return quotes;
    }

    private void addEtf(List<CurrentQuote> quotes, String etfKey, String assetSymbol, Instant now) {
        bourseInstrumentResolver.resolveByEtfKey(etfKey).ifPresent(resolved -> {
            tsetmcBourseProvider.fetchQuote(resolved.insCode()).ifPresent(quote ->
                    quotes.add(new CurrentQuote(assetSymbol, "IRT", quote.priceToman(), "UNIT", code(),
                            quote.observedAt(), resolved.insCode())));
        });
    }
}
