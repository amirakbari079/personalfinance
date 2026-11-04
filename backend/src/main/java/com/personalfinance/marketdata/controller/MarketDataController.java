package com.personalfinance.marketdata.controller;

import com.personalfinance.common.ApiResponse;
import com.personalfinance.marketdata.MarketSymbol;
import com.personalfinance.marketdata.dto.BourseInstrumentDto;
import com.personalfinance.marketdata.dto.BourseInstrumentQuoteDto;
import com.personalfinance.marketdata.dto.BourseWatchlistRequest;
import com.personalfinance.marketdata.dto.MarketCalcResponse;
import com.personalfinance.marketdata.dto.MarketHistoryPointDto;
import com.personalfinance.marketdata.dto.MarketQuoteDto;
import com.personalfinance.marketdata.dto.PortfolioStockQuoteDto;
import com.personalfinance.marketdata.service.MarketDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/market")
public class MarketDataController {

    private final MarketDataService marketDataService;

    public MarketDataController(MarketDataService marketDataService) {
        this.marketDataService = marketDataService;
    }

    @GetMapping("/quotes")
    public ResponseEntity<ApiResponse<List<MarketQuoteDto>>> getQuotes() {
        return ResponseEntity.ok(ApiResponse.ok(marketDataService.getQuotes()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<List<MarketQuoteDto>>> refreshQuotes() {
        return ResponseEntity.ok(ApiResponse.ok(marketDataService.refreshQuotes()));
    }

    @GetMapping("/portfolio-stocks")
    public ResponseEntity<ApiResponse<List<PortfolioStockQuoteDto>>> getPortfolioStocks() {
        return ResponseEntity.ok(ApiResponse.ok(marketDataService.getPortfolioStockQuotes()));
    }

    @PostMapping("/portfolio-stocks/refresh")
    public ResponseEntity<ApiResponse<List<PortfolioStockQuoteDto>>> refreshPortfolioStocks() {
        return ResponseEntity.ok(ApiResponse.ok(marketDataService.refreshPortfolioStockQuotes()));
    }

    @GetMapping("/instruments/search")
    public ResponseEntity<ApiResponse<List<BourseInstrumentDto>>> searchInstruments(
            @RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.ok(marketDataService.searchInstruments(q)));
    }

    @PostMapping("/instruments/quotes")
    public ResponseEntity<ApiResponse<List<BourseInstrumentQuoteDto>>> getWatchlistQuotes(
            @RequestBody BourseWatchlistRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(marketDataService.getWatchlistQuotes(request)));
    }

    @GetMapping("/history/{symbol}")
    public ResponseEntity<ApiResponse<List<MarketHistoryPointDto>>> getHistory(
            @PathVariable MarketSymbol symbol,
            @RequestParam(required = false) Instant from) {
        Instant fromInstant = from != null ? from : marketDataService.currentJalaliMonthStart();
        return ResponseEntity.ok(ApiResponse.ok(marketDataService.getHistory(symbol, fromInstant)));
    }

    @GetMapping("/calc")
    public ResponseEntity<ApiResponse<MarketCalcResponse>> calculate(
            @RequestParam String type,
            @RequestParam BigDecimal amount,
            @RequestParam(required = false) String unit,
            @RequestParam(required = false) String etf,
            @RequestParam(required = false) BigDecimal priceOverride) {
        return ResponseEntity.ok(ApiResponse.ok(
                marketDataService.calculate(type, amount, unit, etf, priceOverride)));
    }
}
