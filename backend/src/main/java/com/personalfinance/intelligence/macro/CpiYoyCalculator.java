package com.personalfinance.intelligence.macro;

import com.personalfinance.intelligence.metrics.FinancialMetrics;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

public final class CpiYoyCalculator {

    private CpiYoyCalculator() {}

    public record Observation(String period, BigDecimal value) {}

    public static List<Observation> yearOverYear(List<BlsCpiParser.IndexPoint> points) {
        Map<YearMonth, BigDecimal> byMonth = new TreeMap<>();
        for (BlsCpiParser.IndexPoint point : points) {
            byMonth.put(YearMonth.parse(point.period()), point.index());
        }
        List<Observation> rows = new ArrayList<>();
        for (Map.Entry<YearMonth, BigDecimal> entry : byMonth.entrySet()) {
            BigDecimal prior = byMonth.get(entry.getKey().minusYears(1));
            BigDecimal yoy = FinancialMetrics.returnPercent(prior, entry.getValue());
            if (yoy != null) {
                rows.add(new Observation(entry.getKey().toString(), yoy));
            }
        }
        return rows;
    }
}
