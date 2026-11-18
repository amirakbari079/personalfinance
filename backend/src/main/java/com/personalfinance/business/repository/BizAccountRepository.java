package com.personalfinance.business.repository;

import com.personalfinance.business.entity.BizAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BizAccountRepository extends JpaRepository<BizAccount, Long> {
    List<BizAccount> findByIsActiveTrueOrderByCreatedAtDesc();
    List<BizAccount> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COALESCE(SUM(a.openingBalance), 0) FROM BizAccount a WHERE a.isActive = true")
    Long sumOpeningBalanceActive();
}
