# 🛡️ AI & Developer Safety Rules for EnjunPilem

This document defines strict architectural guidelines to prevent AI models and developers from accidentally breaking UI layout, routing, or functionality during feature development.

---

## 1. ⚠️ Dual-Tree Architecture Rule (Desktop vs Mobile Parity)
- This project maintains **two parallel page trees**:
  - **Desktop**: `src/pages/*`
  - **Mobile**: `src/components/mobile/pages/*`
- **MANDATORY**: Whenever you create, edit, or refactor a feature in a Desktop page (e.g. `src/pages/Watchlist.tsx`), you **MUST ALSO UPDATE** the corresponding Mobile page (e.g. `src/components/mobile/pages/MobileWatchlist.tsx`).
- Never leave mobile or desktop logic out of sync.

---

## 2. ⚠️ UI Layout & Z-Index Guardrails
- **BottomNav Clearance**: On mobile pages, do not remove `pb-20` or `pb-safe-bottom` from page root containers. Deleting this class causes bottom buttons/content to be covered by `BottomNav`.
- **Fixed Aspect Ratios**: Avoid hardcoding static container heights (`h-[400px]`) on responsive elements. Use Tailwind aspect ratio classes like `aspect-[16/9]` or `aspect-[2/3]` instead.
- **Z-Index Layering**:
  - `BottomNav`: `z-50`
  - `Navbar` / `MobileHeader`: `z-40` or `z-50`
  - Modals / Dialogs / Sheets: `z-50`
  - Dropdowns / Tooltips: `z-50`

---

## 3. ⚠️ Data & API Null Safety (Anti-Crash Rule)
- Data from TMDB API (`TMDBMediaItem`) or Supabase can contain `null` or `undefined` fields.
- **NEVER** dereference raw nested fields directly (e.g., `item.release_date.split('-')[0]`).
- **ALWAYS** use optional chaining and safe fallbacks:
  ```tsx
  const year = item?.release_date ? item.release_date.split('-')[0] : (item?.first_air_date ? item.first_air_date.split('-')[0] : '');
  const rating = typeof item?.vote_average === 'number' ? item.vote_average.toFixed(1) : '0.0';
  ```

---

## 4. 🧪 Automated Verification Requirement
- After making code edits, you must verify code integrity by running:
  ```bash
  npm run verify-all
  ```
- All TypeScript types, Vitest tests, and Vite production builds must pass cleanly before marking any task as complete.
