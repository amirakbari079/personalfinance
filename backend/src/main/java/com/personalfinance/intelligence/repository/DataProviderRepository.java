package com.personalfinance.intelligence.repository;

import com.personalfinance.intelligence.entity.DataProvider;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DataProviderRepository extends JpaRepository<DataProvider, Long> {

    Optional<DataProvider> findByCode(String code);
}
