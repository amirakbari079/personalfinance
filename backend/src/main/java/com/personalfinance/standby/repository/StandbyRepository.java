package com.personalfinance.standby.repository;

import com.personalfinance.standby.entity.Standby;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface StandbyRepository extends JpaRepository<Standby, Long> {

    @Query("SELECT COALESCE(SUM(s.quantity * s.expectedUnitPrice), 0) FROM Standby s")
    Long sumTotalValue();
}
