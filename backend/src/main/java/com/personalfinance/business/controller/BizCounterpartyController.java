package com.personalfinance.business.controller;

import com.personalfinance.business.dto.BizCounterpartyRequest;
import com.personalfinance.business.dto.BizCounterpartyResponse;
import com.personalfinance.business.service.BizCounterpartyService;
import com.personalfinance.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/business/counterparties")
public class BizCounterpartyController {

    private final BizCounterpartyService counterpartyService;

    public BizCounterpartyController(BizCounterpartyService counterpartyService) {
        this.counterpartyService = counterpartyService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BizCounterpartyResponse>>> getAll(
            @RequestParam(required = false, defaultValue = "false") boolean onlyActive,
            @RequestParam(required = false) String role) {
        return ResponseEntity.ok(ApiResponse.ok(counterpartyService.findAll(onlyActive, role)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BizCounterpartyResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(counterpartyService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BizCounterpartyResponse>> create(
            @Valid @RequestBody BizCounterpartyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(counterpartyService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BizCounterpartyResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody BizCounterpartyRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(counterpartyService.update(id, request)));
    }

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<ApiResponse<BizCounterpartyResponse>> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(counterpartyService.toggleActive(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        counterpartyService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("طرف‌حساب با موفقیت بایگانی شد", null));
    }
}
