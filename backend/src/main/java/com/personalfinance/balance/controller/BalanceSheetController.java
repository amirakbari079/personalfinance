package com.personalfinance.balance.controller;

import com.personalfinance.balance.dto.BalanceSheetHistoryPoint;
import com.personalfinance.balance.service.BalanceSheetService;
import com.personalfinance.common.ApiResponse;
import com.personalfinance.history.dto.CashFlowResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/balance-sheet")
public class BalanceSheetController {

    private final BalanceSheetService balanceSheetService;

    public BalanceSheetController(BalanceSheetService balanceSheetService) {
        this.balanceSheetService = balanceSheetService;
    }

    @GetMapping("/history/total-series")
    public ResponseEntity<ApiResponse<List<BalanceSheetHistoryPoint>>> getHistorySeries() {
        return ResponseEntity.ok(ApiResponse.ok(balanceSheetService.getHistorySeries()));
    }

    @GetMapping("/history/cash-flow")
    public ResponseEntity<ApiResponse<CashFlowResponse>> getCashFlow() {
        return ResponseEntity.ok(ApiResponse.ok(balanceSheetService.getCashFlow()));
    }
}
