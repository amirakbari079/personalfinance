package com.personalfinance.intelligence.macro;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public final class BlsCpiParser {

    private BlsCpiParser() {}

    public record IndexPoint(String period, BigDecimal index) {}

    public static List<IndexPoint> parse(String body, ObjectMapper mapper) throws Exception {
        JsonNode series = mapper.readTree(body).path("Results").path("series");
        if (!series.isArray() || series.isEmpty()) {
            return List.of();
        }
        List<IndexPoint> rows = new ArrayList<>();
        for (JsonNode node : series.get(0).path("data")) {
            String year = node.path("year").asText();
            String monthCode = node.path("period").asText();
            JsonNode valueNode = node.path("value");
            if (year.isBlank() || !monthCode.startsWith("M") || "M13".equals(monthCode)) {
                continue;
            }
            if (valueNode.isMissingNode() || valueNode.isNull()) {
                continue;
            }
            String raw = valueNode.asText();
            if (raw == null || raw.isBlank() || "-".equals(raw)) {
                continue;
            }
            int month = Integer.parseInt(monthCode.substring(1));
            if (month < 1 || month > 12) {
                continue;
            }
            rows.add(new IndexPoint(year + "-" + String.format("%02d", month), new BigDecimal(raw)));
        }
        return rows;
    }
}
