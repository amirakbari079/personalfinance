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
    private final java.time.Duration cacheTtl;
    private record CachedQuote(TsetmcBourseQuote quote, java.time.Instant expiresAt) {}
    private final java.util.Map<String, CachedQuote> cache = new java.util.concurrent.ConcurrentHashMap<>();

    @org.springframework.beans.factory.annotation.Autowired
    public TsetmcBourseProvider(IranExchangeHttpClient httpClient, ObjectMapper objectMapper) {
        this(httpClient, objectMapper, java.time.Duration.ofSeconds(30));
    }

    TsetmcBourseProvider(
            IranExchangeHttpClient httpClient,
            ObjectMapper objectMapper,
            java.time.Duration cacheTtl) {
        this.httpClient = httpClient;
        this.objectMapper = objectMapper;
        this.cacheTtl = cacheTtl;
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
        if (existing != null && existing.expiresAt().isAfter(java.time.Instant.now())) {
            return Optional.of(existing.quote());
        }
        Optional<TsetmcBourseQuote> fetched = fetchUncached(code);
        // A timeout is transient. Caching Optional.empty made every caller fail for
        // 30 seconds even when TSETMC recovered on the very next request.
        if (fetched.isPresent()) {
            if (cache.size() > 200) cache.clear();
            cache.put(code, new CachedQuote(fetched.get(), java.time.Instant.now().plus(cacheTtl)));
            return fetched;
        }
        if (existing != null) {
            log.warn("TSETMC insCode={} unavailable; serving last valid quote from {}",
                    code, existing.quote().observedAt());
            return Optional.of(existing.quote());
        }
        return Optional.empty();
    }

    private Optional<TsetmcBourseQuote> fetchUncached(String insCode) {
        if (insCode == null || !insCode.trim().matches("[0-9]{1,20}")) {
            return Optional.empty();
        }
        String url = "https://cdn.tsetmc.com/api/ClosingPrice/GetClosingPriceInfo/" + insCode.trim();
        String body = httpClient.get(url);
        if (body == null) {
            return fetchLatestDaily(insCode.trim());
        }
        try {
            JsonNode info = objectMapper.readTree(body).path("closingPriceInfo");
            if (info.isMissingNode() || info.isNull()) {
                log.warn("TSETMC insCode={}: missing closingPriceInfo", insCode);
                return fetchLatestDaily(insCode.trim());
            }
            return parseQuote(info, insCode, "live");
        } catch (Exception e) {
            log.warn("TSETMC insCode={} parse error: {}", insCode, e.getMessage());
            return fetchLatestDaily(insCode.trim());
        }
    }

    private Optional<TsetmcBourseQuote> fetchLatestDaily(String insCode) {
        String url = "https://cdn.tsetmc.com/api/ClosingPrice/GetClosingPriceDailyList/" + insCode + "/0";
        String body = httpClient.get(url);
        if (body == null) return Optional.empty();
        try {
            JsonNode rows = objectMapper.readTree(body).path("closingPriceDaily");
            if (!rows.isArray()) return Optional.empty();
            for (JsonNode row : rows) {
                Optional<TsetmcBourseQuote> quote = parseQuote(row, insCode, "daily-fallback");
                if (quote.isPresent()) return quote;
            }
        } catch (Exception e) {
            log.warn("TSETMC daily fallback insCode={} parse error: {}", insCode, e.getMessage());
        }
        return Optional.empty();
    }

    private Optional<TsetmcBourseQuote> parseQuote(JsonNode info, String insCode, String mode) {
        try {
            BigDecimal rial = firstPositive(
                    info.path("pClosing"),
                    info.path("pDrCotVal"),
                    info.path("priceYesterday"));
            if (rial == null) return Optional.empty();
            BigDecimal toman = rialToToman(rial);
            BigDecimal previous = parseDecimal(info.path("priceYesterday"));
            BigDecimal changePercent = previous != null && previous.signum() > 0
                    ? rial.subtract(previous).multiply(BigDecimal.valueOf(100)).divide(previous, 2, RoundingMode.HALF_UP)
                    : null;
            String date = info.path("dEven").asText();
            int time = info.path("hEven").asInt();
            java.time.Instant observedAt = java.time.LocalDate.parse(
                            date, java.time.format.DateTimeFormatter.BASIC_ISO_DATE)
                    .atTime(time / 10000, time / 100 % 100, time % 100)
                    .atZone(java.time.ZoneId.of("Asia/Tehran")).toInstant();
            log.info("TSETMC {} OK insCode={} -> {} Toman/unit", mode, insCode, toman);
            return Optional.of(new TsetmcBourseQuote(toman, changePercent, observedAt));
        } catch (Exception e) {
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
