package com.personalfinance.intelligence.entity;

import com.personalfinance.common.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "fi_data_providers")
public class DataProvider extends BaseEntity {

    @Column(nullable = false, unique = true, length = 32)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "reliability_score", nullable = false)
    private short reliabilityScore = 70;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public short getReliabilityScore() { return reliabilityScore; }
    public void setReliabilityScore(short reliabilityScore) { this.reliabilityScore = reliabilityScore; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
