package com.personalfinance.business.controller;

import com.personalfinance.business.dto.BizAccountRequest;
import com.personalfinance.business.dto.BizAccountResponse;
import com.personalfinance.business.service.BizAccountService;
import com.personalfinance.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/business/accounts")
public class BizAccountController {

    private final BizAccountService accountService;

    public BizAccountController(BizAccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BizAccountResponse>>> getAll(
            @RequestParam(required = false, defaultValue = "false") boolean onlyActive) {
        return ResponseEntity.ok(ApiResponse.ok(accountService.findAll(onlyActive)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BizAccountResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(accountService.findById(id)));
    }

    @GetMapping("/total-opening")
    public ResponseEntity<ApiResponse<Long>> getTotalOpening() {
        return ResponseEntity.ok(ApiResponse.ok(accountService.totalOpeningBalance()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BizAccountResponse>> create(@Valid @RequestBody BizAccountRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(accountService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BizAccountResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody BizAccountRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(accountService.update(id, request)));
    }

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<ApiResponse<BizAccountResponse>> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(accountService.toggleActive(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        accountService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("حساب کسب‌وکار با موفقیت بایگانی شد", null));
    }
}
