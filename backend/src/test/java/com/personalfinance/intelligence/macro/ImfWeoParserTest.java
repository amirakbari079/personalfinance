package com.personalfinance.intelligence.macro;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ImfWeoParserTest {

    @Test
    void keepsCurrentYearAndDropsFutureForecasts() throws Exception {
        String body = """
                {"values":{"PCPIPCH":{"IRN":{"2024":42.4,"2025":32.5,"2026":35.1,"2027":20.0}}}}
                """;
        List<ImfWeoParser.Observation> rows = ImfWeoParser.parse(body, "IRN", 2026, new ObjectMapper());
        assertEquals(3, rows.size());
        assertEquals("2026", rows.getLast().period());
        assertEquals(0, new BigDecimal("35.1").compareTo(rows.getLast().value()));
    }
}
