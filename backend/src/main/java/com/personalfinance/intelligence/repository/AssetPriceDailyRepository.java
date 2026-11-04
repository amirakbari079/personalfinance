package com.personalfinance.intelligence.repository;

import com.personalfinance.intelligence.entity.AssetPriceDaily;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AssetPriceDailyRepository extends JpaRepository<AssetPriceDaily, Long> {

    Optional<AssetPriceDaily> findByAssetIdAndTradeDateAndCurrency(
            Long assetId, LocalDate tradeDate, String currency);

    Optional<AssetPriceDaily> findFirstByAssetIdAndCurrencyOrderByTradeDateDesc(Long assetId, String currency);

    Optional<AssetPriceDaily> findFirstByAssetIdAndCurrencyAndTradeDateLessThanEqualOrderByTradeDateDesc(
            Long assetId, String currency, LocalDate tradeDate);

    List<AssetPriceDaily> findByAssetIdAndCurrencyAndTradeDateGreaterThanEqualOrderByTradeDateAsc(
            Long assetId, String currency, LocalDate from);

    List<AssetPriceDaily> findByAssetIdAndCurrencyOrderByTradeDateAsc(Long assetId, String currency);
}
