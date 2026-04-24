import { useEffect, useState } from 'react'

interface Layer {
  id: string
  type: 'text' | 'image'
  label: string
  visible: boolean
}

export function LayerManager() {
  const [layers, setLayers] = useState<Layer[]>([])

  // Poll layers from canvas (simple approach — no shared state needed)
  useEffect(() => {
    const interval = setInterval(() => {
      const lab = (window as any).__designLab
      if (lab?.getLayers) setLayers(lab.getLayers())
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const handleSelect = (id: string) => {
    (window as any).__designLab?.selectObject?.(id)
  }

  const handleDelete = (id: string) => {
    (window as any).__designLab?.removeObject?.(id)
  }

  const handleToggleVisibility = (id: string) => {
    (window as any).__designLab?.toggleVisibility?.(id)
  }

  const handleBringForward = (id: string) => {
    (window as any).__designLab?.bringForward?.(id)
  }

  const handleSendBackward = (id: string) => {
    (window as any).__designLab?.sendBackward?.(id)
  }

  if (layers.length === 0) {
    return (
      <div className="px-4 py-6 text-center">
        <p className="text-on-surface-variant text-[11px]">No layers yet</p>
        <p className="text-on-surface-variant/50 text-[10px] mt-1">Add text or images to see layers here</p>
      </div>
    )
  }

  return (
    <div className="px-2 py-2 space-y-1">
      {layers.map((layer) => (
        <div
          key={layer.id}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-surface-container/50 group cursor-pointer transition-colors"
          onClick={() => handleSelect(layer.id)}
        >
          {/* Type icon */}
          <span className="text-[10px] text-on-surface-variant w-4 text-center">
            {layer.type === 'text' ? 'T' : 'Img'}
          </span>

          {/* Label */}
          <span className={`flex-1 text-[11px] truncate ${layer.visible ? 'text-on-surface' : 'text-on-surface-variant/40 line-through'}`}>
            {layer.label}
          </span>

          {/* Controls — visible on hover */}
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); handleBringForward(layer.id) }}
              className="text-[9px] text-on-surface-variant hover:text-on-surface px-1 py-0.5 rounded"
              title="Bring forward"
            >
              ↑
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleSendBackward(layer.id) }}
              className="text-[9px] text-on-surface-variant hover:text-on-surface px-1 py-0.5 rounded"
              title="Send backward"
            >
              ↓
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleToggleVisibility(layer.id) }}
              className="text-[9px] text-on-surface-variant hover:text-on-surface px-1 py-0.5 rounded"
              title={layer.visible ? 'Hide' : 'Show'}
            >
              {layer.visible ? '👁' : '—'}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(layer.id) }}
              className="text-[9px] text-red-400 hover:text-red-300 px-1 py-0.5 rounded"
              title="Delete"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
