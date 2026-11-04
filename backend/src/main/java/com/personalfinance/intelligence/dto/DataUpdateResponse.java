package com.personalfinance.intelligence.dto;

import com.personalfinance.intelligence.entity.DataUpdate;
import com.personalfinance.intelligence.entity.DataUpdateStatus;

import java.time.Instant;

public class DataUpdateResponse {

    private Long id;
    private Instant startedAt;
    private Instant completedAt;
    private DataUpdateStatus status;
    private String triggerType;
    private int providerCount;
    private int successfulProviders;
    private int failedProviders;
    private int recordsFetched;
    private int recordsStored;
    private int recordsRejected;
    private int errorCount;
    private String errorSummary;
    private Instant createdAt;

    public static DataUpdateResponse from(DataUpdate update) {
        DataUpdateResponse r = new DataUpdateResponse();
        r.id = update.getId();
        r.startedAt = update.getStartedAt();
        r.completedAt = update.getCompletedAt();
        r.status = update.getStatus();
        r.triggerType = update.getTriggerType();
        r.providerCount = update.getProviderCount();
        r.successfulProviders = update.getSuccessfulProviders();
        r.failedProviders = update.getFailedProviders();
        r.recordsFetched = update.getRecordsFetched();
        r.recordsStored = update.getRecordsStored();
        r.recordsRejected = update.getRecordsRejected();
        r.errorCount = update.getErrorCount();
        r.errorSummary = update.getErrorSummary();
        r.createdAt = update.getCreatedAt();
        return r;
    }

    public Long getId() { return id; }
    public Instant getStartedAt() { return startedAt; }
    public Instant getCompletedAt() { return completedAt; }
    public DataUpdateStatus getStatus() { return status; }
    public String getTriggerType() { return triggerType; }
    public int getProviderCount() { return providerCount; }
    public int getSuccessfulProviders() { return successfulProviders; }
    public int getFailedProviders() { return failedProviders; }
    public int getRecordsFetched() { return recordsFetched; }
    public int getRecordsStored() { return recordsStored; }
    public int getRecordsRejected() { return recordsRejected; }
    public int getErrorCount() { return errorCount; }
    public String getErrorSummary() { return errorSummary; }
    public Instant getCreatedAt() { return createdAt; }
}
