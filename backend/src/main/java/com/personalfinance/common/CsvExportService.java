package com.personalfinance.common;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.PrintWriter;
import java.lang.reflect.Field;
import java.util.List;
import java.util.function.Function;

@Service
public class CsvExportService {

    public record CsvColumn<T>(String header, Function<T, Object> extractor) {}

    /**
     * Writes a list of objects as CSV to the HTTP response (UTF-8 with BOM).
     * Header row is derived from field names; values via toString(); nulls → empty string.
     */
    public <T> void writeToResponse(List<T> items, Class<T> type, String filename,
                                    HttpServletResponse response) throws IOException {
        response.setContentType("text/csv; charset=UTF-8");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");

        PrintWriter writer = response.getWriter();
        writer.write('\ufeff');

        if (items == null || items.isEmpty()) {
            writeHeader(type, writer);
            writer.flush();
            return;
        }

        write(items, writer);
        writer.flush();
    }

    public <T> void writeToResponse(List<T> items, List<CsvColumn<T>> columns, String filename,
                                    HttpServletResponse response) throws IOException {
        response.setContentType("text/csv; charset=UTF-8");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");

        PrintWriter writer = response.getWriter();
        writer.write('\ufeff');
        writeWithColumns(items == null ? List.of() : items, columns, writer);
        writer.flush();
    }

    public <T> void write(List<T> items, PrintWriter writer) {
        if (items == null || items.isEmpty()) return;

        Field[] fields = items.get(0).getClass().getDeclaredFields();
        writeHeader(fields, writer);

        for (T item : items) {
            writeRow(item, fields, writer);
        }
        writer.flush();
    }

    public <T> void writeWithColumns(List<T> items, List<CsvColumn<T>> columns, PrintWriter writer) {
        StringBuilder header = new StringBuilder();
        for (int i = 0; i < columns.size(); i++) {
            header.append(columns.get(i).header());
            if (i < columns.size() - 1) header.append(",");
        }
        writer.println(header);

        for (T item : items) {
            StringBuilder row = new StringBuilder();
            for (int i = 0; i < columns.size(); i++) {
                Object value = columns.get(i).extractor().apply(item);
                row.append(value == null ? "" : escape(String.valueOf(value)));
                if (i < columns.size() - 1) row.append(",");
            }
            writer.println(row);
        }
    }

    private <T> void writeHeader(Class<T> type, PrintWriter writer) {
        writeHeader(type.getDeclaredFields(), writer);
    }

    private void writeHeader(Field[] fields, PrintWriter writer) {
        StringBuilder header = new StringBuilder();
        for (int i = 0; i < fields.length; i++) {
            header.append(fields[i].getName());
            if (i < fields.length - 1) header.append(",");
        }
        writer.println(header);
    }

    private <T> void writeRow(T item, Field[] fields, PrintWriter writer) {
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

    private String escape(String value) {
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
