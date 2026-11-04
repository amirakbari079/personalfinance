package com.personalfinance.intelligence.repository;

import com.personalfinance.intelligence.entity.MarketSnapshotItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarketSnapshotItemRepository extends JpaRepository<MarketSnapshotItem, Long> {
}
