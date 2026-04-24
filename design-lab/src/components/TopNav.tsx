export function TopNav() {
  const handleUndo = () => (window as any).__designLab?.undo?.()
  const handleRedo = () => (window as any).__designLab?.redo?.()

  return (
    <header className="flex items-center justify-between px-5 py-2.5 bg-white/80 backdrop-blur-md border-b border-outline shadow-ambient">
      <div className="flex items-center gap-6">
        <span className="font-display font-extrabold text-sm tracking-tighter text-on-surface">
          SwagPrint
        </span>
        <span className="text-[10px] text-secondary font-semibold uppercase tracking-widest">Design Studio</span>
      </div>

      <nav className="hidden md:flex items-center gap-5 text-xs text-secondary">
        <button className="hover:text-on-surface transition-colors">Product Catalog</button>
        <button className="hover:text-on-surface transition-colors">Templates</button>
        <button className="text-primary font-semibold">
          My Designs
        </button>
        <button className="hover:text-on-surface transition-colors">Pricing</button>
      </nav>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-secondary">
          <button
            onClick={handleUndo}
            className="p-1.5 hover:text-on-surface hover:bg-surface-container rounded-md transition-colors text-sm"
            title="Undo (Ctrl+Z)"
          >
            ↩
          </button>
          <button
            onClick={handleRedo}
            className="p-1.5 hover:text-on-surface hover:bg-surface-container rounded-md transition-colors text-sm"
            title="Redo (Ctrl+Shift+Z)"
          >
            ↪
          </button>
        </div>
        <button className="text-xs text-secondary hover:text-on-surface transition-colors">
          Save Design
        </button>
        <button className="bg-primary text-on-primary text-xs font-bold px-5 py-2 rounded-full hover:opacity-90 transition-all">
          Order Now
        </button>
      </div>
    </header>
  )
}
