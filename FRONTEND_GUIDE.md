# Frontend Quick Guide

پروژه فرانت: `frontend/` (Next.js + Tailwind)

قبل از هر تسک UI/Style همین فایل را بخوان و فقط مسیرهای مرتبط را ویرایش کن.

## 1) نقشه سریع

| موضوع | مسیر |
|--------|------|
| توکن‌های تم | `frontend/src/app/globals.css` (`:root` و `.dark`) |
| هدر و ناوبری | `frontend/shared/AppShell.tsx` + کلاس‌های `.app-header-glass` / `.app-nav-link` |
| داشبورد | `frontend/features/dashboard/DashboardPage.tsx` |
| تم / رنگ سفارشی | `frontend/shared/ThemeProvider.tsx` · `frontend/shared/theme/colors.ts` |
| Tailwind tokens | `frontend/tailwind.config.ts` |

## 2) Design tokens مهم

- سطح صفحه: `--color-surface`
- کارت/گلس: `--color-glass`, `--color-glass-border`, `.glass-card`
- اکسنت: `--color-brand-accent`
- هدر (هماهنگ با تم): `--color-header-bg`, `--color-header-text`, `--color-header-border`
- ناوبری: `.app-nav-pill`, `.app-nav-link`, `.app-nav-link--active`

## 3) قوانین کیفیت (اجباری)

- در تم روشن، هدر نباید تیره بماند؛ از `--color-header-*` استفاده کن.
- روی هاور/اکتیو ناوبری `font-weight` را عوض نکن (باعث لرزش عرض می‌شود).
- برای ناوبری اسکرول‌بار ظاهرشونده نگذار (layout shift).
- تغییرات UI را موضعی نگه دار؛ اول توکن، بعد کامپوننت.

## 4) پلی‌بوک

| درخواست | کجا |
|---------|-----|
| رنگ هدر / تم روشن | `:root` و `.dark` → `--color-header-*` |
| لرزش منو | `.app-nav-link` در `globals.css` |
| چیدمان داشبورد | `DashboardPage.tsx` |
| رنگ کل اپ | `:root` / Settings colors |

## 5) چک‌لیست

- [ ] تم روشن و تیره هر دو هماهنگ‌اند
- [ ] هاور منو بدون جابه‌جایی
- [ ] RTL و موبایل درست است
