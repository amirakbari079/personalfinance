package com.personalfinance.intelligence;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ProviderCodesTest {

    @Test
    void mapsKnownSources() {
        assertEquals("TGJU", ProviderCodes.fromSource("TGJU-Live"));
        assertEquals("COINGECKO", ProviderCodes.fromSource("CoinGecko-PAXG"));
        assertEquals("NOBITEX", ProviderCodes.fromSource("Nobitex"));
        assertEquals("TSETMC", ProviderCodes.fromSource("TSETMC"));
        assertEquals("WORLDBANK", ProviderCodes.fromSource("World Bank Open Data"));
        assertEquals("BLS", ProviderCodes.fromSource("BLS-CPI"));
        assertEquals("IMF", ProviderCodes.fromSource("IMF WEO"));
    }

    @Test
    void unknownSourceIsDerived() {
        assertEquals("DERIVED", ProviderCodes.fromSource("BTC_USD×USD_IRR"));
        assertEquals("DERIVED", ProviderCodes.fromSource(null));
        assertEquals("DERIVED", ProviderCodes.fromSource(" "));
    }
}
