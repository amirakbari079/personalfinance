package com.personalfinance.advisor;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;

public final class AdvisorCacheKey {

    private AdvisorCacheKey() {}

    public static String decisionKey(
            String symbols,
            String timeHorizon,
            String riskTolerance,
            Long capitalAmount,
            String question) {
        return decisionKey(symbols, timeHorizon, riskTolerance, capitalAmount, question, "-");
    }

    public static String decisionKey(
            String symbols,
            String timeHorizon,
            String riskTolerance,
            Long capitalAmount,
            String question,
            String portfolioFingerprint) {
        List<String> parsed = new ArrayList<>(AdvisorSymbols.parse(symbols));
        parsed.sort(String::compareTo);
        return sha256(String.join("|",
                String.join(",", parsed),
                blank(timeHorizon),
                blank(riskTolerance),
                capitalAmount == null ? "-" : capitalAmount.toString(),
                normalizeQuestion(question),
                blank(portfolioFingerprint)));
    }

    public static String cacheKey(String decisionKey, Long marketSnapshotId, String promptCode) {
        return sha256(String.join("|",
                decisionKey,
                marketSnapshotId == null ? "0" : marketSnapshotId.toString(),
                blank(promptCode)));
    }

    public static String normalizeQuestion(String question) {
        if (question == null) {
            return "";
        }
        return question.trim().replaceAll("\\s+", " ").toLowerCase(Locale.ROOT);
    }

    public static String summarize(String body) {
        if (body == null) {
            return "";
        }
        String compact = body.trim().replaceAll("\\s+", " ");
        if (compact.length() <= 280) {
            return compact;
        }
        return compact.substring(0, 277) + "...";
    }

    public static String titleFromQuestion(String question) {
        if (question == null || question.isBlank()) {
            return "تحلیل مشاور";
        }
        String compact = question.trim().replaceAll("\\s+", " ");
        return compact.length() <= 200 ? compact : compact.substring(0, 197) + "...";
    }

    private static String blank(String value) {
        return value == null || value.isBlank() ? "-" : value.trim().toUpperCase(Locale.ROOT);
    }

    private static String sha256(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (Exception e) {
            throw new IllegalStateException("محاسبه کلید کش ناموفق بود");
        }
    }
}
