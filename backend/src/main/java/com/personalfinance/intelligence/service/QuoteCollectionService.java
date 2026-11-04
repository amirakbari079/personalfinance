package com.personalfinance.intelligence.service;

import com.personalfinance.intelligence.ProviderCodes;
import com.personalfinance.intelligence.entity.Asset;
import com.personalfinance.intelligence.entity.AssetSourceRoute;
import com.personalfinance.intelligence.entity.DataProvider;
import com.personalfinance.intelligence.provider.CurrentQuote;
import com.personalfinance.intelligence.provider.DerivedQuoteCalculator;
import com.personalfinance.intelligence.provider.FinancialDataProvider;
import com.personalfinance.intelligence.provider.QuoteSelector;
import com.personalfinance.intelligence.repository.AssetRepository;
import com.personalfinance.intelligence.repository.AssetSourceRouteRepository;
import com.personalfinance.intelligence.repository.DataProviderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class QuoteCollectionService {

    private static final Logger log = LoggerFactory.getLogger(QuoteCollectionService.class);

    private final List<FinancialDataProvider> providers;
    private final AssetSourceRouteRepository routeRepository;
    private final AssetRepository assetRepository;
    private final DataProviderRepository dataProviderRepository;
    private final DerivedQuoteCalculator derivedQuoteCalculator;

    public QuoteCollectionService(
            List<FinancialDataProvider> providers,
            AssetSourceRouteRepository routeRepository,
            AssetRepository assetRepository,
            DataProviderRepository dataProviderRepository,
            DerivedQuoteCalculator derivedQuoteCalculator) {
        this.providers = providers;
        this.routeRepository = routeRepository;
        this.assetRepository = assetRepository;
        this.dataProviderRepository = dataProviderRepository;
        this.derivedQuoteCalculator = derivedQuoteCalculator;
    }

    public CollectionResult collect() {
        Map<String, List<CurrentQuote>> fetchedByProvider = new LinkedHashMap<>();
        int successful = 0;
        int failed = 0;
        List<String> errors = new ArrayList<>();

        for (FinancialDataProvider provider : providers) {
            try {
                List<CurrentQuote> quotes = provider.fetchCurrentData();
                fetchedByProvider.put(provider.code(), quotes == null ? List.of() : quotes);
                if (quotes == null || quotes.isEmpty()) {
                    failed++;
                    errors.add(provider.code() + ": empty");
                } else {
                    successful++;
                }
            } catch (Exception e) {
                failed++;
                fetchedByProvider.put(provider.code(), List.of());
                errors.add(provider.code() + ": " + e.getMessage());
                log.warn("Provider {} failed: {}", provider.code(), e.getMessage());
            }
        }

        Map<QuoteKey, Map<String, CurrentQuote>> index = indexQuotes(fetchedByProvider);
        Map<Long, Asset> assets = assetRepository.findAll().stream()
                .collect(Collectors.toMap(Asset::getId, a -> a));
        Map<Long, String> providerCodes = dataProviderRepository.findAll().stream()
                .collect(Collectors.toMap(DataProvider::getId, DataProvider::getCode));

        Map<QuoteKey, List<String>> routeOrder = new LinkedHashMap<>();
        for (AssetSourceRoute route : routeRepository.findAllByOrderByAssetIdAscPriorityAsc()) {
            Asset asset = assets.get(route.getAssetId());
            String providerCode = providerCodes.get(route.getProviderId());
            if (asset == null || providerCode == null || !asset.isActive()) {
                continue;
            }
            QuoteKey key = new QuoteKey(asset.getSymbol(), route.getQuoteCurrency());
            routeOrder.computeIfAbsent(key, ignored -> new ArrayList<>()).add(providerCode);
        }

        seedDerived(index, routeOrder);

        List<CurrentQuote> selected = new ArrayList<>();
        int rejected = 0;
        for (Map.Entry<QuoteKey, List<String>> entry : routeOrder.entrySet()) {
            Map<String, CurrentQuote> byProvider = index.getOrDefault(entry.getKey(), Map.of());
            var chosen = QuoteSelector.firstAvailable(entry.getValue(), byProvider);
            if (chosen.isPresent()) {
                selected.add(chosen.get());
            } else {
                rejected++;
                log.warn("No quote for {} {}", entry.getKey().assetSymbol(), entry.getKey().currency());
            }
        }

        int fetchedCount = fetchedByProvider.values().stream().mapToInt(List::size).sum();
        return new CollectionResult(
                selected, fetchedByProvider, index, routeOrder,
                fetchedCount, successful, failed, rejected, errors);
    }

    private void seedDerived(Map<QuoteKey, Map<String, CurrentQuote>> index, Map<QuoteKey, List<String>> routes) {
        CurrentQuote btcUsd = routedQuote(index, routes, new QuoteKey("BTC", "USD"));
        CurrentQuote usdIrt = routedQuote(index, routes, new QuoteKey("USD", "IRT"));
        derivedQuoteCalculator.btcIrt(btcUsd, usdIrt).ifPresent(derived ->
                index.computeIfAbsent(new QuoteKey("BTC", "IRT"), ignored -> new HashMap<>())
                        .put(ProviderCodes.DERIVED, derived));
    }

    private static CurrentQuote routedQuote(Map<QuoteKey, Map<String, CurrentQuote>> index,
            Map<QuoteKey, List<String>> routes, QuoteKey key) {
        return QuoteSelector.firstAvailable(routes.get(key), index.get(key)).orElse(null);
    }

    private static Map<QuoteKey, Map<String, CurrentQuote>> indexQuotes(
            Map<String, List<CurrentQuote>> fetchedByProvider) {
        Map<QuoteKey, Map<String, CurrentQuote>> index = new HashMap<>();
        fetchedByProvider.forEach((provider, quotes) -> {
            for (CurrentQuote quote : quotes) {
                if (quote == null || !quote.hasPositiveValue()) {
                    continue;
                }
                index.computeIfAbsent(new QuoteKey(quote.assetSymbol(), quote.currency()), ignored -> new HashMap<>())
                        .put(provider, quote);
            }
        });
        return index;
    }

    public record QuoteKey(String assetSymbol, String currency) {}

    public record CollectionResult(
            List<CurrentQuote> selected,
            Map<String, List<CurrentQuote>> fetchedByProvider,
            Map<QuoteKey, Map<String, CurrentQuote>> quotesByKey,
            Map<QuoteKey, List<String>> routeOrder,
            int recordsFetched,
            int successfulProviders,
            int failedProviders,
            int recordsRejected,
            List<String> errors) {}
}
