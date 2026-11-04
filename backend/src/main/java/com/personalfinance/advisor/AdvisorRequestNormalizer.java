package com.personalfinance.advisor;

import java.util.Locale;
import java.util.Set;

public final class AdvisorRequestNormalizer {

    private static final Set<String> RISKS = Set.of(
            "CONSERVATIVE", "MODERATE", "BALANCED", "AGGRESSIVE", "VERY_AGGRESSIVE", "UNSPECIFIED");
    private static final Set<String> HORIZONS = Set.of("1M", "3M", "6M", "1Y", "3Y");
    private static final Set<String> LIQUIDITY = Set.of("LOW", "MEDIUM", "HIGH", "UNSPECIFIED");

    private AdvisorRequestNormalizer() {}

    public static String risk(String raw) {
        return requiredEnum(raw, RISKS, "UNSPECIFIED", "پروفایل ریسک نامعتبر است");
    }

    public static String horizon(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String normalized = raw.trim().toUpperCase(Locale.ROOT);
        if (!HORIZONS.contains(normalized)) {
            throw new IllegalArgumentException("افق زمانی نامعتبر است");
        }
        return normalized;
    }

    public static String liquidity(String raw) {
        return requiredEnum(raw, LIQUIDITY, "UNSPECIFIED", "نیاز نقدشوندگی نامعتبر است");
    }

    private static String requiredEnum(String raw, Set<String> allowed, String fallback, String error) {
        if (raw == null || raw.isBlank()) {
            return fallback;
        }
        String normalized = raw.trim().toUpperCase(Locale.ROOT);
        if (!allowed.contains(normalized)) {
            throw new IllegalArgumentException(error);
        }
        return normalized;
    }
}
