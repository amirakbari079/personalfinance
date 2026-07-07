package com.personalfinance.account.repository;

import com.personalfinance.account.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AccountRepository extends JpaRepository<Account, Long> {

    @Query("SELECT COALESCE(SUM(a.balance), 0) FROM Account a")
    Long sumAllBalances();
}
