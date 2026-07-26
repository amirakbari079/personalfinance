package com.personalfinance.history.service;

import com.personalfinance.common.JalaliDateConverter;
import com.personalfinance.history.SnapshotEntityType;
import com.personalfinance.history.dto.SnapshotRequest;
import com.personalfinance.history.dto.SnapshotResponse;
import com.personalfinance.history.entity.ValueSnapshot;
import com.personalfinance.history.repository.ValueSnapshotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class ValueSnapshotService {

    private final ValueSnapshotRepository repository;
    private final JalaliDateConverter jalaliDateConverter;

    public ValueSnapshotService(ValueSnapshotRepository repository, JalaliDateConverter jalaliDateConverter) {
        this.repository = repository;
        this.jalaliDateConverter = jalaliDateConverter;
    }

    @Transactional
    public ValueSnapshot upsert(
            SnapshotEntityType entityType,
            Long entityId,
            Long value,
            LocalDate recordedDate,
            String notes) {
        ValueSnapshot snapshot = repository
                .findByEntityTypeAndEntityIdAndRecordedDate(entityType, entityId, recordedDate)
                .orElseGet(ValueSnapshot::new);
        snapshot.setEntityType(entityType);
        snapshot.setEntityId(entityId);
        snapshot.setValue(value);
        snapshot.setRecordedDate(recordedDate);
        snapshot.setNotes(notes);
        return repository.save(snapshot);
    }

    @Transactional
    public SnapshotResponse create(SnapshotEntityType entityType, Long entityId, SnapshotRequest request) {
        LocalDate recordedDate = resolveRecordedDate(request.getRecordedDateJalali());
        ValueSnapshot saved = upsert(entityType, entityId, request.getValue(), recordedDate, request.getNotes());
        return findHistory(entityType, entityId).stream()
                .filter(s -> s.id().equals(saved.getId()))
                .findFirst()
                .orElseThrow();
    }

    @Transactional
    public SnapshotResponse update(
            SnapshotEntityType entityType,
            Long entityId,
            Long snapshotId,
            SnapshotRequest request) {
        ValueSnapshot snapshot = repository
                .findByIdAndEntityTypeAndEntityId(snapshotId, entityType, entityId)
                .orElseThrow(() -> new NoSuchElementException("رکورد تاریخچه یافت نشد"));

        LocalDate newDate = resolveRecordedDate(request.getRecordedDateJalali());
        boolean sameCalendarDate = snapshot.getRecordedDate().equals(newDate);
        if (!sameCalendarDate
                && request.getRecordedDateJalali() != null
                && !request.getRecordedDateJalali().isBlank()) {
            String normalizedRequest = jalaliDateConverter.normalizeToWesternDigits(
                    request.getRecordedDateJalali().trim());
            sameCalendarDate = jalaliDateConverter.toJalali(snapshot.getRecordedDate()).equals(normalizedRequest);
        }
        if (!sameCalendarDate) {
            repository.findByEntityTypeAndEntityIdAndRecordedDate(entityType, entityId, newDate)
                    .filter(existing -> !existing.getId().equals(snapshotId))
                    .ifPresent(existing -> {
                        throw new IllegalArgumentException("برای این تاریخ قبلاً رکورد ثبت شده است");
                    });
        }

        snapshot.setValue(request.getValue());
        snapshot.setRecordedDate(newDate);
        snapshot.setNotes(request.getNotes());
        repository.save(snapshot);

        return findHistory(entityType, entityId).stream()
                .filter(s -> s.id().equals(snapshotId))
                .findFirst()
                .orElseThrow();
    }

    @Transactional
    public void delete(SnapshotEntityType entityType, Long entityId, Long snapshotId) {
        ValueSnapshot snapshot = repository
                .findByIdAndEntityTypeAndEntityId(snapshotId, entityType, entityId)
                .orElseThrow(() -> new NoSuchElementException("رکورد تاریخچه یافت نشد"));
        repository.delete(snapshot);
    }

    public List<SnapshotResponse> findHistory(SnapshotEntityType entityType, Long entityId) {
        List<ValueSnapshot> snapshots = repository
                .findByEntityTypeAndEntityIdOrderByRecordedDateDescIdDesc(entityType, entityId);

        Long latestId = repository
                .findFirstByEntityTypeAndEntityIdOrderByRecordedDateDescIdDesc(entityType, entityId)
                .map(ValueSnapshot::getId)
                .orElse(null);

        List<ValueSnapshot> chronological = new ArrayList<>(snapshots);
        chronological.sort(Comparator.comparing(ValueSnapshot::getRecordedDate)
                .thenComparing(ValueSnapshot::getId));

        List<SnapshotResponse> result = new ArrayList<>();
        Long previous = null;
        for (ValueSnapshot snapshot : chronological) {
            Long delta = previous == null ? null : snapshot.getValue() - previous;
            boolean isLatest = snapshot.getId().equals(latestId);
            result.add(toResponse(snapshot, delta, isLatest));
            previous = snapshot.getValue();
        }
        result.sort(Comparator.comparing(SnapshotResponse::recordedDateJalali).reversed());
        return result;
    }

    public Long getLatestValue(SnapshotEntityType entityType, Long entityId) {
        return repository
                .findFirstByEntityTypeAndEntityIdOrderByRecordedDateDescIdDesc(entityType, entityId)
                .map(ValueSnapshot::getValue)
                .orElse(0L);
    }

    public Long getValueOnOrBefore(SnapshotEntityType entityType, Long entityId, LocalDate asOf) {
        return repository
                .findTopByEntityTypeAndEntityIdAndRecordedDateLessThanEqualOrderByRecordedDateDescIdDesc(
                        entityType, entityId, asOf)
                .map(ValueSnapshot::getValue)
                .orElse(0L);
    }

    @Transactional
    public void deleteByEntity(SnapshotEntityType entityType, Long entityId) {
        repository.deleteByEntityTypeAndEntityId(entityType, entityId);
    }

    public LocalDate resolveRecordedDate(String jalaliDate) {
        if (jalaliDate == null || jalaliDate.isBlank()) {
            return LocalDate.now();
        }
        return jalaliDateConverter.toGregorian(jalaliDateConverter.normalizeToWesternDigits(jalaliDate.trim()));
    }

    private SnapshotResponse toResponse(ValueSnapshot snapshot, Long delta, boolean isLatest) {
        return new SnapshotResponse(
                snapshot.getId(),
                snapshot.getValue(),
                jalaliDateConverter.toJalali(snapshot.getRecordedDate()),
                delta,
                snapshot.getNotes(),
                snapshot.getCreatedAt(),
                isLatest);
    }
}
