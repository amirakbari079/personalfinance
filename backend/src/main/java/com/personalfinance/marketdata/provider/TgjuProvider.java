package com.personalfinance.marketdata.provider;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.personalfinance.marketdata.MarketSymbol;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Fetches live Iranian market prices from TGJU widget API.
 * Prices in field {@code p} are in Rial; stored as Toman (÷10).
 *
 * @see <a href="https://api.tgju.org/v1/widget/tmp?keys=137121,137203">TGJU Widget API</a>
 */
@Component
public class TgjuProvider {

    private static final Logger log = LoggerFactory.getLogger(TgjuProvider.class);
    private static final BigDecimal TEN = BigDecimal.TEN;

    private static final Map<String, MarketSymbol> WIDGET_SYMBOLS = Map.of(
            "geram18", MarketSymbol.GOLD_18K_IRR,
            "price_dollar_rl", MarketSymbol.USD_IRR);

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String geram18Key;
    private final String dollarKey;

    public TgjuProvider(
            RestClient.Builder restClientBuilder,
            ObjectMapper objectMapper,
            @Value("${app.market.tgju.geram18-widget-key:137121}") String geram18Key,
            @Value("${app.market.tgju.dollar-widget-key:137203}") String dollarKey) {
        this.restClient = restClientBuilder.build();
        this.objectMapper = objectMapper;
        this.geram18Key = geram18Key;
        this.dollarKey = dollarKey;
    }

    /** Fetches gold 18k and USD in one live request. */
    public List<CoinGeckoProvider.QuoteFetch> fetchLiveIranianQuotes() {
        String url = "https://api.tgju.org/v1/widget/tmp?keys=" + geram18Key + "," + dollarKey;
        String body = fetchWidgetBody(url);
        if (body == null) {
            return List.of();
        }
        return parseWidgetResponse(body);
    }

    private String fetchWidgetBody(String url) {
        String body = fetchWithRestClient(url);
        if (body != null) {
            return body;
        }
        return fetchWithHttpClient(url);
    }

    private String fetchWithRestClient(String url) {
        try {
            return restClient.get()
                    .uri(url)
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .header("Accept", "application/json")
                    .header("Referer", "https://www.tgju.org/")
                    .retrieve()
                    .body(String.class);
        } catch (Exception e) {
            log.warn("TGJU widget RestClient fetch failed: {}", e.getMessage());
            return null;
        }
    }

    private String fetchWithHttpClient(String url) {
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(10))
                    .followRedirects(HttpClient.Redirect.NORMAL)
                    .build();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(15))
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .header("Accept", "application/json")
                    .header("Referer", "https://www.tgju.org/")
                    .GET()
                    .build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("TGJU widget fetched via HttpClient fallback");
                return response.body();
            }
            log.warn("TGJU widget HttpClient status: {}", response.statusCode());
        } catch (Exception e) {
            log.warn("TGJU widget HttpClient fetch failed: {}", e.getMessage());
        }
        return null;
    }

    private List<CoinGeckoProvider.QuoteFetch> parseWidgetResponse(String body) {
        List<CoinGeckoProvider.QuoteFetch> results = new ArrayList<>();
        try {
            JsonNode indicators = objectMapper.readTree(body).path("response").path("indicators");
            if (!indicators.isArray()) {
                log.warn("TGJU widget returned no indicators");
                return results;
            }
            for (JsonNode indicator : indicators) {
                parseWidgetIndicator(indicator).ifPresent(results::add);
            }
            log.info("TGJU widget fetched {} live quotes", results.size());
        } catch (Exception e) {
            log.warn("TGJU widget parse failed: {}", e.getMessage());
        }
        return results;
    }

    public Optional<CoinGeckoProvider.QuoteFetch> fetchGold18kIrr() {
        return fetchLiveIranianQuotes().stream()
                .filter(q -> q.symbol() == MarketSymbol.GOLD_18K_IRR)
                .findFirst();
    }

    public Optional<CoinGeckoProvider.QuoteFetch> fetchUsdIrr() {
        return fetchLiveIranianQuotes().stream()
                .filter(q -> q.symbol() == MarketSymbol.USD_IRR)
                .findFirst();
    }

    private Optional<CoinGeckoProvider.QuoteFetch> parseWidgetIndicator(JsonNode indicator) {
        String name = indicator.path("name").asText("");
        MarketSymbol symbol = WIDGET_SYMBOLS.get(name);
        if (symbol == null) {
            return Optional.empty();
        }
        JsonNode priceNode = indicator.path("p");
        if (priceNode.isMissingNode() || priceNode.isNull()) {
            return Optional.empty();
        }
        BigDecimal rial = parseNumber(priceNode.asText());
        if (rial == null || rial.compareTo(BigDecimal.ZERO) <= 0) {
            return Optional.empty();
        }
        BigDecimal toman = rial.divide(TEN, 0, RoundingMode.HALF_UP);
        log.info("TGJU live {}: {} Rial -> {} Toman", name, rial, toman);
        try {
            var observedAt = java.time.LocalDateTime.parse(indicator.path("updated_at").asText(),
                    java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
                    .atZone(java.time.ZoneId.of("Asia/Tehran")).toInstant();
            return Optional.of(new CoinGeckoProvider.QuoteFetch(symbol, toman, "TOMAN", "TGJU-Live", observedAt));
        } catch (java.time.DateTimeException e) {
            log.warn("TGJU indicator {} has no valid observation timestamp", name);
            return Optional.empty();
        }
    }

    private static BigDecimal parseNumber(String raw) {
        if (raw == null || raw.isBlank()) return null;
        String normalized = raw
                .replace(",", "")
                .replace("٬", "")
                .replace("،", "")
                .replaceAll("<[^>]+>", "")
                .trim();
        StringBuilder western = new StringBuilder();
        for (int i = 0; i < normalized.length(); i++) {
            char c = normalized.charAt(i);
            if (c >= '۰' && c <= '۹') western.append((char) ('0' + (c - '۰')));
            else if (c >= '٠' && c <= '٩') western.append((char) ('0' + (c - '٠')));
            else western.append(c);
        }
        try {
            return new BigDecimal(western.toString().trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
