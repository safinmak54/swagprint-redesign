# Design Studio — Multi-Color Selection + Quantity/Sizes Slide-Out

**Date:** 2026-04-22
**Status:** Approved

## Problem

The Design Lab currently supports selecting a single color per order. Bulk customers frequently need the same product in multiple colors (e.g., 50 black + 30 navy + 20 white). The existing inline quantity stepper and size breakdown in the right panel cannot accommodate per-color configuration without becoming unmanageably cramped.

## Solution Overview

Two coordinated changes:

1. **Multi-color selection** — Color swatches in ProductInfo become multi-select toggles. Selected colors appear as compact chips below the swatches.
2. **Quantity/Sizes slide-out drawer** — A right-side drawer (~420px) opens via a "Configure Sizes & Qty" button, providing per-color quantity steppers and size breakdowns in a stacked accordion layout.

## Design Decisions

| Decision | Choice | Alternatives Considered |
|----------|--------|------------------------|
| Per-color quantity model | Each color has independent qty; total = sum | Split a fixed total across colors; hybrid |
| Drawer trigger | Dedicated "Configure Sizes & Qty" button | Click color row to open; auto-open on color add |
| Drawer position | Right-side overlay (~420px) | Bottom sheet; center modal |
| Per-color layout inside drawer | Stacked accordions (one expanded at a time) | Tabbed color chips |

## Section 1: Multi-Color Selection (ProductInfo)

### Current Behavior
- Single color swatch row; clicking one replaces the selection
- `selectedColor` is a single string in the store

### New Behavior
- Clicking a color swatch **toggles** it in/out of a selected colors list
- Below the swatches, selected colors render as compact chips: `● Black (50)  ● Navy (20)  ✕`
- Each chip shows: swatch dot, color name, quantity, remove button (✕)
- Clicking ✕ removes the color (minimum 1 color must remain selected)
- Canvas mockup shows the most recently clicked color
- The inline quantity stepper and size breakdown are **removed** from ProductInfo and replaced by a summary line + the "Configure Sizes & Qty" button

## Section 2: Quantity/Sizes Slide-Out Drawer

### Trigger
A button below the selected color chips in ProductInfo:
- Label: "Configure Sizes & Qty"
- Subtitle summary: "3 colors · 80 total units"

### Drawer Behavior
- Slides in from the right edge, ~420px wide
- Overlays the right panel (does not push layout)
- Semi-transparent backdrop dims the rest of the UI
- Closes via: ✕ button, clicking backdrop, or Escape key

### Drawer Contents (top to bottom)

1. **Header:** Title "Configure Sizes & Qty" + total summary + close (✕) button

2. **Stacked accordion cards** — one per selected color:
   - **Collapsed state:** color swatch dot, color name, unit count, chevron (▾)
   - **Expanded state:** 
     - Quantity stepper (−/+) for that color's total
     - Size breakdown grid: size label | progress bar | number input (same pattern as existing `SizeBreakdown`)
     - "X of Y assigned" counter
   - First color auto-expanded on drawer open
   - Only one accordion expanded at a time (expanding one collapses the other)

3. **"+ Add Another Color" button** — opens a mini color picker showing available swatches (minus already-selected colors). Selecting one adds a new accordion card with a default quantity of 1.

### Size Assignment Validation
The drawer allows partial size assignment (assigned < color quantity). No blocking validation — the "X of Y assigned" counter serves as a visual nudge. The "Done" button always closes the drawer regardless of assignment state.

4. **Sticky footer:** Grand total line ("80 units · $1,600.00") + "Done" button that closes the drawer

### Products Without Sizes
Products like lanyards that have no sizes: the accordion expanded state shows only the quantity stepper, no size breakdown grid.

## Section 3: Data Model Changes

### Store (`store/index.ts`)

**Remove:**
- `selectedColor: string`
- `selectedSizes: Record<string, number>`
- `totalQuantity: number`
- `setColor()`
- `setQuantity()`
- `setSizeBreakdown()`

**Add:**
```typescript
interface ColorOrder {
  color: string       // color name, matches product.colors[].name
  quantity: number     // total qty for this color
  sizes: Record<string, number>  // per-size breakdown (empty for non-sized products)
}

// In DesignLabState:
colorOrders: ColorOrder[]          // array of per-color orders
activeCanvasColor: string          // which color the canvas shows (last clicked)
drawerOpen: boolean                // slide-out drawer visibility

// Computed:
totalQuantity                      // sum of all colorOrders[].quantity

// Actions:
addColorOrder(color: string)       // add a new color with quantity = 1
removeColorOrder(color: string)    // remove a color (min 1 must remain)
updateColorOrder(color: string, updates: Partial<Omit<ColorOrder, 'color'>>)
setActiveCanvasColor(color: string)
setDrawerOpen(open: boolean)
```

### Derived `totalQuantity`
`totalQuantity` is not stored — it is accessed via a Zustand selector: `useStore(s => s.colorOrders.reduce((sum, co) => sum + co.quantity, 0))`. A convenience selector `useTotalQuantity()` can be exported for reuse.

### `selectProduct()` Migration
The existing `selectProduct()` action initializes `selectedColor`, `selectedSizes`, and `totalQuantity`. It must be updated to initialize `colorOrders` instead: `[{ color: product.colors[0]?.name, quantity: 50, sizes: {} }]` and set `activeCanvasColor` to the first color.

### Quote Calculation
`calcQuote()` changes from `(product, qty, addOns)` to `(product, colorOrders, addOns)`. The total quantity is `colorOrders.reduce((sum, co) => sum + co.quantity, 0)`. Bulk tier lookup uses the total across all colors (not per-color).

## Section 4: File Impact

| File | Change |
|------|--------|
| `store/index.ts` | Replace single-color state with `colorOrders` array, new actions, updated quote calc |
| `ProductInfo.tsx` | Multi-select swatches, selected color chips, remove inline qty/size, add "Configure" button |
| **New:** `SizeQtyDrawer.tsx` | Slide-out drawer with accordion list, per-color qty/size, add-color picker, sticky footer |
| `DesignLab.tsx` | Render `SizeQtyDrawer` at layout root for proper overlay positioning |
| `RightPanel.tsx` | No structural change |
| `StickyCart.tsx` | Replace `setQuantity`/`totalQuantity` usage with derived total from `colorOrders`; qty stepper opens the drawer instead of inline ±. Quote display unchanged. |
| `ChatPanel.tsx` | Update state snapshot (line ~42): replace `selectedColor`/`selectedSizes`/`totalQuantity` with `colorOrders`/`activeCanvasColor`. Update `formatToolName` map: replace `setColor`→`addColorOrder`, `setQuantity`→`updateColorOrder`. |
| `services/actionExecutor.ts` | May need updates if it maps chat AI tool calls to store actions — verify and update action names. |

### Untouched
- `CanvasPanel.tsx`, `ToolPanel.tsx`, `TopNav.tsx`
- All other ProductInfo sections (width, length, attachment, print method, imprint side, stitch style, add-ons)
- `DesignOnlyStudio.tsx`, `ProductCatalog.tsx`
