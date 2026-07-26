package com.personalfinance.history.repository;

import com.personalfinance.history.SnapshotEntityType;
import com.personalfinance.history.entity.ValueSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ValueSnapshotRepository extends JpaRepository<ValueSnapshot, Long> {

    List<ValueSnapshot> findByEntityTypeAndEntityIdOrderByRecordedDateDescIdDesc(
            SnapshotEntityType entityType, Long entityId);

    Optional<ValueSnapshot> findByEntityTypeAndEntityIdAndRecordedDate(
            SnapshotEntityType entityType, Long entityId, LocalDate recordedDate);

    void deleteByEntityTypeAndEntityId(SnapshotEntityType entityType, Long entityId);

    @Query("""
            SELECT DISTINCT vs.recordedDate FROM ValueSnapshot vs
            WHERE vs.entityType = :entityType
            ORDER BY vs.recordedDate ASC
            """)
    List<LocalDate> findDistinctRecordedDates(@Param("entityType") SnapshotEntityType entityType);

    Optional<ValueSnapshot> findTopByEntityTypeAndEntityIdAndRecordedDateLessThanEqualOrderByRecordedDateDescIdDesc(
            SnapshotEntityType entityType, Long entityId, LocalDate asOf);

    Optional<ValueSnapshot> findFirstByEntityTypeAndEntityIdOrderByRecordedDateDescIdDesc(
            SnapshotEntityType entityType, Long entityId);

    @Query("""
            SELECT vs FROM ValueSnapshot vs
            WHERE vs.entityType = :entityType
              AND vs.recordedDate >= :fromDate
              AND vs.recordedDate <= :toDate
            ORDER BY vs.recordedDate ASC, vs.id ASC
            """)
    List<ValueSnapshot> findByEntityTypeAndDateRange(
            @Param("entityType") SnapshotEntityType entityType,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate);

    Optional<ValueSnapshot> findByIdAndEntityTypeAndEntityId(
            Long id, SnapshotEntityType entityType, Long entityId);
}
