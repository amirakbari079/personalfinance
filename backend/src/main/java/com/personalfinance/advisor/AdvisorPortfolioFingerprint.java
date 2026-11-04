package com.personalfinance.advisor;

import com.personalfinance.advisor.dto.AdvisorContextResponse.HoldingSummary;
import com.personalfinance.advisor.dto.AdvisorContextResponse.PortfolioSummary;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public final class AdvisorPortfolioFingerprint {

    private AdvisorPortfolioFingerprint() {}

    public static String of(PortfolioSummary portfolio) {
        if (portfolio == null || portfolio.getHoldings() == null || portfolio.getHoldings().isEmpty()) {
            return "-";
        }
        List<String> parts = new ArrayList<>();
        for (HoldingSummary holding : portfolio.getHoldings()) {
            parts.add(String.join(":",
                    blank(holding.getSource()),
                    holding.getId() == null ? "-" : holding.getId().toString(),
                    blank(holding.getName()),
                    holding.getAmountToman() == null ? "0" : holding.getAmountToman().toString()));
        }
        parts.sort(String::compareTo);
        return String.join(",", parts);
    }

    private static String blank(String value) {
        return value == null || value.isBlank() ? "-" : value.trim().toLowerCase(Locale.ROOT);
    }
}
