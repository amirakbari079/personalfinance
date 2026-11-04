package com.personalfinance.intelligence.macro;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class WorldBankMacroParserTest {

    @Test
    void skipsNullValuesAndReadsYearlyCpi() throws Exception {
        String body = """
                [{"page":1,"pages":1,"total":2},[
                  {"date":"2024","value":32.5},
                  {"date":"2023","value":null},
                  {"date":"2022","value":45.0}
                ]]
                """;
        List<WorldBankMacroParser.Observation> rows =
                WorldBankMacroParser.parse(body, new ObjectMapper());
        assertEquals(2, rows.size());
        assertEquals("2024", rows.getFirst().period());
        assertEquals(0, new BigDecimal("32.5").compareTo(rows.getFirst().value()));
        assertEquals("2022", rows.get(1).period());
    }

    @Test
    void emptyWhenPayloadMalformed() throws Exception {
        assertEquals(0, WorldBankMacroParser.parse("{}", new ObjectMapper()).size());
    }
}
