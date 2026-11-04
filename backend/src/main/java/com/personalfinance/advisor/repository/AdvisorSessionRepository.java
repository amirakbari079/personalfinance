package com.personalfinance.advisor.repository;

import com.personalfinance.advisor.entity.AdvisorSession;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdvisorSessionRepository extends JpaRepository<AdvisorSession, Long> {
}
