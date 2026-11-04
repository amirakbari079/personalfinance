package com.personalfinance.advisor;

import com.personalfinance.intelligence.HistoryRange;
import com.personalfinance.intelligence.entity.DataUpdateStatus;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

public final class AdvisorFreshness {

    public static final int SNAPSHOT_STALE_HOURS = 6;
    public static final int PRICE_STALE_HOURS = 24;

    private AdvisorFreshness() {}

    public static boolean snapshotStale(Instant capturedAt, Instant now) {
        if (capturedAt == null || now == null) {
            return true;
        }
        return Duration.between(capturedAt, now).toHours() >= SNAPSHOT_STALE_HOURS;
    }

    public static boolean priceStale(Instant observedAt, Instant now) {
        if (observedAt == null || now == null) {
            return true;
        }
        return Duration.between(observedAt, now).toHours() >= PRICE_STALE_HOURS;
    }

    public static boolean periodStale(String period, LocalDate today) {
        if (period == null || period.isBlank() || today == null) {
            return true;
        }
        String value = period.trim();
        if (value.matches("\\d{4}-\\d{2}")) {
            try {
                YearMonth observed = YearMonth.parse(value);
                YearMonth lastComplete = YearMonth.from(today).minusMonths(1);
                return observed.isBefore(lastComplete);
            } catch (DateTimeParseException e) {
                return true;
            }
        }
        if (value.matches("\\d{4}")) {
            return Integer.parseInt(value) < today.getYear();
        }
        return false;
    }

    public static boolean updateFailed(DataUpdateStatus status) {
        return status == DataUpdateStatus.FAILED;
    }

    public static LocalDate todayTehran() {
        return LocalDate.now(HistoryRange.TEHRAN);
    }

    public static String joinReasons(List<String> reasons) {
        if (reasons == null || reasons.isEmpty()) {
            return null;
        }
        List<String> compact = new ArrayList<>();
        for (String reason : reasons) {
            if (reason != null && !reason.isBlank()) {
                compact.add(reason.trim());
            }
        }
        return compact.isEmpty() ? null : String.join("؛ ", compact);
    }
}
