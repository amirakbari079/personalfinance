package com.personalfinance.business.controller;

import com.personalfinance.business.dto.BizProductRequest;
import com.personalfinance.business.dto.BizProductResponse;
import com.personalfinance.business.service.BizProductService;
import com.personalfinance.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/business/products")
public class BizProductController {

    private final BizProductService productService;

    public BizProductController(BizProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BizProductResponse>>> getAll(
            @RequestParam(required = false, defaultValue = "false") boolean onlyActive) {
        return ResponseEntity.ok(ApiResponse.ok(productService.findAll(onlyActive)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BizProductResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(productService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BizProductResponse>> create(@Valid @RequestBody BizProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(productService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BizProductResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody BizProductRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(productService.update(id, request)));
    }

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<ApiResponse<BizProductResponse>> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(productService.toggleActive(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("کالا با موفقیت بایگانی شد", null));
    }
}
