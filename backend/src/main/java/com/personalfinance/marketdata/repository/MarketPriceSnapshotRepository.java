package com.personalfinance.marketdata.repository;

import com.personalfinance.marketdata.MarketSymbol;
import com.personalfinance.marketdata.entity.MarketPriceSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface MarketPriceSnapshotRepository extends JpaRepository<MarketPriceSnapshot, Long> {

    Optional<MarketPriceSnapshot> findFirstBySymbolOrderByRecordedAtDesc(MarketSymbol symbol);

    List<MarketPriceSnapshot> findBySymbolAndRecordedAtGreaterThanEqualOrderByRecordedAtAsc(
            MarketSymbol symbol, Instant from);

    @Query("""
            SELECT s FROM MarketPriceSnapshot s
            WHERE s.symbol = :symbol AND s.recordedAt >= :from
            ORDER BY s.recordedAt ASC
            """)
    List<MarketPriceSnapshot> findHistory(
            @Param("symbol") MarketSymbol symbol,
            @Param("from") Instant from);
}
