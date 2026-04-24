# Multi-Color Selection + Quantity/Sizes Drawer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users select multiple colors with per-color quantities and size breakdowns via a slide-out drawer.

**Architecture:** Replace single-color store state with a `colorOrders` array. Convert color swatches in `DesignToolPanel` to multi-select toggles with chips. Add a new `SizeQtyDrawer` component that slides in from the right with per-color accordion cards containing qty steppers and size breakdowns.

**Tech Stack:** React 18, TypeScript, Zustand, Tailwind CSS v4

**Spec:** `docs/superpowers/specs/2026-04-22-multi-color-qty-sizes-drawer-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `design-lab/src/store/index.ts` | Modify | Replace `selectedColor`/`selectedSizes`/`totalQuantity` with `colorOrders` array + new actions |
| `design-lab/src/components/DesignToolPanel.tsx` | Modify | Multi-select color swatches, selected color chips, "Configure Sizes & Qty" button |
| `design-lab/src/components/SizeQtyDrawer.tsx` | Create | Slide-out drawer with per-color accordion cards, qty steppers, size breakdowns |
| `design-lab/src/components/DesignLab.tsx` | Modify | Mount `SizeQtyDrawer` at layout root for overlay positioning |
| `design-lab/src/components/StickyCart.tsx` | Modify | Read `totalQuantity` from derived selector instead of direct state |

---

### Task 1: Update Store — ColorOrders Data Model

**Files:**
- Modify: `design-lab/src/store/index.ts`

- [ ] **Step 1: Add ColorOrder type and update DesignLabState interface**

In `design-lab/src/store/index.ts`, add the `ColorOrder` interface after the existing `Quote` interface (around line 54), then update `DesignLabState`:

```typescript
export interface ColorOrder {
  color: string
  quantity: number
  sizes: Record<string, number>
}
```

In the `DesignLabState` interface, **replace** these fields:
```typescript
// REMOVE:
selectedColor: string
selectedSizes: Record<string, number>
totalQuantity: number
setColor: (colorName: string) => void
setQuantity: (qty: number) => void
setSizeBreakdown: (sizes: Record<string, number>) => void
```

With:
```typescript
// ADD:
colorOrders: ColorOrder[]
activeCanvasColor: string
drawerOpen: boolean
addColorOrder: (color: string) => void
removeColorOrder: (color: string) => void
updateColorOrder: (color: string, updates: Partial<Omit<ColorOrder, 'color'>>) => void
toggleColorOrder: (color: string) => void
setActiveCanvasColor: (color: string) => void
setDrawerOpen: (open: boolean) => void
```

Keep `totalQuantity` as a **stored field** that gets recalculated by a helper, for backwards compat with `StickyCart` and other consumers.

- [ ] **Step 2: Add getTotalQuantity helper and update calcQuote**

Add helper above the store:

```typescript
function getTotalQuantity(colorOrders: ColorOrder[]): number {
  return colorOrders.reduce((sum, co) => sum + co.quantity, 0)
}
```

Update `calcQuote` signature — it still takes `qty` as a number (the total across all colors):
```typescript
function calcQuote(product: Product, qty: number, addOns: string[]): Quote {
  // ... unchanged
}
```

- [ ] **Step 3: Update store initial state and actions**

Replace the initial state and single-color actions in the `create<DesignLabState>` call:

```typescript
// Initial state — replace selectedColor/selectedSizes/totalQuantity:
colorOrders: [{ color: defaultProduct.colors[0]?.name ?? '', quantity: 50, sizes: {} }],
activeCanvasColor: defaultProduct.colors[0]?.name ?? '',
drawerOpen: false,
totalQuantity: 50,

// ... keep quote init but fix qty:
quote: calcQuote(defaultProduct, 50, []),
```

Replace `setColor`, `setQuantity`, `setSizeBreakdown` with:

```typescript
addColorOrder: (color) => {
  set((s) => {
    if (s.colorOrders.some(co => co.color === color)) return s
    const newOrders = [...s.colorOrders, { color, quantity: 1, sizes: {} }]
    const total = getTotalQuantity(newOrders)
    return {
      colorOrders: newOrders,
      activeCanvasColor: color,
      totalQuantity: total,
      quote: calcQuote(s.product, total, s.activeAddOns),
    }
  })
},

removeColorOrder: (color) => {
  set((s) => {
    if (s.colorOrders.length <= 1) return s
    const newOrders = s.colorOrders.filter(co => co.color !== color)
    const total = getTotalQuantity(newOrders)
    return {
      colorOrders: newOrders,
      activeCanvasColor: newOrders[0].color,
      totalQuantity: total,
      quote: calcQuote(s.product, total, s.activeAddOns),
    }
  })
},

updateColorOrder: (color, updates) => {
  set((s) => {
    const newOrders = s.colorOrders.map(co =>
      co.color === color ? { ...co, ...updates } : co
    )
    // If sizes were updated, recalc that color's quantity from sizes
    const target = newOrders.find(co => co.color === color)
    if (target && updates.sizes) {
      const sizeTotal = Object.values(updates.sizes).reduce((a, b) => a + b, 0)
      if (sizeTotal > 0) target.quantity = sizeTotal
    }
    const total = getTotalQuantity(newOrders)
    return {
      colorOrders: newOrders,
      totalQuantity: total,
      quote: calcQuote(s.product, total, s.activeAddOns),
    }
  })
},

toggleColorOrder: (color) => {
  set((s) => {
    const exists = s.colorOrders.some(co => co.color === color)
    if (exists) {
      // Remove if more than 1
      if (s.colorOrders.length <= 1) return s
      const newOrders = s.colorOrders.filter(co => co.color !== color)
      const total = getTotalQuantity(newOrders)
      return {
        colorOrders: newOrders,
        activeCanvasColor: newOrders[0].color,
        totalQuantity: total,
        quote: calcQuote(s.product, total, s.activeAddOns),
      }
    } else {
      const newOrders = [...s.colorOrders, { color, quantity: 1, sizes: {} }]
      const total = getTotalQuantity(newOrders)
      return {
        colorOrders: newOrders,
        activeCanvasColor: color,
        totalQuantity: total,
        quote: calcQuote(s.product, total, s.activeAddOns),
      }
    }
  })
},

setActiveCanvasColor: (color) => set({ activeCanvasColor: color }),

setDrawerOpen: (open) => set({ drawerOpen: open }),
```

- [ ] **Step 4: Update selectProduct to initialize colorOrders**

In the `selectProduct` action, replace the `selectedColor`, `selectedSizes` initialization:

```typescript
selectProduct: (productId) => {
  const product = catalog.find(p => p.id === productId)
  if (!product) return
  const fromUrl = new URLSearchParams(window.location.search).get('product') === productId
  const firstColor = product.colors[0]?.name ?? ''
  set((s) => ({
    product,
    colorOrders: [{ color: firstColor, quantity: s.totalQuantity, sizes: {} }],
    activeCanvasColor: firstColor,
    selectedWidth: (product as any).widths?.[2] ?? (product as any).widths?.[0] ?? '',
    selectedLength: (product as any).lengths?.[1] ?? (product as any).lengths?.[0] ?? '',
    selectedAttachment: (product as any).attachments?.[0] ?? '',
    selectedPrintMethod: (product as any).printMethods?.[0] ?? '',
    selectedImprintSide: (product as any).imprintSides?.[0] ?? 'One-Sided',
    selectedStitchStyle: (product as any).stitchStyles?.[0] ?? 'Sewn',
    activeAddOns: [],
    quote: calcQuote(product, s.totalQuantity, []),
    messages: fromUrl ? [{
      id: 'welcome',
      role: 'assistant' as const,
      content: `I've loaded your ${product.name}. Let's customize it! Upload your logo or tell me what you'd like to add.`,
      timestamp: Date.now(),
    }] : s.messages,
  }))
},
```

- [ ] **Step 5: Update toggleAddOn to use getTotalQuantity**

```typescript
toggleAddOn: (addOnKey) => {
  set((s) => {
    const addOns = s.activeAddOns.includes(addOnKey)
      ? s.activeAddOns.filter(k => k !== addOnKey)
      : [...s.activeAddOns, addOnKey]
    const total = getTotalQuantity(s.colorOrders)
    return {
      activeAddOns: addOns,
      quote: calcQuote(s.product, total, addOns),
    }
  })
},
```

- [ ] **Step 6: Verify app compiles**

Run: `cd design-lab && npx tsc --noEmit`

Fix any type errors. The `DesignToolPanel` will have errors because it still references `selectedColor` and `setColor` — that's expected and fixed in Task 2.

- [ ] **Step 7: Commit**

```bash
git add design-lab/src/store/index.ts
git commit -m "feat(store): replace single-color state with colorOrders array"
```

---

### Task 2: Update DesignToolPanel — Multi-Select Color Swatches + Chips

**Files:**
- Modify: `design-lab/src/components/DesignToolPanel.tsx`

- [ ] **Step 1: Update store imports**

Replace the single-color store reads with multi-color:

```typescript
// REMOVE these lines:
const selectedColor = useStore(s => s.selectedColor)
const setColor = useStore(s => s.setColor)

// ADD these lines:
const colorOrders = useStore(s => s.colorOrders)
const activeCanvasColor = useStore(s => s.activeCanvasColor)
const toggleColorOrder = useStore(s => s.toggleColorOrder)
const removeColorOrder = useStore(s => s.removeColorOrder)
const setActiveCanvasColor = useStore(s => s.setActiveCanvasColor)
const setDrawerOpen = useStore(s => s.setDrawerOpen)
const totalQuantity = useStore(s => s.totalQuantity)
```

- [ ] **Step 2: Replace color section with multi-select swatches + chips + configure button**

Replace the entire `{product.colors.length > 0 && ( <CollapsibleSection label="Color" ...` block with:

```tsx
{product.colors.length > 0 && (
  <CollapsibleSection
    label="Color"
    value={colorOrders.length === 1 ? colorOrders[0].color : `${colorOrders.length} colors`}
    defaultOpen={true}
  >
    {/* Multi-select swatches */}
    <div className="flex gap-1.5 flex-wrap">
      {product.colors.map((c) => {
        const isSelected = colorOrders.some(co => co.color === c.name)
        return (
          <button
            key={c.name}
            onClick={() => {
              toggleColorOrder(c.name)
              setActiveCanvasColor(c.name)
            }}
            className={`w-6 h-6 rounded-full transition-all ${
              isSelected
                ? 'ring-2 ring-primary ring-offset-1 ring-offset-white'
                : 'hover:ring-1 hover:ring-secondary/30'
            }`}
            style={{ backgroundColor: c.hex }}
            title={c.name}
          />
        )
      })}
    </div>

    {/* Selected color chips */}
    <div className="flex flex-wrap gap-1.5 mt-2">
      {colorOrders.map((co) => {
        const hex = product.colors.find(c => c.name === co.color)?.hex ?? '#ccc'
        return (
          <span
            key={co.color}
            className="inline-flex items-center gap-1 bg-surface-container-low rounded-full pl-1.5 pr-1 py-0.5 text-[10px] text-on-surface"
          >
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: hex }}
            />
            <span className="font-medium">{co.color}</span>
            <span className="text-secondary">({co.quantity})</span>
            {colorOrders.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); removeColorOrder(co.color) }}
                className="ml-0.5 text-secondary hover:text-on-surface text-[10px] leading-none"
              >✕</button>
            )}
          </span>
        )
      })}
    </div>

    {/* Configure Sizes & Qty button */}
    <button
      onClick={() => setDrawerOpen(true)}
      className="w-full mt-2 py-2 bg-primary/10 text-primary text-[11px] font-semibold rounded-lg hover:bg-primary/15 transition-colors"
    >
      Configure Sizes & Qty
      <span className="block text-[9px] text-secondary font-normal mt-0.5">
        {colorOrders.length} color{colorOrders.length !== 1 ? 's' : ''} · {totalQuantity} total units
      </span>
    </button>
  </CollapsibleSection>
)}
```

- [ ] **Step 3: Verify app compiles and renders**

Run: `cd design-lab && npx tsc --noEmit`

Open `http://localhost:5174` and verify:
- Color swatches are clickable and multi-select (ring appears on selected)
- Chips appear below showing selected colors with quantities
- "Configure Sizes & Qty" button appears
- Clicking the button doesn't do anything visible yet (drawer built in Task 3)

- [ ] **Step 4: Commit**

```bash
git add design-lab/src/components/DesignToolPanel.tsx
git commit -m "feat(design-tool-panel): multi-select color swatches with chips and configure button"
```

---

### Task 3: Create SizeQtyDrawer Component

**Files:**
- Create: `design-lab/src/components/SizeQtyDrawer.tsx`

- [ ] **Step 1: Create the drawer component**

Create `design-lab/src/components/SizeQtyDrawer.tsx`:

```tsx
import { useState, useEffect } from 'react'
import { useStore } from '../store'

export function SizeQtyDrawer() {
  const drawerOpen = useStore(s => s.drawerOpen)
  const setDrawerOpen = useStore(s => s.setDrawerOpen)
  const product = useStore(s => s.product)
  const colorOrders = useStore(s => s.colorOrders)
  const totalQuantity = useStore(s => s.totalQuantity)
  const quote = useStore(s => s.quote)
  const updateColorOrder = useStore(s => s.updateColorOrder)
  const addColorOrder = useStore(s => s.addColorOrder)
  const removeColorOrder = useStore(s => s.removeColorOrder)

  const [expandedColor, setExpandedColor] = useState<string | null>(null)
  const [showColorPicker, setShowColorPicker] = useState(false)

  // Auto-expand first color when drawer opens
  useEffect(() => {
    if (drawerOpen && colorOrders.length > 0) {
      setExpandedColor(colorOrders[0].color)
      setShowColorPicker(false)
    }
  }, [drawerOpen])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drawerOpen) setDrawerOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [drawerOpen, setDrawerOpen])

  if (!drawerOpen) return null

  const selectedColorNames = colorOrders.map(co => co.color)
  const availableColors = product.colors.filter(c => !selectedColorNames.includes(c.name))

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={() => setDrawerOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-[420px] bg-white shadow-ambient-lg z-50 flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline">
          <div>
            <h3 className="font-display text-sm font-bold text-on-surface">Configure Sizes & Qty</h3>
            <p className="text-[10px] text-secondary mt-0.5">
              {colorOrders.length} color{colorOrders.length !== 1 ? 's' : ''} · {totalQuantity} total units
            </p>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-low text-secondary hover:text-on-surface transition-colors"
          >✕</button>
        </div>

        {/* Accordion list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
          {colorOrders.map((co) => {
            const hex = product.colors.find(c => c.name === co.color)?.hex ?? '#ccc'
            const isExpanded = expandedColor === co.color
            return (
              <div key={co.color} className="bg-surface-container-low rounded-xl overflow-hidden">
                {/* Accordion header */}
                <button
                  onClick={() => setExpandedColor(isExpanded ? null : co.color)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container transition-colors"
                >
                  <span className="w-5 h-5 rounded-full shrink-0" style={{ backgroundColor: hex }} />
                  <span className="text-sm font-semibold text-on-surface">{co.color}</span>
                  <span className="ml-auto text-[11px] text-secondary">{co.quantity} units</span>
                  <span className="text-[12px] text-secondary">{isExpanded ? '▴' : '▾'}</span>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-4 pb-4">
                    {/* Quantity stepper */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] uppercase tracking-widest text-secondary font-semibold">Quantity</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateColorOrder(co.color, { quantity: Math.max(1, co.quantity - 1) })}
                          className="w-7 h-7 rounded-md bg-surface-container text-secondary hover:text-on-surface transition-colors text-sm flex items-center justify-center"
                        >−</button>
                        <input
                          type="number"
                          min={1}
                          value={co.quantity}
                          onChange={(e) => updateColorOrder(co.color, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                          className="w-14 text-center bg-white text-on-surface font-bold text-sm rounded-md border border-outline py-1 focus:border-primary outline-none"
                        />
                        <button
                          onClick={() => updateColorOrder(co.color, { quantity: co.quantity + 1 })}
                          className="w-7 h-7 rounded-md bg-surface-container text-secondary hover:text-on-surface transition-colors text-sm flex items-center justify-center"
                        >+</button>
                      </div>
                    </div>

                    {/* Size breakdown — only for products with sizes */}
                    {product.sizes.length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-secondary font-semibold mb-2">Size Breakdown</p>
                        <div className="space-y-1.5">
                          {product.sizes.map((size) => {
                            const qty = co.sizes[size] ?? 0
                            const pct = co.quantity > 0 ? (qty / co.quantity) * 100 : 0
                            return (
                              <div key={size} className="flex items-center gap-2 text-xs">
                                <span className="w-7 text-secondary">{size}</span>
                                <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary rounded-full transition-all"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <input
                                  type="number"
                                  min={0}
                                  value={qty}
                                  onChange={(e) => {
                                    const val = Math.max(0, parseInt(e.target.value) || 0)
                                    updateColorOrder(co.color, { sizes: { ...co.sizes, [size]: val } })
                                  }}
                                  className="w-12 text-center bg-white text-on-surface rounded-md px-1 py-0.5 text-[11px] border border-outline focus:border-primary outline-none"
                                />
                              </div>
                            )
                          })}
                          <p className="text-[10px] text-secondary mt-1">
                            {Object.values(co.sizes).reduce((a, b) => a + b, 0)} of {co.quantity} assigned
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Remove color */}
                    {colorOrders.length > 1 && (
                      <button
                        onClick={() => removeColorOrder(co.color)}
                        className="mt-3 text-[10px] text-red-500 hover:text-red-700 transition-colors"
                      >
                        Remove this color
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {/* Add another color */}
          {availableColors.length > 0 && (
            <div>
              {showColorPicker ? (
                <div className="bg-surface-container-low rounded-xl p-4">
                  <p className="text-[10px] uppercase tracking-widest text-secondary font-semibold mb-2">Select a color</p>
                  <div className="flex gap-2 flex-wrap">
                    {availableColors.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => {
                          addColorOrder(c.name)
                          setExpandedColor(c.name)
                          setShowColorPicker(false)
                        }}
                        className="w-7 h-7 rounded-full hover:ring-2 hover:ring-primary hover:ring-offset-1 transition-all"
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setShowColorPicker(false)}
                    className="mt-2 text-[10px] text-secondary hover:text-on-surface"
                  >Cancel</button>
                </div>
              ) : (
                <button
                  onClick={() => setShowColorPicker(true)}
                  className="w-full py-3 border border-dashed border-outline rounded-xl text-primary text-[11px] font-semibold hover:bg-surface-container-low transition-colors"
                >
                  + Add Another Color
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sticky footer */}
        <div className="px-5 py-4 border-t border-outline bg-white">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-on-surface font-bold">{totalQuantity} units</span>
            <span className="text-sm text-on-surface font-bold">${quote.grandTotal.toFixed(2)}</span>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-full bg-primary text-on-primary text-sm font-bold py-3 rounded-full hover:opacity-90 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Add slide-in animation to CSS**

Add to `design-lab/src/index.css` at the end:

```css
@keyframes slide-in-right {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.animate-slide-in {
  animation: slide-in-right 0.2s ease-out;
}
```

- [ ] **Step 3: Verify the component renders**

Run: `cd design-lab && npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add design-lab/src/components/SizeQtyDrawer.tsx design-lab/src/index.css
git commit -m "feat: add SizeQtyDrawer component with per-color accordion layout"
```

---

### Task 4: Mount Drawer in DesignLab Layout

**Files:**
- Modify: `design-lab/src/components/DesignLab.tsx`

- [ ] **Step 1: Import and render SizeQtyDrawer**

Add import and render at the layout root (after the flex container, so it overlays):

```tsx
import { DesignToolPanel } from './DesignToolPanel'
import { CanvasPanel } from './CanvasPanel'
import { StickyCart } from './StickyCart'
import { SizeQtyDrawer } from './SizeQtyDrawer'

export function DesignLab() {
  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between px-5 py-2 bg-white/80 backdrop-blur-md border-b border-outline shadow-ambient">
        <div className="flex items-center gap-4">
          <span className="font-display font-extrabold text-sm tracking-tighter text-on-surface">SwagPrint</span>
          <span className="text-[10px] text-secondary font-semibold uppercase tracking-widest">Design Studio</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => (window as any).__designLab?.undo?.()}
            className="p-1.5 hover:bg-surface-container-low rounded-md text-secondary hover:text-on-surface transition-colors text-sm"
            title="Undo (Ctrl+Z)"
          >↩</button>
          <button
            onClick={() => (window as any).__designLab?.redo?.()}
            className="p-1.5 hover:bg-surface-container-low rounded-md text-secondary hover:text-on-surface transition-colors text-sm"
            title="Redo (Ctrl+Shift+Z)"
          >↪</button>
          <button className="text-xs text-secondary hover:text-on-surface transition-colors">Save</button>
          <button className="bg-primary text-on-primary text-xs font-bold px-5 py-2 rounded-full hover:opacity-90 transition-all">
            Add to Cart
          </button>
        </div>
      </header>
      <div className="flex flex-1 min-h-0">
        <DesignToolPanel />
        <CanvasPanel />
        <StickyCart />
      </div>
      <SizeQtyDrawer />
    </div>
  )
}
```

- [ ] **Step 2: Verify full flow works**

Open `http://localhost:5174` and test:
1. Click multiple color swatches — chips appear with quantities
2. Click "Configure Sizes & Qty" — drawer slides in from right
3. Expand a color accordion — qty stepper and size breakdown appear
4. Change qty — total updates in drawer footer and StickyCart
5. Click "+ Add Another Color" — color picker appears, selecting adds new accordion
6. Click "Done" or backdrop or Escape — drawer closes
7. StickyCart shows correct totals

- [ ] **Step 3: Commit**

```bash
git add design-lab/src/components/DesignLab.tsx
git commit -m "feat: mount SizeQtyDrawer in DesignLab layout"
```

---

### Task 5: Update StickyCart to Show Per-Color Summary

**Files:**
- Modify: `design-lab/src/components/StickyCart.tsx`

- [ ] **Step 1: Add per-color breakdown to the cart**

Update `StickyCart` to show which colors are in the order:

```tsx
import { useStore } from '../store'

export function StickyCart() {
  const product = useStore(s => s.product)
  const colorOrders = useStore(s => s.colorOrders)
  const totalQuantity = useStore(s => s.totalQuantity)
  const quote = useStore(s => s.quote)
  const activeAddOns = useStore(s => s.activeAddOns)
  const setDrawerOpen = useStore(s => s.setDrawerOpen)

  const discountPercent = quote.bulkDiscount !== 0
    ? Math.round(Math.abs(quote.bulkDiscount / quote.baseTotal) * 100)
    : 0

  return (
    <aside className="w-[240px] shrink-0 bg-white border-l border-outline flex flex-col">
      <div className="px-4 py-3 border-b border-outline">
        <h3 className="font-display text-sm font-bold text-on-surface">Your Order</h3>
      </div>

      <div className="flex-1 px-4 py-4 overflow-y-auto">
        <div className="mb-4">
          <p className="text-sm font-semibold text-on-surface">{product.name}</p>
          <p className="text-[11px] text-secondary mt-0.5">{product.description}</p>
        </div>

        {/* Per-color breakdown */}
        <div className="mb-3">
          {colorOrders.map((co) => {
            const hex = product.colors.find(c => c.name === co.color)?.hex ?? '#ccc'
            return (
              <div key={co.color} className="flex items-center justify-between py-1">
                <span className="flex items-center gap-1.5 text-[11px] text-on-surface">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: hex }} />
                  {co.color}
                </span>
                <span className="text-[11px] text-secondary">{co.quantity}</span>
              </div>
            )
          })}
          <button
            onClick={() => setDrawerOpen(true)}
            className="text-[10px] text-primary font-semibold hover:underline mt-1"
          >Edit quantities</button>
        </div>

        <div className="bg-surface-container-low rounded-lg p-3 mb-4">
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-secondary">Quantity</span>
            <span className="text-on-surface font-medium">{totalQuantity}</span>
          </div>
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-secondary">Per unit</span>
            <span className="text-on-surface font-medium">${quote.perUnit.toFixed(2)}</span>
          </div>
          {discountPercent > 0 && (
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-secondary">Bulk discount</span>
              <span className="text-[#27AE60] font-medium">-{discountPercent}%</span>
            </div>
          )}
          {quote.addOnTotal > 0 && (
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-secondary">Add-ons ({activeAddOns.length})</span>
              <span className="text-on-surface font-medium">+${quote.addOnTotal.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm mt-2 pt-2" style={{ borderTop: '1px solid rgba(26,42,58,0.08)' }}>
            <span className="text-on-surface font-bold">Total</span>
            <span className="text-on-surface font-bold">${quote.grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-[10px] text-secondary mb-1">
            <span className="text-[#8ECAB0]">✓</span> Free shipping
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-secondary mb-1">
            <span className="text-[#8ECAB0]">✓</span> Free digital proof
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-secondary">
            <span className="text-[#8ECAB0]">✓</span> {product.turnaround}
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-outline">
        <button className="w-full bg-primary text-on-primary text-sm font-bold py-3 rounded-full hover:opacity-90 transition-all">
          Checkout — ${quote.grandTotal.toFixed(2)}
        </button>
        <p className="text-[10px] text-secondary text-center mt-2">or continue designing</p>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Verify and commit**

Test in browser: StickyCart shows per-color rows with swatches and quantities, "Edit quantities" link opens drawer.

```bash
git add design-lab/src/components/StickyCart.tsx
git commit -m "feat(sticky-cart): show per-color breakdown with edit link to drawer"
```

---

### Task 6: Fix Remaining Consumers of Removed State

**Files:**
- Modify: `design-lab/src/App.tsx`
- Modify: `design-lab/src/components/ProductInfo.tsx`
- Modify: `design-lab/src/components/ChatPanel.tsx`
- Modify: `design-lab/src/services/actionExecutor.ts`

These files still reference `selectedColor`, `setColor`, `setQuantity`, and `setSizeBreakdown` which were removed from the store in Task 1. They need to be updated for the app to compile.

- [ ] **Step 1: Update App.tsx URL param handling**

Replace `setColor` and `setQuantity` with the new store actions:

```tsx
import { useEffect } from 'react'
import { DesignLab } from './components/DesignLab'
import { DesignOnlyStudio } from './components/DesignOnlyStudio'
import { MinViewportGate } from './components/MinViewportGate'
import { useStore } from './store'

function App() {
  const selectProduct = useStore(s => s.selectProduct)
  const addColorOrder = useStore(s => s.addColorOrder)

  const params = new URLSearchParams(window.location.search)
  const mode = params.get('mode')

  // Initialize from URL params (e.g., ?product=custom-lanyard&color=Black&quantity=100)
  useEffect(() => {
    const productId = params.get('product')
    const color = params.get('color')

    if (productId) selectProduct(productId)
    // If a color is specified in URL, add it (selectProduct already sets the first color)
    if (color) addColorOrder(color)
  }, [selectProduct, addColorOrder])

  return (
    <MinViewportGate minWidth={1024}>
      {mode === 'design-only' ? <DesignOnlyStudio /> : <DesignLab />}
    </MinViewportGate>
  )
}

export default App
```

- [ ] **Step 2: Delete ProductInfo.tsx (no longer used in any layout)**

`ProductInfo.tsx` is now fully replaced by `DesignToolPanel.tsx` in the main layout. It was previously used in `RightPanel` which is no longer rendered. Remove it:

```bash
rm design-lab/src/components/ProductInfo.tsx
```

Also remove `RightPanel.tsx` since it only rendered `ProductInfo` + `ChatPanel`:

```bash
rm design-lab/src/components/RightPanel.tsx
```

- [ ] **Step 3: Update ChatPanel.tsx state snapshot**

In `ChatPanel.tsx` around line 40-48, replace the state snapshot that references removed fields:

```typescript
// Replace this block in handleSend:
const state = {
  product: { id: useStore.getState().product.id, name: useStore.getState().product.name },
  colorOrders: useStore.getState().colorOrders,
  activeCanvasColor: useStore.getState().activeCanvasColor,
  totalQuantity: useStore.getState().totalQuantity,
  activeAddOns: useStore.getState().activeAddOns,
  activeView: useStore.getState().activeView,
  canvasObjects: useStore.getState().canvasObjects,
  quote: useStore.getState().quote,
}
```

Also update the `formatToolName` map at the bottom of the file:

```typescript
function formatToolName(tool: string): string {
  const names: Record<string, string> = {
    selectProduct: 'Product loaded',
    addColorOrder: 'Color added',
    removeColorOrder: 'Color removed',
    updateColorOrder: 'Order updated',
    addText: 'Text added',
    addImage: 'Image placed',
    moveObject: 'Object moved',
    resizeObject: 'Object resized',
    removeObject: 'Object removed',
    switchView: 'View switched',
    generateQuote: 'Quote updated',
  }
  return names[tool] || tool
}
```

- [ ] **Step 4: Update actionExecutor.ts**

Replace the `setColor`, `setQuantity`, and `setSizeBreakdown` cases:

```typescript
// REMOVE these cases:
case 'setColor':
case 'setQuantity':
case 'setSizeBreakdown':

// ADD these cases:
case 'addColorOrder':
  store.addColorOrder(action.params.color as string)
  break

case 'removeColorOrder':
  store.removeColorOrder(action.params.color as string)
  break

case 'updateColorOrder':
  store.updateColorOrder(
    action.params.color as string,
    { quantity: action.params.quantity as number }
  )
  break
```

- [ ] **Step 5: Verify full app compiles clean**

Run: `cd design-lab && npx tsc --noEmit`

Expected: zero errors.

- [ ] **Step 6: Verify in browser**

Open `http://localhost:5174` and test the full flow end-to-end:
1. Multi-color selection works
2. Drawer opens and closes
3. Per-color qty/sizes work
4. StickyCart totals update correctly
5. No console errors

- [ ] **Step 7: Commit**

```bash
git add -A design-lab/src/
git commit -m "fix: update App, ChatPanel, actionExecutor for colorOrders; remove unused ProductInfo/RightPanel"
```
