package com.personalfinance.intelligence.repository;

import com.personalfinance.intelligence.entity.DataUpdate;
import org.springframework.data.jpa.repository.JpaRepository;

import com.personalfinance.intelligence.entity.DataUpdateStatus;

import java.util.List;
import java.util.Optional;

public interface DataUpdateRepository extends JpaRepository<DataUpdate, Long> {

    List<DataUpdate> findTop50ByOrderByCreatedAtDesc();

    Optional<DataUpdate> findFirstByStatusOrderByCreatedAtDesc(DataUpdateStatus status);
}
