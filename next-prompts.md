# Stitch Edit Prompts — SwagPrint Premium Redesign

## Prompt 1: Hero Section — Reduce Gap

```
Tighten the spacing between the sticky header and the hero section. The hero currently feels disconnected from the header due to excessive top padding.

**Specific changes:**
- Reduce the top padding on the main content area so the hero section sits closer to the navigation bar
- The hero content (badge, headline, subtext, buttons) should begin shortly below the header, creating a seamless visual flow from navigation into the hero
- Keep the hero image and floating "New Arrival" card in the same relative positions
- Maintain the glassmorphism sticky header with its backdrop blur — the hero content should feel like it flows naturally beneath the frosted glass nav

**DESIGN SYSTEM (REQUIRED):**
- Background: Page Surface (#f8f9ff)
- Header: Frosted glass (white at 80% opacity, 12px backdrop blur)
- Typography: Plus Jakarta Sans for headlines, Inter for body
- The goal is "editorial confidence" — tight, intentional spacing that signals a premium brand, not a generic template with padding-heavy defaults

**Context:** This is a targeted spacing edit. Make only this change while preserving all existing elements, colors, and layout structure.
```

---

## Prompt 2: Category Grid — Fresh Style Reinterpretation

```
Reimagine the "Shop by Category" section with a fresh, premium card style. The current grid of 8 identical dark-overlay image cards feels uniform and templated. Give this section a distinctive, curated editorial feel.

**Current state to change:**
- 8 category cards (Apparel, Drinkware, Office, Tech, Bags, Gift Sets, Sustainable Gear, Headwear)
- All cards are the same size (4/5 aspect ratio) in a flat 4-column grid
- Each card uses a dark gradient overlay with white text at the bottom-left

**Design direction:**
- Surprise me with a fresh approach — explore alternatives to the uniform dark-overlay grid
- The section should feel curated and intentional, like a high-end editorial spread, not a generic e-commerce category list
- Consider varying visual weights, mixed sizing, or alternative card treatments
- Maintain all 8 categories but create visual hierarchy among them

**DESIGN SYSTEM (REQUIRED):**
- Platform: Web, Desktop-first
- Palette: Deep Sapphire Blue (#1032cf) for primary accents, Page Surface (#f8f9ff) as foundation
- Surface Hierarchy: Use tonal layering — surface (#f8f9ff), surface-container-low (#eef4ff), surface-container-lowest (#ffffff), surface-container-high (#dae9ff) — instead of borders
- Typography: Plus Jakarta Sans (headlines, tight letter-spacing -0.02em), Inter (body)
- Elevation: Tinted ambient shadows using (#0b1d2d) at 4-6% opacity, 40-60px blur. No standard drop shadows
- Corners: Generously rounded (2rem for containers). No sharp edges
- No 1px solid borders for separation — use background color shifts only
- Section label: Small caps tracking-widest primary-colored label above the heading ("CURATED SELECTIONS")

**Context:** This is an edit to an existing screen. Only change the category grid section. Preserve the header, hero, trust bar, and all sections below.
```

---

## How to Use

1. Open your SwagPrint project in [Stitch](https://stitch.withgoogle.com)
2. Select the screen to edit
3. Copy one prompt at a time into the edit prompt field
4. Apply Prompt 1 first (hero spacing), then Prompt 2 (category grid)
5. Review and iterate as needed
