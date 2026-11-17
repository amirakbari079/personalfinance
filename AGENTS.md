# PersonalFinance agent instructions

Read `docs/UI-GUARDRAILS.md` before any frontend, UI, UX, theme, chart, layout, or Persian copy change. The accepted visual baseline is Git tag `ui-baseline-2026-11-07` (commit `83bcf8a`). It is a quality floor to improve from, not a design to replace casually.

For UI work:

- State the concrete user problem and affected routes before editing.
- Preserve the current Persian RTL identity, right navigation rail, full-width desktop workspace, dense financial dashboard, charts, local Vazirmatn, Lucide icons, and all three dark palettes.
- Keep the cool green/blue/cyan direction. Do not add brown, beige, gold, or amber as decorative/brand colors. Amber/red remain valid only for semantic warning/error states.
- Use existing semantic tokens and shared components. Do not hard-code page-specific palettes or make a global restyle to fix one component.
- Treat stored theme choices and custom colors as user data; migrations must preserve genuine custom values.
- Capture the affected route with the same data before and after at 375, 768, and 1440 px. Check 1920 px for full-width pages. Compare hierarchy, density, alignment, contrast, overflow, and interaction states.
- A UI change is unfinished if it reduces information clarity, removes a useful visual, breaks a theme, introduces horizontal overflow, weakens keyboard/focus behavior, or lacks loading/empty/error states.
- Run `npm run typecheck`, `npm test`, and `npm run build` from `frontend/` after material UI changes. Record visual checks in the relevant docs.

For finance foundation/data work, also read `docs/FOUNDATION-PROGRESS.md` and `docs/FOUNDATION-OPERATIONS.md` when present. Never infer old transactions from snapshots or test against the production database.

For Phase 2 business accounting work, read `docs/BUSINESS-FINANCE-HANDOFF.md` first. It defines the owner's current scope and acceptance tests; the older Phase 2 sections of `REQUIREMENTS.md`, `ROADMAP.md`, and `ARCHITECTURE.md` are background where they differ.
