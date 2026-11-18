package com.personalfinance.business.repository;

import com.personalfinance.business.entity.BizCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BizCategoryRepository extends JpaRepository<BizCategory, Long> {
    Optional<BizCategory> findByName(String name);
    boolean existsByName(String name);
    boolean existsByNameAndIdNot(String name, Long id);
}
