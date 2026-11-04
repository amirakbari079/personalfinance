package com.personalfinance.advisor;

import com.personalfinance.advisor.dto.AdvisorContextResponse;
import com.personalfinance.advisor.llm.AdvisorLlmResult;
import com.personalfinance.advisor.llm.FakeAdvisorLlmClient;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

class FakeAdvisorLlmClientTest {

    @Test
    void doesNotInventPricesAndBindsSnapshot() {
        AdvisorContextResponse context = new AdvisorContextResponse();
        context.setMarketSnapshotId(42L);
        context.setOpenConflictCount(1);
        AdvisorContextResponse.PortfolioSummary portfolio = new AdvisorContextResponse.PortfolioSummary();
        portfolio.setTotalToman(500_000_000L);
        AdvisorContextResponse.HoldingSummary holding = new AdvisorContextResponse.HoldingSummary();
        holding.setName("نقد");
        portfolio.getHoldings().add(holding);
        context.setPortfolio(portfolio);
        AdvisorLlmResult result = new FakeAdvisorLlmClient().complete(context, "طلا بخرم؟", "system");
        assertTrue(result.fake());
        assertTrue(result.text().contains("42"));
        assertTrue(result.text().contains("فعال نیست"));
        assertTrue(result.text().contains("500000000"));
        assertTrue(result.text().contains("اقلام پرتفوی: 1"));
    }
}
