package com.personalfinance.intelligence.entity;

import com.personalfinance.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "fi_market_snapshots")
public class MarketSnapshot extends BaseEntity {

    @Column(name = "data_update_id")
    private Long dataUpdateId;

    @Column(name = "captured_at", nullable = false)
    private Instant capturedAt;

    @Column(nullable = false, length = 20)
    private String status = "SUCCESS";

    public Long getDataUpdateId() { return dataUpdateId; }
    public void setDataUpdateId(Long dataUpdateId) { this.dataUpdateId = dataUpdateId; }

    public Instant getCapturedAt() { return capturedAt; }
    public void setCapturedAt(Instant capturedAt) { this.capturedAt = capturedAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
