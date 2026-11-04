package com.personalfinance.intelligence.macro;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

public final class ImfWeoParser {

    private ImfWeoParser() {}

    public record Observation(String period, BigDecimal value) {}

    public static List<Observation> parse(String body, String iso3, int maxYear, ObjectMapper mapper)
            throws Exception {
        JsonNode country = mapper.readTree(body).path("values").path("PCPIPCH").path(iso3);
        if (!country.isObject()) {
            return List.of();
        }
        List<Observation> rows = new ArrayList<>();
        Iterator<Map.Entry<String, JsonNode>> fields = country.fields();
        while (fields.hasNext()) {
            Map.Entry<String, JsonNode> field = fields.next();
            int year;
            try {
                year = Integer.parseInt(field.getKey());
            } catch (NumberFormatException ignored) {
                continue;
            }
            if (year > maxYear || field.getValue().isNull() || !field.getValue().isNumber()) {
                continue;
            }
            rows.add(new Observation(field.getKey(), field.getValue().decimalValue()));
        }
        rows.sort(Comparator.comparing(Observation::period));
        return rows;
    }
}
