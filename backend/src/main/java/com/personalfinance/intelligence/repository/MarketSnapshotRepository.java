package com.personalfinance.intelligence.repository;

import com.personalfinance.intelligence.entity.MarketSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MarketSnapshotRepository extends JpaRepository<MarketSnapshot, Long> {

    Optional<MarketSnapshot> findFirstByOrderByCapturedAtDesc();
}
