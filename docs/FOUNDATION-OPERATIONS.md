# راهنمای کوتاه توسعه و عملیات

## محدوده و ایمنی داده
- تغییرات UI رنگی و تمام‌عرض به frontend معمولی روی پورت 3000 با backend اصلی 8080 رسیده‌اند؛ branch `codex/cool-wide-layout` و commit `83bcf8a`. فقط UI است؛ APIهای foundation یا صفحهٔ تراکنش جدید ندارد.
- پایگاه تولید `personalfinance` را برای تست استفاده نکنید. هنوز هیچ migration یا deploy تولیدی انجام نشده است.
- پایگاه آزمون integration برابر `personalfinance_foundation_integration_test` است.
- `personalfinance_foundation_test` نسخهٔ جداگانه‌ای از بکاپ اولیه است؛ با integration test یکی نیست.
- هیچ تراکنش تاریخی را از snapshotهای قدیمی حدس نزنید؛ snapshotهای قدیمی فقط خواندنی‌اند.
- بکاپ قدیمی یا ناقص را پیش از ارتقای جداگانه روی داده‌های جدیدتر restore نکنید.
- پیش از جایگزینی داده، بکاپ ایمنی گرفته می‌شود؛ restore ناموفق باید تغییرات را rollback کند.

## حساب و دفترکل
- حذف حساب، آن را بایگانی می‌کند و به version و ماندهٔ صفر نیاز دارد.
- بازیابی حساب: `POST /api/v1/accounts/{id}/restore?version=`.
- تغییر صرفاً metadata حساب نیز version می‌خواهد.
- تغییر مانده فقط از `/api/v1/ledger/adjustments` انجام شود؛ reason، requestKey و expectedVersion لازم‌اند.
- snapshotهای legacy حساب برای نوشتن بسته‌اند؛ تاریخچهٔ مالی از آن‌ها ساخته نشود.
- V26 جدول `pf_restore_events` را برای ثبت عملیاتی‌ای دارد که از restore منطقی باقی می‌ماند.
- حذف audit تکراری فقط در محدودهٔ تراکنش restore مهار می‌شود؛ ردیف‌های اصلی audit باید عیناً بازگردند.

## بکاپ و restore
- فایل بکاپ باید جدول‌ها، ستون‌ها و شمارش‌های کامل و منطبق داشته باشد؛ اعتبارسنجی پیش از هر تغییر داده انجام می‌شود.
- restore جدول‌های مقصد را قفل می‌کند، بکاپ ایمنی را با همان اتصال می‌گیرد، FKها را موقتاً به تعویق می‌اندازد و پیش از commit اعتبارسنجی می‌کند.
- JSONB و UUID باید با binding نوع‌دار ذخیره شوند.
- نام جدید بکاپ زمان میلی‌ثانیه و مقدار تصادفی دارد؛ فایل قبلی overwrite نمی‌شود. نام‌های قدیمی همچنان پذیرفته می‌شوند.
- ترتیب بازگردانی باید وابستگی FK، از جمله ارجاع routeها به assetها، را رعایت کند.

## آزمون ایزوله
- اجرای آزمون‌های foundation:
  `scripts/test-foundation.ps1 -MavenPath 'E:/Ai Agent Project/PersonalFinance/tools/maven/bin/mvn.cmd' -EnvFile 'E:/Ai Agent Project/PersonalFinance/.env' -Tests '*Test'`
- قبل از اجرا، مطمئن شوید اسکریپت به `personalfinance_foundation_integration_test` وصل است.
- مجموعهٔ کامل backend: ۶۷ تست، بدون failure/error/skip؛ شامل ۱۰ تست Ledger و آزمون roundtrip، رد بکاپ ناقص و rollback خطای FK.
- typecheck، production build و ۹ تست frontend موفق‌اند. بررسی مرورگر در ۳۷۵/۷۶۸/۱۴۴۰/۱۹۲۰ پیکسل overflow افقی یا خطای مرورگر نداشت.
- preview foundation روی پورت‌های 3100/8180 جدا و فقط با دادهٔ آزمایشی است و متوقف خواهد شد. هیچ تغییر پایگاه دادهٔ تولید یا انتشار foundation انجام نشده؛ roadmap همچنان ناتمام است.
- برای کارهای عادی مستندات و قالب‌بندی، مدل سبک و هزینهٔ پایین کافی است؛ تغییرات مالی و بازیابی نیازمند بازبینی دقیق‌اند.
