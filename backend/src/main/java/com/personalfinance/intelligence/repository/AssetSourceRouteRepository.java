package com.personalfinance.intelligence.repository;

import com.personalfinance.intelligence.entity.AssetSourceRoute;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssetSourceRouteRepository extends JpaRepository<AssetSourceRoute, Long> {

    List<AssetSourceRoute> findAllByOrderByAssetIdAscPriorityAsc();
}
