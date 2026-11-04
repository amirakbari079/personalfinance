package com.personalfinance.advisor;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class AdvisorSymbolsTest {

    @Test
    void blankUsesDefaultTrio() {
        assertEquals(List.of("GOLD_18K", "BTC", "USD"), AdvisorSymbols.parse(null));
        assertEquals(List.of("GOLD_18K", "BTC", "USD"), AdvisorSymbols.parse("  "));
    }

    @Test
    void normalizesDedupesAndCaps() {
        assertEquals(List.of("GOLD_18K", "BTC"), AdvisorSymbols.parse("gold_18k, btc, GOLD_18K"));
        assertEquals(
                List.of("A", "B", "C", "D", "E", "F", "G", "H"),
                AdvisorSymbols.parse("a,b,c,d,e,f,g,h,i,j"));
    }
}
