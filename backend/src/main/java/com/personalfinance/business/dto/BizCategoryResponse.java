package com.personalfinance.business.dto;

import com.personalfinance.business.entity.BizCategory;
import java.time.Instant;

public class BizCategoryResponse {

    private Long id;
    private String name;
    private String description;
    private Instant createdAt;

    public BizCategoryResponse() {}

    public BizCategoryResponse(Long id, String name, String description, Instant createdAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.createdAt = createdAt;
    }

    public static BizCategoryResponse fromEntity(BizCategory category) {
        if (category == null) return null;
        return new BizCategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.getCreatedAt()
        );
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public Instant getCreatedAt() { return createdAt; }
}
