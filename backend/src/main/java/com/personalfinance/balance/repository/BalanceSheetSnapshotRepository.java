package com.personalfinance.balance.repository;

import com.personalfinance.balance.entity.BalanceSheetSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BalanceSheetSnapshotRepository extends JpaRepository<BalanceSheetSnapshot, Long> {

    Optional<BalanceSheetSnapshot> findByRecordedDate(LocalDate recordedDate);

    List<BalanceSheetSnapshot> findAllByOrderByRecordedDateAsc();
}
