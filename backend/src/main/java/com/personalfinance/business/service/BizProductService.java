package com.personalfinance.business.service;

import com.personalfinance.business.dto.BizProductRequest;
import com.personalfinance.business.dto.BizProductResponse;
import com.personalfinance.business.entity.BizCategory;
import com.personalfinance.business.entity.BizProduct;
import com.personalfinance.business.repository.BizCategoryRepository;
import com.personalfinance.business.repository.BizProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class BizProductService {

    private final BizProductRepository productRepository;
    private final BizCategoryRepository categoryRepository;

    public BizProductService(BizProductRepository productRepository,
                             BizCategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<BizProductResponse> findAll(boolean onlyActive) {
        List<BizProduct> list = onlyActive
                ? productRepository.findByIsActiveTrueOrderByCreatedAtDesc()
                : productRepository.findAllWithCategory();

        return list.stream()
                .map(BizProductResponse::fromEntity)
                .toList();
    }

    public BizProductResponse findById(Long id) {
        return productRepository.findById(id)
                .map(BizProductResponse::fromEntity)
                .orElseThrow(() -> new NoSuchElementException("کالا یافت نشد: " + id));
    }

    @Transactional
    public BizProductResponse create(BizProductRequest request) {
        String cleanCode = request.getCode().trim();
        if (productRepository.existsByCode(cleanCode)) {
            throw new IllegalArgumentException("کد کالای تکراری: " + cleanCode);
        }

        BizProduct product = new BizProduct();
        apply(product, request);
        return BizProductResponse.fromEntity(productRepository.save(product));
    }

    @Transactional
    public BizProductResponse update(Long id, BizProductRequest request) {
        BizProduct product = productRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("کالا یافت نشد: " + id));

        String cleanCode = request.getCode().trim();
        if (productRepository.existsByCodeAndIdNot(cleanCode, id)) {
            throw new IllegalArgumentException("کد کالا در کالای دیگری ثبت شده است: " + cleanCode);
        }

        apply(product, request);
        return BizProductResponse.fromEntity(productRepository.save(product));
    }

    @Transactional
    public BizProductResponse toggleActive(Long id) {
        BizProduct product = productRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("کالا یافت نشد: " + id));
        product.setActive(!product.isActive());
        return BizProductResponse.fromEntity(productRepository.save(product));
    }

    @Transactional
    public void delete(Long id) {
        BizProduct product = productRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("کالا یافت نشد: " + id));
        // Soft delete / archive as mandated by accounting rules
        product.setActive(false);
        productRepository.save(product);
    }

    private void apply(BizProduct product, BizProductRequest request) {
        product.setCode(request.getCode().trim());
        product.setName(request.getName().trim());
        product.setUnit(request.getUnit().trim());

        if (request.getCategoryId() != null) {
            BizCategory category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new NoSuchElementException("دسته‌بندی یافت نشد: " + request.getCategoryId()));
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }

        product.setDefaultPurchasePrice(request.getDefaultPurchasePrice());
        product.setDefaultSalePrice(request.getDefaultSalePrice());
        product.setMinStockAlert(request.getMinStockAlert());
        if (request.getIsActive() != null) {
            product.setActive(request.getIsActive());
        }
        product.setNotes(request.getNotes());
    }
}
