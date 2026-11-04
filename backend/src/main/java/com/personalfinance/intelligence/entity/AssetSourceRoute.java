package com.personalfinance.intelligence.entity;

import com.personalfinance.common.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(
        name = "fi_asset_source_routes",
        uniqueConstraints = @UniqueConstraint(columnNames = {"asset_id", "provider_id", "quote_currency"}))
public class AssetSourceRoute extends BaseEntity {

    @Column(name = "asset_id", nullable = false)
    private Long assetId;

    @Column(name = "provider_id", nullable = false)
    private Long providerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "route_role", nullable = false, length = 16)
    private RouteRole routeRole;

    @Column(nullable = false)
    private short priority;

    @Column(name = "quote_currency", nullable = false, length = 8)
    private String quoteCurrency;

    public Long getAssetId() { return assetId; }
    public void setAssetId(Long assetId) { this.assetId = assetId; }

    public Long getProviderId() { return providerId; }
    public void setProviderId(Long providerId) { this.providerId = providerId; }

    public RouteRole getRouteRole() { return routeRole; }
    public void setRouteRole(RouteRole routeRole) { this.routeRole = routeRole; }

    public short getPriority() { return priority; }
    public void setPriority(short priority) { this.priority = priority; }

    public String getQuoteCurrency() { return quoteCurrency; }
    public void setQuoteCurrency(String quoteCurrency) { this.quoteCurrency = quoteCurrency; }
}
