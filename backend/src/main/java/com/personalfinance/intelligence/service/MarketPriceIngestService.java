package com.personalfinance.intelligence.service;

import com.personalfinance.intelligence.CurrencyCodes;
import com.personalfinance.intelligence.ProviderCodes;
import com.personalfinance.intelligence.entity.Asset;
import com.personalfinance.intelligence.entity.AssetPrice;
import com.personalfinance.intelligence.entity.DataProvider;
import com.personalfinance.intelligence.entity.LegacyMarketSymbol;
import com.personalfinance.intelligence.entity.QuoteType;
import com.personalfinance.intelligence.repository.AssetPriceRepository;
import com.personalfinance.intelligence.repository.AssetRepository;
import com.personalfinance.intelligence.repository.DataProviderRepository;
import com.personalfinance.intelligence.repository.LegacyMarketSymbolRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MarketPriceIngestService {

    private static final Logger log = LoggerFactory.getLogger(MarketPriceIngestService.class);
    private static final short DEFAULT_CONFIDENCE = 70;

    private final LegacyMarketSymbolRepository legacyMarketSymbolRepository;
    private final AssetRepository assetRepository;
    private final DataProviderRepository dataProviderRepository;
    private final AssetPriceRepository assetPriceRepository;
    private final DailyPriceRollupService dailyPriceRollupService;

    private final Map<String, LegacyMarketSymbol> legacyCache = new ConcurrentHashMap<>();
    private final Map<String, DataProvider> providerCache = new ConcurrentHashMap<>();
    private final Map<Long, Asset> assetCache = new ConcurrentHashMap<>();

    public MarketPriceIngestService(
            LegacyMarketSymbolRepository legacyMarketSymbolRepository,
            AssetRepository assetRepository,
            DataProviderRepository dataProviderRepository,
            AssetPriceRepository assetPriceRepository,
            DailyPriceRollupService dailyPriceRollupService) {
        this.legacyMarketSymbolRepository = legacyMarketSymbolRepository;
        this.assetRepository = assetRepository;
        this.dataProviderRepository = dataProviderRepository;
        this.assetPriceRepository = assetPriceRepository;
        this.dailyPriceRollupService = dailyPriceRollupService;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void ingestLegacy(
            String marketSymbol,
            BigDecimal value,
            String currency,
            String source,
            Instant observedAt) {
        if (marketSymbol == null || value == null || observedAt == null) {
            throw new IllegalArgumentException("داده قیمت ناقص است");
        }

        LegacyMarketSymbol legacy = legacyCache.computeIfAbsent(marketSymbol, key ->
                legacyMarketSymbolRepository.findById(key)
                        .orElseThrow(() -> new IllegalStateException("نماد قدیمی در کاتالوگ نیست: " + key)));

        Asset asset = assetCache.computeIfAbsent(legacy.getAssetId(), id ->
                assetRepository.findById(id)
                        .orElseThrow(() -> new IllegalStateException("دارایی کاتالوگ یافت نشد: " + id)));

        String providerCode = ProviderCodes.fromSource(source);
        DataProvider provider = providerCache.computeIfAbsent(providerCode, code ->
                dataProviderRepository.findByCode(code)
                        .orElseThrow(() -> new IllegalStateException("پروایدر کاتالوگ یافت نشد: " + code)));

        AssetPrice price = new AssetPrice();
        price.setAssetId(asset.getId());
        price.setObservedAt(observedAt);
        price.setQuoteType(QuoteType.LIVE);
        price.setPrice(value);
        price.setCurrency(CurrencyCodes.normalize(currency));
        price.setUnit(asset.getUnit());
        price.setProviderId(provider.getId());
        price.setOriginalValue(value);
        price.setConfidence(DEFAULT_CONFIDENCE);
        price = assetPriceRepository.save(price);
        dailyPriceRollupService.apply(price);
        log.debug("FI price stored {} {} {} via {}", asset.getSymbol(), value, price.getCurrency(), providerCode);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void ingestQuote(
            String assetSymbol,
            BigDecimal value,
            String currency,
            String unit,
            String providerCode,
            Instant observedAt,
            Long rawPayloadId) {
        Asset asset = assetRepository.findBySymbol(assetSymbol)
                .orElseThrow(() -> new IllegalStateException("دارایی کاتالوگ یافت نشد: " + assetSymbol));
        DataProvider provider = providerCache.computeIfAbsent(providerCode, code ->
                dataProviderRepository.findByCode(code)
                        .orElseThrow(() -> new IllegalStateException("پروایدر کاتالوگ یافت نشد: " + code)));

        AssetPrice price = new AssetPrice();
        price.setAssetId(asset.getId());
        price.setObservedAt(observedAt);
        price.setQuoteType(QuoteType.LIVE);
        price.setPrice(value);
        price.setCurrency(CurrencyCodes.normalize(currency));
        price.setUnit(unit != null ? unit : asset.getUnit());
        price.setProviderId(provider.getId());
        price.setOriginalValue(value);
        price.setConfidence(DEFAULT_CONFIDENCE);
        price.setRawPayloadId(rawPayloadId);
        price = assetPriceRepository.save(price);
        dailyPriceRollupService.apply(price);
    }
}
