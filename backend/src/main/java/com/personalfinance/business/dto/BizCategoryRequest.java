package com.personalfinance.business.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class BizCategoryRequest {

    @NotBlank(message = "نام دسته الزامی است")
    @Size(max = 100, message = "نام دسته حداکثر ۱۰۰ کاراکتر است")
    private String name;

    private String description;

    public BizCategoryRequest() {}

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
