package com.personalfinance.advisor.entity;

import com.personalfinance.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "advisor_recommendation_evaluations")
public class RecommendationEvaluation extends BaseEntity {

    @Column(name = "recommendation_id", nullable = false, unique = true)
    private Long recommendationId;

    @Column(name = "asset_symbol", nullable = false, length = 32)
    private String assetSymbol;

    @Column(nullable = false, length = 8)
    private String currency;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "start_price", precision = 20, scale = 8)
    private BigDecimal startPrice;

    @Column(name = "end_price", precision = 20, scale = 8)
    private BigDecimal endPrice;

    @Column(name = "asset_return_percent", precision = 12, scale = 4)
    private BigDecimal assetReturnPercent;

    @Column(name = "gold_return_percent", precision = 12, scale = 4)
    private BigDecimal goldReturnPercent;

    @Column(name = "usd_return_percent", precision = 12, scale = 4)
    private BigDecimal usdReturnPercent;

    @Column(name = "btc_return_percent", precision = 12, scale = 4)
    private BigDecimal btcReturnPercent;

    @Column(name = "asset_move", length = 8)
    private String assetMove;

    @Column(name = "time_horizon", length = 16)
    private String timeHorizon;

    @Column(name = "horizon_end")
    private LocalDate horizonEnd;

    @Column(name = "horizon_elapsed", nullable = false)
    private boolean horizonElapsed;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EvaluationStatus status;

    @Column(name = "evaluated_at", nullable = false)
    private Instant evaluatedAt;

    public Long getRecommendationId() { return recommendationId; }
    public void setRecommendationId(Long recommendationId) { this.recommendationId = recommendationId; }

    public String getAssetSymbol() { return assetSymbol; }
    public void setAssetSymbol(String assetSymbol) { this.assetSymbol = assetSymbol; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public BigDecimal getStartPrice() { return startPrice; }
    public void setStartPrice(BigDecimal startPrice) { this.startPrice = startPrice; }

    public BigDecimal getEndPrice() { return endPrice; }
    public void setEndPrice(BigDecimal endPrice) { this.endPrice = endPrice; }

    public BigDecimal getAssetReturnPercent() { return assetReturnPercent; }
    public void setAssetReturnPercent(BigDecimal assetReturnPercent) { this.assetReturnPercent = assetReturnPercent; }

    public BigDecimal getGoldReturnPercent() { return goldReturnPercent; }
    public void setGoldReturnPercent(BigDecimal goldReturnPercent) { this.goldReturnPercent = goldReturnPercent; }

    public BigDecimal getUsdReturnPercent() { return usdReturnPercent; }
    public void setUsdReturnPercent(BigDecimal usdReturnPercent) { this.usdReturnPercent = usdReturnPercent; }

    public BigDecimal getBtcReturnPercent() { return btcReturnPercent; }
    public void setBtcReturnPercent(BigDecimal btcReturnPercent) { this.btcReturnPercent = btcReturnPercent; }

    public String getAssetMove() { return assetMove; }
    public void setAssetMove(String assetMove) { this.assetMove = assetMove; }

    public String getTimeHorizon() { return timeHorizon; }
    public void setTimeHorizon(String timeHorizon) { this.timeHorizon = timeHorizon; }

    public LocalDate getHorizonEnd() { return horizonEnd; }
    public void setHorizonEnd(LocalDate horizonEnd) { this.horizonEnd = horizonEnd; }

    public boolean isHorizonElapsed() { return horizonElapsed; }
    public void setHorizonElapsed(boolean horizonElapsed) { this.horizonElapsed = horizonElapsed; }

    public EvaluationStatus getStatus() { return status; }
    public void setStatus(EvaluationStatus status) { this.status = status; }

    public Instant getEvaluatedAt() { return evaluatedAt; }
    public void setEvaluatedAt(Instant evaluatedAt) { this.evaluatedAt = evaluatedAt; }
}
