package com.personalfinance.intelligence.repository;

import com.personalfinance.intelligence.entity.LegacyMarketSymbol;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LegacyMarketSymbolRepository extends JpaRepository<LegacyMarketSymbol, String> {

    Optional<LegacyMarketSymbol> findByAssetIdAndQuoteCurrency(Long assetId, String quoteCurrency);
}
