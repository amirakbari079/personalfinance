package com.personalfinance.intelligence;

import java.util.Locale;

/**
 * Canonical currency codes for Financial Intelligence.
 * Iranian money is stored as Toman ({@code IRT}), never Rial.
 */
public final class CurrencyCodes {

    public static final String IRT = "IRT";
    public static final String USD = "USD";

    private CurrencyCodes() {}

    public static String normalize(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("واحد پول مشخص نیست");
        }
        String code = raw.trim().toUpperCase(Locale.ROOT);
        return switch (code) {
            case "TOMAN", "IRT", "IRR", "RLS", "RIAL" -> IRT;
            default -> code;
        };
    }
}
