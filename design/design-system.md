# smallestateform.com — Design System

**Version:** 1.0  
**Audience:** Developers, designers, and content editors working on smallestateform.com  
**Status:** Approved for production

---

## Rationale

> This palette evokes a respected estate attorney's office — warm, calm, trustworthy. Designed for people in grief who need clarity and confidence, not a tech product or government form.

Families using this service have recently lost someone. Every design decision must serve that reality: reduce cognitive load, project calm authority, and feel like a physical office you would trust with something important. The aesthetic reference is Farrow & Ball paint, a Mayfair law firm's letterhead, or a well-made hardback book — not Stripe, not a government portal, and emphatically not a startup.

Users are often older, stressed, and operating under emotional strain. Clarity and legibility come first. Personality is expressed through restraint, not decoration.

---

## Anti-patterns

Things this design system deliberately avoids, and why:

- **NOT corporate navy blue.** Navy reads as a bank or government department — cold, institutional, and exactly what a grieving family does not want to feel they are dealing with.
- **NOT bright green.** Green in digital contexts signals "approved" or "success." Using it as a brand colour would create false or premature reassurance in a legal context.
- **NOT pill-shaped buttons.** Pill/rounded-full shapes belong to consumer apps and startups. Rectangular buttons with a modest radius (8px) signal solidity, permanence, and legal seriousness.
- **NOT startup fonts.** No DM Sans, Nunito, Poppins. Inter is clean and highly legible but restrained; Playfair Display for headings brings warmth and heritage without pretension.
- **NOT high-contrast whites or pure blacks.** Harsh white (#FFFFFF) backgrounds feel clinical. Pure black (#000000) feels aggressive. We use cream and charcoal.

---

## Colour Palette

| Token | Hex | Tailwind Class | Usage |
|---|---|---|---|
| `charcoal` | `#1C1C1E` | `bg-charcoal` / `text-charcoal` | Primary text, `.btn-primary` background, headings |
| `gold` | `#B8860B` | `bg-gold` / `text-gold` | Link colour, brand accent (used sparingly) |
| `gold-light` | `#D4A017` | `bg-gold-light` / `text-gold-light` | Active step indicator, `.callout-update` border |
| `cream` | `#FAF8F5` | `bg-cream` / `text-cream` | Page background, `.btn-primary` text |
| `cream-dark` | `#F0EDE8` | `bg-cream-dark` / `text-cream-dark` | Card backgrounds, input backgrounds, secondary surfaces |
| `slate` | `#3D3D3D` | `bg-slate` / `text-slate` | Body text (slightly softer than charcoal) |
| `slate-light` | `#6B6B6B` | `bg-slate-light` / `text-slate-light` | Supporting text, placeholders, inactive step labels |
| `muted-green` | `#4A7C59` | `bg-muted-green` / `text-muted-green` | `.callout-success` border, eligibility confirmation |
| `muted-green-bg` | `#EFF7F2` | `bg-muted-green-bg` | `.callout-success` background |
| `error` | `#9B2335` | `bg-error` / `text-error` | Form errors, `.callout-error`, validation messages |
| `border` | `#E5E0D8` | `bg-border` / `border-border` | All dividers, card borders, input borders |

### Colour use guidance

- **Gold is precious.** Use it for links, the active step indicator, and `.callout-update` borders only. If it appears too frequently, it loses its weight.
- **Cream and cream-dark create depth.** The page is cream; cards and inputs are cream-dark. This gives hierarchy without introducing a new hue.
- **Muted green is for genuinely positive news only.** "You qualify" or "Your form was submitted." Never for marketing or general UI.
- **Error is sombre.** The deep crimson is serious but not alarming — appropriate for a context where legal errors have real consequences.

---

## Typography

### Typefaces

| Font | Category | Weights | Tailwind Class |
|---|---|---|---|
| Playfair Display | Serif | 400, 500, 600, 700 | `font-serif` |
| Inter | Sans-serif | 300, 400, 500, 600 | `font-sans` |

**Playfair Display** is used for all headings (h1–h6) and display text. It carries the warmth and heritage of traditional legal typography without looking dated. It is set in the midweights (600) for headings.

**Inter** is used for all body copy, UI labels, buttons, and form fields. Its high legibility at small sizes makes it ideal for legal forms where users must read carefully.

### Type Scale

| Name | Size | Line Height | Use |
|---|---|---|---|
| `display` | 3rem (48px) | 1.15 | Hero headlines only |
| `h1` | 2.25rem (36px) | 1.2 | Page titles |
| `h2` | 1.75rem (28px) | 1.25 | Section headers |
| `h3` | 1.375rem (22px) | 1.35 | Sub-section headers, card titles |
| `body` | 1rem (16px) | 1.7 | All body copy |
| `small` | 0.875rem (14px) | 1.6 | Labels, captions, legal disclaimers, button text |

### Typography guidance

- Headings are always Playfair Display. Do not use Inter for headings.
- Body text line-height is deliberately generous (1.7). Legal text requires breathing room.
- Button labels use Inter small (14px), uppercase, letter-spacing 0.04em — a traditional legal stationery convention.
- Do not set body copy at display or h1 sizes. The scale exists so that hierarchy is always clear.

---

## Spacing

One dedicated spacing token exists:

| Token | Value | CSS Variable | Tailwind Class |
|---|---|---|---|
| `section` | 80px | `--spacing-section` | `pt-section` / `pb-section` |

Use `spacing-section` (80px) for top and bottom padding on every full-width page section. This is intentionally generous — pages should feel unhurried.

For internal spacing within components, use the standard Tailwind spacing scale (4px base).

---

## Border Radius

| Name | Value | Tailwind Class | Purpose |
|---|---|---|---|
| `sm` | 4px | `rounded-sm` | Small UI elements, badges |
| `md` | 8px | `rounded-md` | Buttons, form inputs |
| `lg` | 12px | `rounded-lg` | Cards, modals, larger containers |

No `rounded-full` or pill shapes. See anti-patterns.

---

## Shadow

| Token | Value | Tailwind Class | Use |
|---|---|---|---|
| `card` | `0 2px 8px rgba(28,28,30,0.08), 0 1px 3px rgba(28,28,30,0.06)` | `shadow-card` | Cards, modals, dropdown menus |

The shadow is extremely subtle — two very low-opacity layers that lift a surface without making it feel digital or "floaty." The colour is derived from charcoal, keeping the shadow warm.

---

## Components

### Buttons

#### `.btn-primary`
The primary action on any page or form step.

- Background: charcoal (`#1C1C1E`)
- Text: cream (`#FAF8F5`)
- Border: charcoal on rest; gold on hover
- No fill change on hover — the gold border is the interaction signal
- Radius: `md` (8px)

**Use for:** "Continue," "Submit your application," "Start your form"

```html
<button class="btn-primary" type="submit">Continue to next step</button>
<a href="/start" class="btn-primary">Begin your application</a>
```

#### `.btn-secondary`
For secondary or optional actions alongside a primary.

- Background: cream
- Text: charcoal
- Border: charcoal on rest; gold text and border on hover
- Radius: `md` (8px)

**Use for:** "Save and return later," "Download a copy," "Go back"

```html
<button class="btn-secondary" type="button">Save and return later</button>
```

---

### Cards

#### `.card`
The standard container for grouped content.

- Background: cream-dark
- Border: 1px solid `border` colour
- Shadow: `card`
- Radius: `lg` (12px)
- Padding: 2rem (32px)

**Use for:** Form sections, informational panels, FAQ items, summary boxes

```html
<div class="card">
  <h3>Your estate details</h3>
  <p>Enter the details as they appear on the grant of probate.</p>
</div>
```

---

### Callout Boxes

Three variants, each semantically distinct.

#### `.callout-update`
For law change announcements or important procedural updates.

- Left border: gold-light
- Background: cream-dark

```html
<div class="callout-update">
  <p><strong>Law update (April 2024):</strong> The inheritance tax threshold has been frozen until 2028. This may affect your estate's liability.</p>
</div>
```

#### `.callout-success`
For eligibility confirmation or successful completion messages.

- Left border: muted-green
- Background: muted-green-bg

```html
<div class="callout-success">
  <p>Based on your answers, you may be eligible to apply for probate without a solicitor.</p>
</div>
```

#### `.callout-error`
For validation errors, blocking issues, or legal warnings.

- Left border: error
- Text: error colour
- Background: light tint of error

```html
<div class="callout-error">
  <p>The date of death cannot be in the future. Please check your entry.</p>
</div>
```

---

### Form Fields

All inputs inherit from the base styles in `global.css`. No additional class is needed for a standard field.

**Standard field:**
```html
<div>
  <label for="deceased-name">Full name of the deceased</label>
  <input id="deceased-name" name="deceased-name" type="text" placeholder="e.g. Margaret Elizabeth Collins" />
</div>
```

**Error state — add `.is-error` to the input and add a `.field-error` below it:**
```html
<div>
  <label for="date-of-death">Date of death</label>
  <input id="date-of-death" name="date-of-death" type="date" class="is-error" />
  <p class="field-error">Please enter a valid date.</p>
</div>
```

Focus ring is gold (`#B8860B` with 15% opacity spread) — never the browser default blue. This is enforced via the `input:focus` rule in `global.css`.

---

### Step Indicator

A 4-step progress bar for multi-step form flows.

States: default (upcoming), `.is-active` (current step, gold), `.is-complete` (done, charcoal).

```html
<nav class="step-indicator" aria-label="Application progress">
  <div class="step-indicator__step is-complete">
    <div class="step-indicator__number">1</div>
    <span class="step-indicator__label">Your details</span>
  </div>
  <div class="step-indicator__step is-active">
    <div class="step-indicator__number">2</div>
    <span class="step-indicator__label">Estate details</span>
  </div>
  <div class="step-indicator__step">
    <div class="step-indicator__number">3</div>
    <span class="step-indicator__label">Documents</span>
  </div>
  <div class="step-indicator__step">
    <div class="step-indicator__number">4</div>
    <span class="step-indicator__label">Review &amp; submit</span>
  </div>
</nav>
```

- Completed steps: charcoal circle, cream number
- Active step: gold circle and gold label
- Connector lines turn gold once the preceding step is complete
- No animation — progress indicators in this context should not feel performative

---

## Tailwind Config Reference

The `tailwind.config.mjs` extends Tailwind's theme with the tokens above:

- All colours are under `theme.extend.colors`
- Font families under `theme.extend.fontFamily`
- Custom font sizes (with line heights) under `theme.extend.fontSize`
- `spacing.section` = `80px`
- Border radii replace defaults: `sm` / `md` / `lg`
- `boxShadow.card` for the card shadow
- `@tailwindcss/typography` plugin for long-form content

The `content` glob covers: `./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}`

---

## Integration

### Astro / HTML

1. Add the Google Fonts `<link>` (or import the `global.css` which imports it via `@import url(...)`)
2. Import `global.css` in your layout's `<head>` or in your Astro layout component
3. Import `tailwind.config.mjs` in your Tailwind setup

```astro
---
// src/layouts/BaseLayout.astro
import '../styles/global.css';
---
```

### Accessibility notes

- All colour combinations in this palette meet WCAG AA contrast requirements at minimum
- Charcoal on cream: ~11:1 (AAA)
- Gold on cream: ~4.6:1 (AA, use at 16px or larger)
- Error on white/cream: ~6.8:1 (AA)
- All focus states use the gold outline ring — do not remove them
- The step indicator uses `<nav aria-label="Application progress">` — keep this

---

*This document should be updated whenever a component is added, a token changes, or a design decision is revised. The source of truth is always `tailwind.config.mjs` and `global.css`.*
