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

    public TsetmcBourseProvider(IranExchangeHttpClient httpClient, ObjectMapper objectMapper) {
        this.httpClient = httpClient;
        this.objectMapper = objectMapper;
    }

    public Optional<BigDecimal> fetchUnitPriceToman(String insCode) {
        if (insCode == null || insCode.isBlank()) {
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
                    info.path("pDrCotVal"),
                    info.path("pClosing"),
                    info.path("priceYesterday"));
            if (rial == null) {
                log.warn("TSETMC insCode={}: no price in response", insCode);
                return Optional.empty();
            }
            BigDecimal toman = rial.divide(TEN, 0, RoundingMode.HALF_UP);
            if (toman.compareTo(BigDecimal.ZERO) <= 0) {
                return Optional.empty();
            }
            log.info("TSETMC OK insCode={} -> {} Toman/unit", insCode, toman);
            return Optional.of(toman);
        } catch (Exception e) {
            log.warn("TSETMC insCode={} parse error: {}", insCode, e.getMessage());
            return Optional.empty();
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
