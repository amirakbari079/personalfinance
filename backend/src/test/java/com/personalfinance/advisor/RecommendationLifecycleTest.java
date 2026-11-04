package com.personalfinance.advisor;

import com.personalfinance.advisor.entity.RecommendationStatus;
import com.personalfinance.advisor.entity.ThesisStatus;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RecommendationLifecycleTest {

    @Test
    void activeCanMoveToTerminalStates() {
        assertTrue(RecommendationLifecycle.canTransition(RecommendationStatus.ACTIVE, RecommendationStatus.COMPLETED));
        assertTrue(RecommendationLifecycle.canTransition(RecommendationStatus.ACTIVE, RecommendationStatus.INVALIDATED));
        assertTrue(RecommendationLifecycle.canTransition(RecommendationStatus.ACTIVE, RecommendationStatus.EXPIRED));
        assertTrue(RecommendationLifecycle.canTransition(RecommendationStatus.ACTIVE, RecommendationStatus.SUPERSEDED));
        assertFalse(RecommendationLifecycle.canTransition(RecommendationStatus.COMPLETED, RecommendationStatus.ACTIVE));
    }

    @Test
    void supersededCannotBeForcedByIllegalJump() {
        assertThrows(IllegalArgumentException.class, () ->
                RecommendationLifecycle.requireTransition(
                        RecommendationStatus.EXPIRED, RecommendationStatus.ACTIVE));
    }

    @Test
    void thesisFollowsRecommendationExceptCompleted() {
        assertEquals(ThesisStatus.INVALIDATED,
                RecommendationLifecycle.followThesis(RecommendationStatus.INVALIDATED));
        assertEquals(ThesisStatus.ACTIVE,
                RecommendationLifecycle.followThesis(RecommendationStatus.COMPLETED));
        assertTrue(RecommendationLifecycle.isReusable(RecommendationStatus.ACTIVE));
        assertFalse(RecommendationLifecycle.isReusable(RecommendationStatus.INVALIDATED));
    }
}
