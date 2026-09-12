# Technical notes (course submission)

## Folder structure

```
src/
  app/                 # Next.js App Router pages + API routes
  components/          # SiteHeader, SiteFooter, Breadcrumbs, SkipLink, HomeClient
  lib/                 # products, search, validation, email, supabase
docs/
  design-dossier.md / .html   # export to PDF via browser print
  accessibility-report.md
  course-submission-checklist.md
  presentation-outline.md
  technical-notes.md
public/                # Optimized WebP images, brand assets
```

## Third-party libraries & licenses

| Package | License (typical) | Use |
|---|---|---|
| next, react, react-dom | MIT | App framework |
| tailwindcss | MIT | Utility CSS |
| @supabase/supabase-js | MIT | Data + storage |
| nodemailer | MIT | Order email |
| sharp | Apache-2.0 | Image compression |
| vitest, axe-core, Testing Library | MIT | Tests / a11y smoke |

## How search works

1. User types in the showcase `<input type="search">`.  
2. Input state updates immediately; a **300ms debounce** copies it to `debouncedSearch`.  
3. `filterProducts()` applies category + case-insensitive match on id/category/descriptions.  
4. Result count is announced via `aria-live="polite"`.

## How layout adapts

- Mobile-first Tailwind breakpoints: base → `sm` → `md` → `lg`.  
- Product grid: 1 column → 2 (`sm`) → 3 (`md`).  
- Sticky header stays available while scrolling; print CSS hides chrome.

## Progressive enhancement

- Navigation and content pages are real routes (shareable URLs).  
- Forms use native `required` / input types even if JS validation also runs.  
- Modal and debounced search enhance the experience when JS is available.
