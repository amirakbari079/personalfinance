package com.personalfinance.intelligence.provider;

import com.personalfinance.intelligence.ProviderCodes;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Optional;

@Component
public class DerivedQuoteCalculator {

    public Optional<CurrentQuote> btcIrt(CurrentQuote btcUsd, CurrentQuote usdIrt) {
        if (btcUsd == null || usdIrt == null || !btcUsd.hasPositiveValue() || !usdIrt.hasPositiveValue()) {
            return Optional.empty();
        }
        BigDecimal toman = btcUsd.value().multiply(usdIrt.value()).setScale(0, RoundingMode.HALF_UP);
        return Optional.of(new CurrentQuote(
                "BTC",
                "IRT",
                toman,
                "BTC",
                ProviderCodes.DERIVED,
                btcUsd.observedAt().isBefore(usdIrt.observedAt()) ? btcUsd.observedAt() : usdIrt.observedAt(),
                "BTC_USD×USD_IRT"));
    }
}
