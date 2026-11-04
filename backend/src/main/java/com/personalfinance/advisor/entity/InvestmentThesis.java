package com.personalfinance.advisor.entity;

import com.personalfinance.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

@Entity
@Table(name = "advisor_investment_theses")
public class InvestmentThesis extends BaseEntity {

    @Column(name = "recommendation_id", nullable = false, unique = true)
    private Long recommendationId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "asset_symbol", length = 32)
    private String assetSymbol;

    @Column(columnDefinition = "TEXT")
    private String assumptions;

    @Column(name = "bull_case", columnDefinition = "TEXT")
    private String bullCase;

    @Column(name = "bear_case", columnDefinition = "TEXT")
    private String bearCase;

    @Column(name = "invalidation_conditions", columnDefinition = "TEXT")
    private String invalidationConditions;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ThesisStatus status = ThesisStatus.ACTIVE;

    public Long getRecommendationId() { return recommendationId; }
    public void setRecommendationId(Long recommendationId) { this.recommendationId = recommendationId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAssetSymbol() { return assetSymbol; }
    public void setAssetSymbol(String assetSymbol) { this.assetSymbol = assetSymbol; }

    public String getAssumptions() { return assumptions; }
    public void setAssumptions(String assumptions) { this.assumptions = assumptions; }

    public String getBullCase() { return bullCase; }
    public void setBullCase(String bullCase) { this.bullCase = bullCase; }

    public String getBearCase() { return bearCase; }
    public void setBearCase(String bearCase) { this.bearCase = bearCase; }

    public String getInvalidationConditions() { return invalidationConditions; }
    public void setInvalidationConditions(String invalidationConditions) { this.invalidationConditions = invalidationConditions; }

    public ThesisStatus getStatus() { return status; }
    public void setStatus(ThesisStatus status) { this.status = status; }
}
