package com.personalfinance.advisor.entity;

import com.personalfinance.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "advisor_sessions")
public class AdvisorSession extends BaseEntity {

    @Column(nullable = false, columnDefinition = "TEXT")
    private String question;

    @Column(length = 200)
    private String objective;

    @Column(name = "selected_assets", nullable = false, length = 256)
    private String selectedAssets;

    @Column(name = "capital_amount")
    private Long capitalAmount;

    @Column(nullable = false, length = 8)
    private String currency = "IRT";

    @Column(name = "time_horizon", length = 16)
    private String timeHorizon;

    @Column(name = "risk_tolerance", nullable = false, length = 24)
    private String riskTolerance = "UNSPECIFIED";

    @Column(name = "liquidity_requirement", nullable = false, length = 16)
    private String liquidityRequirement = "UNSPECIFIED";

    @Column(name = "constraints_text", length = 500)
    private String constraintsText;

    @Column(name = "portfolio_json", columnDefinition = "TEXT")
    private String portfolioJson;

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getObjective() { return objective; }
    public void setObjective(String objective) { this.objective = objective; }

    public String getSelectedAssets() { return selectedAssets; }
    public void setSelectedAssets(String selectedAssets) { this.selectedAssets = selectedAssets; }

    public Long getCapitalAmount() { return capitalAmount; }
    public void setCapitalAmount(Long capitalAmount) { this.capitalAmount = capitalAmount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getTimeHorizon() { return timeHorizon; }
    public void setTimeHorizon(String timeHorizon) { this.timeHorizon = timeHorizon; }

    public String getRiskTolerance() { return riskTolerance; }
    public void setRiskTolerance(String riskTolerance) { this.riskTolerance = riskTolerance; }

    public String getLiquidityRequirement() { return liquidityRequirement; }
    public void setLiquidityRequirement(String liquidityRequirement) { this.liquidityRequirement = liquidityRequirement; }

    public String getConstraintsText() { return constraintsText; }
    public void setConstraintsText(String constraintsText) { this.constraintsText = constraintsText; }

    public String getPortfolioJson() { return portfolioJson; }
    public void setPortfolioJson(String portfolioJson) { this.portfolioJson = portfolioJson; }
}
