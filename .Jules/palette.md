# Palette's Journal

## 2025-05-15 - [React Version Mismatch & Accessibility Patterns]
**Learning:** Found that a mismatch between `react` and `react-dom` versions (e.g., 19.2.3 vs 19.2.4) can cause the application to crash with a cryptic "Minified React error #527" in production builds. Additionally, identified that localized ARIA labels are essential for icon-only buttons in multi-language apps to ensure screen reader compatibility across all supported locales.

**Action:** Always verify that `react` and `react-dom` versions match in `package.json` if encountering blank screens in builds. For icon-only buttons, use `t()` with descriptive keys for ARIA labels. For dynamic buttons (like Wallet), ensure the ARIA label includes the current value (e.g., balance) to keep the information accessible.

## 2026-02-25 - [Async State & Accessibility for Edit/Save Buttons]
**Learning:** Profile save action had no loading states causing user uncertainty during async saves. Missing `aria-busy` and `aria-hidden` attributes failed to convey button's state to screen readers.

**Action:** Always wrap async form save actions with `isSaving` state. Provide `disabled` states + `aria-busy` when processing, and add `focus-visible` ring indicators for explicit keyboard navigation feedback. Use `<Loader2 />` from Lucide to communicate async operations visually.

## 2026-03-10 - [Localized ARIA Labels & Sidebar Internationalization]
**Learning:** Found that icon-only buttons like Favorites (Heart) and Search were missing ARIA labels, and the Sidebar had hardcoded labels. This breaks screen readers and prevents full internationalization support.

**Action:** Ensure all icon-only buttons have dynamic `aria-label` attributes using localized strings (e.g., `aria-label={isFavorite ? t('common.unfavorite') : t('common.favorite')}`). Always use `useTranslation` hook and `t()` for sidebar navigation labels to support multi-language seamlessly.

## 2025-05-20 - [Semantic Elements for Mandatory Interactions]
**Learning:** Using a non-semantic `div` for a mandatory checkbox in the `AgeVerificationModal` prevents keyboard accessibility and fails to communicate state to screen readers. Relying only on `onClick` on a `div` excludes users who navigate via keyboard.

**Action:** Convert interactive elements to semantic `<button>` or `<input>` tags. For custom checkboxes, use `role="checkbox"` and `aria-checked`. Always implement `onKeyDown` handlers for Space/Enter and provide `focus-visible` styles to ensure the focus state is clearly visible during keyboard navigation.

## 2026-03-25 - [Sidebar Internationalization & Accessibility]
**Learning:** Hardcoded strings in navigation components like Sidebars break the experience for international users and exclude screen reader users if buttons lack descriptive ARIA labels. Additionally, keyboard navigation is often overlooked in sidebars, requiring explicit focus-visible styles.

**Action:** Always verify that all strings in navigation components are wrapped in `t()` for i18n. Provide `aria-label` for all icon-only or close buttons. Ensure all interactive elements have `focus-visible` ring styles and use haptic feedback for mobile interactions to improve the tactile experience.

## 2026-03-26 - [Responsive Buttons & Accessible Labels]
**Learning:** Found that buttons using conditional visibility for text (e.g., `hidden sm:inline`) become icon-only for screen readers on mobile. Without an explicit `aria-label`, these buttons lose their semantic meaning when the text node is hidden.

**Action:** For all responsive buttons that hide text on small screens, always provide an `aria-label` (localized via `t()`) that matches the button's intended label. This ensures accessibility remains consistent across all breakpoints.
