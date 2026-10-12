# Main frontend polish

Branch: `improve/main-frontend-polish`, based on `main`. The experimental visual
edition remains on `design/praisly-reimagined`; this branch does not include it.

## Changes

- Shared cream/amber controls, line icons, keyboard focus and reduced-motion styling.
- Homepage illustration with selectable Invite / Review / Understand stages.
  Removed unsupported customer-count/testimonial/ranking/revenue claims from the
  landing page. Updated metadata and pricing; removed stale FAQ structured data.
- Customer review page: editable drafts, undo regeneration, explicit copy and
  Google handoff, clipboard failure handling, retained feedback on failed saves,
  confirmation retries and distinct skip/completion states. Empty generated drafts
  remain writable. Browser storage failure cannot turn a saved rating into an error.
- Preserve the existing 4–5-star draft / 1–3-star private-feedback routing.
- Dashboard metrics precede competitor comparisons. Private ratings replace
  modeled revenue; review-count comparisons are distinguished from Google rank.
- Reviews: customer-confirmed posts are clearly labelled, capped recent samples
  are disclosed, submission counts replace incorrect page-view labels, and
  calculated revenue/protected-rating claims are replaced with feedback themes.

## Verify locally

`npm install`, `npm test`, `npm run build`, then `npm run dev`.

`/__review-lab` is a development-only fixture of the actual customer component.
It uses sample data and makes no backend requests. It covers normal/empty drafts,
long business names and failed follow-up requests. It is excluded from production.
Actual `/review/:businessId` routes still use the real API.

Twelve regression tests cover edited-copy contents, clipboard denial, feedback
retry, confirmation failure, skip semantics, intentional rating routing, missing
Google URLs, empty drafts, undo regeneration, blocked storage, and metric labels.
Browser checks cover desktop, 768px tablet and 320/390px phones, including real
clipboard copying and simulated feedback failure/retry. New files and homepage
pass lint; existing dashboard/layout/Reviews lint findings remain from main.

Railway remains unavailable, so production API integration has not been verified.
Review and merge before deploying to main; no backend or billing changes are included.
