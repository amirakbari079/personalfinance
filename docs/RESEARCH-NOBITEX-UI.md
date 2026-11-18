# Nobitex panel UI research (patterns only)

Source: logged-in `https://nobitex.ir/panel/` inspected via browser CDP + Next.js chunk scan (2026-11-12).  
No account balances, cookies, or private API payloads are stored here.

**Constraint:** borrow motion/structure ideas only. Keep PersonalFinance cool green/blue/cyan accents; do not adopt Nobitex purple as brand, and do not reintroduce brown/beige/gold decoration.

## Stack signals

| Area | Finding |
|------|---------|
| App | Next.js App Router (`__next_f`, `/_next/static/chunks`, RSC `?_rsc=`) |
| RTL | `dir=rtl`, Vazir font family |
| Motion (numbers) | **`number-flow` / `number-flow-react`** (digit-slot roll) |
| Motion (UI) | `@react-spring/web` (`useSpring`, `useTransition`), Motion One / Framer Motion in chunks |
| Carousel | Swiper |
| Toasts | react-toastify |
| Styling | Tailwind + semantic CSS variables (`--bg-surface-*`, `--txt-*`, `--radius-*`) |

## Highest-value pattern: rolling balance digits

The “عدد می‌چرخه” effect is **Number Flow**, not a custom CSS keyframe.

Evidence from production chunk:

- Custom element: `number-flow-react`
- CSS vars: `--_number-flow-d`, `--_number-flow-d-opacity`, `--_number-flow-d-width`, `--_number-flow-dx`
- Public theming hooks: `--number-flow-char-height`, `--number-flow-mask-height`, `--number-flow-mask-width`
- Host styles: `direction: ltr` (numbers stay LTR inside RTL page), per-digit overflow mask, opacity/width transitions
- Defaults recovered from bundle:
  - `transformTiming.duration ≈ 900ms` with dense `linear(...)` easing
  - `opacityTiming: { duration: 450, easing: "ease-out" }`
  - `animated: true`
  - `trend: (prev, next) => Math.sign(next - prev)`
  - `respectMotionPreference: true` (honors `prefers-reduced-motion`)

**PF recommendation:** add `@number-flow/react` for dashboard net-worth / total-balance / large KPI numbers. Keep formatting as integer Toman with commas; wrap in LTR for digits.

```tsx
import NumberFlow from '@number-flow/react'

<NumberFlow
  value={totalToman}
  locales="en-US"
  format={{ useGrouping: true, maximumFractionDigits: 0 }}
  respectMotionPreference
/>
```

Ask before adding the dependency (project rule).

## Layout patterns useful for PF

1. **Balance hero strip**
   - Large `headline-medium` (≈24px / 700) total
   - Eye toggle (privacy mask)
   - Compact secondary actions (واریز / خرید) beside the number on mobile
   - Surface card: `bg-surface-1`, thin neutral border, medium radius, dense padding

2. **Responsive shell**
   - Mobile: bottom tab bar (خانه / بازارها / معامله / کیف پول)
   - Desktop: rail + `max-w-[1920px]` full workspace (`desktop:w-[calc(100%-56px)]`)
   - Separate mobile/desktop trees (`desktop:hidden` / desktop-only)

3. **Quick-action icon grid**
   - 4×2 feature tiles with optional badge chips (جدید / 10X)
   - “همه امکانات” overflow link

4. **Promo / insight carousel**
   - Swiper with dots + chevrons
   - Useful for PF tips / month summary — keep cool accents only

5. **Market/list tabs**
   - Segmented chips: داغ‌ترین‌ها / علاقه‌ها / رشد / افت / جدیدترین‌ها
   - Maps well to PF filters (هزینه / درآمد / حساب)

## Design tokens worth mirroring (structure, not purple)

Surfaces (dark):

- `--bg-surface-0: #000`
- `--bg-surface-1: #101214`
- `--bg-surface-2: #15191c`
- `--bg-surface-3: #1b2024`

Success / gain scale (good for charts; cool green already aligned with PF):

- rest ≈ `#189570` / `#32a180`
- tree-gain steps `#427969` → `#041c15`

Radii: small `.1875rem` → medium `.375rem` → large `.5625rem` → xLarge `.75rem`

Typography scale uses named roles (`headline-medium`, `body-*`, `caption-*`) rather than one-off sizes.

**Do not copy:** `--bg-primary-default-rest: #966bed` purple brand into PF.

## Micro-interactions also present

- Spring press/scale on icon buttons (`tension≈350`, short duration)
- Drawer/sheet slide with spring (`translateX` + opacity)
- Toast slide/fade
- Skeleton shimmer tokens on neutral surfaces

## REA note

`https://rea.tools/` (`rea-agents`) was not installed in this environment yet (`npx rea-agents@latest` hung / engine mismatch). This pass used browser CDP + chunk analysis instead. Optional follow-up: `npx rea-agents@latest setup` after Node engine check, then deeper JS source mapping.

## Suggested PF rollout (guardrail-safe)

1. Spike Number Flow on dashboard total / net worth only (separate branch).
2. Preserve existing themes, RTL rail, charts, and cool accents.
3. Screenshot before/after at 375 / 768 / 1440 / 1920.
4. Run `typecheck`, `test`, `build`.
5. Only then consider privacy-eye, denser balance card, or quick-action grid improvements.

## Implemented (branch `codex/number-flow-hover`)

- Dependency: `@number-flow/react`
- Shared wrapper: `frontend/shared/AnimatedToman.tsx`
- Chart hover → animated amount: `TrendExplorer` + `WealthChart`, `TrendLineChart`, `BalanceSummaryPanel` + `BalanceTrendChart`
- Also: dashboard hero net worth, `TotalFooter` totals
- Fix: never use `fa-IR` / Eastern digits with Number Flow — causes `--current: NaN` and only `٬` separators show. Use `en-US` + Latin digits.
