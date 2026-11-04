package com.personalfinance.advisor.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.personalfinance.intelligence.dto.MarketPremiumResponse;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AdvisorContextResponse {

    private Instant generatedAt;
    private Long marketSnapshotId;
    private Instant snapshotCapturedAt;
    private long openConflictCount;
    private Freshness freshness;
    private MarketPremiumResponse premiums;
    private PortfolioSummary portfolio;
    private List<AssetSummary> assets = new ArrayList<>();
    private List<MacroSummary> macro = new ArrayList<>();

    public Instant getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(Instant generatedAt) { this.generatedAt = generatedAt; }

    public Long getMarketSnapshotId() { return marketSnapshotId; }
    public void setMarketSnapshotId(Long marketSnapshotId) { this.marketSnapshotId = marketSnapshotId; }

    public Instant getSnapshotCapturedAt() { return snapshotCapturedAt; }
    public void setSnapshotCapturedAt(Instant snapshotCapturedAt) { this.snapshotCapturedAt = snapshotCapturedAt; }

    public long getOpenConflictCount() { return openConflictCount; }
    public void setOpenConflictCount(long openConflictCount) { this.openConflictCount = openConflictCount; }

    public Freshness getFreshness() { return freshness; }
    public void setFreshness(Freshness freshness) { this.freshness = freshness; }

    public MarketPremiumResponse getPremiums() { return premiums; }
    public void setPremiums(MarketPremiumResponse premiums) { this.premiums = premiums; }

    public PortfolioSummary getPortfolio() { return portfolio; }
    public void setPortfolio(PortfolioSummary portfolio) { this.portfolio = portfolio; }

    public List<AssetSummary> getAssets() { return assets; }
    public void setAssets(List<AssetSummary> assets) { this.assets = assets; }

    public List<MacroSummary> getMacro() { return macro; }
    public void setMacro(List<MacroSummary> macro) { this.macro = macro; }

    public static class Freshness {
        private Instant lastUpdateAt;
        private String lastUpdateStatus;
        private boolean marketStale;
        private boolean hasOpenConflicts;
        private String staleReason;

        public Instant getLastUpdateAt() { return lastUpdateAt; }
        public void setLastUpdateAt(Instant lastUpdateAt) { this.lastUpdateAt = lastUpdateAt; }

        public String getLastUpdateStatus() { return lastUpdateStatus; }
        public void setLastUpdateStatus(String lastUpdateStatus) { this.lastUpdateStatus = lastUpdateStatus; }

        public boolean isMarketStale() { return marketStale; }
        public void setMarketStale(boolean marketStale) { this.marketStale = marketStale; }

        @com.fasterxml.jackson.annotation.JsonProperty("hasOpenConflicts")
        public boolean getHasOpenConflicts() { return hasOpenConflicts; }
        public void setHasOpenConflicts(boolean hasOpenConflicts) { this.hasOpenConflicts = hasOpenConflicts; }

        public String getStaleReason() { return staleReason; }
        public void setStaleReason(String staleReason) { this.staleReason = staleReason; }
    }

    public static class PortfolioSummary {
        private long cashTotal;
        private long investmentTotal;
        private long customTotal;
        private long totalToman;
        private List<HoldingSummary> holdings = new ArrayList<>();

        public long getCashTotal() { return cashTotal; }
        public void setCashTotal(long cashTotal) { this.cashTotal = cashTotal; }

        public long getInvestmentTotal() { return investmentTotal; }
        public void setInvestmentTotal(long investmentTotal) { this.investmentTotal = investmentTotal; }

        public long getCustomTotal() { return customTotal; }
        public void setCustomTotal(long customTotal) { this.customTotal = customTotal; }

        public long getTotalToman() { return totalToman; }
        public void setTotalToman(long totalToman) { this.totalToman = totalToman; }

        public List<HoldingSummary> getHoldings() { return holdings; }
        public void setHoldings(List<HoldingSummary> holdings) { this.holdings = holdings; }
    }

    public static class HoldingSummary {
        private String source;
        private Long id;
        private String name;
        private String type;
        private Long amountToman;
        private BigDecimal quantity;
        private String unit;
        private String symbol;
        private String recordedDate;

        public String getSource() { return source; }
        public void setSource(String source) { this.source = source; }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public Long getAmountToman() { return amountToman; }
        public void setAmountToman(Long amountToman) { this.amountToman = amountToman; }

        public BigDecimal getQuantity() { return quantity; }
        public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }

        public String getUnit() { return unit; }
        public void setUnit(String unit) { this.unit = unit; }

        public String getSymbol() { return symbol; }
        public void setSymbol(String symbol) { this.symbol = symbol; }

        public String getRecordedDate() { return recordedDate; }
        public void setRecordedDate(String recordedDate) { this.recordedDate = recordedDate; }
    }

    public static class AssetSummary {
        private String symbol;
        private String name;
        private String currency;
        private String unit;
        private BigDecimal latestPrice;
        private Instant observedAt;
        private String providerCode;
        private boolean stale;
        private BigDecimal return30d;
        private BigDecimal return1y;
        private List<MonthlyClose> monthlyCloses = new ArrayList<>();

        public String getSymbol() { return symbol; }
        public void setSymbol(String symbol) { this.symbol = symbol; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }

        public String getUnit() { return unit; }
        public void setUnit(String unit) { this.unit = unit; }

        public BigDecimal getLatestPrice() { return latestPrice; }
        public void setLatestPrice(BigDecimal latestPrice) { this.latestPrice = latestPrice; }

        public Instant getObservedAt() { return observedAt; }
        public void setObservedAt(Instant observedAt) { this.observedAt = observedAt; }

        public String getProviderCode() { return providerCode; }
        public void setProviderCode(String providerCode) { this.providerCode = providerCode; }

        public boolean isStale() { return stale; }
        public void setStale(boolean stale) { this.stale = stale; }

        public BigDecimal getReturn30d() { return return30d; }
        public void setReturn30d(BigDecimal return30d) { this.return30d = return30d; }

        public BigDecimal getReturn1y() { return return1y; }
        public void setReturn1y(BigDecimal return1y) { this.return1y = return1y; }

        public List<MonthlyClose> getMonthlyCloses() { return monthlyCloses; }
        public void setMonthlyCloses(List<MonthlyClose> monthlyCloses) { this.monthlyCloses = monthlyCloses; }
    }

    public static class MonthlyClose {
        private String period;
        private BigDecimal close;

        public String getPeriod() { return period; }
        public void setPeriod(String period) { this.period = period; }

        public BigDecimal getClose() { return close; }
        public void setClose(BigDecimal close) { this.close = close; }
    }

    public static class MacroSummary {
        private String code;
        private String name;
        private String country;
        private String period;
        private BigDecimal value;
        private String unit;
        private String source;
        private boolean stale;

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }

        public String getPeriod() { return period; }
        public void setPeriod(String period) { this.period = period; }

        public BigDecimal getValue() { return value; }
        public void setValue(BigDecimal value) { this.value = value; }

        public String getUnit() { return unit; }
        public void setUnit(String unit) { this.unit = unit; }

        public String getSource() { return source; }
        public void setSource(String source) { this.source = source; }

        public boolean isStale() { return stale; }
        public void setStale(boolean stale) { this.stale = stale; }
    }
}
