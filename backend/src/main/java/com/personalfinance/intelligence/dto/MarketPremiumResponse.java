package com.personalfinance.intelligence.dto;

import java.math.BigDecimal;

public class MarketPremiumResponse {

    private BigDecimal usdtPremiumPercent;
    private BigDecimal paxgPremiumPercent;

    public BigDecimal getUsdtPremiumPercent() { return usdtPremiumPercent; }
    public void setUsdtPremiumPercent(BigDecimal usdtPremiumPercent) { this.usdtPremiumPercent = usdtPremiumPercent; }

    public BigDecimal getPaxgPremiumPercent() { return paxgPremiumPercent; }
    public void setPaxgPremiumPercent(BigDecimal paxgPremiumPercent) { this.paxgPremiumPercent = paxgPremiumPercent; }
}
