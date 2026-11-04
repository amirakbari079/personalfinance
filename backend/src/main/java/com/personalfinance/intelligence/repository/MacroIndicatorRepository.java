package com.personalfinance.intelligence.repository;

import com.personalfinance.intelligence.entity.MacroIndicator;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MacroIndicatorRepository extends JpaRepository<MacroIndicator, Long> {

    List<MacroIndicator> findAllByActiveTrueOrderByCodeAsc();
}
