package com.personalfinance.income.controller;

import com.personalfinance.common.ApiResponse;
import com.personalfinance.income.dto.IncomeRequest;
import com.personalfinance.income.dto.IncomeResponse;
import com.personalfinance.income.service.IncomeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/v1/incomes")
public class IncomeController {

    private final IncomeService incomeService;

    public IncomeController(IncomeService incomeService) {
        this.incomeService = incomeService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<IncomeResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(incomeService.findAll()));
    }

    @GetMapping("/total-monthly")
    public ResponseEntity<ApiResponse<Long>> getMonthlyTotal() {
        return ResponseEntity.ok(ApiResponse.ok(incomeService.monthlyRecurringTotal()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<IncomeResponse>> create(
            @Valid @RequestBody IncomeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(incomeService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<IncomeResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody IncomeRequest request) {
        try {
            return ResponseEntity.ok(ApiResponse.ok(incomeService.update(id, request)));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        try {
            incomeService.delete(id);
            return ResponseEntity.ok(ApiResponse.ok("درآمد حذف شد", null));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
