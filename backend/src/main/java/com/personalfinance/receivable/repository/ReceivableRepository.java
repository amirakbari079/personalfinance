package com.personalfinance.receivable.repository;

import com.personalfinance.receivable.entity.Receivable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ReceivableRepository extends JpaRepository<Receivable, Long> {

    @Query("SELECT COALESCE(SUM(r.originalAmount - r.receivedAmount), 0) FROM Receivable r")
    Long sumOutstanding();
}
