# Lulu Bakery Deploy Checklist

Use this checklist after each deployment.

## 1) Domain and SSL

- Open `https://lulubakerychinohills.com`
- Open `https://www.lulubakerychinohills.com`
- Confirm both load over HTTPS (no browser certificate warning)
- Confirm one domain redirects to your preferred primary domain

## 2) Public Site Core Flow

- Home page loads and product cards render
- Language dropdown works (EN/ZH/ES)
- About page opens and contact email link works
- Category filter works (`All`, `Men`, `Women`, `Kids`, `Other`)

## 3) Custom Order Flow

- Select a showcase cake -> enters Order tab correctly
- Upload a customer reference image from showcase works
- Order form validates required fields correctly
- Submit order succeeds and success dialog appears

## 4) Email Notification

- New order email is received
- Email includes:
  - customer info
  - pickup date/time
  - selected cake info (or reference-only fallback text)
  - reference image (if provided)
  - product image (if selected)

## 5) Admin Flow

- `/admin` login works with `ADMIN_PAGE_PASSWORD`
- Product image upload works
- New product save works (including category `other`)
- New product appears on home page

## 6) Supabase Checks

- `products` table accepts new inserts
- `category` constraint includes `other`
- Storage bucket is accessible and serving public URLs

## 7) Final Quick Quality Check

- Test one full order on desktop
- Test one full order on mobile
- Check console for runtime errors
- Check Vercel deployment logs for server errors
