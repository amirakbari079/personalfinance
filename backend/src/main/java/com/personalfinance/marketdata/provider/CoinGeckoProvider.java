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

    private JsonNode prices;
    private java.time.Instant nextFetchAt = java.time.Instant.EPOCH;

    // Both assets share one request; failures also have a cooldown to avoid 429 storms.
    private synchronized Optional<QuoteFetch> fetch(String id, MarketSymbol symbol, String source) {
        if (!java.time.Instant.now().isBefore(nextFetchAt)) {
            prices = null;
            nextFetchAt = java.time.Instant.now().plusSeconds(60);
            try {
                String body = restClient.get()
                        .uri("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,pax-gold&vs_currencies=usd&include_last_updated_at=true")
                        .retrieve().body(String.class);
                prices = objectMapper.readTree(body);
            } catch (Exception e) {
                log.warn("CoinGecko batch fetch failed: {}", e.getMessage());
            }
        }
        if (prices == null) return Optional.empty();
        JsonNode value = prices.path(id).path("usd");
        if (!value.isNumber() || value.decimalValue().signum() <= 0) return Optional.empty();
        long timestamp = prices.path(id).path("last_updated_at").asLong(0);
        if (timestamp <= 0) return Optional.empty();
        return Optional.of(new QuoteFetch(symbol, value.decimalValue(), "USD", source,
                java.time.Instant.ofEpochSecond(timestamp)));
    }

    public Optional<QuoteFetch> fetchBtcUsd() {
        return fetch("bitcoin", MarketSymbol.BTC_USD, "CoinGecko");
    }

    public Optional<QuoteFetch> fetchGoldXauUsd() {
        return fetchPaxgUsd().map(q -> new QuoteFetch(
                MarketSymbol.GOLD_XAU_USD, q.value(), q.currency(), q.source(), q.observedAt()));
    }

    public Optional<QuoteFetch> fetchPaxgUsd() {
        return fetch("pax-gold", MarketSymbol.PAXG_USD, "CoinGecko-PAXG");
    }

    public record QuoteFetch(MarketSymbol symbol, BigDecimal value, String currency, String source,
            java.time.Instant observedAt) {
        public QuoteFetch(MarketSymbol symbol, BigDecimal value, String currency, String source) {
            this(symbol, value, currency, source, java.time.Instant.now());
        }
    }
}
