package com.personalfinance.receivable.controller;

import com.personalfinance.common.ApiResponse;
import com.personalfinance.common.CsvExportService;
import com.personalfinance.receivable.dto.ReceivableRequest;
import com.personalfinance.receivable.dto.ReceivableResponse;
import com.personalfinance.receivable.service.ReceivableService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/v1/receivables")
public class ReceivableController {

    private final ReceivableService receivableService;
    private final CsvExportService csvExportService;

    public ReceivableController(ReceivableService receivableService,
                                CsvExportService csvExportService) {
        this.receivableService = receivableService;
        this.csvExportService = csvExportService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReceivableResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(receivableService.findAll()));
    }

    @GetMapping("/export")
    public void exportCsv(HttpServletResponse response) throws IOException {
        csvExportService.writeToResponse(
                receivableService.findAll(), ReceivableResponse.class, "receivables.csv", response);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReceivableResponse>> create(
            @Valid @RequestBody ReceivableRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.ok(receivableService.create(request)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ReceivableResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody ReceivableRequest request) {
        try {
            return ResponseEntity.ok(ApiResponse.ok(receivableService.update(id, request)));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        try {
            receivableService.delete(id);
            return ResponseEntity.ok(ApiResponse.ok("طلب حذف شد", null));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
