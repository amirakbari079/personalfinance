package com.personalfinance.advisor.dto;

import com.personalfinance.advisor.entity.RecommendationStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class RecommendationTransitionRequest {

    @NotNull(message = "وضعیت الزامی است")
    private RecommendationStatus status;

    @Size(max = 300, message = "دلیل حداکثر ۳۰۰ کاراکتر است")
    private String reason;

    public RecommendationStatus getStatus() { return status; }
    public void setStatus(RecommendationStatus status) { this.status = status; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
