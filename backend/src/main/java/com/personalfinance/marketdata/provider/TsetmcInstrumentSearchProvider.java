package com.personalfinance.marketdata.provider;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.personalfinance.marketdata.dto.BourseInstrumentDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Component
public class TsetmcInstrumentSearchProvider {

    private static final Logger log = LoggerFactory.getLogger(TsetmcInstrumentSearchProvider.class);

    private final IranExchangeHttpClient httpClient;
    private final ObjectMapper objectMapper;

    public TsetmcInstrumentSearchProvider(IranExchangeHttpClient httpClient, ObjectMapper objectMapper) {
        this.httpClient = httpClient;
        this.objectMapper = objectMapper;
    }

    public List<BourseInstrumentDto> search(String query) {
        if (query == null || query.trim().length() < 2) {
            return List.of();
        }
        String encoded = URLEncoder.encode(query.trim(), StandardCharsets.UTF_8);
        String url = "https://cdn.tsetmc.com/api/Instrument/GetInstrumentSearch/" + encoded;
        String body = httpClient.get(url);
        if (body == null || body.isBlank() || body.trim().startsWith("<")) {
            log.warn("TSETMC search empty/blocked for query={}", query);
            return List.of();
        }
        try {
            JsonNode root = objectMapper.readTree(body);
            JsonNode items = root.path("instrumentSearch");
            if (!items.isArray()) {
                return List.of();
            }
            List<BourseInstrumentDto> results = new ArrayList<>();
            for (JsonNode item : items) {
                String insCode = text(item, "insCode");
                if (insCode.isBlank()) {
                    continue;
                }
                String symbol = text(item, "lVal18AFC");
                String name = text(item, "lVal30");
                if (name.isBlank()) {
                    name = symbol;
                }
                results.add(new BourseInstrumentDto(
                        insCode,
                        symbol,
                        name,
                        flowLabel(item.path("flow").asInt(0))));
                if (results.size() >= 20) {
                    break;
                }
            }
            return results;
        } catch (Exception e) {
            log.warn("TSETMC search parse error query={}: {}", query, e.getMessage());
            return List.of();
        }
    }

    private static String text(JsonNode node, String field) {
        JsonNode value = node.path(field);
        return value.isMissingNode() || value.isNull() ? "" : value.asText("").trim();
    }

    private static String flowLabel(int flow) {
        return switch (flow) {
            case 1 -> "بورس";
            case 2 -> "فرابورس";
            case 3 -> "پایه";
            case 4 -> "آتی";
            case 5 -> "بورس انرژی";
            default -> "بازار " + flow;
        };
    }
}
