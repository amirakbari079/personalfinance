package com.personalfinance.intelligence.repository;

import com.personalfinance.intelligence.entity.ConflictResolutionStatus;
import com.personalfinance.intelligence.entity.DataConflict;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DataConflictRepository extends JpaRepository<DataConflict, Long> {

    List<DataConflict> findTop50ByResolutionStatusOrderByDetectedAtDesc(ConflictResolutionStatus status);

    long countByResolutionStatus(ConflictResolutionStatus status);
}
