package com.personalfinance.loan.controller;

import com.personalfinance.common.ApiResponse;
import com.personalfinance.common.CsvExportService;
import com.personalfinance.loan.dto.LoanRequest;
import com.personalfinance.loan.dto.LoanResponse;
import com.personalfinance.loan.service.LoanService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/loans")
public class LoanController {

    private final LoanService loanService;
    private final CsvExportService csvExportService;

    public LoanController(LoanService loanService, CsvExportService csvExportService) {
        this.loanService = loanService;
        this.csvExportService = csvExportService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<LoanResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(loanService.findAll()));
    }

    @GetMapping("/total-monthly")
    public ResponseEntity<ApiResponse<Long>> getMonthlyTotal() {
        return ResponseEntity.ok(ApiResponse.ok(loanService.activeMonthlyTotal()));
    }

    @GetMapping("/export")
    public void exportCsv(HttpServletResponse response) throws IOException {
        csvExportService.writeToResponse(
                loanService.findAll(), LoanResponse.class, "loans.csv", response);
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
        return ResponseEntity.ok(ApiResponse.ok(loanService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        loanService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("وام حذف شد", null));
    }

    /** Records payment of the next (sequential) installment. */
    @PostMapping("/{id}/pay-next")
    public ResponseEntity<ApiResponse<LoanResponse>> payNext(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(loanService.payNextInstallment(id)));
    }

    /** Undoes the last recorded installment payment. */
    @PostMapping("/{id}/undo-last")
    public ResponseEntity<ApiResponse<LoanResponse>> undoLast(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(loanService.undoLastInstallment(id)));
    }
}
