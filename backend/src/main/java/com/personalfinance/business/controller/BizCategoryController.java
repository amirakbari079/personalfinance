package com.personalfinance.business.controller;

import com.personalfinance.business.dto.BizCategoryRequest;
import com.personalfinance.business.dto.BizCategoryResponse;
import com.personalfinance.business.service.BizCategoryService;
import com.personalfinance.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/business/categories")
public class BizCategoryController {

    private final BizCategoryService categoryService;

    public BizCategoryController(BizCategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BizCategoryResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BizCategoryResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BizCategoryResponse>> create(@Valid @RequestBody BizCategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(categoryService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BizCategoryResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody BizCategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("دسته‌بندی با موفقیت حذف شد", null));
    }
}
