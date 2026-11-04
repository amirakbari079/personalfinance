package com.personalfinance.advisor.llm;

import com.personalfinance.advisor.dto.AdvisorContextResponse;

public class FakeAdvisorLlmClient implements AdvisorLlmClient {

    public static final String MODEL = "FAKE";

    @Override
    public AdvisorLlmResult complete(AdvisorContextResponse context, String question, String systemPrompt) {
        long snapshotId = context.getMarketSnapshotId() == null ? 0 : context.getMarketSnapshotId();
        int assets = context.getAssets() == null ? 0 : context.getAssets().size();
        long portfolioTotal = context.getPortfolio() == null ? 0 : context.getPortfolio().getTotalToman();
        int holdings = context.getPortfolio() == null || context.getPortfolio().getHoldings() == null
                ? 0
                : context.getPortfolio().getHoldings().size();
        boolean stale = context.getFreshness() != null && context.getFreshness().isMarketStale();
        String text = "مشاور هوشمند فعال نیست چون کلید LLM تنظیم نشده. "
                + "اسنپ‌شات بازار: " + snapshotId
                + "؛ تعداد دارایی بازار در کانتکست: " + assets
                + "؛ اقلام پرتفوی: " + holdings
                + "؛ جمع پرتفوی: " + portfolioTotal + " تومان"
                + "؛ تعارض باز: " + context.getOpenConflictCount()
                + (stale ? "؛ داده پیش‌زمینه ممکن است کهنه باشد" : "؛ داده پیش‌زمینه از نظر تازگی قابل استفاده است")
                + ". قیمت‌ها و موجودی را از همین کانتکست بخوانید و عدد جدید نسازید.";
        return new AdvisorLlmResult(MODEL, text, true, "FAKE");
    }
}
