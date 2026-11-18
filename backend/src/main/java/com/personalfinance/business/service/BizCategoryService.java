package com.personalfinance.business.service;

import com.personalfinance.business.dto.BizCategoryRequest;
import com.personalfinance.business.dto.BizCategoryResponse;
import com.personalfinance.business.entity.BizCategory;
import com.personalfinance.business.repository.BizCategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class BizCategoryService {

    private final BizCategoryRepository categoryRepository;

    public BizCategoryService(BizCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<BizCategoryResponse> findAll() {
        return categoryRepository.findAll()
                .stream()
                .map(BizCategoryResponse::fromEntity)
                .toList();
    }

    public BizCategoryResponse findById(Long id) {
        return categoryRepository.findById(id)
                .map(BizCategoryResponse::fromEntity)
                .orElseThrow(() -> new NoSuchElementException("دسته‌بندی یافت نشد: " + id));
    }

    @Transactional
    public BizCategoryResponse create(BizCategoryRequest request) {
        if (categoryRepository.existsByName(request.getName().trim())) {
            throw new IllegalArgumentException("دسته‌بندی با این نام از قبل وجود دارد: " + request.getName());
        }
        BizCategory category = new BizCategory(request.getName().trim(), request.getDescription());
        return BizCategoryResponse.fromEntity(categoryRepository.save(category));
    }

    @Transactional
    public BizCategoryResponse update(Long id, BizCategoryRequest request) {
        BizCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("دسته‌بندی یافت نشد: " + id));

        if (categoryRepository.existsByNameAndIdNot(request.getName().trim(), id)) {
            throw new IllegalArgumentException("دسته‌بندی دیگری با این نام وجود دارد: " + request.getName());
        }

        category.setName(request.getName().trim());
        category.setDescription(request.getDescription());
        return BizCategoryResponse.fromEntity(categoryRepository.save(category));
    }

    @Transactional
    public void delete(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new NoSuchElementException("دسته‌بندی یافت نشد: " + id);
        }
        categoryRepository.deleteById(id);
    }
}
