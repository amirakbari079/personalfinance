package com.personalfinance.business.service;

import com.personalfinance.business.dto.BizSummaryResponse;
import com.personalfinance.business.repository.BizAccountRepository;
import com.personalfinance.business.repository.BizCounterpartyRepository;
import com.personalfinance.business.repository.BizProductRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class BizSummaryService {

    private final BizAccountRepository accountRepository;
    private final BizProductRepository productRepository;
    private final BizCounterpartyRepository counterpartyRepository;

    public BizSummaryService(BizAccountRepository accountRepository,
                             BizProductRepository productRepository,
                             BizCounterpartyRepository counterpartyRepository) {
        this.accountRepository = accountRepository;
        this.productRepository = productRepository;
        this.counterpartyRepository = counterpartyRepository;
    }

    public BizSummaryResponse getSummary(LocalDate startDate, LocalDate endDate) {
        LocalDate now = LocalDate.now();
        LocalDate start = (startDate != null) ? startDate : now.minusDays(30);
        LocalDate end = (endDate != null) ? endDate : now;

        BizSummaryResponse response = new BizSummaryResponse();
        response.setPeriod("۳۰ روز اخیر");
        response.setStartDate(start);
        response.setEndDate(end);
        response.setAsOfDate(now);

        // Sales and Gross profit (in Step 1, purchase/sales ledgers are in subsequent steps)
        response.setSalesTotal(0L);
        response.setGrossProfit(0L);

        // Cash liquidity in business accounts (opening balance + movements)
        Long cashLiquidity = accountRepository.sumOpeningBalanceActive();
        response.setCashLiquidity(cashLiquidity != null ? cashLiquidity : 0L);

        // Receivables and Payables (Step 1 base)
        response.setReceivables(0L);
        response.setPayables(0L);

        // Inventory value (Step 1 base)
        response.setInventoryValue(0L);

        // Entity counts
        response.setActiveProductsCount(productRepository.findByIsActiveTrueOrderByCreatedAtDesc().size());
        response.setActiveCounterpartiesCount(counterpartyRepository.findByIsActiveTrueOrderByCreatedAtDesc().size());
        response.setActiveAccountsCount(accountRepository.findByIsActiveTrueOrderByCreatedAtDesc().size());

        // Calculation Definitions for transparency
        Map<String, String> definitions = new LinkedHashMap<>();
        definitions.put("نقدینگی فروشگاه", "جمع ماندهٔ فعال صندوق‌ها، بانک‌ها و کیف‌پول‌های تجاری (جدا از حساب‌های شخصی)");
        definitions.put("فروش بازه", "مبلغ خالص فروش‌های قطعی نهایی‌شده در بازهٔ انتخابی");
        definitions.put("سود ناخالص", "مبلغ خالص فروش منهای بهای تمام‌شده بر مبنای میانگین موزون متحرک انبار");
        definitions.put("مطالبات تجاری", "مانده طلب از مشتریان بر اساس فاکتورهای نهایی و دریافت‌ها");
        definitions.put("بدهی‌های تجاری", "مانده بدهی به تأمین‌کنندگان بر اساس فاکتورهای خرید نهایی و پرداخت‌ها");
        definitions.put("ارزش انبار", "جمع جبری ارزش ریالی موجودی کالاها بر مبنای بهای میانگین");

        response.setCalculationDefinitions(definitions);
        return response;
    }
}
