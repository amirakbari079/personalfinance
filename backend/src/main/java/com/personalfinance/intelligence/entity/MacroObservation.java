package com.personalfinance.intelligence.entity;

import com.personalfinance.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(
        name = "fi_macro_observations",
        uniqueConstraints = @UniqueConstraint(columnNames = {"indicator_id", "period"}))
public class MacroObservation extends BaseEntity {

    @Column(name = "indicator_id", nullable = false)
    private Long indicatorId;

    @Column(nullable = false, length = 16)
    private String period;

    @Column(nullable = false, precision = 20, scale = 8)
    private BigDecimal value;

    @Column(name = "previous_value", precision = 20, scale = 8)
    private BigDecimal previousValue;

    @Column(nullable = false, length = 32)
    private String unit;

    @Column(nullable = false, length = 32)
    private String source;

    @Column(name = "published_at", nullable = false)
    private Instant publishedAt;

    public Long getIndicatorId() { return indicatorId; }
    public void setIndicatorId(Long indicatorId) { this.indicatorId = indicatorId; }

    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }

    public BigDecimal getValue() { return value; }
    public void setValue(BigDecimal value) { this.value = value; }

    public BigDecimal getPreviousValue() { return previousValue; }
    public void setPreviousValue(BigDecimal previousValue) { this.previousValue = previousValue; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public Instant getPublishedAt() { return publishedAt; }
    public void setPublishedAt(Instant publishedAt) { this.publishedAt = publishedAt; }
}
