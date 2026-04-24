import { useState, useEffect, useCallback } from 'react'
import { useStore } from '../store'

export function SizeQtyDrawer() {
  const drawerOpen = useStore(s => s.drawerOpen)
  const setDrawerOpen = useStore(s => s.setDrawerOpen)
  const colorOrders = useStore(s => s.colorOrders)
  const product = useStore(s => s.product)
  const totalQuantity = useStore(s => s.totalQuantity)
  const quote = useStore(s => s.quote)
  const updateColorOrder = useStore(s => s.updateColorOrder)
  const addColorOrder = useStore(s => s.addColorOrder)
  const removeColorOrder = useStore(s => s.removeColorOrder)

  const [expandedColor, setExpandedColor] = useState<string | null>(null)
  const [showAddPicker, setShowAddPicker] = useState(false)

  const hasSizes = product.sizes.length > 0
  const sizes = hasSizes ? product.sizes : []

  // Auto-expand first color on open
  useEffect(() => {
    if (drawerOpen && colorOrders.length > 0) {
      setExpandedColor(colorOrders[0].color)
      setShowAddPicker(false)
    }
  }, [drawerOpen])

  // Close on Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setDrawerOpen(false)
  }, [setDrawerOpen])

  useEffect(() => {
    if (drawerOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [drawerOpen, handleKeyDown])

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
      <div className="fixed top-0 right-0 h-full w-[420px] max-w-full bg-white z-50 shadow-ambient-lg flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline">
          <h2 className="font-display font-bold text-sm text-on-surface">Configure Sizes &amp; Qty</h2>
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-surface-container-low text-secondary hover:text-on-surface transition-colors text-sm"
          >&#10005;</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {colorOrders.map((co) => {
            const colorDef = product.colors.find(c => c.name === co.color)
            const isExpanded = expandedColor === co.color

            return (
              <div key={co.color} className="border border-outline rounded-lg overflow-hidden">
                {/* Accordion header */}
                <button
                  onClick={() => setExpandedColor(isExpanded ? null : co.color)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low/50 transition-colors"
                >
                  <span
                    className="w-4 h-4 rounded-full shrink-0 border border-outline"
                    style={{ backgroundColor: colorDef?.hex ?? '#ccc' }}
                  />
                  <span className="flex-1 text-left text-sm font-semibold text-on-surface">{co.color}</span>
                  <span className="text-xs text-secondary">{co.quantity} units</span>
                  <span className="text-xs text-secondary">{isExpanded ? '\u25B4' : '\u25BE'}</span>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-outline pt-3 space-y-4">
                    {/* Quantity stepper */}
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-secondary font-semibold block mb-1.5">
                        Quantity
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateColorOrder(co.color, { quantity: Math.max(1, co.quantity - 1) })}
                          className="w-8 h-8 rounded-md bg-surface-container-low text-on-surface font-bold text-sm hover:bg-surface-container transition-colors flex items-center justify-center"
                        >&minus;</button>
                        <input
                          type="number"
                          min={1}
                          value={co.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10)
                            if (!isNaN(val) && val >= 1) updateColorOrder(co.color, { quantity: val })
                          }}
                          className="w-16 h-8 text-center text-sm font-semibold border border-outline rounded-md bg-white text-on-surface [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          onClick={() => updateColorOrder(co.color, { quantity: co.quantity + 1 })}
                          className="w-8 h-8 rounded-md bg-surface-container-low text-on-surface font-bold text-sm hover:bg-surface-container transition-colors flex items-center justify-center"
                        >+</button>
                      </div>
                    </div>

                    {/* Size breakdown grid */}
                    {hasSizes && (
                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-secondary font-semibold block mb-1.5">
                          Size Breakdown
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {sizes.map((size) => (
                            <div key={size} className="flex flex-col items-center gap-1">
                              <span className="text-[10px] font-semibold text-secondary">{size}</span>
                              <input
                                type="number"
                                min={0}
                                value={co.sizes[size] ?? 0}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10)
                                  const newSizes = { ...co.sizes, [size]: isNaN(val) ? 0 : Math.max(0, val) }
                                  updateColorOrder(co.color, { sizes: newSizes })
                                }}
                                className="w-full h-7 text-center text-xs border border-outline rounded-md bg-white text-on-surface [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Remove color */}
                    {colorOrders.length > 1 && (
                      <button
                        onClick={() => {
                          removeColorOrder(co.color)
                          if (expandedColor === co.color) {
                            const remaining = colorOrders.filter(c => c.color !== co.color)
                            setExpandedColor(remaining[0]?.color ?? null)
                          }
                        }}
                        className="text-[11px] text-red-500 hover:text-red-700 font-medium transition-colors"
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
          <div>
            <button
              onClick={() => setShowAddPicker(!showAddPicker)}
              className="w-full py-2.5 border border-dashed border-outline rounded-lg text-[11px] font-semibold text-primary hover:bg-surface-container-low/50 transition-colors"
            >
              + Add Another Color
            </button>

            {showAddPicker && availableColors.length > 0 && (
              <div className="mt-2 p-3 border border-outline rounded-lg bg-surface-container-low/30">
                <p className="text-[10px] uppercase tracking-widest text-secondary font-semibold mb-2">Available Colors</p>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => {
                        addColorOrder(c.name)
                        setExpandedColor(c.name)
                        setShowAddPicker(false)
                      }}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-outline hover:border-primary/30 transition-colors"
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-outline"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-[11px] text-on-surface">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showAddPicker && availableColors.length === 0 && (
              <p className="mt-2 text-[11px] text-secondary text-center">All colors are selected</p>
            )}
          </div>
        </div>

        {/* Sticky footer */}
        <div className="border-t border-outline px-5 py-4 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-secondary">Total Units</p>
              <p className="text-lg font-bold text-on-surface">{totalQuantity}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-secondary">Grand Total</p>
              <p className="text-lg font-bold text-on-surface">${quote.grandTotal.toFixed(2)}</p>
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-full py-2.5 bg-primary text-on-primary font-bold text-sm rounded-lg hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </>
  )
}
