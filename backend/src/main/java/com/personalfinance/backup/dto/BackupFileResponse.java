package com.personalfinance.backup.dto;

import java.time.Instant;
import java.util.Map;

public class BackupFileResponse {

    private String filename;
    private Instant createdAt;
    private long sizeBytes;
    private Map<String, Integer> counts;

    public static BackupFileResponse of(String filename, Instant createdAt, long sizeBytes,
                                        Map<String, Integer> counts) {
        BackupFileResponse r = new BackupFileResponse();
        r.filename = filename;
        r.createdAt = createdAt;
        r.sizeBytes = sizeBytes;
        r.counts = counts;
        return r;
    }

    public String getFilename() { return filename; }
    public Instant getCreatedAt() { return createdAt; }
    public long getSizeBytes() { return sizeBytes; }
    public Map<String, Integer> getCounts() { return counts; }
}
