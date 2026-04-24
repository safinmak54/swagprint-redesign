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
