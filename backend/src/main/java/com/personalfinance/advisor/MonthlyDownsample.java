package com.personalfinance.advisor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class MonthlyDownsample {

    public static final int MAX_POINTS = 12;

    private MonthlyDownsample() {}

    public record Point(String period, BigDecimal close) {}

    public record DailyClose(LocalDate date, BigDecimal close) {}

    public static List<Point> lastClosesByMonth(List<DailyClose> rows, int maxPoints) {
        if (rows == null || rows.isEmpty() || maxPoints <= 0) {
            return List.of();
        }
        Map<YearMonth, BigDecimal> lastClose = new LinkedHashMap<>();
        for (DailyClose row : rows) {
            if (row == null || row.date() == null || row.close() == null) {
                continue;
            }
            lastClose.put(YearMonth.from(row.date()), row.close());
        }
        List<Point> points = new ArrayList<>(lastClose.size());
        for (Map.Entry<YearMonth, BigDecimal> entry : lastClose.entrySet()) {
            points.add(new Point(entry.getKey().toString(), entry.getValue()));
        }
        if (points.size() <= maxPoints) {
            return List.copyOf(points);
        }
        return List.copyOf(points.subList(points.size() - maxPoints, points.size()));
    }
}
