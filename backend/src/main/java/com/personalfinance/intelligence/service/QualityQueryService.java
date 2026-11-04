package com.personalfinance.intelligence.service;

import com.personalfinance.intelligence.dto.DataConflictResponse;
import com.personalfinance.intelligence.dto.DataUpdateResponse;
import com.personalfinance.intelligence.dto.QualitySummaryResponse;
import com.personalfinance.intelligence.entity.Asset;
import com.personalfinance.intelligence.entity.ConflictResolutionStatus;
import com.personalfinance.intelligence.entity.DataConflict;
import com.personalfinance.intelligence.entity.DataProvider;
import com.personalfinance.intelligence.entity.DataUpdate;
import com.personalfinance.intelligence.entity.ReferenceValue;
import com.personalfinance.intelligence.repository.AssetRepository;
import com.personalfinance.intelligence.repository.DataConflictRepository;
import com.personalfinance.intelligence.repository.DataProviderRepository;
import com.personalfinance.intelligence.repository.DataUpdateRepository;
import com.personalfinance.intelligence.repository.MarketSnapshotRepository;
import com.personalfinance.intelligence.repository.ReferenceValueRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class QualityQueryService {

    private final DataConflictRepository dataConflictRepository;
    private final DataUpdateRepository dataUpdateRepository;
    private final MarketSnapshotRepository marketSnapshotRepository;
    private final ReferenceValueRepository referenceValueRepository;
    private final AssetRepository assetRepository;
    private final DataProviderRepository dataProviderRepository;

    public QualityQueryService(
            DataConflictRepository dataConflictRepository,
            DataUpdateRepository dataUpdateRepository,
            MarketSnapshotRepository marketSnapshotRepository,
            ReferenceValueRepository referenceValueRepository,
            AssetRepository assetRepository,
            DataProviderRepository dataProviderRepository) {
        this.dataConflictRepository = dataConflictRepository;
        this.dataUpdateRepository = dataUpdateRepository;
        this.marketSnapshotRepository = marketSnapshotRepository;
        this.referenceValueRepository = referenceValueRepository;
        this.assetRepository = assetRepository;
        this.dataProviderRepository = dataProviderRepository;
    }

    public List<DataConflictResponse> openConflicts() {
        Map<Long, Asset> assets = assetRepository.findAll().stream()
                .collect(Collectors.toMap(Asset::getId, a -> a));
        Map<Long, DataProvider> providers = dataProviderRepository.findAll().stream()
                .collect(Collectors.toMap(DataProvider::getId, p -> p));
        return dataConflictRepository
                .findTop50ByResolutionStatusOrderByDetectedAtDesc(ConflictResolutionStatus.OPEN)
                .stream()
                .map(conflict -> toResponse(conflict, assets, providers))
                .toList();
    }

    public QualitySummaryResponse summary() {
        QualitySummaryResponse response = new QualitySummaryResponse();
        response.setOpenConflictCount(
                dataConflictRepository.countByResolutionStatus(ConflictResolutionStatus.OPEN));

        List<DataUpdate> recent = dataUpdateRepository.findTop50ByOrderByCreatedAtDesc();
        if (!recent.isEmpty()) {
            DataUpdate last = recent.getFirst();
            response.setLastUpdate(DataUpdateResponse.from(last));
            int total = last.getSuccessfulProviders() + last.getFailedProviders();
            if (total > 0) {
                response.setProviderSuccessRate(
                        (int) Math.round(last.getSuccessfulProviders() * 100.0 / total));
            }
        }

        marketSnapshotRepository.findFirstByOrderByCapturedAtDesc().ifPresent(snapshot -> {
            response.setLastSnapshotId(snapshot.getId());
            response.setLastSnapshotAt(snapshot.getCapturedAt());
            List<ReferenceValue> refs = referenceValueRepository.findByMarketSnapshotId(snapshot.getId());
            if (!refs.isEmpty()) {
                double avg = refs.stream()
                        .filter(r -> r.getConfidence() != null)
                        .mapToInt(r -> r.getConfidence().intValue())
                        .average()
                        .orElse(0);
                response.setAverageConfidence(BigDecimal.valueOf(avg).setScale(1, RoundingMode.HALF_UP));
            }
        });
        return response;
    }

    private static DataConflictResponse toResponse(
            DataConflict conflict,
            Map<Long, Asset> assets,
            Map<Long, DataProvider> providers) {
        DataConflictResponse r = new DataConflictResponse();
        r.setId(conflict.getId());
        Asset asset = assets.get(conflict.getAssetId());
        if (asset != null) {
            r.setAssetSymbol(asset.getSymbol());
            r.setAssetName(asset.getName());
        }
        r.setCurrency(conflict.getCurrency());
        DataProvider a = providers.get(conflict.getProviderAId());
        DataProvider b = providers.get(conflict.getProviderBId());
        r.setProviderA(a == null ? null : a.getCode());
        r.setProviderB(b == null ? null : b.getCode());
        r.setValueA(conflict.getValueA());
        r.setValueB(conflict.getValueB());
        r.setDifferencePercent(conflict.getDifferencePercent());
        r.setDetectedAt(conflict.getDetectedAt());
        r.setResolutionStatus(conflict.getResolutionStatus());
        return r;
    }
}
