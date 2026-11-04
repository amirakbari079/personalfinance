package com.personalfinance.advisor.repository;

import com.personalfinance.advisor.entity.InvestmentThesis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InvestmentThesisRepository extends JpaRepository<InvestmentThesis, Long> {

    Optional<InvestmentThesis> findByRecommendationId(Long recommendationId);
}
