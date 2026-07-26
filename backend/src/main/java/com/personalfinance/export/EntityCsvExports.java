package com.personalfinance.export;

import com.personalfinance.account.dto.AccountResponse;
import com.personalfinance.account.dto.InvestmentResponse;
import com.personalfinance.common.CsvExportService;
import com.personalfinance.expense.dto.PendingExpenseResponse;
import com.personalfinance.income.dto.IncomeResponse;
import com.personalfinance.loan.dto.LoanResponse;
import com.personalfinance.receivable.dto.ReceivableResponse;
import com.personalfinance.standby.dto.StandbyResponse;

import java.util.List;

import static com.personalfinance.export.ExportLabels.*;

public final class EntityCsvExports {

    private EntityCsvExports() {}

    public static List<CsvExportService.CsvColumn<AccountResponse>> accountColumns() {
        return List.of(
                new CsvExportService.CsvColumn<>("شناسه", AccountResponse::getId),
                new CsvExportService.CsvColumn<>("دسته‌بندی", r -> CATEGORY_ASSET_FA),
                new CsvExportService.CsvColumn<>("نام", AccountResponse::getName),
                new CsvExportService.CsvColumn<>("نوع", r -> ACCOUNT_TYPE_FA.getOrDefault(r.getType(), r.getType().name())),
                new CsvExportService.CsvColumn<>("موجودی", AccountResponse::getBalance),
                new CsvExportService.CsvColumn<>("تاریخ ثبت موجودی", AccountResponse::getBalanceRecordedDate),
                new CsvExportService.CsvColumn<>("یادداشت", AccountResponse::getNotes),
                new CsvExportService.CsvColumn<>("کد بانک", AccountResponse::getBankCode),
                new CsvExportService.CsvColumn<>("تاریخ ایجاد", AccountResponse::getCreatedAt));
    }

    public static List<CsvExportService.CsvColumn<InvestmentResponse>> investmentColumns() {
        return List.of(
                new CsvExportService.CsvColumn<>("شناسه", InvestmentResponse::getId),
                new CsvExportService.CsvColumn<>("دسته‌بندی", r -> CATEGORY_ASSET_FA),
                new CsvExportService.CsvColumn<>("نام", InvestmentResponse::getName),
                new CsvExportService.CsvColumn<>("نوع", r -> INVESTMENT_TYPE_FA.getOrDefault(r.getAssetType(), r.getAssetType().name())),
                new CsvExportService.CsvColumn<>("مقدار", InvestmentResponse::getNativeAmount),
                new CsvExportService.CsvColumn<>("واحد", InvestmentResponse::getNativeUnit),
                new CsvExportService.CsvColumn<>("معادل تومان", InvestmentResponse::getTomanEquivalent),
                new CsvExportService.CsvColumn<>("تاریخ ثبت ارزش", InvestmentResponse::getValueRecordedDate),
                new CsvExportService.CsvColumn<>("یادداشت", InvestmentResponse::getNotes),
                new CsvExportService.CsvColumn<>("تاریخ ایجاد", InvestmentResponse::getCreatedAt));
    }

    public static List<CsvExportService.CsvColumn<LoanResponse>> loanColumns() {
        return List.of(
                new CsvExportService.CsvColumn<>("شناسه", LoanResponse::getId),
                new CsvExportService.CsvColumn<>("دسته‌بندی", r -> CATEGORY_LIABILITY_FA),
                new CsvExportService.CsvColumn<>("طلبکار", LoanResponse::getCreditor),
                new CsvExportService.CsvColumn<>("مبلغ قسط", LoanResponse::getMonthlyAmount),
                new CsvExportService.CsvColumn<>("تعداد اقساط", LoanResponse::getTotalInstallments),
                new CsvExportService.CsvColumn<>("اقساط پرداخت‌شده", LoanResponse::getPaidInstallments),
                new CsvExportService.CsvColumn<>("مانده", LoanResponse::getRemainingAmount),
                new CsvExportService.CsvColumn<>("تاریخ شروع", LoanResponse::getStartDate),
                new CsvExportService.CsvColumn<>("یادداشت", LoanResponse::getNotes),
                new CsvExportService.CsvColumn<>("تاریخ ایجاد", LoanResponse::getCreatedAt));
    }

    public static List<CsvExportService.CsvColumn<PendingExpenseResponse>> pendingExpenseColumns() {
        return List.of(
                new CsvExportService.CsvColumn<>("شناسه", PendingExpenseResponse::getId),
                new CsvExportService.CsvColumn<>("دسته‌بندی", r -> CATEGORY_LIABILITY_FA),
                new CsvExportService.CsvColumn<>("عنوان", PendingExpenseResponse::getLabel),
                new CsvExportService.CsvColumn<>("مبلغ", PendingExpenseResponse::getPlannedAmount),
                new CsvExportService.CsvColumn<>("سررسید", PendingExpenseResponse::getDueDate),
                new CsvExportService.CsvColumn<>("یادداشت", PendingExpenseResponse::getNotes),
                new CsvExportService.CsvColumn<>("تاریخ ایجاد", PendingExpenseResponse::getCreatedAt));
    }

    public static List<CsvExportService.CsvColumn<ReceivableResponse>> receivableColumns() {
        return List.of(
                new CsvExportService.CsvColumn<>("شناسه", ReceivableResponse::getId),
                new CsvExportService.CsvColumn<>("دسته‌بندی", r -> CATEGORY_ASSET_FA),
                new CsvExportService.CsvColumn<>("بدهکار", ReceivableResponse::getDebtorName),
                new CsvExportService.CsvColumn<>("مبلغ اصلی", ReceivableResponse::getOriginalAmount),
                new CsvExportService.CsvColumn<>("دریافت‌شده", ReceivableResponse::getReceivedAmount),
                new CsvExportService.CsvColumn<>("مانده", ReceivableResponse::getOutstanding),
                new CsvExportService.CsvColumn<>("تاریخ ایجاد بدهی", ReceivableResponse::getCreatedDate),
                new CsvExportService.CsvColumn<>("یادداشت", ReceivableResponse::getNotes),
                new CsvExportService.CsvColumn<>("تاریخ ثبت", ReceivableResponse::getCreatedAt));
    }

    public static List<CsvExportService.CsvColumn<StandbyResponse>> standbyColumns() {
        return List.of(
                new CsvExportService.CsvColumn<>("شناسه", StandbyResponse::getId),
                new CsvExportService.CsvColumn<>("دسته‌بندی", r -> CATEGORY_ASSET_FA),
                new CsvExportService.CsvColumn<>("عنوان", StandbyResponse::getItemLabel),
                new CsvExportService.CsvColumn<>("تعداد", StandbyResponse::getQuantity),
                new CsvExportService.CsvColumn<>("قیمت واحد", StandbyResponse::getExpectedUnitPrice),
                new CsvExportService.CsvColumn<>("ارزش کل", StandbyResponse::getTotalValue),
                new CsvExportService.CsvColumn<>("تاریخ ثبت", StandbyResponse::getDateAdded),
                new CsvExportService.CsvColumn<>("یادداشت", StandbyResponse::getNotes),
                new CsvExportService.CsvColumn<>("تاریخ ایجاد", StandbyResponse::getCreatedAt));
    }

    public static List<CsvExportService.CsvColumn<IncomeResponse>> incomeColumns() {
        return List.of(
                new CsvExportService.CsvColumn<>("شناسه", IncomeResponse::getId),
                new CsvExportService.CsvColumn<>("دسته‌بندی", r -> CATEGORY_INCOME_FA),
                new CsvExportService.CsvColumn<>("منبع", IncomeResponse::getSource),
                new CsvExportService.CsvColumn<>("مبلغ", IncomeResponse::getAmount),
                new CsvExportService.CsvColumn<>("نوع", r -> INCOME_TYPE_FA.getOrDefault(r.getIncomeType(), r.getIncomeType().name())),
                new CsvExportService.CsvColumn<>("تاریخ دریافت", IncomeResponse::getReceivedDate),
                new CsvExportService.CsvColumn<>("یادداشت", IncomeResponse::getNotes),
                new CsvExportService.CsvColumn<>("تاریخ ایجاد", IncomeResponse::getCreatedAt));
    }
}
