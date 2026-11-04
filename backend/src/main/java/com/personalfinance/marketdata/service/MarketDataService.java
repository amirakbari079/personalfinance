package com.personalfinance.marketdata.service;

import com.github.mfathi91.time.PersianDate;
import com.personalfinance.common.JalaliDateConverter;
import com.personalfinance.marketdata.MarketSymbol;
import com.personalfinance.marketdata.dto.BourseInstrumentDto;
import com.personalfinance.marketdata.dto.BourseInstrumentQuoteDto;
import com.personalfinance.marketdata.dto.BourseWatchlistRequest;
import com.personalfinance.marketdata.dto.MarketCalcResponse;
import com.personalfinance.marketdata.dto.MarketHistoryPointDto;
import com.personalfinance.marketdata.dto.MarketQuoteDto;
import com.personalfinance.marketdata.entity.MarketPriceSnapshot;
import com.personalfinance.marketdata.provider.CoinGeckoProvider;
import com.personalfinance.marketdata.dto.PortfolioStockQuoteDto;
import com.personalfinance.marketdata.provider.BourseInstrumentResolver;
import com.personalfinance.marketdata.provider.TsetmcInstrumentSearchProvider;
import com.personalfinance.marketdata.provider.TsetmcBourseProvider;
import com.personalfinance.marketdata.provider.TsetmcBourseQuote;
import com.personalfinance.account.entity.Investment;
import com.personalfinance.account.entity.InvestmentType;
import com.personalfinance.account.repository.InvestmentRepository;
import com.personalfinance.marketdata.repository.MarketPriceSnapshotRepository;
import com.personalfinance.intelligence.service.FinancialDataUpdateService;
import com.personalfinance.intelligence.service.MarketPriceIngestService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MarketDataService {

    private static final Logger log = LoggerFactory.getLogger(MarketDataService.class);
    private static final Map<MarketSymbol, String> LABELS = Map.of(
            MarketSymbol.BTC_USD, "بیت‌کوین (دلار)",
            MarketSymbol.BTC_IRR, "بیت‌کوین (تومان)",
            MarketSymbol.GOLD_18K_IRR, "طلای ۱۸ عیار ایران (هر گرم)",
            MarketSymbol.GOLD_XAU_USD, "برآورد اونس طلا (PAXG)",
            MarketSymbol.PAXG_USD, "PAXG (دلار)",
            MarketSymbol.USD_IRR, "دلار (تومان)",
            MarketSymbol.ETF_AYAR, "صندوق عیار (ETF بورس)",
            MarketSymbol.ETF_NARANGE, "صندوق نارنج (ETF بورس)");
    private final MarketPriceSnapshotRepository repository;
    private final TsetmcBourseProvider tsetmcBourseProvider;
    private final TsetmcInstrumentSearchProvider tsetmcInstrumentSearchProvider;
    private final BourseInstrumentResolver bourseInstrumentResolver;
    private final InvestmentRepository investmentRepository;
    private final JalaliDateConverter jalaliDateConverter;
    private final MarketPriceIngestService marketPriceIngestService;
    private final FinancialDataUpdateService financialDataUpdateService;

    private final Map<MarketSymbol, MarketQuoteDto> quoteCache = new ConcurrentHashMap<>();
    private final Map<Long, PortfolioStockQuoteDto> portfolioStockCache = new ConcurrentHashMap<>();
    private volatile Instant cacheUpdatedAt = Instant.EPOCH;
    private volatile Instant portfolioCacheUpdatedAt = Instant.EPOCH;

    public MarketDataService(
            MarketPriceSnapshotRepository repository,
            TsetmcBourseProvider tsetmcBourseProvider,
            TsetmcInstrumentSearchProvider tsetmcInstrumentSearchProvider,
            BourseInstrumentResolver bourseInstrumentResolver,
            InvestmentRepository investmentRepository,
            JalaliDateConverter jalaliDateConverter,
            MarketPriceIngestService marketPriceIngestService,
            FinancialDataUpdateService financialDataUpdateService) {
        this.repository = repository;
        this.tsetmcBourseProvider = tsetmcBourseProvider;
        this.tsetmcInstrumentSearchProvider = tsetmcInstrumentSearchProvider;
        this.bourseInstrumentResolver = bourseInstrumentResolver;
        this.investmentRepository = investmentRepository;
        this.jalaliDateConverter = jalaliDateConverter;
        this.marketPriceIngestService = marketPriceIngestService;
        this.financialDataUpdateService = financialDataUpdateService;
    }

    public List<MarketQuoteDto> getQuotes() {
        if (quoteCache.isEmpty() || cacheExpired()) {
            refreshFromDb();
        }
        return MarketSymbol.values().length == 0
                ? List.of()
                : Arrays.stream(MarketSymbol.values())
                        .map(quoteCache::get)
                        .filter(Objects::nonNull)
                        .toList();
    }

    /** Fetches fresh global prices (TGJU, crypto). Portfolio stocks are fetched separately. */
    public List<MarketQuoteDto> refreshQuotes() {
        fetchAllQuotes();
        return getQuotes();
    }

    public List<PortfolioStockQuoteDto> getPortfolioStockQuotes() {
        if (portfolioCacheExpired()) {
            refreshPortfolioStockQuotes();
        }
        return investmentRepository.findByAssetType(InvestmentType.STOCK).stream()
                .map(Investment::getId)
                .map(portfolioStockCache::get)
                .filter(Objects::nonNull)
                .toList();
    }

    public List<BourseInstrumentDto> searchInstruments(String query) {
        return tsetmcInstrumentSearchProvider.search(query);
    }

    public List<BourseInstrumentQuoteDto> getWatchlistQuotes(BourseWatchlistRequest request) {
        if (request == null || request.items() == null || request.items().isEmpty()) {
            return List.of();
        }
        Instant now = Instant.now();
        Set<String> fetched = new HashSet<>();
        List<BourseInstrumentQuoteDto> results = new ArrayList<>();

        for (BourseWatchlistRequest.WatchlistItem item : request.items()) {
            if (item == null || item.insCode() == null || item.insCode().isBlank()) {
                continue;
            }
            String insCode = item.insCode().trim();
            String symbol = item.symbol() != null ? item.symbol() : "";
            String name = item.name() != null ? item.name() : symbol;

            BigDecimal price = null;
            BigDecimal changePercent = null;
            String source = null;
            String error = null;
            Instant observedAt = null;

            if (fetched.add(insCode)) {
                Optional<TsetmcBourseQuote> quote = tsetmcBourseProvider.fetchQuote(insCode);
                if (quote.isPresent()) {
                    price = quote.get().priceToman();
                    changePercent = quote.get().changePercent();
                    source = "TSETMC";
                    observedAt = quote.get().observedAt();
                    persistPortfolioEtfSnapshot(insCode, price, observedAt);
                } else {
                    error = "دریافت از TSETMC ناموفق";
                }
            } else {
                Optional<BourseInstrumentQuoteDto> prior = results.stream()
                        .filter(q -> insCode.equals(q.insCode()))
                        .findFirst();
                if (prior.isPresent()) {
                    price = prior.get().value();
                    changePercent = prior.get().changePercent();
                    source = prior.get().source();
                    error = prior.get().errorMessage();
                    observedAt = prior.get().recordedAt();
                }
            }

            results.add(new BourseInstrumentQuoteDto(
                    insCode,
                    symbol,
                    name,
                    price,
                    "TOMAN",
                    changePercent,
                    source,
                    observedAt,
                    error));
        }
        return results;
    }

    public List<PortfolioStockQuoteDto> refreshPortfolioStockQuotes() {
        List<Investment> holdings = investmentRepository.findByAssetType(InvestmentType.STOCK);
        if (holdings.isEmpty()) {
            portfolioStockCache.clear();
            portfolioCacheUpdatedAt = Instant.now();
            return List.of();
        }

        Instant now = Instant.now();
        Map<Long, PortfolioStockQuoteDto> refreshed = new LinkedHashMap<>();
        Set<String> fetchedInsCodes = new HashSet<>();

        for (Investment holding : holdings) {
            Optional<BourseInstrumentResolver.ResolvedInstrument> resolved =
                    bourseInstrumentResolver.resolve(holding);
            if (resolved.isEmpty()) {
                refreshed.put(holding.getId(), new PortfolioStockQuoteDto(
                        holding.getId(),
                        holding.getName(),
                        null,
                        null,
                        "TOMAN",
                        null,
                        null,
                        "کد bourse برای این نماد مشخص نیست — nativeUnit را b:INS_CODE بگذارید"));
                continue;
            }

            BourseInstrumentResolver.ResolvedInstrument instrument = resolved.get();
            BigDecimal price = null;
            String source = null;
            String error = null;
            Instant observedAt = null;

            if (fetchedInsCodes.add(instrument.insCode())) {
                Optional<TsetmcBourseQuote> fetched = tsetmcBourseProvider.fetchQuote(instrument.insCode());
                if (fetched.isPresent()) {
                    price = fetched.get().priceToman();
                    observedAt = fetched.get().observedAt();
                    source = "TSETMC";
                    persistPortfolioEtfSnapshot(instrument.insCode(), price, observedAt);
                } else {
                    error = "دریافت از TSETMC ناموفق — backend.log را بررسی کنید";
                }
            } else {
                Optional<PortfolioStockQuoteDto> cachedSameIns = refreshed.values().stream()
                        .filter(q -> instrument.insCode().equals(q.insCode()))
                        .findFirst();
                if (cachedSameIns.isPresent()) {
                    PortfolioStockQuoteDto prior = cachedSameIns.get();
                    price = prior.value();
                    source = prior.source();
                    error = prior.errorMessage();
                    observedAt = prior.recordedAt();
                }
            }

            refreshed.put(holding.getId(), new PortfolioStockQuoteDto(
                    holding.getId(),
                    holding.getName(),
                    instrument.insCode(),
                    price,
                    "TOMAN",
                    source,
                    observedAt,
                    error));
        }

        portfolioStockCache.clear();
        portfolioStockCache.putAll(refreshed);
        portfolioCacheUpdatedAt = Instant.now();
        log.info("Portfolio bourse quotes refreshed: {} holdings, {} TSETMC calls",
                holdings.size(), fetchedInsCodes.size());
        return getPortfolioStockQuotes();
    }

    public List<MarketHistoryPointDto> getHistory(MarketSymbol symbol, Instant from) {
        return repository.findHistory(symbol, from).stream()
                .map(s -> new MarketHistoryPointDto(s.getRecordedAt(), s.getValue()))
                .toList();
    }

    public Instant currentJalaliMonthStart() {
        PersianDate today = PersianDate.fromGregorian(LocalDate.now());
        LocalDate monthStart = PersianDate.of(today.getYear(), today.getMonthValue(), 1).toGregorian();
        return monthStart.atStartOfDay(ZoneId.systemDefault()).toInstant();
    }

    public MarketCalcResponse calculate(
            String type,
            BigDecimal amount,
            String unit,
            String etf,
            BigDecimal priceOverride) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("مقدار نامعتبر است");
        }
        String normalized = type == null ? "" : type.trim().toUpperCase(Locale.ROOT);
        boolean overridden = priceOverride != null && priceOverride.compareTo(BigDecimal.ZERO) > 0;

        return switch (normalized) {
            case "GOLD" -> calcGold(amount, overridden ? priceOverride : getQuoteValue(MarketSymbol.GOLD_18K_IRR), overridden);
            case "CRYPTO" -> calcSimple("CRYPTO", amount, "BTC",
                    overridden ? priceOverride : getQuoteValue(MarketSymbol.BTC_IRR), "TOMAN", overridden);
            case "STOCK" -> calcEtf(amount, etf, overridden ? priceOverride : null, overridden);
            case "FOREIGN_CURRENCY" -> calcSimple("FOREIGN_CURRENCY", amount, unit != null ? unit : "USD",
                    overridden ? priceOverride : getQuoteValue(MarketSymbol.USD_IRR), "TOMAN", overridden);
            default -> throw new IllegalArgumentException("نوع دارایی پشتیبانی نمی‌شود: " + type);
        };
    }

    private MarketCalcResponse calcGold(BigDecimal grams, BigDecimal unitPrice, boolean overridden) {
        BigDecimal toman = grams.multiply(unitPrice).setScale(0, RoundingMode.HALF_UP);
        return new MarketCalcResponse("GOLD", grams, "gram", unitPrice, "TOMAN", toman, overridden);
    }

    private MarketCalcResponse calcEtf(BigDecimal units, String etf, BigDecimal priceOverride, boolean overridden) {
        BigDecimal unitPrice;
        if (overridden && priceOverride != null) {
            unitPrice = priceOverride;
        } else {
            Optional<BourseInstrumentResolver.ResolvedInstrument> resolved =
                    bourseInstrumentResolver.resolveByEtfKey(etf);
            unitPrice = resolved.flatMap(r -> tsetmcBourseProvider.fetchUnitPriceToman(r.insCode()))
                    .orElseGet(() -> {
                        MarketSymbol symbol = "NARANGE".equalsIgnoreCase(etf)
                                ? MarketSymbol.ETF_NARANGE : MarketSymbol.ETF_AYAR;
                        return getQuoteValueOrNull(symbol);
                    });
            if (unitPrice == null) {
                throw new IllegalStateException("قیمت ETF بورس در دسترس نیست");
            }
        }
        BigDecimal toman = units.multiply(unitPrice).setScale(0, RoundingMode.HALF_UP);
        return new MarketCalcResponse("STOCK", units, "unit", unitPrice, "TOMAN", toman, overridden);
    }

    private BigDecimal getQuoteValueOrNull(MarketSymbol symbol) {
        MarketQuoteDto quote = quoteCache.get(symbol);
        if (quote == null) {
            refreshFromDb();
            quote = quoteCache.get(symbol);
        }
        return quote != null ? quote.value() : null;
    }

    private MarketCalcResponse calcSimple(
            String assetType,
            BigDecimal amount,
            String unit,
            BigDecimal unitPrice,
            String currency,
            boolean overridden) {
        BigDecimal toman = amount.multiply(unitPrice).setScale(0, RoundingMode.HALF_UP);
        return new MarketCalcResponse(assetType, amount, unit, unitPrice, currency, toman, overridden);
    }

    private BigDecimal getQuoteValue(MarketSymbol symbol) {
        MarketQuoteDto quote = quoteCache.get(symbol);
        if (quote == null) {
            refreshFromDb();
            quote = quoteCache.get(symbol);
        }
        if (quote == null) {
            throw new IllegalStateException("قیمت " + LABELS.get(symbol) + " در دسترس نیست");
        }
        return quote.value();
    }

    @Scheduled(initialDelayString = "${app.market.fetch-interval-ms:600000}",
            fixedDelayString = "${app.market.fetch-interval-ms:600000}")
    public void scheduledFetch() {
        financialDataUpdateService.runSynchronous("SCHEDULED");
        refreshFromDb();
        refreshPortfolioStockQuotes();
    }

    public void fetchAllQuotes() {
        financialDataUpdateService.runSynchronous("MANUAL");
        refreshFromDb();
        log.info("Market quotes refreshed via financial intelligence update");
    }

    private boolean portfolioCacheExpired() {
        return portfolioCacheUpdatedAt.plusSeconds(300).isBefore(Instant.now());
    }

    private void persistPortfolioEtfSnapshot(String insCode, BigDecimal toman, Instant recordedAt) {
        MarketSymbol symbol = insCode.equals(bourseInstrumentResolver.resolveByEtfKey("AYAR")
                .map(BourseInstrumentResolver.ResolvedInstrument::insCode).orElse(""))
                ? MarketSymbol.ETF_AYAR
                : insCode.equals(bourseInstrumentResolver.resolveByEtfKey("NARANGE")
                        .map(BourseInstrumentResolver.ResolvedInstrument::insCode).orElse(""))
                        ? MarketSymbol.ETF_NARANGE
                        : null;
        if (symbol == null) {
            return;
        }
        persistQuote(new CoinGeckoProvider.QuoteFetch(symbol, toman, "TOMAN", "TSETMC"), recordedAt);
    }

    private void persistQuote(CoinGeckoProvider.QuoteFetch q, Instant recordedAt) {
        MarketPriceSnapshot snapshot = new MarketPriceSnapshot();
        snapshot.setSymbol(q.symbol());
        snapshot.setValue(q.value());
        snapshot.setCurrency(q.currency());
        snapshot.setRecordedAt(recordedAt);
        snapshot.setSource(q.source());
        repository.save(snapshot);
        try {
            marketPriceIngestService.ingestLegacy(
                    q.symbol().name(), q.value(), q.currency(), q.source(), recordedAt);
        } catch (Exception e) {
            log.warn("Financial intelligence ingest skipped for {}: {}", q.symbol(), e.getMessage());
        }
    }

    private void refreshFromDb() {
        Instant monthStart = currentJalaliMonthStart();
        for (MarketSymbol symbol : MarketSymbol.values()) {
            repository.findFirstBySymbolOrderByIdDesc(symbol).ifPresent(latest -> {
                BigDecimal monthChange = computeMonthChangePercent(symbol, latest.getValue(), monthStart);
                quoteCache.put(symbol, new MarketQuoteDto(
                        symbol,
                        LABELS.get(symbol),
                        latest.getValue(),
                        latest.getCurrency(),
                        latest.getSource(),
                        latest.getRecordedAt(),
                        monthChange));
            });
        }
        cacheUpdatedAt = Instant.now();
    }

    private BigDecimal computeMonthChangePercent(MarketSymbol symbol, BigDecimal current, Instant monthStart) {
        List<MarketPriceSnapshot> history = repository.findHistory(symbol, monthStart);
        if (history.isEmpty()) return null;
        BigDecimal first = history.getFirst().getValue();
        if (first.compareTo(BigDecimal.ZERO) == 0) return null;
        return current.subtract(first)
                .multiply(BigDecimal.valueOf(100))
                .divide(first, 2, RoundingMode.HALF_UP);
    }

    private boolean cacheExpired() {
        return cacheUpdatedAt.plusSeconds(10).isBefore(Instant.now());
    }
}
