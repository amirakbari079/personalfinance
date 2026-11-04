package com.personalfinance.backup.dto;

import java.util.Map;

public class RestoreResultResponse {

    private String filename;
    private Map<String, Integer> restoredCounts;

    public static RestoreResultResponse of(String filename, Map<String, Integer> restoredCounts) {
        RestoreResultResponse r = new RestoreResultResponse();
        r.filename = filename;
        r.restoredCounts = restoredCounts;
        return r;
    }

    public String getFilename() { return filename; }
    public Map<String, Integer> getRestoredCounts() { return restoredCounts; }
}
