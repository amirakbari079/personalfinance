package com.personalfinance.advisor.dto;

import com.personalfinance.advisor.entity.AdvisorRecommendation;
import com.personalfinance.advisor.entity.AdvisorSession;
import com.personalfinance.advisor.entity.InvestmentThesis;
import com.personalfinance.advisor.entity.RecommendationStatus;
import com.personalfinance.advisor.entity.ThesisStatus;

import java.time.Instant;

public class AdvisorRecommendationResponse {

    private Long id;
    private Long sessionId;
    private Long marketSnapshotId;
    private boolean snapshotStale;
    private String promptVersion;
    private String model;
    private String provider;
    private boolean fake;
    private boolean cached;
    private RecommendationStatus status;
    private String statusReason;
    private String question;
    private String selectedAssets;
    private Long capitalAmount;
    private String currency;
    private String timeHorizon;
    private String riskTolerance;
    private String liquidityRequirement;
    private String body;
    private String reasoningSummary;
    private String portfolioJson;
    private Integer confidence;
    private int reuseCount;
    private Instant createdAt;
    private ThesisSummary thesis;

    public static AdvisorRecommendationResponse from(
            AdvisorRecommendation rec,
            AdvisorSession session,
            InvestmentThesis thesis,
            String promptVersion,
            Long latestSnapshotId,
            boolean cached) {
        AdvisorRecommendationResponse r = new AdvisorRecommendationResponse();
        r.id = rec.getId();
        r.sessionId = rec.getSessionId();
        r.marketSnapshotId = rec.getMarketSnapshotId();
        r.snapshotStale = rec.getMarketSnapshotId() != null
                && latestSnapshotId != null
                && !rec.getMarketSnapshotId().equals(latestSnapshotId);
        r.promptVersion = promptVersion;
        r.model = rec.getModel();
        r.provider = rec.getProvider();
        r.fake = rec.isFake();
        r.cached = cached;
        r.status = rec.getStatus();
        r.statusReason = rec.getStatusReason();
        r.body = rec.getBody();
        r.reasoningSummary = rec.getReasoningSummary();
        r.confidence = rec.getConfidence() == null ? null : rec.getConfidence().intValue();
        r.reuseCount = rec.getReuseCount();
        r.createdAt = rec.getCreatedAt();
        if (session != null) {
            r.question = session.getQuestion();
            r.selectedAssets = session.getSelectedAssets();
            r.capitalAmount = session.getCapitalAmount();
            r.currency = session.getCurrency();
            r.timeHorizon = session.getTimeHorizon();
            r.riskTolerance = session.getRiskTolerance();
            r.liquidityRequirement = session.getLiquidityRequirement();
            r.portfolioJson = session.getPortfolioJson();
        }
        if (thesis != null) {
            ThesisSummary summary = new ThesisSummary();
            summary.id = thesis.getId();
            summary.title = thesis.getTitle();
            summary.assetSymbol = thesis.getAssetSymbol();
            summary.assumptions = thesis.getAssumptions();
            summary.invalidationConditions = thesis.getInvalidationConditions();
            summary.status = thesis.getStatus();
            r.thesis = summary;
        }
        return r;
    }

    public Long getId() { return id; }
    public Long getSessionId() { return sessionId; }
    public Long getMarketSnapshotId() { return marketSnapshotId; }
    public boolean isSnapshotStale() { return snapshotStale; }
    public String getPromptVersion() { return promptVersion; }
    public String getModel() { return model; }
    public String getProvider() { return provider; }
    public boolean isFake() { return fake; }
    public boolean isCached() { return cached; }
    public RecommendationStatus getStatus() { return status; }
    public String getStatusReason() { return statusReason; }
    public String getQuestion() { return question; }
    public String getSelectedAssets() { return selectedAssets; }
    public Long getCapitalAmount() { return capitalAmount; }
    public String getCurrency() { return currency; }
    public String getTimeHorizon() { return timeHorizon; }
    public String getRiskTolerance() { return riskTolerance; }
    public String getLiquidityRequirement() { return liquidityRequirement; }
    public String getBody() { return body; }
    public String getReasoningSummary() { return reasoningSummary; }
    public String getPortfolioJson() { return portfolioJson; }
    public Integer getConfidence() { return confidence; }
    public int getReuseCount() { return reuseCount; }
    public Instant getCreatedAt() { return createdAt; }
    public ThesisSummary getThesis() { return thesis; }

    public static class ThesisSummary {
        private Long id;
        private String title;
        private String assetSymbol;
        private String assumptions;
        private String invalidationConditions;
        private ThesisStatus status;

        public Long getId() { return id; }
        public String getTitle() { return title; }
        public String getAssetSymbol() { return assetSymbol; }
        public String getAssumptions() { return assumptions; }
        public String getInvalidationConditions() { return invalidationConditions; }
        public ThesisStatus getStatus() { return status; }
    }
}
