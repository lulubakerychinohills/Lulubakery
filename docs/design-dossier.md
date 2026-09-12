# Design Dossier — Lulu Bakery Web Platform

**Course:** Professional Responsive Web Platform  
**Project:** Multi-page custom cake ordering site for a real local bakery client  
**Stack:** Next.js (React) · Tailwind CSS · TypeScript · Supabase  

Export this Markdown to PDF (4–8 pages) for submission: print from browser or use Pandoc/`File → Print → Save as PDF`.

---

## 1. Target audience & persona

**Primary persona — Maya, 32**  
Parent in Chino Hills ordering a birthday cake. Needs clear photos, simple size/filling choices, bilingual support, and a trustworthy privacy/contact path. Browses on phone during the day; completes the order on desktop at night.

**Secondary users:** Spanish-speaking family members; guests browsing dessert menus before events.

**Goals:** Find a style quickly → confirm pickup details → submit order with confidence.

---

## 2. Information architecture

```
Home (/)
├── Showcase (filter + search) → category routes
│   ├── /cakeformen
│   ├── /cakeforwomen
│   ├── /cakeforkids
│   ├── /cakeforother
│   └── /sweet → /sweet/photos
├── Order panel (same page progressive tabs)
├── About (/about)
└── Privacy (/privacy)
Admin (/admin) — staff only, noindex
```

**Navigation model:** Hierarchical primary nav (Home / About / Dessert Menu / Privacy) + contextual category filters and breadcrumbs on deep pages (`/sweet/photos`).

---

## 3. Wireframe notes (desktop + mobile)

**Desktop (≥768px)**  
- Sticky header + primary `<nav>`  
- Hero brand block with one H1 and short intro  
- Product grid: CSS Grid 3 columns  
- Order form: 2-column Grid for fields  

**Mobile (mobile-first)**  
- Nav wraps; sticky bar remains usable  
- Single-column product cards  
- Full-width form controls; large tap targets  

---

## 4. Color palette & typography

| Token | Value | Role |
|---|---|---|
| Brand | `#5C4B43` | Primary buttons / active nav |
| Ink | `#2F2926` | Body text |
| Muted | `#5E524B` | Secondary text |
| Border | `#D8D2C9` | Cards / inputs |
| Surface | `#F8F7F5` | Page background |

**Contrast:** Brand brown on white and cream surfaces targets WCAG AA for normal text (≥4.5:1). Focus rings use `#8B776A` with 3px outline.

**Typography:** Geist Sans via `next/font` — scale from `sm` (0.875rem) to `2xl` (2rem). Spacing tokens: `--space-1` … `--space-8`.

**UI components:** Shared `SiteHeader`, buttons (`.ui-button`), cards (`.ui-card`), form inputs, modal dialog, breadcrumbs.

---

## 5. Layout techniques demonstrated

- **Box model / `box-sizing: border-box`** — global in `globals.css`
- **Flexbox** — header, tab bar, category chips, CTAs
- **CSS Grid** — product showcase, order field layout, step strip
- **Positioning** — sticky header; fixed modal overlay (`z-50`)
- **Responsive** — `sm` / `md` / `lg` breakpoints (mobile-first)
- **Print stylesheet** — hide chrome; simplify links

---

## 6. Interactivity & progressive enhancement

| Feature | Behavior |
|---|---|
| Debounced search (300ms) | Filters showcase without full page reload |
| Category filter | Updates route for shareable deep links |
| Order form | HTML5 `required` + client validation messages |
| Success modal | `role="dialog"`, Esc to close, initial focus |
| Without JS | Pages still render; nav/links work; forms keep native constraints |

---

## 7. Accessibility checklist & remediation

See `docs/accessibility-report.md` for tool results and POUR mapping.

**Key remediations shipped:**
1. Skip link + `#main-content` landmark  
2. Semantic primary `<nav>` + breadcrumbs  
3. Visible `:focus-visible` styles  
4. Modal ARIA (`aria-modal`, labelled dialog)  
5. Search labelled; live result count  
6. Product cards expose visible titles (not image-only)  

---

## 8. Performance

- WebP assets + `sharp` upload pipeline  
- `loading="lazy"` / `sizes` on non-critical images  
- ISR `revalidate = 300` for product pages  
- Print CSS reduces ink/chrome noise  

---

## 9. Testing

```bash
npm test
```

Includes ≥5 unit tests (search, debounce, order validation) plus axe smoke on landmark structure.
