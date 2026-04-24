import { useCallback, useEffect, useRef } from 'react'
import type * as fabric from 'fabric'

const MAX_HISTORY = 50

export function useCanvasHistory(fabricRef: React.RefObject<fabric.Canvas | null>) {
  const undoStack = useRef<string[]>([])
  const redoStack = useRef<string[]>([])
  const isRestoring = useRef(false)

  // Save current canvas state to undo stack
  const saveState = useCallback(() => {
    if (!fabricRef.current || isRestoring.current) return
    const json = JSON.stringify(fabricRef.current.toJSON())
    undoStack.current.push(json)
    if (undoStack.current.length > MAX_HISTORY) undoStack.current.shift()
    redoStack.current = [] // Clear redo on new action
  }, [fabricRef])

  // Restore canvas from a JSON string
  const restoreState = useCallback(async (json: string) => {
    if (!fabricRef.current) return
    isRestoring.current = true
    await fabricRef.current.loadFromJSON(json)
    fabricRef.current.renderAll()
    isRestoring.current = false
  }, [fabricRef])

  const undo = useCallback(async () => {
    if (!fabricRef.current || undoStack.current.length === 0) return
    // Save current state to redo
    const currentJson = JSON.stringify(fabricRef.current.toJSON())
    redoStack.current.push(currentJson)
    // Pop and restore previous state
    const prevJson = undoStack.current.pop()!
    await restoreState(prevJson)
  }, [fabricRef, restoreState])

  const redo = useCallback(async () => {
    if (!fabricRef.current || redoStack.current.length === 0) return
    // Save current state to undo
    const currentJson = JSON.stringify(fabricRef.current.toJSON())
    undoStack.current.push(currentJson)
    // Pop and restore next state
    const nextJson = redoStack.current.pop()!
    await restoreState(nextJson)
  }, [fabricRef, restoreState])

  // Listen for canvas changes and auto-save state
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return

    // Save initial state
    const initialJson = JSON.stringify(canvas.toJSON())
    undoStack.current = [initialJson]
    redoStack.current = []

    const handler = () => saveState()
    canvas.on('object:added', handler)
    canvas.on('object:removed', handler)
    canvas.on('object:modified', handler)

    return () => {
      canvas.off('object:added', handler)
      canvas.off('object:removed', handler)
      canvas.off('object:modified', handler)
    }
  }, [fabricRef, saveState])

  // Keyboard shortcuts: Ctrl+Z / Cmd+Z for undo, Ctrl+Shift+Z / Cmd+Shift+Z for redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey
      if (!isMod) return

      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
        e.preventDefault()
        redo()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  return {
    undo,
    redo,
    canUndo: undoStack.current.length > 0,
    canRedo: redoStack.current.length > 0,
  }
}
