package com.personalfinance.advisor;

import com.personalfinance.advisor.dto.AdvisorContextResponse.HoldingSummary;
import com.personalfinance.advisor.dto.AdvisorContextResponse.PortfolioSummary;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

class AdvisorPortfolioFingerprintTest {

    @Test
    void orderIndependentAndChangesWithAmount() {
        PortfolioSummary first = portfolio(holding("ACCOUNT", 1L, "نقد", 100L), holding("INVESTMENT", 2L, "طلا", 200L));
        PortfolioSummary swapped = portfolio(holding("INVESTMENT", 2L, "طلا", 200L), holding("ACCOUNT", 1L, "نقد", 100L));
        PortfolioSummary changed = portfolio(holding("ACCOUNT", 1L, "نقد", 150L), holding("INVESTMENT", 2L, "طلا", 200L));
        assertEquals(AdvisorPortfolioFingerprint.of(first), AdvisorPortfolioFingerprint.of(swapped));
        assertNotEquals(AdvisorPortfolioFingerprint.of(first), AdvisorPortfolioFingerprint.of(changed));
    }

    private static PortfolioSummary portfolio(HoldingSummary... holdings) {
        PortfolioSummary summary = new PortfolioSummary();
        summary.getHoldings().addAll(List.of(holdings));
        return summary;
    }

    private static HoldingSummary holding(String source, Long id, String name, long amount) {
        HoldingSummary row = new HoldingSummary();
        row.setSource(source);
        row.setId(id);
        row.setName(name);
        row.setAmountToman(amount);
        return row;
    }
}
