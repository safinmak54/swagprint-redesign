import { useStore } from '../store'

export function StickyCart() {
  const product = useStore(s => s.product)
  const totalQuantity = useStore(s => s.totalQuantity)
  const quote = useStore(s => s.quote)
  const activeAddOns = useStore(s => s.activeAddOns)
  const colorOrders = useStore(s => s.colorOrders)
  const setDrawerOpen = useStore(s => s.setDrawerOpen)

  const discountPercent = quote.bulkDiscount !== 0
    ? Math.round(Math.abs(quote.bulkDiscount / quote.baseTotal) * 100)
    : 0

  const colorHexMap = Object.fromEntries(product.colors.map(c => [c.name, c.hex]))

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
        {colorOrders.length > 0 && (
          <div className="mb-4">
            <p className="text-[11px] font-medium text-secondary uppercase tracking-wide mb-2">Colors</p>
            <div className="space-y-1.5">
              {colorOrders.map(co => (
                <div key={co.color} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 border border-black/10"
                      style={{ backgroundColor: colorHexMap[co.color] ?? '#ccc' }}
                    />
                    <span className="text-on-surface">{co.color}</span>
                  </div>
                  <span className="text-secondary font-medium">{co.quantity}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setDrawerOpen(true)}
              className="text-[11px] text-primary font-medium mt-2 hover:underline"
            >
              Edit quantities
            </button>
          </div>
        )}

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
