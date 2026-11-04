package com.personalfinance.backup.dto;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class BackupDocument {

    public static final String FORMAT_V1 = "personalfinance-backup-v1";

    private String format;
    private Instant createdAt;
    private Map<String, Integer> counts;
    private Map<String, List<Map<String, Object>>> tables;

    public static BackupDocument of(Instant createdAt,
                                    Map<String, Integer> counts,
                                    Map<String, List<Map<String, Object>>> tables) {
        BackupDocument doc = new BackupDocument();
        doc.format = FORMAT_V1;
        doc.createdAt = createdAt;
        doc.counts = counts;
        doc.tables = tables;
        return doc;
    }

    public String getFormat() { return format; }
    public void setFormat(String format) { this.format = format; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Map<String, Integer> getCounts() { return counts; }
    public void setCounts(Map<String, Integer> counts) { this.counts = counts; }

    public Map<String, List<Map<String, Object>>> getTables() { return tables; }
    public void setTables(Map<String, List<Map<String, Object>>> tables) { this.tables = tables; }

    public Map<String, Integer> countsOrEmpty() {
        return counts != null ? counts : Map.of();
    }

    public Map<String, List<Map<String, Object>>> tablesOrEmpty() {
        return tables != null ? tables : new LinkedHashMap<>();
    }
}
