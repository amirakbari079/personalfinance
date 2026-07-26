package com.personalfinance.history.entity;

import com.personalfinance.common.BaseEntity;
import com.personalfinance.history.SnapshotEntityType;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "value_snapshots")
public class ValueSnapshot extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type", nullable = false, length = 30)
    private SnapshotEntityType entityType;

    @Column(name = "entity_id", nullable = false)
    private Long entityId;

    @Column(nullable = false)
    private Long value;

    @Column(name = "recorded_date", nullable = false)
    private LocalDate recordedDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public SnapshotEntityType getEntityType() { return entityType; }
    public void setEntityType(SnapshotEntityType entityType) { this.entityType = entityType; }

    public Long getEntityId() { return entityId; }
    public void setEntityId(Long entityId) { this.entityId = entityId; }

    public Long getValue() { return value; }
    public void setValue(Long value) { this.value = value; }

    public LocalDate getRecordedDate() { return recordedDate; }
    public void setRecordedDate(LocalDate recordedDate) { this.recordedDate = recordedDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
