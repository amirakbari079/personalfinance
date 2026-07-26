package com.personalfinance.marketdata.provider;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.personalfinance.marketdata.MarketSymbol;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

@Component
public class CoinGeckoProvider {

    private static final Logger log = LoggerFactory.getLogger(CoinGeckoProvider.class);
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public CoinGeckoProvider(RestClient.Builder restClientBuilder, ObjectMapper objectMapper) {
        this.restClient = restClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    public Optional<QuoteFetch> fetchBtcUsd() {
        try {
            String body = restClient.get()
                    .uri("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd")
                    .retrieve()
                    .body(String.class);
            JsonNode root = objectMapper.readTree(body);
            BigDecimal usd = root.path("bitcoin").path("usd").decimalValue();
            if (usd.compareTo(BigDecimal.ZERO) <= 0) return Optional.empty();
            return Optional.of(new QuoteFetch(MarketSymbol.BTC_USD, usd, "USD", "CoinGecko"));
        } catch (Exception e) {
            log.warn("CoinGecko BTC/USD fetch failed: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public Optional<QuoteFetch> fetchGoldXauUsd() {
        return fetchPaxgUsd().map(q -> new QuoteFetch(
                MarketSymbol.GOLD_XAU_USD, q.value(), q.currency(), q.source()));
    }

    public Optional<QuoteFetch> fetchPaxgUsd() {
        try {
            String body = restClient.get()
                    .uri("https://api.coingecko.com/api/v3/simple/price?ids=pax-gold&vs_currencies=usd")
                    .retrieve()
                    .body(String.class);
            JsonNode root = objectMapper.readTree(body);
            BigDecimal usd = root.path("pax-gold").path("usd").decimalValue();
            if (usd.compareTo(BigDecimal.ZERO) <= 0) return Optional.empty();
            return Optional.of(new QuoteFetch(MarketSymbol.PAXG_USD, usd, "USD", "CoinGecko-PAXG"));
        } catch (Exception e) {
            log.warn("CoinGecko PAXG/USD fetch failed: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public record QuoteFetch(MarketSymbol symbol, BigDecimal value, String currency, String source) {}
}
