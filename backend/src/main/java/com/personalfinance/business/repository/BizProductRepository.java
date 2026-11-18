package com.personalfinance.business.repository;

import com.personalfinance.business.entity.BizProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BizProductRepository extends JpaRepository<BizProduct, Long> {
    Optional<BizProduct> findByCode(String code);
    boolean existsByCode(String code);
    boolean existsByCodeAndIdNot(String code, Long id);

    List<BizProduct> findByIsActiveTrueOrderByCreatedAtDesc();
    List<BizProduct> findAllByOrderByCreatedAtDesc();

    @Query("SELECT p FROM BizProduct p LEFT JOIN FETCH p.category ORDER BY p.createdAt DESC")
    List<BizProduct> findAllWithCategory();
}
