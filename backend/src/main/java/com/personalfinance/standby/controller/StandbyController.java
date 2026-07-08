package com.personalfinance.standby.controller;

import com.personalfinance.common.ApiResponse;
import com.personalfinance.common.CsvExportService;
import com.personalfinance.standby.dto.StandbyRequest;
import com.personalfinance.standby.dto.StandbyResponse;
import com.personalfinance.standby.service.StandbyService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/v1/standby")
public class StandbyController {

    private final StandbyService standbyService;
    private final CsvExportService csvExportService;

    public StandbyController(StandbyService standbyService, CsvExportService csvExportService) {
        this.standbyService = standbyService;
        this.csvExportService = csvExportService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<StandbyResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(standbyService.findAll()));
    }

    @GetMapping("/total")
    public ResponseEntity<ApiResponse<Long>> getTotal() {
        return ResponseEntity.ok(ApiResponse.ok(standbyService.totalValue()));
    }

    @GetMapping("/export")
    public void exportCsv(HttpServletResponse response) throws IOException {
        csvExportService.writeToResponse(
                standbyService.findAll(), StandbyResponse.class, "standby.csv", response);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StandbyResponse>> create(
            @Valid @RequestBody StandbyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(standbyService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StandbyResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody StandbyRequest request) {
        try {
            return ResponseEntity.ok(ApiResponse.ok(standbyService.update(id, request)));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        try {
            standbyService.delete(id);
            return ResponseEntity.ok(ApiResponse.ok("کالای معوق حذف شد", null));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
