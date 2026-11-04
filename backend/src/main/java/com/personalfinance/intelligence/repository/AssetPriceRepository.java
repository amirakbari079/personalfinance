package com.personalfinance.intelligence.repository;

import com.personalfinance.intelligence.entity.AssetPrice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AssetPriceRepository extends JpaRepository<AssetPrice, Long> {

    Optional<AssetPrice> findFirstByAssetIdAndCurrencyOrderByIdDesc(Long assetId, String currency);
}
