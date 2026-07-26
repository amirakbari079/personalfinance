package com.personalfinance.account.repository;

import com.personalfinance.account.entity.Investment;
import com.personalfinance.account.entity.InvestmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface InvestmentRepository extends JpaRepository<Investment, Long> {

    List<Investment> findByAssetType(InvestmentType assetType);

    @Query("SELECT COALESCE(SUM(a.tomanEquivalent), 0) FROM Investment a")
    Long sumAllTomanEquivalents();
}
