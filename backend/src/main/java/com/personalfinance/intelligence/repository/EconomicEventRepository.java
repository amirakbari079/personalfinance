package com.personalfinance.intelligence.repository;

import com.personalfinance.intelligence.entity.EconomicEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EconomicEventRepository extends JpaRepository<EconomicEvent, Long> {
}
