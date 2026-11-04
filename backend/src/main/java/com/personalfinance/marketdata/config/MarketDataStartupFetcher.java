package com.personalfinance.marketdata.config;

import com.personalfinance.marketdata.service.MarketDataService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.scheduling.annotation.Async;

@Component
public class MarketDataStartupFetcher implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(MarketDataStartupFetcher.class);
    private final MarketDataService marketDataService;

    public MarketDataStartupFetcher(MarketDataService marketDataService) {
        this.marketDataService = marketDataService;
    }

    @Override
    @Async("fiExecutor")
    public void run(ApplicationArguments args) {
        try {
            marketDataService.fetchAllQuotes();
            marketDataService.refreshPortfolioStockQuotes();
            log.info("Initial market quotes fetched on startup");
        } catch (Exception e) {
            log.warn("Initial market quote fetch failed: {}", e.getMessage());
        }
    }
}
