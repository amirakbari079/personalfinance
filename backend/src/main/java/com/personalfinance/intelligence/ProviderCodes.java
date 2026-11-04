package com.personalfinance.intelligence;

import java.util.Locale;

public final class ProviderCodes {

    public static final String TGJU = "TGJU";
    public static final String COINGECKO = "COINGECKO";
    public static final String NOBITEX = "NOBITEX";
    public static final String TSETMC = "TSETMC";
    public static final String DERIVED = "DERIVED";
    public static final String WORLDBANK = "WORLDBANK";
    public static final String BLS = "BLS";
    public static final String IMF = "IMF";

    private ProviderCodes() {}

    public static String fromSource(String source) {
        if (source == null || source.isBlank()) {
            return DERIVED;
        }
        String normalized = source.trim().toUpperCase(Locale.ROOT);
        if (normalized.startsWith("TGJU")) {
            return TGJU;
        }
        if (normalized.startsWith("COINGECKO")) {
            return COINGECKO;
        }
        if (normalized.startsWith("NOBITEX")) {
            return NOBITEX;
        }
        if (normalized.startsWith("TSETMC")) {
            return TSETMC;
        }
        if (normalized.startsWith("WORLDBANK") || normalized.startsWith("WORLD BANK")) {
            return WORLDBANK;
        }
        if (normalized.startsWith("BLS")) {
            return BLS;
        }
        if (normalized.startsWith("IMF")) {
            return IMF;
        }
        return DERIVED;
    }
}
