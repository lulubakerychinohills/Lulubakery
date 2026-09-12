# Presentation outline (8–12 minutes)

Use with `docs/Lulu-Bakery-Final-Presentation.pptx`. Demo the **live URL** while speaking.

| Time | Slide / demo | Talk track |
|---|---|---|
| 0:00–1:00 | Title / team / client | Real bakery client in Chino Hills; goal = showcase + online deposit order |
| 1:00–2:00 | IA site map | Hierarchical nav: Home → categories → Order; About / Privacy |
| 2:00–3:30 | Layout techniques | Box model + `border-box`; Flexbox header/chips; Grid product cards & form; sticky header; z-index modal |
| 3:30–5:00 | Responsive | Mobile-first; resize browser across 3 breakpoints; show WeChat QR compact on small screens |
| 5:00–6:30 | Interactivity | Debounced showcase search; category filters; order form validation; success dialog; PayPal deposit |
| 6:30–8:00 | Accessibility | Tab to Skip link; keyboard nav; focus ring; breadcrumbs; axe tests (`npm run test:a11y`); POUR summary |
| 8:00–9:00 | Performance | WebP assets, lazy images, Sharp upload pipeline; sitemap/robots |
| 9:00–10:00 | Architecture | Next.js App Router, Supabase, SMTP, PayPal; progressive enhancement |
| 10:00–11:00 | Challenges | Image optimization on Vercel; PayPal button z-index; bilingual UX |
| 11:00–12:00 | Wrap | Demo URL, GitHub, what you’d improve next (`html[lang]` sync, product lightbox) |

## Accessibility live demo script

1. Press Tab until “Skip to main content” appears → Enter.  
2. Tab through header links; show focus outline.  
3. Open Order → show validation with keyboard only.  
4. Mention Lighthouse/WAVE scores (after you paste screenshots).
