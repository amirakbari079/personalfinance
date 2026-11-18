package com.personalfinance.business.repository;

import com.personalfinance.business.entity.BizCounterparty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BizCounterpartyRepository extends JpaRepository<BizCounterparty, Long> {
    Optional<BizCounterparty> findByCode(String code);
    boolean existsByCode(String code);
    boolean existsByCodeAndIdNot(String code, Long id);

    List<BizCounterparty> findByIsActiveTrueOrderByCreatedAtDesc();
    List<BizCounterparty> findAllByOrderByCreatedAtDesc();
    List<BizCounterparty> findByRoleAndIsActiveTrue(String role);
}
