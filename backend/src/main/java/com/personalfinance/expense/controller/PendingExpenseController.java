package com.personalfinance.expense.controller;

import com.personalfinance.common.ApiResponse;
import com.personalfinance.common.CsvExportService;
import com.personalfinance.export.EntityCsvExports;
import com.personalfinance.expense.dto.PendingExpenseRequest;
import com.personalfinance.expense.dto.PendingExpenseResponse;
import com.personalfinance.expense.service.PendingExpenseService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/pending-expenses")
public class PendingExpenseController {

    private final PendingExpenseService pendingExpenseService;
    private final CsvExportService csvExportService;

    public PendingExpenseController(PendingExpenseService pendingExpenseService,
                                    CsvExportService csvExportService) {
        this.pendingExpenseService = pendingExpenseService;
        this.csvExportService = csvExportService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PendingExpenseResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(pendingExpenseService.findAll()));
    }

    @GetMapping("/total")
    public ResponseEntity<ApiResponse<Long>> getTotal() {
        return ResponseEntity.ok(ApiResponse.ok(pendingExpenseService.totalPlannedAmount()));
    }

    @GetMapping("/export")
    public void exportCsv(HttpServletResponse response) throws IOException {
        csvExportService.writeToResponse(
                pendingExpenseService.findAll(),
                EntityCsvExports.pendingExpenseColumns(),
                "pending-expenses.csv",
                response);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PendingExpenseResponse>> create(
            @Valid @RequestBody PendingExpenseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(pendingExpenseService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PendingExpenseResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody PendingExpenseRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(pendingExpenseService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        pendingExpenseService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("هزینه حذف شد", null));
    }
}
