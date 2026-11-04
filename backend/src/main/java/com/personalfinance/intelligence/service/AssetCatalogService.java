package com.personalfinance.intelligence.service;

import com.personalfinance.intelligence.dto.AssetResponse;
import com.personalfinance.intelligence.entity.Asset;
import com.personalfinance.intelligence.repository.AssetRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class AssetCatalogService {

    private final AssetRepository assetRepository;

    public AssetCatalogService(AssetRepository assetRepository) {
        this.assetRepository = assetRepository;
    }

    public List<AssetResponse> findAll() {
        return assetRepository.findAllByActiveTrueOrderByAssetCategoryAscSymbolAsc()
                .stream()
                .map(AssetResponse::from)
                .toList();
    }

    public AssetResponse findById(Long id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("دارایی یافت نشد: " + id));
        return AssetResponse.from(asset);
    }
}
