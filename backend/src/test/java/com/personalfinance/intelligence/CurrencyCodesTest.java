package com.personalfinance.intelligence;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class CurrencyCodesTest {

    @Test
    void tomanAndRialAliasesBecomeIrt() {
        assertEquals("IRT", CurrencyCodes.normalize("TOMAN"));
        assertEquals("IRT", CurrencyCodes.normalize("toman"));
        assertEquals("IRT", CurrencyCodes.normalize("IRR"));
        assertEquals("IRT", CurrencyCodes.normalize("RLS"));
        assertEquals("IRT", CurrencyCodes.normalize("Rial"));
        assertEquals("IRT", CurrencyCodes.normalize("IRT"));
    }

    @Test
    void usdStaysUsd() {
        assertEquals("USD", CurrencyCodes.normalize("usd"));
    }

    @Test
    void blankCurrencyIsRejected() {
        assertThrows(IllegalArgumentException.class, () -> CurrencyCodes.normalize(" "));
        assertThrows(IllegalArgumentException.class, () -> CurrencyCodes.normalize(null));
    }
}
