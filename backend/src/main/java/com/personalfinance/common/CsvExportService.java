package com.personalfinance.common;

import org.springframework.stereotype.Service;

import java.io.PrintWriter;
import java.lang.reflect.Field;
import java.util.List;

@Service
public class CsvExportService {

    /**
     * Writes a list of objects as CSV to the provided PrintWriter.
     * Header row is derived from field names; values via toString(); nulls → empty string.
     *
     * Usage in a controller:
     *   response.setContentType("text/csv; charset=UTF-8");
     *   response.setHeader("Content-Disposition", "attachment; filename=\"export.csv\"");
     *   csvExportService.write(items, response.getWriter());
     */
    public <T> void write(List<T> items, PrintWriter writer) {
        if (items == null || items.isEmpty()) return;

        Field[] fields = items.get(0).getClass().getDeclaredFields();

        StringBuilder header = new StringBuilder();
        for (int i = 0; i < fields.length; i++) {
            header.append(fields[i].getName());
            if (i < fields.length - 1) header.append(",");
        }
        writer.println(header);

        for (T item : items) {
            StringBuilder row = new StringBuilder();
            for (int i = 0; i < fields.length; i++) {
                fields[i].setAccessible(true);
                try {
                    Object value = fields[i].get(item);
                    row.append(value == null ? "" : escape(value.toString()));
                } catch (IllegalAccessException e) {
                    row.append("");
                }
                if (i < fields.length - 1) row.append(",");
            }
            writer.println(row);
        }
        writer.flush();
    }

    private String escape(String value) {
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
