package com.personalfinance.history.service;

import com.personalfinance.common.JalaliDateConverter;
import com.personalfinance.history.SnapshotEntityType;
import com.personalfinance.history.dto.SnapshotRequest;
import com.personalfinance.history.dto.SnapshotResponse;
import com.personalfinance.history.entity.ValueSnapshot;
import com.personalfinance.history.repository.ValueSnapshotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class ValueSnapshotService {

    private final ValueSnapshotRepository repository;
    private final JalaliDateConverter jalaliDateConverter;
    private final JdbcTemplate jdbc;

    public ValueSnapshotService(ValueSnapshotRepository repository, JalaliDateConverter jalaliDateConverter, JdbcTemplate jdbc) {
        this.repository = repository;
        this.jalaliDateConverter = jalaliDateConverter;
        this.jdbc = jdbc;
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
        if (entityType == SnapshotEntityType.ACCOUNT) {
            // Negative IDs identify computed ledger observations, never editable legacy rows.
            var ledgerRows = jdbc.queryForList("""
                SELECT -t.id AS id,t.effective_date,t.description,t.created_at,
                  l.opening_balance + sum(e.amount) OVER (ORDER BY t.effective_date,t.id) AS balance,
                  e.amount AS delta
                FROM pf_transaction_entries e JOIN pf_transactions t ON t.id=e.transaction_id
                JOIN pf_ledger_accounts l ON l.account_id=e.account_id
                WHERE e.account_id=? ORDER BY t.effective_date,t.id
                """, entityId);
            for (var row : ledgerRows) {
                result.add(new SnapshotResponse(((Number)row.get("id")).longValue(),
                    ((Number)row.get("balance")).longValue(),
                    jalaliDateConverter.toJalali(((java.sql.Date)row.get("effective_date")).toLocalDate()),
                    ((Number)row.get("delta")).longValue(),row.get("description").toString(),
                    ((java.sql.Timestamp)row.get("created_at")).toInstant(),false));
            }
            if (!ledgerRows.isEmpty()) {
                Long newest = ((Number)ledgerRows.getLast().get("id")).longValue();
                result.replaceAll(s -> new SnapshotResponse(s.id(),s.value(),s.recordedDateJalali(),s.deltaFromPrevious(),s.notes(),s.createdAt(),s.id().equals(newest)));
            }
        }
        result.sort(Comparator.comparing(SnapshotResponse::recordedDateJalali)
            .thenComparing(s -> s.id() < 0 ? 1 : 0).thenComparing(s -> Math.abs(s.id())).reversed());
        return result;
    }

    public Long getLatestValue(SnapshotEntityType entityType, Long entityId) {
        if (entityType == SnapshotEntityType.ACCOUNT) {
            var balance = ledgerValue(entityId, com.personalfinance.foundation.LedgerService.today());
            if (balance != null) return balance;
        }
        return repository
                .findFirstByEntityTypeAndEntityIdOrderByRecordedDateDescIdDesc(entityType, entityId)
                .map(ValueSnapshot::getValue)
                .orElse(0L);
    }

    public java.util.Optional<String> getLatestRecordedDateJalali(SnapshotEntityType entityType, Long entityId) {
        if (entityType == SnapshotEntityType.ACCOUNT) {
            var date = jdbc.queryForObject("SELECT max(d) FROM (SELECT opening_date d FROM pf_ledger_accounts WHERE account_id=? UNION ALL SELECT t.effective_date FROM pf_transactions t JOIN pf_transaction_entries e ON e.transaction_id=t.id WHERE e.account_id=?) dates",java.sql.Date.class,entityId,entityId);
            if (date != null) return java.util.Optional.of(jalaliDateConverter.toJalali(date.toLocalDate()));
        }
        return repository
                .findFirstByEntityTypeAndEntityIdOrderByRecordedDateDescIdDesc(entityType, entityId)
                .map(snapshot -> jalaliDateConverter.toJalali(snapshot.getRecordedDate()));
    }

    public Long getValueOnOrBefore(SnapshotEntityType entityType, Long entityId, LocalDate asOf) {
        if (entityType == SnapshotEntityType.ACCOUNT) {
            var value = ledgerValue(entityId,asOf);
            if (value != null) return value;
        }
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
            return com.personalfinance.foundation.LedgerService.today();
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

    private Long ledgerValue(Long id,LocalDate date) {
        var values=jdbc.queryForList("""
            SELECT l.opening_balance + coalesce((SELECT sum(e.amount) FROM pf_transaction_entries e
              JOIN pf_transactions t ON t.id=e.transaction_id WHERE e.account_id=l.account_id AND t.effective_date<=?),0)
            FROM pf_ledger_accounts l WHERE l.account_id=? AND l.opening_date<=?
            """,Long.class,date,id,date);
        return values.isEmpty()?null:values.getFirst();
    }
}
