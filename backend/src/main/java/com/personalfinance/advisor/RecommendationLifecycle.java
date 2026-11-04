package com.personalfinance.advisor;

import com.personalfinance.advisor.entity.RecommendationStatus;
import com.personalfinance.advisor.entity.ThesisStatus;

import java.util.EnumSet;
import java.util.Set;

public final class RecommendationLifecycle {

    private RecommendationLifecycle() {}

    public static Set<RecommendationStatus> allowedTargets(RecommendationStatus from) {
        return switch (from) {
            case DRAFT -> EnumSet.of(RecommendationStatus.ACTIVE, RecommendationStatus.INVALIDATED);
            case ACTIVE -> EnumSet.of(
                    RecommendationStatus.SUPERSEDED,
                    RecommendationStatus.EXPIRED,
                    RecommendationStatus.INVALIDATED,
                    RecommendationStatus.COMPLETED);
            case SUPERSEDED, EXPIRED, INVALIDATED, COMPLETED -> EnumSet.noneOf(RecommendationStatus.class);
        };
    }

    public static boolean canTransition(RecommendationStatus from, RecommendationStatus to) {
        return from != null && to != null && allowedTargets(from).contains(to);
    }

    public static void requireTransition(RecommendationStatus from, RecommendationStatus to) {
        if (!canTransition(from, to)) {
            throw new IllegalArgumentException("تغییر وضعیت توصیه مجاز نیست");
        }
    }

    public static boolean isReusable(RecommendationStatus status) {
        return status == RecommendationStatus.ACTIVE || status == RecommendationStatus.DRAFT;
    }

    public static ThesisStatus followThesis(RecommendationStatus recommendationStatus) {
        return switch (recommendationStatus) {
            case SUPERSEDED -> ThesisStatus.SUPERSEDED;
            case EXPIRED -> ThesisStatus.EXPIRED;
            case INVALIDATED -> ThesisStatus.INVALIDATED;
            case DRAFT, ACTIVE, COMPLETED -> ThesisStatus.ACTIVE;
        };
    }
}
