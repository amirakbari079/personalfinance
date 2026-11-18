package com.personalfinance.business;

import com.personalfinance.business.dto.BizSummaryResponse;
import com.personalfinance.business.entity.BizAccount;
import com.personalfinance.business.entity.BizCounterparty;
import com.personalfinance.business.entity.BizProduct;
import com.personalfinance.business.repository.BizAccountRepository;
import com.personalfinance.business.repository.BizCounterpartyRepository;
import com.personalfinance.business.repository.BizProductRepository;
import com.personalfinance.business.service.BizSummaryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class BizSummaryServiceTest {

    private BizAccountRepository accountRepository;
    private BizProductRepository productRepository;
    private BizCounterpartyRepository counterpartyRepository;
    private BizSummaryService summaryService;

    @BeforeEach
    void setUp() {
        accountRepository = Mockito.mock(BizAccountRepository.class);
        productRepository = Mockito.mock(BizProductRepository.class);
        counterpartyRepository = Mockito.mock(BizCounterpartyRepository.class);
        summaryService = new BizSummaryService(accountRepository, productRepository, counterpartyRepository);
    }

    @Test
    void summaryAggregatesActiveBalancesWithoutAlteringPersonalFinance() {
        when(accountRepository.sumOpeningBalanceActive()).thenReturn(25_000_000L);
        when(productRepository.findByIsActiveTrueOrderByCreatedAtDesc()).thenReturn(List.of(new BizProduct(), new BizProduct()));
        when(counterpartyRepository.findByIsActiveTrueOrderByCreatedAtDesc()).thenReturn(List.of(new BizCounterparty()));

        BizSummaryResponse summary = summaryService.getSummary(LocalDate.now().minusDays(15), LocalDate.now());

        assertNotNull(summary);
        assertEquals(25_000_000L, summary.getCashLiquidity());
        assertEquals(0L, summary.getSalesTotal());
        assertEquals(0L, summary.getGrossProfit());
        assertEquals(2, summary.getActiveProductsCount());
        assertEquals(1, summary.getActiveCounterpartiesCount());
        assertTrue(summary.getCalculationDefinitions().containsKey("نقدینگی فروشگاه"));
        assertTrue(summary.getCalculationDefinitions().containsKey("سود ناخالص"));
    }
}
