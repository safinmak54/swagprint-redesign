import { useState } from 'react'
import { ProductCatalog } from './ProductCatalog'
import { LayerManager } from './LayerManager'

interface Tool {
  icon: string
  label: string
  action?: () => void
}

export function ToolPanel() {
  const [activeTool, setActiveTool] = useState<string>('Add Text')
  const [showCatalog, setShowCatalog] = useState(false)

  const tools: Tool[] = [
    {
      icon: '🛍️',
      label: 'Select Product',
      action: () => setShowCatalog(true),
    },
    {
      icon: 'T',
      label: 'Add Text',
      action: () => {
        const lab = (window as any).__designLab
        if (lab) lab.addText()
      },
    },
    { icon: '✏️', label: 'Add Art' },
    {
      icon: '📤',
      label: 'Upload Image',
      action: () => {
        const lab = (window as any).__designLab
        if (lab) lab.handleFileUpload()
      },
    },
    {
      icon: '◇',
      label: 'Layer Manager',
    },
  ]

  return (
    <>
      <aside className="w-[300px] shrink-0 bg-white border-r border-outline flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 pt-4 pb-1">
            <p className="text-[10px] uppercase tracking-widest text-secondary font-semibold">
              Tools
            </p>
          </div>

          <nav className="mt-2">
            {tools.map((tool) => (
              <button
                key={tool.label}
                onClick={() => {
                  setActiveTool(tool.label)
                  tool.action?.()
                }}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors ${
                  activeTool === tool.label
                    ? 'text-primary border-l-[3px] border-primary bg-surface-container-low font-semibold'
                    : 'text-secondary hover:text-on-surface hover:bg-surface-container-low/50 border-l-[3px] border-transparent'
                }`}
              >
                <span className="text-sm w-5 text-center">{tool.icon}</span>
                {tool.label}
              </button>
            ))}
          </nav>

          {/* Layer Manager panel — shows when active */}
          {activeTool === 'Layer Manager' && (
            <div className="border-t border-outline mt-2">
              <LayerManager />
            </div>
          )}

          {/* Product options — removed: ProductInfo was deleted */}
        </div>

        <div className="px-4 pb-4 pt-2 border-t border-outline space-y-2">
          <button className="w-full bg-primary text-on-primary text-[10px] font-bold tracking-wider uppercase py-2.5 rounded-full hover:opacity-90 transition-all">
            Export Mockup
          </button>
          <button className="flex items-center gap-2 text-[11px] text-secondary hover:text-on-surface transition-colors px-1 py-1">
            <span>⚙</span> Settings
          </button>
          <button className="flex items-center gap-2 text-[11px] text-secondary hover:text-on-surface transition-colors px-1 py-1">
            <span>?</span> Help
          </button>
        </div>
      </aside>

      <ProductCatalog isOpen={showCatalog} onClose={() => setShowCatalog(false)} />
    </>
  )
}
