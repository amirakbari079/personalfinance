package com.personalfinance.advisor.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AdvisorDraftRequest extends AdvisorContextRequest {

    @NotBlank(message = "سؤال الزامی است")
    @Size(max = 4000, message = "سؤال حداکثر ۴۰۰۰ کاراکتر است")
    private String question;

    @Size(max = 200, message = "هدف حداکثر ۲۰۰ کاراکتر است")
    private String objective;

    @Min(value = 0, message = "مبلغ سرمایه نمی‌تواند منفی باشد")
    private Long capitalAmount;

    @Size(max = 16, message = "افق زمانی نامعتبر است")
    private String timeHorizon;

    @Size(max = 24, message = "پروفایل ریسک نامعتبر است")
    private String riskTolerance;

    @Size(max = 16, message = "نیاز نقدشوندگی نامعتبر است")
    private String liquidityRequirement;

    @Size(max = 500, message = "محدودیت حداکثر ۵۰۰ کاراکتر است")
    private String constraints;

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getObjective() { return objective; }
    public void setObjective(String objective) { this.objective = objective; }

    public Long getCapitalAmount() { return capitalAmount; }
    public void setCapitalAmount(Long capitalAmount) { this.capitalAmount = capitalAmount; }

    public String getTimeHorizon() { return timeHorizon; }
    public void setTimeHorizon(String timeHorizon) { this.timeHorizon = timeHorizon; }

    public String getRiskTolerance() { return riskTolerance; }
    public void setRiskTolerance(String riskTolerance) { this.riskTolerance = riskTolerance; }

    public String getLiquidityRequirement() { return liquidityRequirement; }
    public void setLiquidityRequirement(String liquidityRequirement) { this.liquidityRequirement = liquidityRequirement; }

    public String getConstraints() { return constraints; }
    public void setConstraints(String constraints) { this.constraints = constraints; }
}
