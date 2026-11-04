package com.personalfinance.advisor;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class MonthlyDownsampleTest {

    @Test
    void keepsLastCloseOfEachMonthAndCapsAtTwelve() {
        List<MonthlyDownsample.DailyClose> rows = new ArrayList<>();
        for (int month = 1; month <= 14; month++) {
            LocalDate first = LocalDate.of(2025, 1, 1).plusMonths(month - 1);
            rows.add(new MonthlyDownsample.DailyClose(first, BigDecimal.valueOf(month)));
            rows.add(new MonthlyDownsample.DailyClose(first.plusDays(10), BigDecimal.valueOf(month + 0.5)));
        }

        List<MonthlyDownsample.Point> points =
                MonthlyDownsample.lastClosesByMonth(rows, MonthlyDownsample.MAX_POINTS);

        assertEquals(12, points.size());
        assertEquals("2025-03", points.getFirst().period());
        assertEquals(0, new BigDecimal("3.5").compareTo(points.getFirst().close()));
        assertEquals("2026-02", points.getLast().period());
        assertEquals(0, new BigDecimal("14.5").compareTo(points.getLast().close()));
    }
}
