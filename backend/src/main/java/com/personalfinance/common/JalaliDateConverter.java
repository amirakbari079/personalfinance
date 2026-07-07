package com.personalfinance.common;

import com.github.mfathi91.time.PersianDate;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.YearMonth;

@Component
public class JalaliDateConverter {

    private static final String[] PERSIAN_MONTHS = {
        "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
        "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
    };

    /**
     * Converts a Gregorian LocalDate to a Jalali date string "YYYY/MM/DD".
     * Example: 2024-07-04 → "1403/04/14"
     */
    public String toJalali(LocalDate gregorian) {
        if (gregorian == null) return null;
        PersianDate persian = PersianDate.fromGregorian(gregorian);
        return String.format("%d/%02d/%02d",
                persian.getYear(),
                persian.getMonthValue(),
                persian.getDayOfMonth());
    }

    /**
     * Converts a Jalali date string "YYYY/MM/DD" to a Gregorian LocalDate.
     */
    public LocalDate toGregorian(String jalali) {
        if (jalali == null || jalali.isBlank()) return null;
        String[] parts = jalali.split("/");
        if (parts.length != 3) {
            throw new IllegalArgumentException("Invalid Jalali date format: " + jalali);
        }
        int year  = Integer.parseInt(parts[0].trim());
        int month = Integer.parseInt(parts[1].trim());
        int day   = Integer.parseInt(parts[2].trim());
        return PersianDate.of(year, month, day).toGregorian();
    }

    /**
     * Adds {@code months} to a Jalali date string, returning the new Jalali date.
     * Clamps day to the last valid day of the target Jalali month (e.g. 31/xx/1402 + 1 month → 30/xx+1).
     */
    public String addMonthsToJalali(String jalali, int months) {
        if (jalali == null || jalali.isBlank()) return null;
        LocalDate base = toGregorian(jalali);
        LocalDate shifted = addMonthsGregorian(base, months);
        return toJalali(shifted);
    }

    /**
     * Adds months to a Gregorian date, clamping the day to month-end (uses YearMonth
     * length so e.g. Jan 31 + 1 month → Feb 28/29).
     */
    public LocalDate addMonthsGregorian(LocalDate date, int months) {
        if (date == null) return null;
        YearMonth target = YearMonth.from(date).plusMonths(months);
        int day = Math.min(date.getDayOfMonth(), target.lengthOfMonth());
        return LocalDate.of(target.getYear(), target.getMonth(), day);
    }

    /**
     * Returns a human-readable Persian month label, e.g. "اردیبهشت ۱۴۰۳".
     */
    public String jalaliMonthLabel(String jalali) {
        if (jalali == null || jalali.isBlank()) return null;
        PersianDate persian = PersianDate.fromGregorian(toGregorian(jalali));
        int monthIndex = persian.getMonthValue() - 1;
        String month = (monthIndex >= 0 && monthIndex < PERSIAN_MONTHS.length)
                ? PERSIAN_MONTHS[monthIndex]
                : String.valueOf(persian.getMonthValue());
        return toPersianDigits(persian.getYear())
                + " "
                + month;
    }

    /** Converts Western digits in a number/string to Persian digits. */
    public String toPersianDigits(long value) {
        char[] persianDigits = {'۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'};
        String s = String.valueOf(value);
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            out.append(Character.isDigit(c) ? persianDigits[c - '0'] : c);
        }
        return out.toString();
    }
}
