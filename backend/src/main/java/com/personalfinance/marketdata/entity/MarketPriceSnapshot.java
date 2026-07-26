package com.personalfinance.marketdata.entity;

import com.personalfinance.marketdata.MarketSymbol;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "market_price_snapshots")
public class MarketPriceSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private MarketSymbol symbol;

    @Column(nullable = false, precision = 20, scale = 4)
    private BigDecimal value;

    @Column(nullable = false, length = 8)
    private String currency;

    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt;

    @Column(nullable = false, length = 64)
    private String source;

    public Long getId() { return id; }
    public MarketSymbol getSymbol() { return symbol; }
    public BigDecimal getValue() { return value; }
    public String getCurrency() { return currency; }
    public Instant getRecordedAt() { return recordedAt; }
    public String getSource() { return source; }

    public void setSymbol(MarketSymbol symbol) { this.symbol = symbol; }
    public void setValue(BigDecimal value) { this.value = value; }
    public void setCurrency(String currency) { this.currency = currency; }
    public void setRecordedAt(Instant recordedAt) { this.recordedAt = recordedAt; }
    public void setSource(String source) { this.source = source; }
}
