package com.personalfinance.intelligence.controller;

import com.personalfinance.common.ApiResponse;
import com.personalfinance.intelligence.dto.AssetHistoryResponse;
import com.personalfinance.intelligence.dto.AssetPriceResponse;
import com.personalfinance.intelligence.dto.MarketPremiumResponse;
import com.personalfinance.intelligence.service.AssetMarketQueryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/financial-intelligence")
public class FinancialIntelligenceMarketController {

    private final AssetMarketQueryService assetMarketQueryService;

    public FinancialIntelligenceMarketController(AssetMarketQueryService assetMarketQueryService) {
        this.assetMarketQueryService = assetMarketQueryService;
    }

    @GetMapping("/prices")
    public ResponseEntity<ApiResponse<List<AssetPriceResponse>>> prices() {
        return ResponseEntity.ok(ApiResponse.ok(assetMarketQueryService.latestPrices()));
    }

    @GetMapping("/metrics/premiums")
    public ResponseEntity<ApiResponse<MarketPremiumResponse>> premiums() {
        return ResponseEntity.ok(ApiResponse.ok(assetMarketQueryService.premiums()));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<AssetHistoryResponse>> history(
            @RequestParam String symbol,
            @RequestParam(required = false) String currency,
            @RequestParam(defaultValue = "1M") String range) {
        return ResponseEntity.ok(ApiResponse.ok(assetMarketQueryService.history(symbol, currency, range)));
    }
}
