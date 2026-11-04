package com.personalfinance.backup.dto;

import java.util.List;

public class BackupListResponse {

    private String directory;
    private List<BackupFileResponse> items;

    public static BackupListResponse of(String directory, List<BackupFileResponse> items) {
        BackupListResponse r = new BackupListResponse();
        r.directory = directory;
        r.items = items;
        return r;
    }

    public String getDirectory() { return directory; }
    public List<BackupFileResponse> getItems() { return items; }
}
