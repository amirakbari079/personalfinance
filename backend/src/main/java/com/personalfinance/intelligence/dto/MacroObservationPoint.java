package com.personalfinance.intelligence.dto;

import java.math.BigDecimal;

public class MacroObservationPoint {

    private String period;
    private BigDecimal value;

    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }

    public BigDecimal getValue() { return value; }
    public void setValue(BigDecimal value) { this.value = value; }
}
