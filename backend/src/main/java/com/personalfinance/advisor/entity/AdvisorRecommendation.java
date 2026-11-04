package com.personalfinance.advisor.entity;

import com.personalfinance.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

@Entity
@Table(name = "advisor_recommendations")
public class AdvisorRecommendation extends BaseEntity {

    @Column(name = "session_id", nullable = false)
    private Long sessionId;

    @Column(name = "market_snapshot_id")
    private Long marketSnapshotId;

    @Column(name = "prompt_version_id", nullable = false)
    private Long promptVersionId;

    @Column(name = "cache_key", nullable = false, length = 64)
    private String cacheKey;

    @Column(name = "decision_key", nullable = false, length = 64)
    private String decisionKey;

    @Column(nullable = false, length = 80)
    private String model;

    @Column(nullable = false, length = 16)
    private String provider;

    @Column(name = "is_fake", nullable = false)
    private boolean fake;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RecommendationStatus status = RecommendationStatus.ACTIVE;

    @Column(name = "status_reason", length = 300)
    private String statusReason;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(name = "reasoning_summary", nullable = false, length = 300)
    private String reasoningSummary;

    @Column
    private Short confidence;

    @Column(name = "reuse_count", nullable = false)
    private int reuseCount;

    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

    public Long getMarketSnapshotId() { return marketSnapshotId; }
    public void setMarketSnapshotId(Long marketSnapshotId) { this.marketSnapshotId = marketSnapshotId; }

    public Long getPromptVersionId() { return promptVersionId; }
    public void setPromptVersionId(Long promptVersionId) { this.promptVersionId = promptVersionId; }

    public String getCacheKey() { return cacheKey; }
    public void setCacheKey(String cacheKey) { this.cacheKey = cacheKey; }

    public String getDecisionKey() { return decisionKey; }
    public void setDecisionKey(String decisionKey) { this.decisionKey = decisionKey; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public boolean isFake() { return fake; }
    public void setFake(boolean fake) { this.fake = fake; }

    public RecommendationStatus getStatus() { return status; }
    public void setStatus(RecommendationStatus status) { this.status = status; }

    public String getStatusReason() { return statusReason; }
    public void setStatusReason(String statusReason) { this.statusReason = statusReason; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }

    public String getReasoningSummary() { return reasoningSummary; }
    public void setReasoningSummary(String reasoningSummary) { this.reasoningSummary = reasoningSummary; }

    public Short getConfidence() { return confidence; }
    public void setConfidence(Short confidence) { this.confidence = confidence; }

    public int getReuseCount() { return reuseCount; }
    public void setReuseCount(int reuseCount) { this.reuseCount = reuseCount; }
}
