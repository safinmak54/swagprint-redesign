import { useState } from 'react'
import { useStore } from '../store'
import { ProductCatalog } from './ProductCatalog'

function CollapsibleSection({ label, value, defaultOpen = false, children }: {
  label: string; value?: string; defaultOpen?: boolean; children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-outline">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-[10px] uppercase tracking-widest text-secondary font-semibold hover:text-on-surface transition-colors"
      >
        <span className="flex items-center gap-2">
          {label}
          {!open && value && (
            <span className="normal-case tracking-normal text-[11px] text-on-surface font-medium">{value}</span>
          )}
        </span>
        <span className="text-[12px]">{open ? '▴' : '▾'}</span>
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  )
}

export function DesignToolPanel() {
  const [showCatalog, setShowCatalog] = useState(false)
  const product = useStore(s => s.product)
  const colorOrders = useStore(s => s.colorOrders)
  const activeCanvasColor = useStore(s => s.activeCanvasColor)
  const totalQuantity = useStore(s => s.totalQuantity)
  const selectedWidth = useStore(s => s.selectedWidth)
  const selectedLength = useStore(s => s.selectedLength)
  const selectedAttachment = useStore(s => s.selectedAttachment)
  const selectedImprintSide = useStore(s => s.selectedImprintSide)
  const selectedStitchStyle = useStore(s => s.selectedStitchStyle)
  const activeAddOns = useStore(s => s.activeAddOns)
  const activeView = useStore(s => s.activeView)
  const toggleColorOrder = useStore(s => s.toggleColorOrder)
  const removeColorOrder = useStore(s => s.removeColorOrder)
  const updateColorOrder = useStore(s => s.updateColorOrder)
  const setActiveCanvasColor = useStore(s => s.setActiveCanvasColor)
  const setDrawerOpen = useStore(s => s.setDrawerOpen)
  const setWidth = useStore(s => s.setWidth)
  const setLength = useStore(s => s.setLength)
  const setAttachment = useStore(s => s.setAttachment)
  const setImprintSide = useStore(s => s.setImprintSide)
  const setStitchStyle = useStore(s => s.setStitchStyle)
  const toggleAddOn = useStore(s => s.toggleAddOn)
  const setActiveView = useStore(s => s.setActiveView)

  const selectedColorNames = colorOrders.map(co => co.color)

  const prod = product as any

  const handleAddText = () => (window as any).__designLab?.addText?.()
  const handleUpload = () => (window as any).__designLab?.handleFileUpload?.()
  const handleFlip = () => {
    const newView = activeView === 'front' ? 'back' : 'front'
    setActiveView(newView)
    ;(window as any).__designLab?.switchView?.(newView)
  }

  return (
    <>
      <aside className="w-[240px] shrink-0 bg-white border-r border-outline flex flex-col overflow-y-auto">
        {/* Product info */}
        <div className="px-4 py-3 border-b border-outline">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-surface-container-low rounded-lg flex items-center justify-center text-lg">🏷️</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-on-surface truncate">{product.name}</p>
              <p className="text-[10px] text-secondary">{product.description}</p>
            </div>
          </div>
          <button onClick={() => setShowCatalog(true)} className="text-[11px] text-primary font-semibold hover:underline mt-1.5">
            Change Product
          </button>
        </div>

        {/* View toggle */}
        <div className="px-4 py-3 border-b border-outline">
          <p className="text-[10px] uppercase tracking-widest text-secondary font-semibold mb-2">Product View</p>
          <div className="flex gap-2">
            <button
              onClick={() => { setActiveView('front'); (window as any).__designLab?.switchView?.('front') }}
              className={`flex-1 py-1.5 text-xs rounded-full font-semibold transition-colors ${
                activeView === 'front' ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-secondary hover:text-on-surface'
              }`}
            >Front</button>
            <button
              onClick={handleFlip}
              className={`flex-1 py-1.5 text-xs rounded-full font-semibold transition-colors ${
                activeView === 'back' ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-secondary hover:text-on-surface'
              } ${!product.printAreas.back ? 'opacity-40 cursor-not-allowed' : ''}`}
              disabled={!product.printAreas.back}
            >Back</button>
          </div>
        </div>

        {/* Design Tools */}
        <div className="px-4 py-3 border-b border-outline">
          <p className="text-[10px] uppercase tracking-widest text-secondary font-semibold mb-2">Design Tools</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={handleAddText} className="flex flex-col items-center gap-1 p-3 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors">
              <span className="text-lg font-bold text-on-surface">T</span>
              <span className="text-[10px] text-secondary font-medium">Add Text</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-3 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors">
              <span className="text-lg">✏️</span>
              <span className="text-[10px] text-secondary font-medium">Clipart</span>
            </button>
            <button onClick={handleUpload} className="flex flex-col items-center gap-1 p-3 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors">
              <span className="text-lg">📤</span>
              <span className="text-[10px] text-secondary font-medium">Upload</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-3 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors">
              <span className="text-lg font-bold text-on-surface">#</span>
              <span className="text-[10px] text-secondary font-medium">Names</span>
            </button>
          </div>
        </div>

        {/* Product Options — Collapsible */}
        {product.colors.length > 0 && (
          <CollapsibleSection label="Color" value={`${colorOrders.length} selected`} defaultOpen={true}>
            {/* Multi-select swatches */}
            <div className="flex gap-1.5 flex-wrap">
              {product.colors.map((c) => {
                const isSelected = selectedColorNames.includes(c.name)
                return (
                  <button
                    key={c.name}
                    onClick={() => {
                      toggleColorOrder(c.name)
                      if (!isSelected) setActiveCanvasColor(c.name)
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
            {colorOrders.length > 0 && (
              <div className="flex flex-col gap-1 mt-2">
                {colorOrders.map((co) => {
                  const colorDef = product.colors.find(c => c.name === co.color)
                  return (
                    <div
                      key={co.color}
                      onClick={() => setActiveCanvasColor(co.color)}
                      className={`flex items-center gap-2 px-2 py-1 rounded-md text-[11px] cursor-pointer transition-colors ${
                        activeCanvasColor === co.color ? 'bg-primary/10' : 'bg-surface-container-low hover:bg-surface-container'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0 border border-outline"
                        style={{ backgroundColor: colorDef?.hex ?? '#ccc' }}
                      />
                      <span className="flex-1 text-on-surface font-medium truncate">{co.color}</span>
                      <input
                        type="number"
                        min={1}
                        value={co.quantity}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          const val = Math.max(1, parseInt(e.target.value) || 1)
                          updateColorOrder(co.color, { quantity: val })
                        }}
                        className="w-12 text-center text-[10px] text-on-surface font-medium bg-white border border-outline rounded px-1 py-0.5 focus:border-primary outline-none"
                      />
                      {colorOrders.length > 1 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); removeColorOrder(co.color) }}
                          className="text-secondary hover:text-on-surface text-[10px] ml-0.5"
                          title="Remove color"
                        >&#10005;</button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Configure button */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="w-full mt-2 py-2 bg-primary text-on-primary text-[11px] font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Configure Sizes &amp; Qty
            </button>
            <p className="text-secondary text-[10px] mt-1 text-center">
              {colorOrders.length} color{colorOrders.length !== 1 ? 's' : ''} &middot; {totalQuantity} units
            </p>
          </CollapsibleSection>
        )}

        {prod.widths?.length > 0 && (
          <CollapsibleSection label="Width" value={selectedWidth} defaultOpen={false}>
            <div className="flex flex-wrap gap-1.5">
              {prod.widths.map((w: string) => (
                <button key={w} onClick={() => setWidth(w)}
                  className={`px-2.5 py-1 text-[11px] rounded-md transition-colors ${
                    selectedWidth === w ? 'bg-primary text-on-primary font-semibold' : 'bg-surface-container-low text-secondary hover:text-on-surface'
                  }`}>{w}</button>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {prod.lengths?.length > 0 && (
          <CollapsibleSection label="Length" value={selectedLength} defaultOpen={false}>
            <div className="flex flex-wrap gap-1.5">
              {prod.lengths.map((l: string) => (
                <button key={l} onClick={() => setLength(l)}
                  className={`px-2.5 py-1 text-[11px] rounded-md transition-colors ${
                    selectedLength === l ? 'bg-primary text-on-primary font-semibold' : 'bg-surface-container-low text-secondary hover:text-on-surface'
                  }`}>{l}</button>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {prod.attachments?.length > 0 && (
          <CollapsibleSection label="Attachment" value={selectedAttachment} defaultOpen={false}>
            <div className="flex flex-wrap gap-1.5">
              {prod.attachments.map((a: string) => (
                <button key={a} onClick={() => setAttachment(a)}
                  className={`px-2.5 py-1 text-[11px] rounded-md transition-colors ${
                    selectedAttachment === a ? 'bg-primary text-on-primary font-semibold' : 'bg-surface-container-low text-secondary hover:text-on-surface'
                  }`}>{a}</button>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {prod.imprintSides?.length > 0 && (
          <CollapsibleSection label="Imprint" value={selectedImprintSide} defaultOpen={false}>
            <div className="flex flex-wrap gap-1.5">
              {prod.imprintSides.map((s: string) => (
                <button key={s} onClick={() => setImprintSide(s)}
                  className={`px-2.5 py-1 text-[11px] rounded-md transition-colors ${
                    selectedImprintSide === s ? 'bg-primary text-on-primary font-semibold' : 'bg-surface-container-low text-secondary hover:text-on-surface'
                  }`}>{s}</button>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {prod.stitchStyles?.length > 0 && (
          <CollapsibleSection label="Stitch" value={selectedStitchStyle} defaultOpen={false}>
            <div className="flex flex-wrap gap-1.5">
              {prod.stitchStyles.map((s: string) => (
                <button key={s} onClick={() => setStitchStyle(s)}
                  className={`px-2.5 py-1 text-[11px] rounded-md transition-colors ${
                    selectedStitchStyle === s ? 'bg-primary text-on-primary font-semibold' : 'bg-surface-container-low text-secondary hover:text-on-surface'
                  }`}>{s}</button>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {Object.keys(product.pricing.addOns).length > 0 && (
          <CollapsibleSection label="Add-Ons" value={activeAddOns.length > 0 ? `${activeAddOns.length} selected` : undefined} defaultOpen={false}>
            <div className="flex flex-col gap-1">
              {Object.entries(product.pricing.addOns).map(([key, addOn]) => (
                <button key={key} onClick={() => toggleAddOn(key)}
                  className={`flex items-center justify-between px-2.5 py-1.5 text-[11px] rounded-md transition-colors ${
                    activeAddOns.includes(key) ? 'bg-primary/10 text-on-surface' : 'bg-surface-container-low/50 text-secondary hover:text-on-surface'
                  }`}>
                  <span className="flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[8px] ${
                      activeAddOns.includes(key) ? 'bg-primary border-primary text-on-primary' : 'border-secondary/30'
                    }`}>{activeAddOns.includes(key) && '✓'}</span>
                    {addOn.label}
                  </span>
                  <span className="text-secondary">+${addOn.perUnit.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </CollapsibleSection>
        )}
      </aside>

      <ProductCatalog isOpen={showCatalog} onClose={() => setShowCatalog(false)} />
    </>
  )
}
