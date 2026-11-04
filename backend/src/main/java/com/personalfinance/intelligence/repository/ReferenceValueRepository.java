package com.personalfinance.intelligence.repository;

import com.personalfinance.intelligence.entity.ReferenceValue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReferenceValueRepository extends JpaRepository<ReferenceValue, Long> {

    List<ReferenceValue> findByMarketSnapshotId(Long marketSnapshotId);
}
