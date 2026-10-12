# Praisly — a new chapter

Review branch: `design/praisly-reimagined`. Do not merge or promote to production
until the owner approves the design.

## Open the experience

Run `npm install` and `npm run dev`, then open `/preview` on the printed local URL.
The same routes work on the branch's Vercel preview deployment:

- `/preview`: editorial homepage, dimensional animated seal, customer-journey
  selector, product sections, monthly/yearly pricing and FAQs.
- `/preview/studio`: sample reputation workspace, location selector, chart
  period selector and sample CSV export.
- `/preview/studio/reviews`: searchable/filterable sample reviews and private feedback.
- `/preview/studio/qr`: editable invitation, colour choices and downloadable QR.
- `/preview/studio/competitors`: illustrative local comparison.
- `/preview/studio/billing`: reversible, local-only cancellation simulation.
- `/preview/review`: rating, editable review draft, private feedback and sample
  Google handoff. Nothing is submitted to Google or the backend.

The demo needs no Railway service, authentication, API keys or database. Sample
inputs live only in component memory and reset on reload. The QR targets the
current origin; use the deployed preview URL for phone scanning. The Google Fonts
already used by the existing app remain in use, with system fallbacks.

## Implementation boundary

The existing homepage, authentication, onboarding, dashboard, review collection
and billing routes are unchanged. The only existing React entrypoint change is a
lazy `/preview/*` route. All new styles are scoped to `p-` classes. No packages or
backend changes were needed. Preview routes send `X-Robots-Tag: noindex, nofollow`
on Vercel and add a matching document meta tag.

This is an interactive design preview, not a replacement for the connected
production screens. Approval should be followed by applying these layouts to the
existing services and access checks. Do not substitute the sample billing or
review actions for real endpoints.

## Visual direction

Warm paper, deep green ink, burnt orange, generous editorial type, italic serif
accents and dimensional artwork built from CSS. The main seal and cards float
slowly; the homepage provides a pause control. Reduced-motion preferences disable
animation and transitions. Keyboard focus is visible and the mobile navigation
is an explicit expand/collapse control.

## Validation

- Production build and lint for the new React file.
- Browser checks for pricing, journey selection, FAQs, motion pause, location and
  chart selection, review search/rating filters, empty results, private feedback,
  QR headline/colour rendering, cancellation/keep-plan choices, and both customer
  rating paths through their final states.
- Layout checks at desktop, tablet and narrow phone widths; no page-wide
  horizontal overflow after the narrow-screen decorative-star correction.
- Download support uses the existing QR library and browser file downloads.
  The in-app browser's download-event automation stalled; verify the actual
  downloaded PNG/CSV in a normal browser before promoting that interaction.

The sample statistics and businesses are illustrative, not customer results or
testimonials. Pricing is taken from the existing Billing screen: ₹499 monthly or
₹4,990 yearly (approximately ₹416/month).
