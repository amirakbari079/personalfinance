package com.personalfinance.intelligence.service;

import com.personalfinance.intelligence.entity.Asset;
import com.personalfinance.intelligence.entity.ConflictResolutionStatus;
import com.personalfinance.intelligence.entity.DataConflict;
import com.personalfinance.intelligence.entity.DataProvider;
import com.personalfinance.intelligence.entity.DataUpdate;
import com.personalfinance.intelligence.entity.MarketSnapshot;
import com.personalfinance.intelligence.entity.MarketSnapshotItem;
import com.personalfinance.intelligence.entity.QuoteType;
import com.personalfinance.intelligence.entity.ReferenceValue;
import com.personalfinance.intelligence.quality.DataQualityEvaluator;
import com.personalfinance.intelligence.repository.AssetRepository;
import com.personalfinance.intelligence.repository.DataConflictRepository;
import com.personalfinance.intelligence.repository.DataProviderRepository;
import com.personalfinance.intelligence.repository.MarketSnapshotItemRepository;
import com.personalfinance.intelligence.repository.MarketSnapshotRepository;
import com.personalfinance.intelligence.repository.ReferenceValueRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DataQualityService {

    private static final Logger log = LoggerFactory.getLogger(DataQualityService.class);

    private final AssetRepository assetRepository;
    private final DataProviderRepository dataProviderRepository;
    private final DataConflictRepository dataConflictRepository;
    private final ReferenceValueRepository referenceValueRepository;
    private final MarketSnapshotRepository marketSnapshotRepository;
    private final MarketSnapshotItemRepository marketSnapshotItemRepository;
    private final BigDecimal conflictThreshold;

    public DataQualityService(
            AssetRepository assetRepository,
            DataProviderRepository dataProviderRepository,
            DataConflictRepository dataConflictRepository,
            ReferenceValueRepository referenceValueRepository,
            MarketSnapshotRepository marketSnapshotRepository,
            MarketSnapshotItemRepository marketSnapshotItemRepository,
            @Value("${app.market.conflict-threshold-percent:0.5}") BigDecimal conflictThreshold) {
        this.assetRepository = assetRepository;
        this.dataProviderRepository = dataProviderRepository;
        this.dataConflictRepository = dataConflictRepository;
        this.referenceValueRepository = referenceValueRepository;
        this.marketSnapshotRepository = marketSnapshotRepository;
        this.marketSnapshotItemRepository = marketSnapshotItemRepository;
        this.conflictThreshold = conflictThreshold;
    }

    @Transactional
    public int persist(DataUpdate job, QuoteCollectionService.CollectionResult result) {
        Instant now = Instant.now();
        Map<String, Asset> assets = assetRepository.findAll().stream()
                .collect(Collectors.toMap(Asset::getSymbol, a -> a));
        Map<String, DataProvider> providers = dataProviderRepository.findAll().stream()
                .collect(Collectors.toMap(DataProvider::getCode, p -> p));

        MarketSnapshot snapshot = new MarketSnapshot();
        snapshot.setDataUpdateId(job.getId());
        snapshot.setCapturedAt(now);
        snapshot.setStatus(job.getStatus() == null ? "RUNNING" : job.getStatus().name());
        snapshot = marketSnapshotRepository.save(snapshot);

        int conflictCount = 0;
        for (var entry : result.routeOrder().entrySet()) {
            QuoteCollectionService.QuoteKey key = entry.getKey();
            Map<String, com.personalfinance.intelligence.provider.CurrentQuote> byProvider =
                    result.quotesByKey().getOrDefault(key, Map.of());
            var assessed = DataQualityEvaluator.assess(entry.getValue(), byProvider, conflictThreshold);
            if (assessed.isEmpty()) {
                continue;
            }
            Asset asset = assets.get(key.assetSymbol());
            if (asset == null) {
                continue;
            }
            var view = assessed.get();
            DataProvider selectedProvider = providers.get(view.selected().providerCode());

            ReferenceValue reference = new ReferenceValue();
            reference.setAssetId(asset.getId());
            reference.setObservedAt(view.selected().observedAt());
            reference.setQuoteType(QuoteType.REFERENCE);
            reference.setValue(view.selected().value());
            reference.setCurrency(view.selected().currency());
            reference.setUnit(view.selected().unit());
            reference.setSelectedProviderId(selectedProvider == null ? null : selectedProvider.getId());
            reference.setSelectionReason(view.selectionReason());
            reference.setConfidence((short) view.confidence());
            reference.setMarketSnapshotId(snapshot.getId());
            reference = referenceValueRepository.save(reference);

            MarketSnapshotItem item = new MarketSnapshotItem();
            item.setMarketSnapshotId(snapshot.getId());
            item.setAssetId(asset.getId());
            item.setReferenceValueId(reference.getId());
            item.setPrice(view.selected().value());
            item.setCurrency(view.selected().currency());
            item.setQuoteType(QuoteType.REFERENCE);
            marketSnapshotItemRepository.save(item);

            for (var conflictView : view.conflicts()) {
                DataProvider providerA = providers.get(conflictView.providerA());
                DataProvider providerB = providers.get(conflictView.providerB());
                if (providerA == null || providerB == null) {
                    continue;
                }
                DataConflict conflict = new DataConflict();
                conflict.setAssetId(asset.getId());
                conflict.setCurrency(conflictView.currency());
                conflict.setProviderAId(providerA.getId());
                conflict.setValueA(conflictView.valueA());
                conflict.setProviderBId(providerB.getId());
                conflict.setValueB(conflictView.valueB());
                conflict.setDifferencePercent(conflictView.differencePercent());
                conflict.setDetectedAt(now);
                conflict.setResolutionStatus(ConflictResolutionStatus.OPEN);
                dataConflictRepository.save(conflict);
                conflictCount++;
            }
        }

        snapshot.setStatus(conflictCount > 0 ? "PARTIAL_SUCCESS" : "SUCCESS");
        marketSnapshotRepository.save(snapshot);
        log.info("Quality persisted: snapshot={} conflicts={}", snapshot.getId(), conflictCount);
        return conflictCount;
    }
}
