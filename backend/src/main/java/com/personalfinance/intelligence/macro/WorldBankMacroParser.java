package com.personalfinance.intelligence.macro;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public final class WorldBankMacroParser {

    private WorldBankMacroParser() {}

    public record Observation(String period, BigDecimal value) {}

    public static List<Observation> parse(String body, ObjectMapper mapper) throws Exception {
        JsonNode root = mapper.readTree(body);
        if (!root.isArray() || root.size() < 2 || !root.get(1).isArray()) {
            return List.of();
        }
        List<Observation> rows = new ArrayList<>();
        for (JsonNode node : root.get(1)) {
            JsonNode valueNode = node.path("value");
            JsonNode dateNode = node.path("date");
            if (valueNode.isMissingNode() || valueNode.isNull() || dateNode.isMissingNode()) {
                continue;
            }
            String period = dateNode.asText();
            if (period == null || period.isBlank()) {
                continue;
            }
            BigDecimal value = valueNode.decimalValue();
            if (value.compareTo(BigDecimal.ZERO) == 0 && valueNode.asText().isBlank()) {
                continue;
            }
            rows.add(new Observation(period, value));
        }
        return rows;
    }
}
