# Presentation outline (8–12 minutes)

Use with `docs/Lulu-Bakery-Final-Presentation.pptx`. Demo the **live URL** while speaking.

| Time | Slide / demo | Talk track |
|---|---|---|
| 0:00–1:00 | Title / team / client | Real bakery client in Chino Hills; goal = showcase + online deposit order |
| 1:00–2:00 | IA site map | Hierarchical nav: Home → categories → Order; About / Privacy |
| 2:00–3:30 | Layout techniques | Box model + `border-box`; Flexbox header/chips; Grid product cards & form; sticky header; z-index modal |
| 3:30–5:00 | Responsive | Mobile-first; resize browser across 3 breakpoints; show WeChat QR compact on small screens |
| 5:00–6:30 | Interactivity | See slide copy below + live demo (search → filter → order validate → dialog) |
| 6:30–8:00 | Accessibility | Keyboard nav; focus ring; breadcrumbs; Lighthouse 100 / WAVE 0 errors |
| 8:00–9:00 | Performance | WebP assets, lazy images, Sharp upload pipeline; sitemap/robots |
| 9:00–10:00 | Architecture | Next.js App Router, Supabase, SMTP, PayPal; progressive enhancement |
| 10:00–11:00 | Challenges | Image optimization on Vercel; PayPal button z-index; bilingual UX |
| 11:00–12:00 | Wrap | Demo URL, GitHub, what you’d improve next (`html[lang]` sync, product lightbox) |

---

## Slide: Interactivity (paste into PPT)

**Title:** Interactivity  
**Eyebrow:** JAVASCRIPT / CLIENT-SIDE

**Bullets:**

- **Debounced search (300ms)** — filters the cake gallery without lag on every keystroke  
- **Category filter + URL sync** — Men / Women / Kids update the route (shareable state)  
- **Client form validation** — name, email, pickup, policy; focuses the first invalid field  
- **Modal dialog** — success overlay uses `role="dialog"`; **Esc** closes it  
- **Progressive enhancement** — native `required` / input types still work if JS is slow  
- **Extra:** PayPal deposit checkout (create → approve → capture)

**Optional footer line:** `Live demo next: type in search → switch category → open Order → submit`

---

## Speak track (~60–75 seconds)

> For interactivity I focused on course requirements: search, validation, and a dialog — with progressive enhancement.  
> Gallery search is **debounced 300ms**, so filtering stays smooth. Category chips also update the **URL**, so the filtered view is shareable.  
> The order form validates on the client and jumps to the first error. After submit, a **modal** appears with proper dialog semantics; Escape closes it.  
> Native HTML `required` still helps if JavaScript is slow — that’s progressive enhancement.  
> As extra credit, PayPal handles the deposit flow end to end.  
> I’ll demo search and the form live.

## Live demo checklist (during this slide)

1. Type 2–3 letters in showcase search → pause → results update.  
2. Click a category chip → URL changes, scroll stays.  
3. Go to Order → clear a required field → show validation message.  
4. (Optional) Mention PayPal deposit briefly — don’t need a full sandbox payment in the recording.

## Accessibility live demo script

1. Tab through header links; show focus outline.  
2. Open Order → show validation with keyboard only.  
3. Mention Lighthouse Accessibility **100** and WAVE **0 errors / AIM 10**.
