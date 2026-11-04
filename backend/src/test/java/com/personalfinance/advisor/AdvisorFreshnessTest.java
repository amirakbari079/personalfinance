package com.personalfinance.advisor;

import com.personalfinance.intelligence.entity.DataUpdateStatus;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AdvisorFreshnessTest {

    @Test
    void snapshotOlderThanSixHoursIsStale() {
        Instant now = Instant.parse("2026-08-17T12:00:00Z");
        assertTrue(AdvisorFreshness.snapshotStale(now.minusSeconds(6 * 3600), now));
        assertFalse(AdvisorFreshness.snapshotStale(now.minusSeconds(5 * 3600), now));
        assertTrue(AdvisorFreshness.snapshotStale(null, now));
    }

    @Test
    void annualMacroOfCurrentYearIsFresh() {
        LocalDate today = LocalDate.of(2026, 8, 17);
        assertFalse(AdvisorFreshness.periodStale("2026", today));
        assertTrue(AdvisorFreshness.periodStale("2025", today));
    }

    @Test
    void monthlyMacroBeforeLastCompleteMonthIsStale() {
        LocalDate today = LocalDate.of(2026, 8, 17);
        assertFalse(AdvisorFreshness.periodStale("2026-07", today));
        assertTrue(AdvisorFreshness.periodStale("2026-06", today));
    }

    @Test
    void failedUpdateIsStaleSignal() {
        assertTrue(AdvisorFreshness.updateFailed(DataUpdateStatus.FAILED));
        assertFalse(AdvisorFreshness.updateFailed(DataUpdateStatus.SUCCESS));
    }
}
