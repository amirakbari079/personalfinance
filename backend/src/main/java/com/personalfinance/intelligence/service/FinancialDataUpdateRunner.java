package com.personalfinance.intelligence.service;

import com.personalfinance.intelligence.entity.Asset;
import com.personalfinance.intelligence.entity.DataProvider;
import com.personalfinance.intelligence.entity.DataUpdate;
import com.personalfinance.intelligence.entity.DataUpdateStatus;
import com.personalfinance.intelligence.entity.RawProviderPayload;
import com.personalfinance.intelligence.provider.CurrentQuote;
import com.personalfinance.intelligence.repository.AssetRepository;
import com.personalfinance.intelligence.repository.DataProviderRepository;
import com.personalfinance.intelligence.repository.DataUpdateRepository;
import com.personalfinance.intelligence.repository.LegacyMarketSymbolRepository;
import com.personalfinance.intelligence.repository.RawProviderPayloadRepository;
import com.personalfinance.marketdata.MarketSymbol;
import com.personalfinance.marketdata.entity.MarketPriceSnapshot;
import com.personalfinance.marketdata.repository.MarketPriceSnapshotRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FinancialDataUpdateRunner {

    private static final Logger log = LoggerFactory.getLogger(FinancialDataUpdateRunner.class);
    private static final int RAW_LIMIT = 8000;

    private final DataUpdateRepository dataUpdateRepository;
    private final QuoteCollectionService quoteCollectionService;
    private final MarketPriceIngestService marketPriceIngestService;
    private final RawProviderPayloadRepository rawProviderPayloadRepository;
    private final DataProviderRepository dataProviderRepository;
    private final AssetRepository assetRepository;
    private final LegacyMarketSymbolRepository legacyMarketSymbolRepository;
    private final MarketPriceSnapshotRepository marketPriceSnapshotRepository;
    private final DataQualityService dataQualityService;
    private final MacroIngestService macroIngestService;

    public FinancialDataUpdateRunner(
            DataUpdateRepository dataUpdateRepository,
            QuoteCollectionService quoteCollectionService,
            MarketPriceIngestService marketPriceIngestService,
            RawProviderPayloadRepository rawProviderPayloadRepository,
            DataProviderRepository dataProviderRepository,
            AssetRepository assetRepository,
            LegacyMarketSymbolRepository legacyMarketSymbolRepository,
            MarketPriceSnapshotRepository marketPriceSnapshotRepository,
            DataQualityService dataQualityService,
            MacroIngestService macroIngestService) {
        this.dataUpdateRepository = dataUpdateRepository;
        this.quoteCollectionService = quoteCollectionService;
        this.marketPriceIngestService = marketPriceIngestService;
        this.rawProviderPayloadRepository = rawProviderPayloadRepository;
        this.dataProviderRepository = dataProviderRepository;
        this.assetRepository = assetRepository;
        this.legacyMarketSymbolRepository = legacyMarketSymbolRepository;
        this.marketPriceSnapshotRepository = marketPriceSnapshotRepository;
        this.dataQualityService = dataQualityService;
        this.macroIngestService = macroIngestService;
    }

    @Async("fiExecutor")
    public void executeAsync(Long jobId) {
        execute(jobId);
    }

    public DataUpdate execute(Long jobId) {
        // Raw payloads must commit before isolated quote transactions read them.
        // Never hold a database transaction open across provider HTTP requests.
        DataUpdate job = dataUpdateRepository.findById(jobId)
                .orElseThrow(() -> new IllegalStateException("جاب بروزرسانی یافت نشد: " + jobId));
        job.setStatus(DataUpdateStatus.RUNNING);
        job.setStartedAt(Instant.now());
        dataUpdateRepository.save(job);

        try {
            QuoteCollectionService.CollectionResult result = quoteCollectionService.collect();
            Map<String, Long> rawIds = storeRawPayloads(result.fetchedByProvider());

            int stored = 0;
            int ingestErrors = 0;
            for (CurrentQuote quote : result.selected()) {
                try {
                    Long rawId = rawIds.get(quote.providerCode());
                    marketPriceIngestService.ingestQuote(
                            quote.assetSymbol(),
                            quote.value(),
                            quote.currency(),
                            quote.unit(),
                            quote.providerCode(),
                            quote.observedAt(),
                            rawId);
                    writeFacadeSnapshot(quote);
                    stored++;
                } catch (Exception e) {
                    ingestErrors++;
                    log.warn("Failed to store quote {} {}: {}", quote.assetSymbol(), quote.currency(), e.getMessage());
                }
            }

            int qualityConflicts = 0;
            try {
                qualityConflicts = dataQualityService.persist(job, result);
            } catch (Exception e) {
                log.warn("Quality persist failed: {}", e.getMessage());
            }

            try {
                int macroStored = macroIngestService.refreshIfStale();
                if (macroStored > 0) {
                    log.info("Stored {} macro observations", macroStored);
                }
            } catch (Exception e) {
                log.warn("Macro ingest failed: {}", e.getMessage());
            }

            job.setProviderCount(result.successfulProviders() + result.failedProviders());
            job.setSuccessfulProviders(result.successfulProviders());
            job.setFailedProviders(result.failedProviders());
            job.setRecordsFetched(result.recordsFetched());
            job.setRecordsStored(stored);
            job.setRecordsRejected(result.recordsRejected() + ingestErrors);
            job.setErrorCount(result.errors().size() + ingestErrors);
            job.setErrorSummary(summarize(result.errors()));
            job.setCompletedAt(Instant.now());
            job.setStatus(resolveStatus(stored, result.failedProviders(), job.getRecordsRejected() + qualityConflicts));
            return dataUpdateRepository.save(job);
        } catch (Exception e) {
            log.error("Financial data update failed", e);
            job.setStatus(DataUpdateStatus.FAILED);
            job.setCompletedAt(Instant.now());
            job.setErrorCount(job.getErrorCount() + 1);
            job.setErrorSummary(e.getMessage());
            return dataUpdateRepository.save(job);
        }
    }

    private Map<String, Long> storeRawPayloads(Map<String, List<CurrentQuote>> fetchedByProvider) {
        Map<String, DataProvider> providers = dataProviderRepository.findAll().stream()
                .collect(Collectors.toMap(DataProvider::getCode, p -> p));
        Instant now = Instant.now();
        return fetchedByProvider.entrySet().stream()
                .filter(entry -> providers.containsKey(entry.getKey()))
                .collect(Collectors.toMap(Map.Entry::getKey, entry -> {
                    RawProviderPayload raw = new RawProviderPayload();
                    raw.setProviderId(providers.get(entry.getKey()).getId());
                    raw.setCollectedAt(now);
                    raw.setContentType("text/plain");
                    raw.setPayload(trimRaw(entry.getValue().toString()));
                    return rawProviderPayloadRepository.save(raw).getId();
                }));
    }

    private void writeFacadeSnapshot(CurrentQuote quote) {
        Asset asset = assetRepository.findBySymbol(quote.assetSymbol()).orElse(null);
        if (asset == null) {
            return;
        }
        legacyMarketSymbolRepository.findByAssetIdAndQuoteCurrency(asset.getId(), quote.currency())
                .ifPresent(legacy -> {
                    MarketPriceSnapshot snapshot = new MarketPriceSnapshot();
                    snapshot.setSymbol(MarketSymbol.valueOf(legacy.getMarketSymbol()));
                    snapshot.setValue(quote.value());
                    snapshot.setCurrency("IRT".equals(quote.currency()) ? "TOMAN" : quote.currency());
                    snapshot.setRecordedAt(quote.observedAt());
                    snapshot.setSource(facadeSource(quote));
                    marketPriceSnapshotRepository.save(snapshot);
                });
    }

    private static String facadeSource(CurrentQuote quote) {
        return switch (quote.providerCode()) {
            case "TGJU" -> "TGJU-Live";
            case "COINGECKO" -> "PAXG".equals(quote.assetSymbol()) || "GOLD_SPOT".equals(quote.assetSymbol())
                    ? "CoinGecko-PAXG" : "CoinGecko";
            case "NOBITEX" -> "Nobitex";
            case "TSETMC" -> "TSETMC";
            case "DERIVED" -> "BTC_USD×USD_IRR";
            default -> quote.providerCode();
        };
    }

    private static DataUpdateStatus resolveStatus(int stored, int failedProviders, int rejected) {
        if (stored == 0) {
            return DataUpdateStatus.FAILED;
        }
        if (failedProviders > 0 || rejected > 0) {
            return DataUpdateStatus.PARTIAL_SUCCESS;
        }
        return DataUpdateStatus.SUCCESS;
    }

    private static String summarize(List<String> errors) {
        if (errors == null || errors.isEmpty()) {
            return null;
        }
        String joined = String.join(" | ", errors);
        return joined.length() <= 1000 ? joined : joined.substring(0, 1000);
    }

    private static String trimRaw(String raw) {
        if (raw == null) {
            return "";
        }
        return raw.length() <= RAW_LIMIT ? raw : raw.substring(0, RAW_LIMIT);
    }
}
