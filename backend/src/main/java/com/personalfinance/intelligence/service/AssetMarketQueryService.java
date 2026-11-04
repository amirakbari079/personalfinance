package com.personalfinance.intelligence.service;

import com.personalfinance.common.JalaliDateConverter;
import com.personalfinance.intelligence.CurrencyCodes;
import com.personalfinance.intelligence.HistoryRange;
import com.personalfinance.intelligence.dto.AssetHistoryResponse;
import com.personalfinance.intelligence.dto.AssetPriceResponse;
import com.personalfinance.intelligence.dto.MarketPremiumResponse;
import com.personalfinance.intelligence.entity.Asset;
import com.personalfinance.intelligence.entity.AssetPrice;
import com.personalfinance.intelligence.entity.AssetPriceDaily;
import com.personalfinance.intelligence.metrics.FinancialMetrics;
import com.personalfinance.intelligence.repository.AssetPriceDailyRepository;
import com.personalfinance.intelligence.repository.AssetPriceRepository;
import com.personalfinance.intelligence.repository.AssetRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class AssetMarketQueryService {

    private final AssetRepository assetRepository;
    private final AssetPriceRepository assetPriceRepository;
    private final AssetPriceDailyRepository dailyRepository;
    private final JalaliDateConverter jalaliDateConverter;

    public AssetMarketQueryService(
            AssetRepository assetRepository,
            AssetPriceRepository assetPriceRepository,
            AssetPriceDailyRepository dailyRepository,
            JalaliDateConverter jalaliDateConverter) {
        this.assetRepository = assetRepository;
        this.assetPriceRepository = assetPriceRepository;
        this.dailyRepository = dailyRepository;
        this.jalaliDateConverter = jalaliDateConverter;
    }

    public List<AssetPriceResponse> latestPrices() {
        List<AssetPriceResponse> result = new ArrayList<>();
        for (Asset asset : assetRepository.findAllByActiveTrueOrderByAssetCategoryAscSymbolAsc()) {
            addLatest(result, asset, asset.getCurrency());
            if ("BTC".equals(asset.getSymbol())) {
                addLatest(result, asset, CurrencyCodes.IRT);
            }
        }
        return result;
    }

    public MarketPremiumResponse premiums() {
        MarketPremiumResponse response = new MarketPremiumResponse();
        latestClose("USDT", CurrencyCodes.IRT).ifPresent(usdt ->
                latestClose("USD", CurrencyCodes.IRT).ifPresent(usd ->
                        response.setUsdtPremiumPercent(FinancialMetrics.premiumPercent(usdt, usd))));
        latestClose("PAXG", CurrencyCodes.USD).ifPresent(paxg ->
                latestClose("GOLD_SPOT", CurrencyCodes.USD).ifPresent(spot ->
                        response.setPaxgPremiumPercent(FinancialMetrics.premiumPercent(paxg, spot))));
        return response;
    }

    public AssetHistoryResponse history(String symbol, String currency, String range) {
        Asset asset = assetRepository.findBySymbol(symbol)
                .orElseThrow(() -> new NoSuchElementException("دارایی یافت نشد: " + symbol));
        String ccy = CurrencyCodes.normalize(currency == null ? asset.getCurrency() : currency);
        String normalizedRange = range == null ? "1M" : range.trim().toUpperCase();
        LocalDate today = LocalDate.now(HistoryRange.TEHRAN);
        LocalDate from = HistoryRange.startDate(normalizedRange, today);

        List<AssetPriceDaily> rows = "MAX".equals(normalizedRange)
                ? dailyRepository.findByAssetIdAndCurrencyOrderByTradeDateAsc(asset.getId(), ccy)
                : dailyRepository.findByAssetIdAndCurrencyAndTradeDateGreaterThanEqualOrderByTradeDateAsc(
                        asset.getId(), ccy, from);

        AssetHistoryResponse response = new AssetHistoryResponse();
        response.setSymbol(asset.getSymbol());
        response.setCurrency(ccy);
        response.setRange(normalizedRange);
        for (AssetPriceDaily row : rows) {
            AssetHistoryResponse.Point point = new AssetHistoryResponse.Point();
            point.setTradeDate(row.getTradeDate().toString());
            point.setTradeDateJalali(jalaliDateConverter.toJalali(row.getTradeDate()));
            point.setOpen(row.getOpen());
            point.setHigh(row.getHigh());
            point.setLow(row.getLow());
            point.setClose(row.getClose());
            response.getPoints().add(point);
        }
        return response;
    }

    private void addLatest(List<AssetPriceResponse> result, Asset asset, String currency) {
        assetPriceRepository.findFirstByAssetIdAndCurrencyOrderByIdDesc(asset.getId(), currency)
                .ifPresent(price -> {
                    AssetPriceResponse row = toResponse(asset, price);
                    LocalDate today = LocalDate.now(HistoryRange.TEHRAN);
                    row.setChange1d(changeSince(asset.getId(), currency, today.minusDays(1)));
                    row.setChange7d(changeSince(asset.getId(), currency, today.minusDays(7)));
                    row.setChange30d(changeSince(asset.getId(), currency, today.minusDays(30)));
                    result.add(row);
                });
    }

    private BigDecimal changeSince(Long assetId, String currency, LocalDate from) {
        var latest = dailyRepository.findFirstByAssetIdAndCurrencyOrderByTradeDateDesc(assetId, currency);
        var start = dailyRepository.findFirstByAssetIdAndCurrencyAndTradeDateLessThanEqualOrderByTradeDateDesc(
                assetId, currency, from);
        if (latest.isEmpty() || start.isEmpty()) {
            return null;
        }
        return FinancialMetrics.returnPercent(start.get().getClose(), latest.get().getClose());
    }

    private java.util.Optional<BigDecimal> latestClose(String symbol, String currency) {
        return assetRepository.findBySymbol(symbol)
                .flatMap(asset -> dailyRepository.findFirstByAssetIdAndCurrencyOrderByTradeDateDesc(asset.getId(), currency))
                .map(AssetPriceDaily::getClose);
    }

    private static AssetPriceResponse toResponse(Asset asset, AssetPrice price) {
        AssetPriceResponse r = new AssetPriceResponse();
        r.setAssetId(asset.getId());
        r.setSymbol(asset.getSymbol());
        r.setName(asset.getName());
        r.setCurrency(price.getCurrency());
        r.setUnit(price.getUnit());
        r.setPrice(price.getPrice());
        r.setObservedAt(price.getObservedAt());
        r.setConfidence(price.getConfidence() == null ? null : price.getConfidence().intValue());
        return r;
    }
}
