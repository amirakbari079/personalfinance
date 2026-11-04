package com.personalfinance.advisor.service;

import com.personalfinance.account.dto.AccountResponse;
import com.personalfinance.account.dto.InvestmentResponse;
import com.personalfinance.account.service.AccountService;
import com.personalfinance.account.service.InvestmentService;
import com.personalfinance.advisor.AdvisorFreshness;
import com.personalfinance.advisor.AdvisorHoldings;
import com.personalfinance.advisor.AdvisorSymbols;
import com.personalfinance.advisor.MonthlyDownsample;
import com.personalfinance.advisor.dto.AdvisorContextRequest;
import com.personalfinance.advisor.dto.AdvisorContextResponse;
import com.personalfinance.advisor.dto.AdvisorContextResponse.AssetSummary;
import com.personalfinance.advisor.dto.AdvisorContextResponse.Freshness;
import com.personalfinance.advisor.dto.AdvisorContextResponse.HoldingSummary;
import com.personalfinance.advisor.dto.AdvisorContextResponse.MacroSummary;
import com.personalfinance.advisor.dto.AdvisorContextResponse.MonthlyClose;
import com.personalfinance.advisor.dto.AdvisorContextResponse.PortfolioSummary;
import com.personalfinance.advisor.dto.AdvisorHoldingRequest;
import com.personalfinance.intelligence.HistoryRange;
import com.personalfinance.intelligence.dto.DataUpdateResponse;
import com.personalfinance.intelligence.dto.MacroIndicatorResponse;
import com.personalfinance.intelligence.dto.QualitySummaryResponse;
import com.personalfinance.intelligence.entity.Asset;
import com.personalfinance.intelligence.entity.AssetPrice;
import com.personalfinance.intelligence.entity.AssetPriceDaily;
import com.personalfinance.intelligence.entity.DataProvider;
import com.personalfinance.intelligence.metrics.FinancialMetrics;
import com.personalfinance.intelligence.repository.AssetPriceDailyRepository;
import com.personalfinance.intelligence.repository.AssetPriceRepository;
import com.personalfinance.intelligence.repository.AssetRepository;
import com.personalfinance.intelligence.repository.DataProviderRepository;
import com.personalfinance.intelligence.service.AssetMarketQueryService;
import com.personalfinance.intelligence.service.MacroQueryService;
import com.personalfinance.intelligence.service.QualityQueryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AdvisorContextBuilder {

    private final AssetRepository assetRepository;
    private final AssetPriceRepository assetPriceRepository;
    private final AssetPriceDailyRepository dailyRepository;
    private final DataProviderRepository dataProviderRepository;
    private final AssetMarketQueryService assetMarketQueryService;
    private final QualityQueryService qualityQueryService;
    private final MacroQueryService macroQueryService;
    private final AccountService accountService;
    private final InvestmentService investmentService;

    public AdvisorContextBuilder(
            AssetRepository assetRepository,
            AssetPriceRepository assetPriceRepository,
            AssetPriceDailyRepository dailyRepository,
            DataProviderRepository dataProviderRepository,
            AssetMarketQueryService assetMarketQueryService,
            QualityQueryService qualityQueryService,
            MacroQueryService macroQueryService,
            AccountService accountService,
            InvestmentService investmentService) {
        this.assetRepository = assetRepository;
        this.assetPriceRepository = assetPriceRepository;
        this.dailyRepository = dailyRepository;
        this.dataProviderRepository = dataProviderRepository;
        this.assetMarketQueryService = assetMarketQueryService;
        this.qualityQueryService = qualityQueryService;
        this.macroQueryService = macroQueryService;
        this.accountService = accountService;
        this.investmentService = investmentService;
    }

    @Transactional(readOnly = true)
    public AdvisorContextResponse build(String symbolsParam) {
        AdvisorContextRequest request = new AdvisorContextRequest();
        request.setSymbols(symbolsParam);
        return build(request);
    }

    @Transactional(readOnly = true)
    public AdvisorContextResponse build(AdvisorContextRequest request) {
        Instant now = Instant.now();
        LocalDate today = LocalDate.now(HistoryRange.TEHRAN);
        AdvisorContextRequest safe = request == null ? new AdvisorContextRequest() : request;

        AdvisorContextResponse context = new AdvisorContextResponse();
        context.setGeneratedAt(now);
        QualitySummaryResponse quality = qualityQueryService.summary();
        context.setMarketSnapshotId(quality.getLastSnapshotId());
        context.setSnapshotCapturedAt(quality.getLastSnapshotAt());
        context.setOpenConflictCount(quality.getOpenConflictCount());
        context.setPremiums(assetMarketQueryService.premiums());
        context.setAssets(assetSummaries(AdvisorSymbols.parse(safe.getSymbols()), now, today));
        context.setMacro(macroSummaries(today));
        context.setPortfolio(portfolio(safe));
        context.setFreshness(freshness(quality, context, now));
        return context;
    }

    private List<AssetSummary> assetSummaries(List<String> symbols, Instant now, LocalDate today) {
        List<AssetSummary> rows = new ArrayList<>();
        for (String symbol : symbols) {
            assetRepository.findBySymbol(symbol).ifPresent(asset -> {
                AssetSummary summary = summarize(asset, asset.getCurrency(), now, today);
                if (summary != null) {
                    rows.add(summary);
                }
            });
        }
        return rows;
    }

    private AssetSummary summarize(Asset asset, String currency, Instant now, LocalDate today) {
        AssetPrice latest = assetPriceRepository
                .findFirstByAssetIdAndCurrencyOrderByIdDesc(asset.getId(), currency)
                .orElse(null);
        if (latest == null) {
            return null;
        }
        AssetSummary summary = new AssetSummary();
        summary.setSymbol(asset.getSymbol());
        summary.setName(asset.getName());
        summary.setCurrency(currency);
        summary.setUnit(latest.getUnit());
        summary.setLatestPrice(latest.getPrice());
        summary.setObservedAt(latest.getObservedAt());
        summary.setProviderCode(providerCode(latest.getProviderId()));
        summary.setStale(AdvisorFreshness.priceStale(latest.getObservedAt(), now));
        summary.setReturn30d(returnSince(asset.getId(), currency, today.minusDays(30)));
        summary.setReturn1y(returnSince(asset.getId(), currency, today.minusYears(1)));

        List<AssetPriceDaily> daily = dailyRepository
                .findByAssetIdAndCurrencyAndTradeDateGreaterThanEqualOrderByTradeDateAsc(
                        asset.getId(), currency, today.minusMonths(13));
        List<MonthlyDownsample.DailyClose> closes = daily.stream()
                .map(row -> new MonthlyDownsample.DailyClose(row.getTradeDate(), row.getClose()))
                .toList();
        for (MonthlyDownsample.Point point : MonthlyDownsample.lastClosesByMonth(closes, MonthlyDownsample.MAX_POINTS)) {
            MonthlyClose close = new MonthlyClose();
            close.setPeriod(point.period());
            close.setClose(point.close());
            summary.getMonthlyCloses().add(close);
        }
        return summary;
    }

    private String providerCode(Long providerId) {
        if (providerId == null) {
            return null;
        }
        return dataProviderRepository.findById(providerId).map(DataProvider::getCode).orElse(null);
    }

    private BigDecimal returnSince(Long assetId, String currency, LocalDate from) {
        var latest = dailyRepository.findFirstByAssetIdAndCurrencyOrderByTradeDateDesc(assetId, currency);
        var start = dailyRepository.findFirstByAssetIdAndCurrencyAndTradeDateLessThanEqualOrderByTradeDateDesc(
                assetId, currency, from);
        if (latest.isEmpty() || start.isEmpty()) {
            return null;
        }
        return FinancialMetrics.returnPercent(start.get().getClose(), latest.get().getClose());
    }

    private List<MacroSummary> macroSummaries(LocalDate today) {
        List<MacroSummary> rows = new ArrayList<>();
        for (MacroIndicatorResponse indicator : macroQueryService.latest(false)) {
            if (indicator.getPeriod() == null || indicator.getValue() == null) {
                continue;
            }
            MacroSummary summary = new MacroSummary();
            summary.setCode(indicator.getCode());
            summary.setName(indicator.getName());
            summary.setCountry(indicator.getCountry());
            summary.setPeriod(indicator.getPeriod());
            summary.setValue(indicator.getValue());
            summary.setUnit(indicator.getUnit());
            summary.setSource(indicator.getSource() != null ? indicator.getSource() : indicator.getSourceCode());
            summary.setStale(AdvisorFreshness.periodStale(indicator.getPeriod(), today));
            rows.add(summary);
        }
        return rows;
    }

    private PortfolioSummary portfolio(AdvisorContextRequest request) {
        PortfolioSummary portfolio = new PortfolioSummary();
        long cashTotal = 0;
        long investmentTotal = 0;
        long customTotal = 0;

        Set<Long> accountIds = distinctIds(request.getAccountIds());
        for (AccountResponse account : accountService.findByIds(accountIds)) {
            HoldingSummary holding = new HoldingSummary();
            holding.setSource(AdvisorHoldings.ACCOUNT);
            holding.setId(account.getId());
            holding.setName(account.getName());
            holding.setType(account.getType() == null ? null : account.getType().name());
            holding.setAmountToman(account.getBalance() == null ? 0L : account.getBalance());
            holding.setRecordedDate(account.getBalanceRecordedDate());
            portfolio.getHoldings().add(holding);
            cashTotal += holding.getAmountToman();
        }

        Set<Long> investmentIds = distinctIds(request.getInvestmentIds());
        for (InvestmentResponse investment : investmentService.findByIds(investmentIds)) {
            HoldingSummary holding = new HoldingSummary();
            holding.setSource(AdvisorHoldings.INVESTMENT);
            holding.setId(investment.getId());
            holding.setName(investment.getName());
            holding.setType(investment.getAssetType() == null ? null : investment.getAssetType().name());
            holding.setAmountToman(investment.getTomanEquivalent() == null ? 0L : investment.getTomanEquivalent());
            holding.setQuantity(investment.getNativeAmount());
            holding.setUnit(investment.getNativeUnit());
            holding.setRecordedDate(investment.getValueRecordedDate());
            portfolio.getHoldings().add(holding);
            investmentTotal += holding.getAmountToman();
        }

        List<AdvisorHoldingRequest> customHoldings = request.getCustomHoldings() == null
                ? List.of()
                : request.getCustomHoldings();
        for (AdvisorHoldingRequest custom : customHoldings) {
            HoldingSummary holding = new HoldingSummary();
            holding.setSource(AdvisorHoldings.CUSTOM);
            holding.setName(custom.getName() == null ? null : custom.getName().trim());
            holding.setType(AdvisorHoldings.kind(custom.getKind()));
            holding.setAmountToman(custom.getAmountToman() == null ? 0L : custom.getAmountToman());
            holding.setQuantity(custom.getQuantity());
            holding.setUnit(blankToNull(custom.getUnit()));
            holding.setSymbol(blankToNull(custom.getSymbol()));
            portfolio.getHoldings().add(holding);
            customTotal += holding.getAmountToman();
        }

        portfolio.setCashTotal(cashTotal);
        portfolio.setInvestmentTotal(investmentTotal);
        portfolio.setCustomTotal(customTotal);
        portfolio.setTotalToman(cashTotal + investmentTotal + customTotal);
        return portfolio;
    }

    private Freshness freshness(QualitySummaryResponse quality, AdvisorContextResponse context, Instant now) {
        List<String> reasons = new ArrayList<>();
        Freshness freshness = new Freshness();
        DataUpdateResponse lastUpdate = quality.getLastUpdate();
        if (lastUpdate != null) {
            freshness.setLastUpdateAt(lastUpdate.getCompletedAt() != null
                    ? lastUpdate.getCompletedAt()
                    : lastUpdate.getStartedAt());
            freshness.setLastUpdateStatus(lastUpdate.getStatus() == null ? null : lastUpdate.getStatus().name());
            if (AdvisorFreshness.updateFailed(lastUpdate.getStatus())) {
                reasons.add("آخرین بروزرسانی بازار ناموفق بود");
            }
        }
        if (AdvisorFreshness.snapshotStale(quality.getLastSnapshotAt(), now)) {
            reasons.add("اسنپ‌شات بازار بیش از "
                    + AdvisorFreshness.SNAPSHOT_STALE_HOURS
                    + " ساعت قدمت دارد یا وجود ندارد");
        }
        for (AssetSummary asset : context.getAssets()) {
            if (asset.isStale()) {
                reasons.add("قیمت " + asset.getSymbol() + " بیش از "
                        + AdvisorFreshness.PRICE_STALE_HOURS
                        + " ساعت به‌روز نشده");
            }
        }
        for (MacroSummary macro : context.getMacro()) {
            if (macro.isStale()) {
                reasons.add("شاخص " + macro.getName() + " مربوط به دورهٔ " + macro.getPeriod() + " است");
            }
        }
        boolean conflicts = quality.getOpenConflictCount() > 0;
        freshness.setHasOpenConflicts(conflicts);
        boolean marketStale = !reasons.isEmpty();
        if (conflicts) {
            reasons.add("بین منابع قیمت تعارض باز وجود دارد");
        }
        freshness.setMarketStale(marketStale);
        freshness.setStaleReason(AdvisorFreshness.joinReasons(reasons));
        return freshness;
    }

    private static Set<Long> distinctIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return Set.of();
        }
        return ids.stream().filter(Objects::nonNull).collect(Collectors.toSet());
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
