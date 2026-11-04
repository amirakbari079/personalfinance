package com.personalfinance.advisor;

import java.util.Locale;
import java.util.Set;

public final class AdvisorHoldings {

    public static final String ACCOUNT = "ACCOUNT";
    public static final String INVESTMENT = "INVESTMENT";
    public static final String CUSTOM = "CUSTOM";

    private static final Set<String> KINDS = Set.of(ACCOUNT, INVESTMENT);

    private AdvisorHoldings() {}

    public static String kind(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("نوع دارایی الزامی است");
        }
        String normalized = raw.trim().toUpperCase(Locale.ROOT);
        if (!KINDS.contains(normalized)) {
            throw new IllegalArgumentException("نوع دارایی باید حساب یا سرمایه‌گذاری باشد");
        }
        return normalized;
    }
}
