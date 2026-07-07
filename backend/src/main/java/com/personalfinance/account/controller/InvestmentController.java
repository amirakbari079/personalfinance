package com.personalfinance.account.controller;

import com.personalfinance.account.dto.InvestmentRequest;
import com.personalfinance.account.dto.InvestmentResponse;
import com.personalfinance.account.service.InvestmentService;
import com.personalfinance.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/v1/investments")
public class InvestmentController {

    private final InvestmentService investmentService;

    public InvestmentController(InvestmentService investmentService) {
        this.investmentService = investmentService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<InvestmentResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(investmentService.findAll()));
    }

    @GetMapping("/total")
    public ResponseEntity<ApiResponse<Long>> getTotal() {
        return ResponseEntity.ok(ApiResponse.ok(investmentService.totalTomanValue()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<InvestmentResponse>> create(
            @Valid @RequestBody InvestmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(investmentService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<InvestmentResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody InvestmentRequest request) {
        try {
            return ResponseEntity.ok(ApiResponse.ok(investmentService.update(id, request)));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        try {
            investmentService.delete(id);
            return ResponseEntity.ok(ApiResponse.ok("سرمایه‌گذاری حذف شد", null));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
