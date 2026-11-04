package com.personalfinance.intelligence.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class QualitySummaryResponse {

    private DataUpdateResponse lastUpdate;
    private Long lastSnapshotId;
    private Instant lastSnapshotAt;
    private long openConflictCount;
    private BigDecimal averageConfidence;
    private Integer providerSuccessRate;

    public DataUpdateResponse getLastUpdate() { return lastUpdate; }
    public void setLastUpdate(DataUpdateResponse lastUpdate) { this.lastUpdate = lastUpdate; }

    public Long getLastSnapshotId() { return lastSnapshotId; }
    public void setLastSnapshotId(Long lastSnapshotId) { this.lastSnapshotId = lastSnapshotId; }

    public Instant getLastSnapshotAt() { return lastSnapshotAt; }
    public void setLastSnapshotAt(Instant lastSnapshotAt) { this.lastSnapshotAt = lastSnapshotAt; }

    public long getOpenConflictCount() { return openConflictCount; }
    public void setOpenConflictCount(long openConflictCount) { this.openConflictCount = openConflictCount; }

    public BigDecimal getAverageConfidence() { return averageConfidence; }
    public void setAverageConfidence(BigDecimal averageConfidence) { this.averageConfidence = averageConfidence; }

    public Integer getProviderSuccessRate() { return providerSuccessRate; }
    public void setProviderSuccessRate(Integer providerSuccessRate) { this.providerSuccessRate = providerSuccessRate; }
}
