package com.personalfinance.account.repository;

import com.personalfinance.account.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AccountRepository extends JpaRepository<Account, Long> {

    @Query("SELECT COALESCE(SUM(a.balance), 0L) FROM Account a WHERE a.archivedAt IS NULL")
    Long sumAllBalances();

    @Override
    @Query("SELECT a FROM Account a WHERE a.archivedAt IS NULL ORDER BY a.id")
    java.util.List<Account> findAll();

    @Query("SELECT a FROM Account a ORDER BY a.id")
    java.util.List<Account> findAllIncludingArchived();

    java.util.List<Account> findByArchivedAtIsNotNullOrderByIdDesc();

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Account a WHERE a.id=:id")
    java.util.Optional<Account> findLockedById(@org.springframework.data.repository.query.Param("id") Long id);
}
