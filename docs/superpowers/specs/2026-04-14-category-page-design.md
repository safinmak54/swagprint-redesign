# Category Page Design Spec

## Overview

A clean, minimal category/product listing page for SwagPrint that extends the redesigned home page's visual language. The page uses a 3-column balanced grid (matching the home page's "Most Popular" section), horizontal chip-style filters, a full hero banner, and infinite scroll.

This spec uses the **Custom Can Coolers** category as the reference example, but the layout is generic to all SwagPrint categories.

## Design Tokens (from home page)

All values inherited from the existing redesign:

- **Fonts**: Plus Jakarta Sans (headlines, extrabold, tracking-tighter), Inter (body/labels)
- **Colors**: M3 palette — `primary: #3D5167`, `on-surface: #1a2a3a`, `secondary: #5a7068`, `surface: #f5f7f6`, `surface-container-lowest: #ffffff`, `outline-variant: #c5d0ca`, `tertiary-fixed-dim: #8ECAB0`
- **Colors (additional)**: `surface-container: #e8eeeb` (active filter chips), `surface-container-low: #f0f4f2`
- **Radii**: Custom config maps `rounded-lg` to `2rem` and `rounded-xl` to `3rem`. Use `rounded-lg` for cards and hero (not `rounded-lg` which falls back to Tailwind default 1rem). Use `rounded-full` for chips/pills.
- **Shadows**: `shadow-ambient-sm` (cards), `shadow-ambient-lg` (dropdowns)
- **Max width**: `max-w-[1400px]` centered container
- **Grid gap**: `gap-8`

## Page Structure (top to bottom)

### 1. Shared Navigation

Identical to the home page fixed header:
- Utility bar: `bg-surface-container-low`, free shipping message + help/track links
- Main nav: `bg-white/80 backdrop-blur-md`, logo, mega menu dropdowns, search, cart
- Fixed at top, `z-50`

### 2. Hero Banner

Full-width section inside the `max-w-[1400px]` container.

- **Background**: `bg-primary-container` (#3D5167) with `rounded-lg`. Note: despite the M3 naming convention, `primary-container` maps to the dark `#3D5167` in this theme. Use `text-white` and `text-white/80` explicitly for all text on this surface — do NOT use `on-primary-container` (which maps to mint green `#8ECAB0`).
- **Layout**: Split — left content, right product image
- **Left side**:
  - Breadcrumb trail: `text-[10px] uppercase tracking-widest opacity-70` white text (e.g., "Home / Drinkware / Can Coolers")
  - Category title: `font-headline text-4xl lg:text-5xl font-extrabold tracking-tighter text-white`
  - Tagline: `text-white/80 text-lg` (e.g., "Keep drinks cold. Keep your brand hot.")
- **Right side**: Lifestyle/product image in a rounded container, `rounded-xl overflow-hidden`
- **Padding**: `py-16 px-12 lg:px-16`
- **Spacing**: `mt-24` (accounts for fixed nav) `mb-8`

### 3. Sticky Filter Bar

Positioned below the hero. Becomes `sticky top-[60px]` when scrolled past. (The nav height is approximately 60px: utility bar ~28px + main nav ~32px. Adjust the exact value during implementation if needed.)

**Container styling**:
- `bg-white/80 backdrop-blur-md`
- `border-b border-outline-variant/30`
- `py-4 px-4 md:px-8 lg:px-16`
- `z-40` (below nav's z-50)

**Left side — Filter chips**:
- Horizontal row of pill-shaped buttons, `rounded-full`, `text-sm font-semibold`
- **Active state**: `bg-primary text-white`
- **Inactive state**: `bg-white border border-outline-variant text-on-surface-variant`
- Default active chip: "All"
- Quick-access chips: sub-categories relevant to the category (e.g., Collapsible, Neoprene, Foam, Slim Can)
- **"More Filters" chip**: funnel icon + text, opens a dropdown panel
  - Panel: `bg-white rounded-lg shadow-ambient-lg p-6`
  - Contains: Brand multi-select, Price range slider, Color count, additional attributes
  - Positioned absolutely below the chip

**Right side**:
- Product count: `text-secondary text-sm` (e.g., "48 products")
- Sort dropdown: minimal borderless select, `text-sm font-semibold` (options: Best Sellers, Price Low-High, Price High-Low, Newest, Best Reviewed)

**Active filter chips**:
- Appear in a row below the main filter bar when filters are applied
- Styled as `bg-surface-container rounded-full text-sm px-3 py-1` with a dismiss "x" button
- Example: "Neoprene x", "$1-$5 x"

### 4. Product Grid

- **Layout**: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8`
- **Container**: `max-w-[1400px] mx-auto px-4 md:px-8 lg:px-16 py-8`

#### Product Card Structure

Each card is a clickable `group` element:

**Image area**:
- `aspect-[4/5] bg-[#f5f5f7] rounded-lg overflow-hidden mb-6 relative`
- Product image: `w-full h-full object-cover mix-blend-multiply`
- Hover: `group-hover:scale-105 transition-transform duration-500`
- **Badge** (optional): absolute top-left, `bg-primary text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest` (e.g., "Trending", "Best Seller")
- **Customize button** (hover): fades in at bottom of image area on hover, `bg-primary text-white rounded-full py-2 px-6 text-sm font-bold`, centered with `opacity-0 group-hover:opacity-100 transition-opacity duration-300`

**Text content** (below image):
1. **Product name**: `font-bold text-on-surface mb-1`, single line, `truncate` for overflow
2. **Star rating**: inline flex row
   - Gold stars: `text-[#FFB300]` (filled star icons)
   - Review count: `text-[11px] text-secondary ml-1` e.g., "(127)"
3. **Meta line**: `text-[11px] text-secondary mb-2 uppercase font-semibold`
   - Format: "Min {qty} · {count} Colors" (e.g., "Min 25 · 104 Colors")
4. **Price**: `text-primary font-bold`
   - Format: "From ${price}" with `/ea` in `text-secondary text-xs font-normal`

### 5. Infinite Scroll (Simulated)

Since this is a static HTML prototype with no backend, infinite scroll is simulated client-side:

- All product cards are pre-rendered in the HTML but grouped into batches (e.g., 12 per batch)
- Batches beyond the first are hidden with `display: none`
- An Intersection Observer watches a sentinel element at the bottom of the visible grid
- When triggered, the next hidden batch is revealed with a short delay and `fade-up` animation
- A CSS spinner shows briefly during the reveal delay to simulate loading

**Loading state**:
- Small spinner (CSS `@keyframes` animation) centered below grid in `text-secondary`
- Text: "Loading more products..." in `text-secondary text-sm`
- New product cards enter with `fade-up` animation (same as home page: `opacity: 0 → 1`, `translateY(40px) → 0`, `0.8s ease`)

**End of results**:
- Once all batches are revealed, sentinel is disconnected
- Centered text below grid: "You've seen all {count} products"
- `text-secondary text-sm py-8`

**No results (empty state)**:
- Centered container, `py-20`
- Material icon: `search_off`, `text-6xl text-outline`
- Heading: "No products match your filters", `font-headline text-xl font-bold`
- Subtext: "Try adjusting your filters or browse all products", `text-secondary text-sm`
- CTA button: "Clear All Filters", `btn-primary` styling (same as home page buttons)

### 6. Shared Footer

Identical to the home page footer.

## Responsive Behavior

- **Desktop (lg+)**: 3-column grid, split hero, full filter bar
- **Tablet (sm-lg)**: 2-column grid, hero stacks vertically (image below text), filter chips scroll horizontally
- **Mobile (< sm)**: 1-column grid, compact hero (no image, just text on dark bg), filter chips in horizontal scroll container, "More Filters" becomes the primary filter access point (full-screen slide-up panel)

## Interactions

| Element | Interaction | Behavior |
|---------|-----------|----------|
| Filter chip | Click | Toggles active state, filters grid, updates product count |
| "More Filters" chip | Click | Opens dropdown panel with additional filters |
| Active filter dismiss | Click "x" | Removes that filter, updates grid |
| Sort dropdown | Change | Re-sorts grid with fade transition |
| Product card | Hover | Image scales up, "Customize Now" button fades in |
| Product card | Click | Navigates to product detail page |
| Scroll to bottom | Scroll | Loads next batch of products with fade-up animation |

## File

The category page will be built as a standalone HTML file (`category.html`) in the project root, sharing the same Tailwind CDN config, fonts, and design tokens as `code.html`. The nav and footer markup will be duplicated (no build system/components in this static prototype).
