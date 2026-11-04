package com.personalfinance.advisor.repository;

import com.personalfinance.advisor.entity.RecommendationEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RecommendationEvaluationRepository extends JpaRepository<RecommendationEvaluation, Long> {

    Optional<RecommendationEvaluation> findByRecommendationId(Long recommendationId);
}
