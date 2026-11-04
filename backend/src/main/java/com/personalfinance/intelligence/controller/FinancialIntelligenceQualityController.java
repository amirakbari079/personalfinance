package com.personalfinance.intelligence.controller;

import com.personalfinance.common.ApiResponse;
import com.personalfinance.intelligence.dto.DataConflictResponse;
import com.personalfinance.intelligence.dto.QualitySummaryResponse;
import com.personalfinance.intelligence.service.QualityQueryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/financial-intelligence")
public class FinancialIntelligenceQualityController {

    private final QualityQueryService qualityQueryService;

    public FinancialIntelligenceQualityController(QualityQueryService qualityQueryService) {
        this.qualityQueryService = qualityQueryService;
    }

    @GetMapping("/conflicts")
    public ResponseEntity<ApiResponse<List<DataConflictResponse>>> conflicts() {
        return ResponseEntity.ok(ApiResponse.ok(qualityQueryService.openConflicts()));
    }

    @GetMapping("/quality")
    public ResponseEntity<ApiResponse<QualitySummaryResponse>> quality() {
        return ResponseEntity.ok(ApiResponse.ok(qualityQueryService.summary()));
    }
}
