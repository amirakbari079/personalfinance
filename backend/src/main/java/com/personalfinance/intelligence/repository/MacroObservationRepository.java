package com.personalfinance.intelligence.repository;

import com.personalfinance.intelligence.entity.MacroObservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface MacroObservationRepository extends JpaRepository<MacroObservation, Long> {

    boolean existsByCreatedAtAfter(Instant createdAt);

    boolean existsByIndicatorIdAndPeriod(Long indicatorId, String period);

    Optional<MacroObservation> findFirstByIndicatorIdOrderByPeriodDesc(Long indicatorId);

    Optional<MacroObservation> findFirstByIndicatorIdAndPeriodLessThanOrderByPeriodDesc(
            Long indicatorId, String period);

    List<MacroObservation> findTop8ByIndicatorIdOrderByPeriodDesc(Long indicatorId);
}
