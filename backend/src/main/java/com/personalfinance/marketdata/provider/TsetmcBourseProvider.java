package com.personalfinance.marketdata.provider;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

/**
 * Live bourse prices from TSETMC CDN (free, per instrument).
 */
@Component
public class TsetmcBourseProvider {

    private static final Logger log = LoggerFactory.getLogger(TsetmcBourseProvider.class);
    private static final BigDecimal TEN = BigDecimal.TEN;
    private final IranExchangeHttpClient httpClient;
    private final ObjectMapper objectMapper;
    private record CachedQuote(Optional<TsetmcBourseQuote> quote, java.time.Instant expiresAt) {}
    private final java.util.Map<String, CachedQuote> cache = new java.util.concurrent.ConcurrentHashMap<>();

    public TsetmcBourseProvider(IranExchangeHttpClient httpClient, ObjectMapper objectMapper) {
        this.httpClient = httpClient;
        this.objectMapper = objectMapper;
    }

    public Optional<BigDecimal> fetchUnitPriceToman(String insCode) {
        return fetchQuote(insCode).map(TsetmcBourseQuote::priceToman);
    }

    public synchronized Optional<TsetmcBourseQuote> fetchQuote(String insCode) {
        if (insCode == null) return Optional.empty();
        String code = insCode.trim();
        if ("68603452107668866".equals(code)) code = "34144395039913458";
        if ("120079097679462".equals(code)) code = "35831329532779850";
        CachedQuote existing = cache.get(code);
        if (existing != null && existing.expiresAt().isAfter(java.time.Instant.now())) return existing.quote();
        Optional<TsetmcBourseQuote> fetched = fetchUncached(code);
        if (cache.size() > 200) cache.clear();
        cache.put(code, new CachedQuote(fetched, java.time.Instant.now().plusSeconds(30)));
        return fetched;
    }

    private Optional<TsetmcBourseQuote> fetchUncached(String insCode) {
        if (insCode == null || !insCode.trim().matches("[0-9]{1,20}")) {
            return Optional.empty();
        }
        String url = "https://cdn.tsetmc.com/api/ClosingPrice/GetClosingPriceInfo/" + insCode.trim();
        String body = httpClient.get(url);
        if (body == null) {
            return Optional.empty();
        }
        try {
            JsonNode info = objectMapper.readTree(body).path("closingPriceInfo");
            if (info.isMissingNode() || info.isNull()) {
                log.warn("TSETMC insCode={}: missing closingPriceInfo", insCode);
                return Optional.empty();
            }
            BigDecimal rial = firstPositive(
                    info.path("pClosing"),
                    info.path("pDrCotVal"),
                    info.path("priceYesterday"));
            if (rial == null) {
                log.warn("TSETMC insCode={}: no price in response", insCode);
                return Optional.empty();
            }
            BigDecimal toman = rialToToman(rial);
            if (toman.compareTo(BigDecimal.ZERO) <= 0) {
                return Optional.empty();
            }
            BigDecimal previous = parseDecimal(info.path("priceYesterday"));
            BigDecimal changePercent = previous != null && previous.signum() > 0
                    ? rial.subtract(previous).multiply(BigDecimal.valueOf(100)).divide(previous, 2, RoundingMode.HALF_UP)
                    : null;
            String date = info.path("dEven").asText();
            int time = info.path("hEven").asInt();
            java.time.Instant observedAt = java.time.LocalDate.parse(date, java.time.format.DateTimeFormatter.BASIC_ISO_DATE)
                    .atTime(time / 10000, time / 100 % 100, time % 100)
                    .atZone(java.time.ZoneId.of("Asia/Tehran")).toInstant();
            log.info("TSETMC OK insCode={} -> {} Toman/unit", insCode, toman);
            return Optional.of(new TsetmcBourseQuote(toman, changePercent, observedAt));
        } catch (Exception e) {
            log.warn("TSETMC insCode={} parse error: {}", insCode, e.getMessage());
            return Optional.empty();
        }
    }

    private static BigDecimal rialToToman(BigDecimal rial) {
        return rial.divide(TEN);
    }

    private static BigDecimal parseDecimal(JsonNode node) {
        if (node.isMissingNode() || node.isNull()) {
            return null;
        }
        try {
            return new BigDecimal(node.asText().trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static BigDecimal firstPositive(JsonNode... nodes) {
        for (JsonNode node : nodes) {
            if (node.isMissingNode() || node.isNull()) {
                continue;
            }
            try {
                BigDecimal value = new BigDecimal(node.asText().trim());
                if (value.compareTo(BigDecimal.ZERO) > 0) {
                    return value;
                }
            } catch (NumberFormatException ignored) {
                /* try next */
            }
        }
        return null;
    }
}
