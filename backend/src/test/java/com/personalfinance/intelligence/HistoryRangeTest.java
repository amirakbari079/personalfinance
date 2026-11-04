package com.personalfinance.intelligence;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class HistoryRangeTest {

    @Test
    void computesWindowsFromToday() {
        LocalDate today = LocalDate.of(2026, 8, 17);
        assertEquals(LocalDate.of(2026, 8, 10), HistoryRange.startDate("1W", today));
        assertEquals(LocalDate.of(2026, 7, 17), HistoryRange.startDate("1M", today));
        assertEquals(LocalDate.of(2026, 1, 1), HistoryRange.startDate("YTD", today));
        assertEquals(LocalDate.of(1970, 1, 1), HistoryRange.startDate("MAX", today));
    }

    @Test
    void rejectsUnknownRange() {
        assertThrows(IllegalArgumentException.class, () -> HistoryRange.startDate("2D", LocalDate.now()));
    }
}
