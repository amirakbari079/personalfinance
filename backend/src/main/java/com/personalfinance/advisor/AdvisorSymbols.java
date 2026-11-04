package com.personalfinance.advisor;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public final class AdvisorSymbols {

    public static final List<String> DEFAULT = List.of("GOLD_18K", "BTC", "USD");
    public static final int MAX_SYMBOLS = 8;

    private AdvisorSymbols() {}

    public static List<String> parse(String raw) {
        if (raw == null || raw.isBlank()) {
            return DEFAULT;
        }
        List<String> symbols = new ArrayList<>();
        for (String part : raw.split(",")) {
            String symbol = part.trim().toUpperCase(Locale.ROOT);
            if (symbol.isEmpty() || symbols.contains(symbol)) {
                continue;
            }
            symbols.add(symbol);
            if (symbols.size() >= MAX_SYMBOLS) {
                break;
            }
        }
        return symbols.isEmpty() ? DEFAULT : List.copyOf(symbols);
    }
}
