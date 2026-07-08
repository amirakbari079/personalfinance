package com.personalfinance.balance.controller;

import com.personalfinance.balance.dto.BalanceResponse;
import com.personalfinance.balance.service.BalanceService;
import com.personalfinance.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/balance")
public class BalanceController {

    private final BalanceService balanceService;

    public BalanceController(BalanceService balanceService) {
        this.balanceService = balanceService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<BalanceResponse>> getNetWorth() {
        return ResponseEntity.ok(ApiResponse.ok(balanceService.getNetWorth()));
    }
}
