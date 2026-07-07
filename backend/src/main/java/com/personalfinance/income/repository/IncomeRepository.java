package com.personalfinance.income.repository;

import com.personalfinance.income.entity.Income;
import com.personalfinance.income.entity.IncomeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface IncomeRepository extends JpaRepository<Income, Long> {

    /** Sum of all active recurring (monthly) income sources. */
    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM Income i WHERE i.incomeType = :type")
    Long sumByType(IncomeType type);
}
