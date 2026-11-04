package com.personalfinance.advisor.entity;

import com.personalfinance.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "advisor_prompt_versions")
public class AdvisorPromptVersion extends BaseEntity {

    @Column(nullable = false, unique = true, length = 16)
    private String code;

    @Column(name = "system_prompt", nullable = false, columnDefinition = "TEXT")
    private String systemPrompt;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getSystemPrompt() { return systemPrompt; }
    public void setSystemPrompt(String systemPrompt) { this.systemPrompt = systemPrompt; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
