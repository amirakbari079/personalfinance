package com.personalfinance.intelligence.controller;

import com.personalfinance.common.ApiResponse;
import com.personalfinance.intelligence.dto.DataUpdateResponse;
import com.personalfinance.intelligence.service.FinancialDataUpdateService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/financial-intelligence/updates")
public class FinancialDataUpdateController {

    private final FinancialDataUpdateService financialDataUpdateService;

    public FinancialDataUpdateController(FinancialDataUpdateService financialDataUpdateService) {
        this.financialDataUpdateService = financialDataUpdateService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DataUpdateResponse>> enqueue() {
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(ApiResponse.ok("بروزرسانی در صف قرار گرفت", financialDataUpdateService.enqueue("MANUAL")));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DataUpdateResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.ok(financialDataUpdateService.findRecent()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DataUpdateResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(financialDataUpdateService.findById(id)));
    }
}
