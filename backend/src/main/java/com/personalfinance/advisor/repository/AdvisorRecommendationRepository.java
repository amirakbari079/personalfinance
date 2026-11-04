package com.personalfinance.advisor.repository;

import com.personalfinance.advisor.entity.AdvisorRecommendation;
import com.personalfinance.advisor.entity.RecommendationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface AdvisorRecommendationRepository extends JpaRepository<AdvisorRecommendation, Long> {

    Optional<AdvisorRecommendation> findFirstByCacheKeyAndStatusInOrderByCreatedAtDesc(
            String cacheKey, Collection<RecommendationStatus> statuses);

    List<AdvisorRecommendation> findByDecisionKeyAndStatusIn(
            String decisionKey, Collection<RecommendationStatus> statuses);

    List<AdvisorRecommendation> findTop50ByOrderByCreatedAtDesc();
}
