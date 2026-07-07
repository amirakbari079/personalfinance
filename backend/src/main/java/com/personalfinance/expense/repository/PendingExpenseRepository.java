package com.personalfinance.expense.repository;

import com.personalfinance.expense.entity.PendingExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PendingExpenseRepository extends JpaRepository<PendingExpense, Long> {

    @Query("SELECT COALESCE(SUM(e.plannedAmount), 0) FROM PendingExpense e")
    Long sumAllPlannedAmounts();
}
