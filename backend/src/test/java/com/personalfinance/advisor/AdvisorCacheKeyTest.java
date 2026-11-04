package com.personalfinance.advisor;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

class AdvisorCacheKeyTest {

    @Test
    void sameDecisionIsOrderIndependent() {
        String a = AdvisorCacheKey.decisionKey("BTC,GOLD_18K", "6M", "MODERATE", 500_000_000L, "طلا یا بیت‌کوین؟");
        String b = AdvisorCacheKey.decisionKey("gold_18k, btc", "6m", "moderate", 500_000_000L, "  طلا   یا بیت‌کوین؟ ");
        assertEquals(a, b);
    }

    @Test
    void snapshotAndPromptChangeTheCacheKey() {
        String decision = AdvisorCacheKey.decisionKey("USD", "1Y", "CONSERVATIVE", null, "دلار نگه دارم؟");
        String first = AdvisorCacheKey.cacheKey(decision, 10L, "1.0");
        String newerSnapshot = AdvisorCacheKey.cacheKey(decision, 11L, "1.0");
        String newerPrompt = AdvisorCacheKey.cacheKey(decision, 10L, "1.1");
        assertNotEquals(first, newerSnapshot);
        assertNotEquals(first, newerPrompt);
    }

    @Test
    void portfolioChangesTheDecisionKey() {
        String without = AdvisorCacheKey.decisionKey("GOLD_18K", "6M", "MODERATE", 100L, "چه کار کنم؟", "-");
        String with = AdvisorCacheKey.decisionKey("GOLD_18K", "6M", "MODERATE", 100L, "چه کار کنم؟", "account:1:نقد:100");
        assertNotEquals(without, with);
    }

    @Test
    void summarizeTruncatesWithoutInventingContent() {
        String summary = AdvisorCacheKey.summarize("  الف  " + "ب".repeat(400));
        assertEquals(280, summary.length());
        assertEquals("...", summary.substring(277));
    }
}
