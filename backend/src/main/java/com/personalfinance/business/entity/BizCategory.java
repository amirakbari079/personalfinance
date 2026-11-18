package com.personalfinance.business.entity;

import com.personalfinance.common.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "biz_categories")
public class BizCategory extends BaseEntity {

    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    public BizCategory() {}

    public BizCategory(String name, String description) {
        this.name = name;
        this.description = description;
    }

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
