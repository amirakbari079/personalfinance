package com.personalfinance.history.controller;

import com.personalfinance.common.ApiResponse;
import com.personalfinance.history.SnapshotEntityType;
import com.personalfinance.history.dto.CashFlowResponse;
import com.personalfinance.history.dto.SnapshotResponse;
import com.personalfinance.history.dto.TotalSeriesPoint;
import com.personalfinance.history.service.AggregateHistoryService;
import com.personalfinance.history.service.ValueSnapshotService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/history")
public class HistoryController {

    private final ValueSnapshotService snapshotService;
    private final AggregateHistoryService aggregateHistoryService;

    public HistoryController(
            ValueSnapshotService snapshotService,
            AggregateHistoryService aggregateHistoryService) {
        this.snapshotService = snapshotService;
        this.aggregateHistoryService = aggregateHistoryService;
    }

    @GetMapping("/ACCOUNT/total-series")
    public ResponseEntity<ApiResponse<List<TotalSeriesPoint>>> getAccountTotalSeries() {
        return ResponseEntity.ok(ApiResponse.ok(aggregateHistoryService.getAccountTotalSeries()));
    }

    @GetMapping("/ACCOUNT/cash-flow")
    public ResponseEntity<ApiResponse<CashFlowResponse>> getAccountCashFlow() {
        return ResponseEntity.ok(ApiResponse.ok(aggregateHistoryService.getAccountCashFlow()));
    }

    @GetMapping("/INVESTMENT/total-series")
    public ResponseEntity<ApiResponse<List<TotalSeriesPoint>>> getInvestmentTotalSeries() {
        return ResponseEntity.ok(ApiResponse.ok(aggregateHistoryService.getInvestmentTotalSeries()));
    }

    @GetMapping("/INVESTMENT/cash-flow")
    public ResponseEntity<ApiResponse<CashFlowResponse>> getInvestmentCashFlow() {
        return ResponseEntity.ok(ApiResponse.ok(aggregateHistoryService.getInvestmentCashFlow()));
    }

    @GetMapping("/{entityType}/{entityId}")
    public ResponseEntity<ApiResponse<List<SnapshotResponse>>> getEntityHistory(
            @PathVariable SnapshotEntityType entityType,
            @PathVariable Long entityId) {
        return ResponseEntity.ok(ApiResponse.ok(snapshotService.findHistory(entityType, entityId)));
    }
}
