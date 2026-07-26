package com.personalfinance.export;

import com.personalfinance.account.entity.AccountType;
import com.personalfinance.account.entity.InvestmentType;
import com.personalfinance.income.entity.IncomeType;

import java.util.Map;

public final class ExportLabels {

    private ExportLabels() {}

    public static final String CATEGORY_ASSET = "asset";
    public static final String CATEGORY_LIABILITY = "liability";
    public static final String CATEGORY_INCOME = "income";

    public static final String CATEGORY_ASSET_FA = "دارایی";
    public static final String CATEGORY_LIABILITY_FA = "بدهی";
    public static final String CATEGORY_INCOME_FA = "درآمد";

    public static final Map<AccountType, String> ACCOUNT_TYPE_FA = Map.of(
            AccountType.BANK, "بانکی",
            AccountType.DIGITAL_WALLET, "کیف پول دیجیتال",
            AccountType.EXCHANGE, "صرافی",
            AccountType.CASH, "نقد",
            AccountType.OTHER, "سایر"
    );

    public static final Map<InvestmentType, String> INVESTMENT_TYPE_FA = Map.of(
            InvestmentType.STOCK, "سهام / صندوق",
            InvestmentType.GOLD, "طلا",
            InvestmentType.CRYPTO, "ارز دیجیتال",
            InvestmentType.FOREIGN_CURRENCY, "ارز خارجی",
            InvestmentType.OTHER, "سایر"
    );

    public static final Map<IncomeType, String> INCOME_TYPE_FA = Map.of(
            IncomeType.RECURRING, "ماهانه",
            IncomeType.ONE_OFF, "یک‌باره"
    );

    public static String nullSafe(String value) {
        return value == null ? "" : value;
    }
}
