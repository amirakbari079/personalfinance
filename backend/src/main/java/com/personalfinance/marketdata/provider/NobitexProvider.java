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
public class NobitexProvider {

    private static final Logger log = LoggerFactory.getLogger(NobitexProvider.class);
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public NobitexProvider(RestClient.Builder restClientBuilder, ObjectMapper objectMapper) {
        this.restClient = restClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    public Optional<CoinGeckoProvider.QuoteFetch> fetchBtcIrr() {
        try {
            String body = restClient.get()
                    .uri("https://apiv2.nobitex.ir/v3/orderbook/BTCIRT")
                    .retrieve()
                    .body(String.class);
            JsonNode root = objectMapper.readTree(body);
            JsonNode lastTrade = root.path("lastTradePrice");
            if (lastTrade.isMissingNode() || lastTrade.isNull()) {
                lastTrade = root.path("stats").path("latest");
            }
            if (lastTrade.isMissingNode() || lastTrade.isNull()) return Optional.empty();
            // Nobitex prices are in Rial; store as Toman (÷10)
            BigDecimal rial = new BigDecimal(lastTrade.asText());
            BigDecimal toman = rial.divide(BigDecimal.TEN, 0, RoundingMode.HALF_UP);
            if (toman.compareTo(BigDecimal.ZERO) <= 0) return Optional.empty();
            return Optional.of(new CoinGeckoProvider.QuoteFetch(MarketSymbol.BTC_IRR, toman, "TOMAN", "Nobitex"));
        } catch (Exception e) {
            log.warn("Nobitex BTC/IRR fetch failed: {}", e.getMessage());
            return Optional.empty();
        }
    }

    public Optional<CoinGeckoProvider.QuoteFetch> fetchUsdIrr() {
        try {
            String body = restClient.get()
                    .uri("https://apiv2.nobitex.ir/market/stats?srcCurrency=usdt&dstCurrency=rls")
                    .retrieve()
                    .body(String.class);
            JsonNode root = objectMapper.readTree(body);
            JsonNode bestSell = root.path("stats").path("usdt-rls").path("latest");
            if (bestSell.isMissingNode() || bestSell.isNull()) return Optional.empty();
            BigDecimal rial = new BigDecimal(bestSell.asText());
            BigDecimal toman = rial.divide(BigDecimal.TEN, 0, RoundingMode.HALF_UP);
            if (toman.compareTo(BigDecimal.ZERO) <= 0) return Optional.empty();
            return Optional.of(new CoinGeckoProvider.QuoteFetch(MarketSymbol.USD_IRR, toman, "TOMAN", "Nobitex"));
        } catch (Exception e) {
            log.warn("Nobitex USD/IRR fetch failed: {}", e.getMessage());
            return Optional.empty();
        }
    }
}
