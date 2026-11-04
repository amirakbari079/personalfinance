package com.personalfinance.intelligence.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class AssetHistoryResponse {

    private String symbol;
    private String currency;
    private String range;
    private List<Point> points = new ArrayList<>();

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getRange() { return range; }
    public void setRange(String range) { this.range = range; }

    public List<Point> getPoints() { return points; }
    public void setPoints(List<Point> points) { this.points = points; }

    public static class Point {
        private String tradeDate;
        private String tradeDateJalali;
        private BigDecimal open;
        private BigDecimal high;
        private BigDecimal low;
        private BigDecimal close;

        public String getTradeDate() { return tradeDate; }
        public void setTradeDate(String tradeDate) { this.tradeDate = tradeDate; }

        public String getTradeDateJalali() { return tradeDateJalali; }
        public void setTradeDateJalali(String tradeDateJalali) { this.tradeDateJalali = tradeDateJalali; }

        public BigDecimal getOpen() { return open; }
        public void setOpen(BigDecimal open) { this.open = open; }

        public BigDecimal getHigh() { return high; }
        public void setHigh(BigDecimal high) { this.high = high; }

        public BigDecimal getLow() { return low; }
        public void setLow(BigDecimal low) { this.low = low; }

        public BigDecimal getClose() { return close; }
        public void setClose(BigDecimal close) { this.close = close; }
    }
}
