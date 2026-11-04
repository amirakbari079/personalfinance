package com.personalfinance.intelligence.entity;

import com.personalfinance.common.BaseEntity;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "fi_data_updates")
public class DataUpdate extends BaseEntity {

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DataUpdateStatus status = DataUpdateStatus.QUEUED;

    @Column(name = "trigger_type", nullable = false, length = 16)
    private String triggerType = "SCHEDULED";

    @Column(name = "provider_count", nullable = false)
    private int providerCount;

    @Column(name = "successful_providers", nullable = false)
    private int successfulProviders;

    @Column(name = "failed_providers", nullable = false)
    private int failedProviders;

    @Column(name = "records_fetched", nullable = false)
    private int recordsFetched;

    @Column(name = "records_stored", nullable = false)
    private int recordsStored;

    @Column(name = "records_rejected", nullable = false)
    private int recordsRejected;

    @Column(name = "error_count", nullable = false)
    private int errorCount;

    @Column(name = "error_summary", columnDefinition = "TEXT")
    private String errorSummary;

    public Instant getStartedAt() { return startedAt; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }

    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }

    public DataUpdateStatus getStatus() { return status; }
    public void setStatus(DataUpdateStatus status) { this.status = status; }

    public String getTriggerType() { return triggerType; }
    public void setTriggerType(String triggerType) { this.triggerType = triggerType; }

    public int getProviderCount() { return providerCount; }
    public void setProviderCount(int providerCount) { this.providerCount = providerCount; }

    public int getSuccessfulProviders() { return successfulProviders; }
    public void setSuccessfulProviders(int successfulProviders) { this.successfulProviders = successfulProviders; }

    public int getFailedProviders() { return failedProviders; }
    public void setFailedProviders(int failedProviders) { this.failedProviders = failedProviders; }

    public int getRecordsFetched() { return recordsFetched; }
    public void setRecordsFetched(int recordsFetched) { this.recordsFetched = recordsFetched; }

    public int getRecordsStored() { return recordsStored; }
    public void setRecordsStored(int recordsStored) { this.recordsStored = recordsStored; }

    public int getRecordsRejected() { return recordsRejected; }
    public void setRecordsRejected(int recordsRejected) { this.recordsRejected = recordsRejected; }

    public int getErrorCount() { return errorCount; }
    public void setErrorCount(int errorCount) { this.errorCount = errorCount; }

    public String getErrorSummary() { return errorSummary; }
    public void setErrorSummary(String errorSummary) { this.errorSummary = errorSummary; }
}
