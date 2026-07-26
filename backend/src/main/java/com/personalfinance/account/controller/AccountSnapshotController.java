package com.personalfinance.account.controller;

import com.personalfinance.account.service.AccountSnapshotService;
import com.personalfinance.common.ApiResponse;
import com.personalfinance.history.dto.SnapshotRequest;
import com.personalfinance.history.dto.SnapshotResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/accounts/{accountId}/snapshots")
public class AccountSnapshotController {

    private final AccountSnapshotService snapshotService;

    public AccountSnapshotController(AccountSnapshotService snapshotService) {
        this.snapshotService = snapshotService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SnapshotResponse>>> list(@PathVariable Long accountId) {
        return ResponseEntity.ok(ApiResponse.ok(snapshotService.list(accountId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SnapshotResponse>> create(
            @PathVariable Long accountId,
            @Valid @RequestBody SnapshotRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(snapshotService.create(accountId, request)));
    }

    @PutMapping("/{snapshotId}")
    public ResponseEntity<ApiResponse<SnapshotResponse>> update(
            @PathVariable Long accountId,
            @PathVariable Long snapshotId,
            @Valid @RequestBody SnapshotRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                snapshotService.update(accountId, snapshotId, request)));
    }

    @DeleteMapping("/{snapshotId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long accountId,
            @PathVariable Long snapshotId) {
        snapshotService.delete(accountId, snapshotId);
        return ResponseEntity.ok(ApiResponse.ok("رکورد حذف شد", null));
    }
}
