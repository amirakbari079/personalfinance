package com.personalfinance.advisor.dto;

import com.personalfinance.advisor.entity.EvaluationStatus;
import com.personalfinance.advisor.entity.RecommendationEvaluation;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public class RecommendationEvaluationResponse {

    private Long id;
    private Long recommendationId;
    private String assetSymbol;
    private String currency;
    private String startDate;
    private String startDateJalali;
    private String endDate;
    private String endDateJalali;
    private BigDecimal startPrice;
    private BigDecimal endPrice;
    private BigDecimal assetReturnPercent;
    private BigDecimal goldReturnPercent;
    private BigDecimal usdReturnPercent;
    private BigDecimal btcReturnPercent;
    private String assetMove;
    private String timeHorizon;
    private String horizonEnd;
    private String horizonEndJalali;
    private boolean horizonElapsed;
    private EvaluationStatus status;
    private Instant evaluatedAt;

    public static RecommendationEvaluationResponse from(
            RecommendationEvaluation row,
            String startJalali,
            String endJalali,
            String horizonJalali) {
        RecommendationEvaluationResponse r = new RecommendationEvaluationResponse();
        r.id = row.getId();
        r.recommendationId = row.getRecommendationId();
        r.assetSymbol = row.getAssetSymbol();
        r.currency = row.getCurrency();
        r.startDate = iso(row.getStartDate());
        r.startDateJalali = startJalali;
        r.endDate = iso(row.getEndDate());
        r.endDateJalali = endJalali;
        r.startPrice = row.getStartPrice();
        r.endPrice = row.getEndPrice();
        r.assetReturnPercent = row.getAssetReturnPercent();
        r.goldReturnPercent = row.getGoldReturnPercent();
        r.usdReturnPercent = row.getUsdReturnPercent();
        r.btcReturnPercent = row.getBtcReturnPercent();
        r.assetMove = row.getAssetMove();
        r.timeHorizon = row.getTimeHorizon();
        r.horizonEnd = iso(row.getHorizonEnd());
        r.horizonEndJalali = horizonJalali;
        r.horizonElapsed = row.isHorizonElapsed();
        r.status = row.getStatus();
        r.evaluatedAt = row.getEvaluatedAt();
        return r;
    }

    private static String iso(LocalDate date) {
        return date == null ? null : date.toString();
    }

    public Long getId() { return id; }
    public Long getRecommendationId() { return recommendationId; }
    public String getAssetSymbol() { return assetSymbol; }
    public String getCurrency() { return currency; }
    public String getStartDate() { return startDate; }
    public String getStartDateJalali() { return startDateJalali; }
    public String getEndDate() { return endDate; }
    public String getEndDateJalali() { return endDateJalali; }
    public BigDecimal getStartPrice() { return startPrice; }
    public BigDecimal getEndPrice() { return endPrice; }
    public BigDecimal getAssetReturnPercent() { return assetReturnPercent; }
    public BigDecimal getGoldReturnPercent() { return goldReturnPercent; }
    public BigDecimal getUsdReturnPercent() { return usdReturnPercent; }
    public BigDecimal getBtcReturnPercent() { return btcReturnPercent; }
    public String getAssetMove() { return assetMove; }
    public String getTimeHorizon() { return timeHorizon; }
    public String getHorizonEnd() { return horizonEnd; }
    public String getHorizonEndJalali() { return horizonEndJalali; }
    public boolean isHorizonElapsed() { return horizonElapsed; }
    public EvaluationStatus getStatus() { return status; }
    public Instant getEvaluatedAt() { return evaluatedAt; }
}
