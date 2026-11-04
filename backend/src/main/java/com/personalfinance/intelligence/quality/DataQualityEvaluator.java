package com.personalfinance.intelligence.quality;

import com.personalfinance.intelligence.metrics.FinancialMetrics;
import com.personalfinance.intelligence.provider.CurrentQuote;
import com.personalfinance.intelligence.provider.QuoteSelector;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public final class DataQualityEvaluator {

    public static final BigDecimal DEFAULT_THRESHOLD = new BigDecimal("0.5");

    private DataQualityEvaluator() {}

    public static List<ConflictView> findConflicts(
            Map<String, CurrentQuote> byProvider,
            BigDecimal thresholdPercent) {
        List<ConflictView> conflicts = new ArrayList<>();
        if (byProvider == null || byProvider.size() < 2) {
            return conflicts;
        }
        BigDecimal threshold = thresholdPercent == null ? DEFAULT_THRESHOLD : thresholdPercent;
        List<CurrentQuote> quotes = byProvider.values().stream()
                .filter(CurrentQuote::hasPositiveValue)
                .sorted(Comparator.comparing(CurrentQuote::providerCode))
                .toList();
        for (int i = 0; i < quotes.size(); i++) {
            for (int j = i + 1; j < quotes.size(); j++) {
                CurrentQuote a = quotes.get(i);
                CurrentQuote b = quotes.get(j);
                BigDecimal diff = FinancialMetrics.differencePercent(a.value(), b.value());
                if (diff != null && diff.compareTo(threshold) > 0) {
                    conflicts.add(new ConflictView(
                            a.assetSymbol(),
                            a.currency(),
                            a.providerCode(),
                            a.value(),
                            b.providerCode(),
                            b.value(),
                            diff));
                }
            }
        }
        return conflicts;
    }

    public static Optional<ReferenceView> assess(
            List<String> routeOrder,
            Map<String, CurrentQuote> byProvider,
            BigDecimal thresholdPercent) {
        Optional<CurrentQuote> selected = QuoteSelector.firstAvailable(routeOrder, byProvider);
        if (selected.isEmpty()) {
            return Optional.empty();
        }
        List<ConflictView> conflicts = findConflicts(byProvider, thresholdPercent);
        CurrentQuote quote = selected.get();
        int routeIndex = routeOrder == null ? 0 : routeOrder.indexOf(quote.providerCode());
        int sourceCount = byProvider == null ? 0 : (int) byProvider.values().stream()
                .filter(CurrentQuote::hasPositiveValue)
                .count();
        String reason;
        int confidence;
        if (!conflicts.isEmpty()) {
            reason = "CONFLICT_PRIMARY_KEPT";
            confidence = 55;
        } else if (routeIndex > 0) {
            reason = "FALLBACK_ROUTE";
            confidence = 78;
        } else if (sourceCount <= 1) {
            reason = "ONLY_SOURCE";
            confidence = 82;
        } else {
            reason = "PRIMARY_ROUTE";
            confidence = 94;
        }
        return Optional.of(new ReferenceView(quote, reason, confidence, conflicts));
    }

    public record ConflictView(
            String assetSymbol,
            String currency,
            String providerA,
            BigDecimal valueA,
            String providerB,
            BigDecimal valueB,
            BigDecimal differencePercent) {}

    public record ReferenceView(
            CurrentQuote selected,
            String selectionReason,
            int confidence,
            List<ConflictView> conflicts) {}
}
