package com.personalfinance.loan.controller;

import com.personalfinance.common.ApiResponse;
import com.personalfinance.loan.dto.LoanRequest;
import com.personalfinance.loan.dto.LoanResponse;
import com.personalfinance.loan.service.LoanService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/v1/loans")
public class LoanController {

    private final LoanService loanService;

    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<LoanResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(loanService.findAll()));
    }

    @GetMapping("/total-monthly")
    public ResponseEntity<ApiResponse<Long>> getMonthlyTotal() {
        return ResponseEntity.ok(ApiResponse.ok(loanService.activeMonthlyTotal()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LoanResponse>> create(
            @Valid @RequestBody LoanRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(loanService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LoanResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody LoanRequest request) {
        try {
            return ResponseEntity.ok(ApiResponse.ok(loanService.update(id, request)));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        try {
            loanService.delete(id);
            return ResponseEntity.ok(ApiResponse.ok("وام حذف شد", null));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /** Records payment of the next (sequential) installment. */
    @PostMapping("/{id}/pay-next")
    public ResponseEntity<ApiResponse<LoanResponse>> payNext(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(ApiResponse.ok(loanService.payNextInstallment(id)));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IllegalStateException e) {
            // Loan already fully paid → 409 Conflict
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
