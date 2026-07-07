package com.personalfinance.account.repository;

import com.personalfinance.account.entity.Investment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface InvestmentRepository extends JpaRepository<Investment, Long> {

    @Query("SELECT COALESCE(SUM(a.tomanEquivalent), 0) FROM Investment a")
    Long sumAllTomanEquivalents();
}
