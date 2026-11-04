package com.personalfinance.advisor.repository;

import com.personalfinance.advisor.entity.AdvisorPromptVersion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdvisorPromptVersionRepository extends JpaRepository<AdvisorPromptVersion, Long> {

    Optional<AdvisorPromptVersion> findFirstByActiveTrueOrderByIdDesc();
}
