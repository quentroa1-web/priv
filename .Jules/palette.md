# Palette's Journal

## 2025-05-15 - [React Version Mismatch & Accessibility Patterns]
**Learning:** Found that a mismatch between `react` and `react-dom` versions (e.g., 19.2.3 vs 19.2.4) can cause the application to crash with a cryptic "Minified React error #527" in production builds. Additionally, identified that localized ARIA labels are essential for icon-only buttons in multi-language apps to ensure screen reader compatibility across all supported locales.

**Action:** Always verify that `react` and `react-dom` versions match in `package.json` if encountering blank screens in builds. For icon-only buttons, use `t()` with descriptive keys for ARIA labels. For dynamic buttons (like Wallet), ensure the ARIA label includes the current value (e.g., balance) to keep the information accessible.

## 2026-02-25 - [Async State & Accessibility for Edit/Save Buttons]
**Learning:** Profile save action had no loading states causing user uncertainty during async saves. Missing `aria-busy` and `aria-hidden` attributes failed to convey button's state to screen readers.

**Action:** Always wrap async form save actions with `isSaving` state. Provide `disabled` states + `aria-busy` when processing, and add `focus-visible` ring indicators for explicit keyboard navigation feedback. Use `<Loader2 />` from Lucide to communicate async operations visually.
