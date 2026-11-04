package com.personalfinance.marketdata.dto;

import java.util.List;

public record BourseWatchlistRequest(List<WatchlistItem> items) {

    public record WatchlistItem(String insCode, String symbol, String name) {}
}
