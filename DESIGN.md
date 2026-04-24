# Design System Document: Editorial Precision & Dimensional Trust

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Architectural Monolith."** 

Moving away from the cluttered, "commodity" feel of standard print services, this system treats every product and service as a premium artifact. We achieve this through **Editorial Asymmetry**: leveraging vast amounts of white space (`surface`) against high-contrast, authoritative typography. The design breaks the traditional "template" grid by using overlapping elements—where imagery or text blocks bleed across container boundaries—to create a sense of bespoke craftsmanship. We are not just printing; we are curating a brand's physical presence.

## 2. Colors & Surface Architecture
This system relies on tonal depth rather than structural lines. By utilizing the Slate Gray and Navy palette, we create a professional environment that feels "solid" and "high-stakes."

### The "No-Line" Rule
**Explicit Instruction:** 1px solid borders for sectioning are strictly prohibited. Boundaries must be defined solely through background color shifts or subtle tonal transitions.
*   **Implementation:** To separate a product gallery from a hero section, transition from `surface` (#f8f9ff) to `surface-container-low` (#eef4ff). 

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of frosted glass.
*   **The Foundation:** `surface` (#f8f9ff)
*   **The Content Blocks:** `surface-container-lowest` (#ffffff) cards sitting on the foundation to provide a "pure" clean lift.
*   **The Emphasis Layers:** `surface-container-high` (#dae9ff) for interactive sidebars or utility drawers.

### The "Glass & Gradient" Rule
To escape a flat, generic look, use **Glassmorphism** for floating navigation and modal overlays.
*   **Token:** Use `surface-variant` (#d3e4fb) at 60% opacity with a `20px` backdrop-blur. 
*   **Signature Textures:** For primary CTAs and Hero backgrounds, use a subtle linear gradient: `primary` (#001f9d) to `primary-container` (#1032cf) at a 135-degree angle. This adds "soul" and a sense of movement.

## 3. Typography: The Editorial Voice
The system uses a high-contrast pairing to balance authority with utility.

*   **Display & Headlines (Plus Jakarta Sans):** Despite the brand's history with Montserrat, we utilize **Plus Jakarta Sans** for our display scale to provide a more modern, geometric, and "premium-tech" feel. These should be set with tight letter-spacing (-0.02em) to feel like a high-end magazine.
*   **Body & Titles (Inter):** Used for all functional reading. Inter provides the "Trustworthy" pillar, offering maximum legibility at small scales.
*   **Hierarchy as Identity:** Use `display-lg` (3.5rem) for hero statements, paired immediately with `body-lg` (1rem) for descriptions. The jump in scale creates a dramatic, intentional look that signals confidence.

## 4. Elevation & Depth
We eschew the "flat" trend in favor of **Tonal Layering**.

### The Layering Principle
Depth is achieved by "stacking" surface-container tiers. Place a `surface-container-lowest` card on a `surface-container-low` section. The contrast in hex values provides all the separation necessary.

### Ambient Shadows
When a "floating" effect is required for high-priority cards:
*   **Blur:** 40px to 60px.
*   **Opacity:** 4%-6%.
*   **Color:** Use a tinted shadow (`on-surface` #0b1d2d) rather than pure black. This mimics natural light passing through a premium surface.

### The "Ghost Border" Fallback
If a border is required for accessibility in input fields:
*   Use `outline-variant` (#c5c5d8) at **20% opacity**. 100% opaque borders are forbidden as they "trap" the eye and break the spacious flow.

## 5. Components

### Buttons
*   **Primary (Pill-Shaped):** `primary` (#001f9d) background, `on-primary` (#ffffff) text. Use a 135-degree gradient to `primary-container` on hover.
*   **Secondary:** `surface-container-highest` (#d3e4fb) background with `on-secondary-container` (#546478) text. No border.
*   **Tertiary:** Transparent background, `primary` text, with a `0.5rem` underline appearing only on hover.

### Cards & Lists
*   **The Card Rule:** Forbid divider lines. Separate content using the `md` (1.5rem) or `lg` (2rem) Spacing Scale.
*   **Interaction:** Cards should "lift" using the Ambient Shadow spec on hover, rather than changing background color.

### Input Fields
*   **Style:** Minimalist. `surface-container-low` background, no border, `sm` (0.5rem) rounding. 
*   **States:** On focus, the background shifts to `surface-container-lowest` with a "Ghost Border" of `primary` at 30% opacity.

### Featured Component: The Product "Artifact" Chip
*   **Usage:** For selecting print finishes (Matte, Gloss, Foil).
*   **Design:** `pill-shaped`, using `surface-container-high` for unselected and a `primary` to `tertiary` gradient for selected, creating a tactile, high-end "button" feel.

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical margins (e.g., 80px left, 120px right) in editorial sections to create visual interest.
*   **Do** allow images to break out of their containers ("Bleed Effect") to emphasize the physical nature of print.
*   **Do** use `plusJakartaSans` for large numbers and statistics to lean into the "Architectural" feel.

### Don't:
*   **Don't** use 1px solid borders to define the edges of the screen or sections.
*   **Don't** use pure `#000000` for body text; use `on-surface` (#0b1d2d) to maintain tonal sophistication.
*   **Don't** use standard "drop shadows" with high opacity or small blurs; they look "cheap" and dated.
*   **Don't** crowd the layout. If a section feels "full," double the padding. Space is a luxury brand's best friend.