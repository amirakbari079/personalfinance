package com.personalfinance.account.controller;

import com.personalfinance.account.service.InvestmentSnapshotService;
import com.personalfinance.common.ApiResponse;
import com.personalfinance.history.dto.SnapshotRequest;
import com.personalfinance.history.dto.SnapshotResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/investments/{investmentId}/snapshots")
public class InvestmentSnapshotController {

    private final InvestmentSnapshotService snapshotService;

    public InvestmentSnapshotController(InvestmentSnapshotService snapshotService) {
        this.snapshotService = snapshotService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SnapshotResponse>>> list(@PathVariable Long investmentId) {
        return ResponseEntity.ok(ApiResponse.ok(snapshotService.list(investmentId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SnapshotResponse>> create(
            @PathVariable Long investmentId,
            @Valid @RequestBody SnapshotRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(snapshotService.create(investmentId, request)));
    }

    @PutMapping("/{snapshotId}")
    public ResponseEntity<ApiResponse<SnapshotResponse>> update(
            @PathVariable Long investmentId,
            @PathVariable Long snapshotId,
            @Valid @RequestBody SnapshotRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                snapshotService.update(investmentId, snapshotId, request)));
    }

    @DeleteMapping("/{snapshotId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long investmentId,
            @PathVariable Long snapshotId) {
        snapshotService.delete(investmentId, snapshotId);
        return ResponseEntity.ok(ApiResponse.ok("رکورد حذف شد", null));
    }
}
