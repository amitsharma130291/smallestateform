# Deployment Guide — SmallEstateForm.com

## Phase 1 (Current) — Free During Beta

### Vercel Deployment
1. Connect this GitHub repo to Vercel
2. Framework: Astro (auto-detected)
3. Build command: `astro build`
4. Output directory: `dist`
5. Node version: 20.x
6. No environment variables needed for Phase 1

### Environment Variables (Phase 1)
None required. The `DODO_API_KEY` placeholder exists in `.env.example` but is not used.

### Custom Domain
1. Add `smallestateform.com` in Vercel → Settings → Domains
2. Update DNS records as instructed by Vercel

---

## Phase 2 — Dodo Payments Integration

> **Status: Pending Dodo Payments account approval**

### What needs to change for Phase 2
1. **Replace payment stub**: `src/pages/api/create-checkout.ts` — marked with comment `// Phase 2: Replace with Dodo Payments integration`
2. **Add Dodo SDK**: `npm install @dodopayments/sdk` (or Dodo's recommended package name)
3. **Environment variables to add in Vercel**:
   - `DODO_API_KEY` — from Dodo Payments dashboard
   - `DODO_WEBHOOK_SECRET` — for payment confirmation webhooks
4. **Update DownloadButton.tsx**: Replace "Free During Beta" flow with payment gate
5. **Pricing**:
   - Small Estate Affidavit: $19.99
   - Affidavit of Heirship: $19.99
   - Transfer on Death Deed: $14.99

### Phase 2 Checklist
- [ ] Dodo Payments account approved
- [ ] API keys obtained
- [ ] `create-checkout.ts` implemented
- [ ] `DownloadButton.tsx` updated with payment gate
- [ ] Webhook handler built (`src/pages/api/webhook.ts`)
- [ ] Test payment flow end-to-end
- [ ] Update Vercel env vars in production
- [ ] Remove "Free During Beta" badges

---

## Architecture Notes
- **Astro static site** — fully static output, no server required
- **PDF generation** is client-side (jsPDF) — no server-side rendering needed
- **All pages** can be served from Vercel's CDN edge
- **API routes** (`/api/create-checkout`) require Vercel's serverless function runtime
- **Design system**: Playfair Display (serif headings) + Inter (body) | charcoal + gold + cream palette
- **No tracking / no account required** from the user

---

## Page Structure
- `/` — Homepage (generate document, select state)
- `/small-estate-affidavit/` — Hub page (50K/mo keyword)
- `/affidavit-of-heirship/texas/` — Texas AOH (5K/mo)
- `/small-estate-affidavit/arizona/` — Arizona SEA (500/mo, HB2116 March 2026)
- `/small-estate-affidavit/arizona/maricopa/` — Maricopa county (500/mo, +900% YoY)
- `/small-estate-affidavit/illinois/` — Illinois SEA (5K/mo, Aug 2025 law)
- `/transfer-on-death-deed/california/` — California TOD Deed (5K/mo, AB 1052)
