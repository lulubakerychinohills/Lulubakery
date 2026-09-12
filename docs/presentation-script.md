# Presentation script — Lulu Bakery (8–12 minutes)

**Speak in English.** Total target: ~10 minutes + short live demo cues.  
Live site: use your deployed URL. Pause briefly where marked **[DEMO]**.

---

## Slide 1 — Title (~30 sec)

Hello everyone. My name is Weixin Wang, and this is my Web Development project: **Home Bakery** — a custom cake ordering website for a real local business, Lulu Bakery in Chino Hills.

The live site is online, and I’ll walk through the architecture, layout, interactivity, accessibility, and what I learned building it.

---

## Slide 2 — What this project is (~45 sec)

This project is a **custom cake ordering website** for local customers.

The audience is mainly **parents and families** planning birthdays, parties, anniversaries, and other special events.

The goal is simple: make it easy to **browse cake designs**, find inspiration, optionally **upload reference photos**, and **submit a custom order** — including a deposit — from any device, phone or desktop.

---

## Slide 3 — Architecture / site structure (~60 sec)

Here’s how the site is structured.

- **Home** is the cake gallery — the main showcase.
- Customers can filter by category: **men, women, kids, other**, plus desserts.
- **Order** collects size, filling, contact details, and payment for the deposit.
- **About** explains who we are and pickup information.
- **Privacy** explains how we collect and use data.
- **Admin** is a separate staff page to upload new product images.

Navigation is **hierarchical**: from Home into a category, then into Order. About and Privacy sit in the primary nav. Admin is intentionally not part of the public menu.

**[DEMO — optional, 15 sec]** Click Home → a category → Order → About, just to show the real routes.

---

## Slide 4 — Design / Look & feel (~45 sec)

For look and feel I used a **warm neutral palette** that fits a bakery brand.

The page background is a soft cream. Cards and the header use white. The brand color is a bakery brown for buttons, active chips, and key actions. Borders are a light taupe so sections feel calm, not loud.

Product photos carry most of the visual energy; the UI stays quiet so the cakes stay the focus. I also checked contrast with **Lighthouse** and **WAVE** so text stays readable on these cream surfaces.

---

## Slide 5 — How the layout is built (~75 sec)

I built the layout with a few deliberate CSS techniques — each one solves a real UI problem.

First, global **`box-sizing: border-box`**, so padding doesn’t break alignment inside grids and buttons.

Second, **Flexbox** for the header and filter chips. Logo, links, and language sit in one row; on a narrow screen they **wrap** instead of overflowing — so I didn’t need a second mobile nav.

Third, **CSS Grid** for the cake gallery: one column on phones, up to three on desktop. New products drop into the grid without manual positioning.

The order form is also Grid: two columns on wider screens, with full-width rows for notes and policy — so the form is dense on desktop and simple on mobile.

I used **sticky positioning** for the header so customers can keep browsing photos without scrolling back up to navigate.

And for overlays, I used **fixed positioning and z-index**. That mattered in practice: the success dialog has to sit above PayPal’s iframes, or the payment buttons cover the confirmation UI.

**[DEMO]** Resize the browser and scroll the gallery to show Flex wrap, Grid columns, and the sticky header.

---

## Slide 6 — Responsive (~60 sec)

The site is **mobile-first**, then enhanced at `sm`, `md`, `lg`, and larger breakpoints.

On a phone you get **one cake column** and a stacked form. On desktop the gallery becomes **three cards across**, and the order form opens to **two columns**.

Images use **lazy loading** and responsive `sizes`, so we don’t download huge photos before they’re needed. On small screens, supporting visuals like the WeChat QR stay compact so they don’t dominate the hero.

**[DEMO]** Drag from mobile width to desktop and point at the grid and form.

---

## Slide 7 — Interactivity / JavaScript (~90 sec)

For interactivity I focused on what the course asks for — plus a payment flow.

Gallery search is **debounced at about 300 milliseconds**, so filtering doesn’t thrash on every keystroke.

I also want to call out **SSR and CSR**. Early on I mixed them up. Now the product page can render cake data on the **server** for a faster first paint and clearer content, while search, the order form, and the modal stay **client-side** where the UI has to react.

The order form does **dynamic validation** and moves focus to the **first invalid field**, so keyboard and screen-reader users aren’t left guessing.

After a successful submit, a **modal dialog** appears with proper dialog semantics, and Escape can close it.

Native HTML `required` and input types still help if JavaScript is slow — that’s **progressive enhancement**.

As extra credit, **PayPal** handles the deposit: create order, customer approves, then capture.

**[DEMO — required]**
1. Type 2–3 letters in search → pause → results update.  
2. Switch a category chip → URL updates.  
3. Open Order → clear a required field → show the validation message.

---

## Slide 8 — Accessibility (~75 sec)

Accessibility was not only a checklist — it changed real UI decisions.

I used semantic landmarks: header, nav, main, and footer. Pages like About and category views use **breadcrumbs** so orientation stays clear.

Links and controls have visible **focus styles** for keyboard users.

I learned from **WAVE** that alt text must be descriptive, but it should **not blindly duplicate** the nearby title.

I also ignored **Lighthouse and WAVE** at first. When I finally ran them, they flagged **weak color contrast** that hurt readability. After fixes, Lighthouse Accessibility scored **100**, and WAVE reported **zero errors**.

**[DEMO]** Tab through the header to show the focus ring; mention the Lighthouse / WAVE evidence on the slide.

---

## Slide 9 — Build / stack & performance (~70 sec)

Here’s the stack.

The storefront is **Next.js, React, TypeScript, and Tailwind** on the App Router.

**Supabase** stores product rows in Postgres and product images in Storage.

When someone orders, **SMTP email** notifies the bakery inbox.

Images are **WebP** where possible for lighter loads.

The site is **hosted and deployed on Vercel**, with continuous deploy from GitHub.

**PayPal** powers deposit checkout on the order page.

**`/admin`** is password-protected product upload. Auth is a **shared admin password** plus an **HttpOnly session cookie** checked on the server for each admin API — not a JWT, and not UI-only gating.

Finally, **`sitemap.xml` and `robots.txt`** cover basic SEO crawl rules.

---

## Slide 10 — Testing and docs (~45 sec)

For process: I added automated tests around **search filtering**, **order form validation**, and a small **accessibility smoke** check with axe.

I also wrote supporting docs: a design dossier, an accessibility report with tool evidence, and README / technical notes so the project is reviewable — not only demoable.

The important lesson is timing: I didn’t take testing seriously early enough. After real submits, incomplete data could reach storage. That pushed me to validate before submit and cover those rules in tests.

---

## Slide 11 — Reflection (~70 sec)

A few hard lessons.

First, I mixed up **SSR and CSR**. Later I learned SSR fits content and first paint; CSR fits rich interactivity — and our home experience is a hybrid.

Second, I first gated admin only in the **UI**. Without **server-side** checks on admin APIs, a non-admin could still call those routes. I fixed that with cookie checks in the handlers.

Third, skipping early **testing** led to incomplete order data. Validation and tests had to come before trust in the database.

Fourth, a success popup can look fine visually and still need real **dialog** semantics.

Fifth, **Lighthouse and WAVE** matter early — contrast issues are UX issues, not just audit scores.

---

## Slide 12 — Thank you (~30 sec)

Thank you. The live demo is at the site URL on the slide.

I’m happy to take questions — about layout, the PayPal deposit flow, admin auth, or accessibility.

**[DEMO — closing, if time]** One fast pass: search → category → order validation → keyboard focus.

---

## Timing cheat sheet

| Slides | Time |
|---|---|
| 1–2 Intro | ~1:15 |
| 3–4 IA + Design | ~1:45 |
| 5–6 Layout + Responsive | ~2:15 |
| 7 Interactivity + demo | ~1:30 |
| 8 Accessibility + demo | ~1:15 |
| 9–10 Stack + Testing | ~2:00 |
| 11–12 Reflection + close | ~1:40 |
| **Total** | **~11 min** |

If you run long: shorten Slide 9 PayPal detail and keep only three reflection bullets (SSR/CSR, admin API auth, Lighthouse/WAVE).

---

## Demo checklist (print or keep beside you)

- [ ] Search debounce  
- [ ] Category chip + URL  
- [ ] Resize 1 → 3 columns  
- [ ] Sticky header while scrolling  
- [ ] Order validation + focus  
- [ ] Tab / focus ring  
- [ ] Mention Lighthouse 100 / WAVE 0  
- [ ] (Optional) `/admin` login screen  
