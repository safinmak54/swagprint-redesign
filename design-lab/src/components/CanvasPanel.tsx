import { useRef } from 'react'
import { useCanvas } from '../hooks/useCanvas'
import { useCanvasHistory } from '../hooks/useCanvasHistory'
import { useStore } from '../store'
import { PropertiesPanel } from './PropertiesPanel'

export function CanvasPanel() {
  const canvasElRef = useRef<HTMLCanvasElement>(null)
  const {
    fabricRef, addText, addImage, switchView, getLayers, removeObject, moveObject, resizeObject,
    updateObject, deleteSelected, selectedProps, selectObject, toggleVisibility,
    bringForward, sendBackward,
  } = useCanvas(canvasElRef)
  const { undo, redo } = useCanvasHistory(fabricRef)
  const activeView = useStore(s => s.activeView)
  const setActiveView = useStore(s => s.setActiveView)
  const product = useStore(s => s.product)

  const handleFileUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/png,image/jpeg,image/svg+xml,image/webp'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const url = URL.createObjectURL(file)
      await addImage(url)
    }
    input.click()
  }

  const handleFlip = () => {
    const newView = activeView === 'front' ? 'back' : 'front'
    setActiveView(newView)
    switchView(newView)
  }

  // Expose canvas actions for ToolPanel and AI action executor
  ;(window as any).__designLab = {
    addText, addImage, handleFileUpload, switchView, getLayers, removeObject,
    moveObject, resizeObject, updateObject, selectObject, toggleVisibility,
    bringForward, sendBackward, undo, redo,
  }

  return (
    <main className="flex-1 bg-surface-container-low flex flex-col items-center justify-center relative">
      {/* View badge */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] text-primary flex items-center gap-1.5 z-10 shadow-ambient">
        <span className="w-1.5 h-1.5 bg-[#8ECAB0] rounded-full" />
        {activeView.toUpperCase()} VIEW ACTIVE
      </div>

      {/* Product name badge */}
      <div className="absolute top-3 left-4 text-secondary text-[10px] font-medium">
        {product.name}
      </div>

      {/* Properties panel — shows when an object is selected */}
      {selectedProps && (
        <PropertiesPanel
          selected={selectedProps}
          onUpdate={updateObject}
          onDelete={deleteSelected}
        />
      )}

      {/* Fabric.js Canvas */}
      <div className="rounded-2xl overflow-hidden shadow-ambient-lg bg-white">
        <canvas ref={canvasElRef} width={500} height={460} />
      </div>

      {/* Canvas controls */}
      <div className="flex gap-2.5 mt-4">
        <button className="bg-white hover:bg-surface-container text-secondary text-xs px-3.5 py-1.5 rounded-full transition-colors shadow-ambient">
          Grid
        </button>
        <button className="bg-white hover:bg-surface-container text-secondary text-xs px-3.5 py-1.5 rounded-full transition-colors shadow-ambient">
          100%
        </button>
        <button
          onClick={handleFlip}
          className={`text-xs px-3.5 py-1.5 rounded-full transition-colors shadow-ambient ${
            product.printAreas.back
              ? 'bg-white hover:bg-surface-container text-secondary'
              : 'bg-surface-container text-secondary/30 cursor-not-allowed'
          }`}
          disabled={!product.printAreas.back}
        >
          Flip
        </button>
      </div>
    </main>
  )
}
