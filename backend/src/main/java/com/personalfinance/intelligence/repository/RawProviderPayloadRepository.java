package com.personalfinance.intelligence.repository;

import com.personalfinance.intelligence.entity.RawProviderPayload;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RawProviderPayloadRepository extends JpaRepository<RawProviderPayload, Long> {
}
