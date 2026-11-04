package com.personalfinance.intelligence.controller;

import com.personalfinance.common.ApiResponse;
import com.personalfinance.intelligence.dto.AssetResponse;
import com.personalfinance.intelligence.service.AssetCatalogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/financial-intelligence/assets")
public class FinancialIntelligenceAssetController {

    private final AssetCatalogService assetCatalogService;

    public FinancialIntelligenceAssetController(AssetCatalogService assetCatalogService) {
        this.assetCatalogService = assetCatalogService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AssetResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(assetCatalogService.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AssetResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(assetCatalogService.findById(id)));
    }
}
