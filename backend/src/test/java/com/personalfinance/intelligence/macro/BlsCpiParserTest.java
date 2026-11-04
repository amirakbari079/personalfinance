package com.personalfinance.intelligence.macro;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class BlsCpiParserTest {

    @Test
    void readsMonthlyIndexAndSkipsAnnualAndMissing() throws Exception {
        String body = """
                {"Results":{"series":[{"data":[
                  {"year":"2026","period":"M07","value":"333.918"},
                  {"year":"2025","period":"M13","value":"321.943"},
                  {"year":"2025","period":"M10","value":"-"},
                  {"year":"2025","period":"M07","value":"323.048"}
                ]}]}}
                """;
        List<BlsCpiParser.IndexPoint> rows = BlsCpiParser.parse(body, new ObjectMapper());
        assertEquals(2, rows.size());
        assertEquals("2026-07", rows.getFirst().period());
        assertEquals(0, new BigDecimal("333.918").compareTo(rows.getFirst().index()));
        assertEquals("2025-07", rows.get(1).period());
    }
}
