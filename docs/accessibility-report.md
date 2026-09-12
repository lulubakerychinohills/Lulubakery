# Accessibility Report — Lulu Bakery

**Date:** 2026-09-11  
**Scope:** Public storefront pages (`/`, category routes, `/about`, `/privacy`, `/sweet`)  
**Standards:** WCAG 2.2 Level AA (POUR)

---

## Tools used (minimum two)

| Tool | How to run | Evidence to attach |
|---|---|---|
| **axe-core (automated smoke)** | `npm run test:a11y` | CI/test output — serious/critical = 0 |
| **Lighthouse (Chrome DevTools)** | Open site → Lighthouse → Accessibility | Screenshot of Accessibility score + audits |
| **WAVE (optional third)** | [wave.webaim.org](https://wave.webaim.org) extension on live URL | Screenshot of errors/contrast |

> Before submission: run Lighthouse + WAVE on the deployed URL and paste screenshots into this file or the design PDF.

---

## Manual POUR checklist

### Perceivable
- [x] Meaningful text alternatives on product/hero images  
- [x] Text contrast tokens documented (`#2F2926` / `#5C4B43` on cream)  
- [x] Content readable when CSS print stylesheet applied  
- [x] Language selector present (zh / en / es)

### Operable
- [x] Skip link to `#main-content`  
- [x] Full keyboard access to nav, tabs, search, form, modal  
- [x] Visible focus styles (`:focus-visible`)  
- [x] Modal closes with Escape; focus moves to close control  
- [x] No keyboard traps in primary flows

### Understandable
- [x] Consistent sticky primary navigation across pages  
- [x] Breadcrumbs on deeper routes (`/about`, `/privacy`, `/sweet/photos`)  
- [x] Form labels associated; validation messages in plain language  
- [x] Readable link text (not “click here”)

### Robust
- [x] Semantic landmarks: `header`, `nav`, `main`, `article`, `footer` (`SiteFooter`)  
- [x] ARIA for tabs (`role="tablist"`), dialog (`role="dialog"`), search region  
- [x] Valid HTML5 controls (`type="email|date|time|search"`)
- [x] Breadcrumbs on category routes, `/sweet/photos`, `/order`, `/about`, `/privacy`

---

## Issues found & fixed (examples)

| # | Issue | Fix |
|---|---|---|
| 1 | No skip link / weak landmark focus target | Added `SkipLink` + `id="main-content"` |
| 2 | Header links not in `<nav>`; image-only cards | Shared `SiteHeader`; card titles from `descriptionI18n` |
| 3 | Success overlay not announced as dialog | `role="dialog"`, `aria-modal`, labelled title/description, Esc |

---

## Known limitations

- Admin UI (`/admin`) is out of public a11y scope for this course deliverable.  
- Language switch updates copy client-side; document `lang` remains `en` unless extended.  
- Full focus trap (Tab cycling only inside modal) is partial — Esc + initial focus implemented.

---

## Remediation plan (if audits still flag items)

1. Re-run Lighthouse after deploy; fix any color-contrast warnings on badges.  
2. Add `html[lang]` sync when language changes (enhancement).  
3. Expand axe coverage to full page renders with Next test harness if required by instructor.
