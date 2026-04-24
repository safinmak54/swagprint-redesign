import { useEffect, useRef, useState, useCallback } from 'react'
import * as fabric from 'fabric'

export interface CanvasObjectData {
  id: string
  type: 'image' | 'text'
  text?: string
  fontFamily?: string
  fontSize?: number
  fontWeight?: 'normal' | 'bold'
  fontStyle?: 'normal' | 'italic'
  fill?: string
  textAlign?: string
  src?: string
  x: number
  y: number
  width: number
  height: number
  scaleX?: number
  scaleY?: number
  angle?: number
  opacity?: number
}

// Print area bounds
const PRINT_AREA = { left: 120, top: 80, width: 260, height: 300 }

export function useCanvas(canvasElRef: React.RefObject<HTMLCanvasElement | null>) {
  const fabricRef = useRef<fabric.Canvas | null>(null)
  const [objects, setObjects] = useState<CanvasObjectData[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedProps, setSelectedProps] = useState<CanvasObjectData | null>(null)
  const [activeView, setActiveView] = useState<'front' | 'back'>('front')
  const printAreaRef = useRef<fabric.Rect | null>(null)

  // Serialize canvas objects
  const syncObjects = useCallback(() => {
    if (!fabricRef.current) return
    const objs = fabricRef.current.getObjects().filter(o => (o as any).__swagId)
    const serialized: CanvasObjectData[] = objs.map((o) => {
      const base: CanvasObjectData = {
        id: (o as any).__swagId,
        type: o instanceof fabric.IText || o instanceof fabric.FabricText ? 'text' : 'image',
        x: Math.round(o.left ?? 0),
        y: Math.round(o.top ?? 0),
        width: Math.round((o.width ?? 0) * (o.scaleX ?? 1)),
        height: Math.round((o.height ?? 0) * (o.scaleY ?? 1)),
        scaleX: o.scaleX,
        scaleY: o.scaleY,
        angle: o.angle,
        opacity: o.opacity,
      }
      if (o instanceof fabric.IText || o instanceof fabric.FabricText) {
        base.text = o.text
        base.fontFamily = o.fontFamily
        base.fontSize = o.fontSize
        base.fontWeight = (o.fontWeight as 'normal' | 'bold') ?? 'normal'
        base.fontStyle = (o.fontStyle as 'normal' | 'italic') ?? 'normal'
        base.fill = o.fill as string
        base.textAlign = o.textAlign
      }
      if (o instanceof fabric.FabricImage) {
        const src = o.getSrc?.()
        if (src) base.src = src
      }
      return base
    })
    setObjects(serialized)
  }, [])

  // Update selected object props for the properties panel
  const syncSelected = useCallback(() => {
    if (!fabricRef.current) return
    const active = fabricRef.current.getActiveObject()
    if (active && (active as any).__swagId) {
      const id = (active as any).__swagId as string
      setSelectedId(id)
      const isText = active instanceof fabric.IText || active instanceof fabric.FabricText
      setSelectedProps({
        id,
        type: isText ? 'text' : 'image',
        text: isText ? (active as fabric.IText).text : undefined,
        fontFamily: isText ? (active as fabric.IText).fontFamily : undefined,
        fontSize: isText ? (active as fabric.IText).fontSize : undefined,
        fontWeight: isText ? ((active as fabric.IText).fontWeight as 'normal' | 'bold') : undefined,
        fontStyle: isText ? ((active as fabric.IText).fontStyle as 'normal' | 'italic') : undefined,
        fill: isText ? (active as fabric.IText).fill as string : undefined,
        textAlign: isText ? (active as fabric.IText).textAlign : undefined,
        x: Math.round(active.left ?? 0),
        y: Math.round(active.top ?? 0),
        width: Math.round((active.width ?? 0) * (active.scaleX ?? 1)),
        height: Math.round((active.height ?? 0) * (active.scaleY ?? 1)),
        scaleX: active.scaleX,
        scaleY: active.scaleY,
        angle: Math.round(active.angle ?? 0),
        opacity: active.opacity,
      })
    } else {
      setSelectedId(null)
      setSelectedProps(null)
    }
  }, [])

  // Clamp object within print area bounds
  const clampToPrintArea = useCallback((obj: fabric.FabricObject) => {
    const objWidth = (obj.width ?? 0) * (obj.scaleX ?? 1)
    const objHeight = (obj.height ?? 0) * (obj.scaleY ?? 1)
    const minLeft = PRINT_AREA.left
    const maxLeft = PRINT_AREA.left + PRINT_AREA.width - objWidth
    const minTop = PRINT_AREA.top
    const maxTop = PRINT_AREA.top + PRINT_AREA.height - objHeight

    let clamped = false
    if ((obj.left ?? 0) < minLeft) { obj.set({ left: minLeft }); clamped = true }
    if ((obj.left ?? 0) > maxLeft) { obj.set({ left: Math.max(minLeft, maxLeft) }); clamped = true }
    if ((obj.top ?? 0) < minTop) { obj.set({ top: minTop }); clamped = true }
    if ((obj.top ?? 0) > maxTop) { obj.set({ top: Math.max(minTop, maxTop) }); clamped = true }

    // Flash print area red when clamped
    if (clamped && printAreaRef.current) {
      printAreaRef.current.set({ stroke: 'rgba(220, 38, 38, 0.6)' })
      fabricRef.current?.renderAll()
      setTimeout(() => {
        printAreaRef.current?.set({ stroke: 'rgba(0, 31, 157, 0.25)' })
        fabricRef.current?.renderAll()
      }, 300)
    }
  }, [])

  // Initialize fabric canvas
  useEffect(() => {
    if (!canvasElRef.current || fabricRef.current) return

    const canvas = new fabric.Canvas(canvasElRef.current, {
      backgroundColor: '#1a2f42',
      selection: true,
      preserveObjectStacking: true,
    })

    // Print area boundary
    const printArea = new fabric.Rect({
      left: PRINT_AREA.left,
      top: PRINT_AREA.top,
      width: PRINT_AREA.width,
      height: PRINT_AREA.height,
      fill: 'transparent',
      stroke: 'rgba(0, 31, 157, 0.25)',
      strokeDashArray: [8, 4],
      selectable: false,
      evented: false,
    })
    canvas.add(printArea)
    printAreaRef.current = printArea

    // Placeholder text
    const placeholder = new fabric.FabricText('PLACE ARTWORK HERE', {
      left: 145,
      top: 220,
      fontSize: 12,
      fill: 'rgba(0, 31, 157, 0.3)',
      fontFamily: 'Inter',
      selectable: false,
      evented: false,
    })
    ;(placeholder as any).__placeholder = true
    canvas.add(placeholder)

    // Object events
    canvas.on('object:modified', () => { syncObjects(); syncSelected() })
    canvas.on('object:added', syncObjects)
    canvas.on('object:removed', syncObjects)

    // Selection events
    canvas.on('selection:created', syncSelected)
    canvas.on('selection:updated', syncSelected)
    canvas.on('selection:cleared', () => { setSelectedId(null); setSelectedProps(null) })

    // Bounds enforcement
    canvas.on('object:moving', (e) => {
      if (e.target && (e.target as any).__swagId) {
        clampToPrintArea(e.target)
      }
    })
    canvas.on('object:scaling', (e) => {
      if (e.target && (e.target as any).__swagId) {
        clampToPrintArea(e.target)
      }
    })

    // Remove placeholder when first real object is added
    canvas.on('object:added', (e) => {
      if ((e.target as any).__swagId) {
        const ph = canvas.getObjects().find(o => (o as any).__placeholder)
        if (ph) canvas.remove(ph)
      }
    })

    // Keyboard: Delete/Backspace to remove selected object
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!canvas) return
      const active = canvas.getActiveObject()
      if (!active || !(active as any).__swagId) return

      // Don't delete when editing text inline
      if (active instanceof fabric.IText && active.isEditing) return

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        canvas.remove(active)
        canvas.discardActiveObject()
        canvas.renderAll()
        setSelectedId(null)
        setSelectedProps(null)
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    fabricRef.current = canvas

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      canvas.dispose()
      fabricRef.current = null
    }
  }, [canvasElRef, syncObjects, syncSelected, clampToPrintArea])

  // Add text
  const addText = useCallback((text = 'Your Text', options?: Partial<{ font: string; size: number; color: string; x: number; y: number }>) => {
    if (!fabricRef.current) return
    const id = `text-${Date.now()}`
    const textObj = new fabric.IText(text, {
      left: options?.x ?? 180,
      top: options?.y ?? 200,
      fontSize: options?.size ?? 24,
      fontFamily: options?.font ?? 'Plus Jakarta Sans',
      fill: options?.color ?? '#ffffff',
      fontWeight: 'bold',
    })
    ;(textObj as any).__swagId = id
    fabricRef.current.add(textObj)
    fabricRef.current.setActiveObject(textObj)
    fabricRef.current.renderAll()
    return id
  }, [])

  // Add image
  const addImage = useCallback(async (src: string, options?: Partial<{ x: number; y: number; width: number }>) => {
    if (!fabricRef.current) return
    const id = `img-${Date.now()}`
    const img = await fabric.FabricImage.fromURL(src, { crossOrigin: 'anonymous' })
    const targetWidth = options?.width ?? 160
    const scale = targetWidth / (img.width ?? targetWidth)
    img.set({
      left: options?.x ?? 200,
      top: options?.y ?? 140,
      scaleX: scale,
      scaleY: scale,
    })
    ;(img as any).__swagId = id
    fabricRef.current.add(img)
    fabricRef.current.setActiveObject(img)
    fabricRef.current.renderAll()
    return id
  }, [])

  // Remove object by ID
  const removeObject = useCallback((id: string) => {
    if (!fabricRef.current) return
    const obj = fabricRef.current.getObjects().find(o => (o as any).__swagId === id)
    if (obj) {
      fabricRef.current.remove(obj)
      fabricRef.current.discardActiveObject()
      fabricRef.current.renderAll()
      setSelectedId(null)
      setSelectedProps(null)
    }
  }, [])

  // Delete currently selected object
  const deleteSelected = useCallback(() => {
    if (!fabricRef.current) return
    const active = fabricRef.current.getActiveObject()
    if (active && (active as any).__swagId) {
      if (active instanceof fabric.IText && active.isEditing) return
      fabricRef.current.remove(active)
      fabricRef.current.discardActiveObject()
      fabricRef.current.renderAll()
      setSelectedId(null)
      setSelectedProps(null)
    }
  }, [])

  // Move object
  const moveObject = useCallback((id: string, x: number, y: number) => {
    if (!fabricRef.current) return
    const obj = fabricRef.current.getObjects().find(o => (o as any).__swagId === id)
    if (obj) {
      obj.set({ left: x, top: y })
      clampToPrintArea(obj)
      fabricRef.current.renderAll()
      syncObjects()
      syncSelected()
    }
  }, [syncObjects, syncSelected, clampToPrintArea])

  // Resize object
  const resizeObject = useCallback((id: string, scale: number) => {
    if (!fabricRef.current) return
    const obj = fabricRef.current.getObjects().find(o => (o as any).__swagId === id)
    if (obj) {
      obj.set({ scaleX: (obj.scaleX ?? 1) * scale, scaleY: (obj.scaleY ?? 1) * scale })
      clampToPrintArea(obj)
      fabricRef.current.renderAll()
      syncObjects()
      syncSelected()
    }
  }, [syncObjects, syncSelected, clampToPrintArea])

  // Update object properties (used by properties panel)
  const updateObject = useCallback((id: string, props: Partial<{
    text: string; fontFamily: string; fontSize: number; fontWeight: string;
    fontStyle: string; fill: string; textAlign: string; angle: number; opacity: number;
    left: number; top: number
  }>) => {
    if (!fabricRef.current) return
    const obj = fabricRef.current.getObjects().find(o => (o as any).__swagId === id)
    if (!obj) return
    obj.set(props as any)
    fabricRef.current.renderAll()
    syncObjects()
    syncSelected()
  }, [syncObjects, syncSelected])

  // Layer management
  const getLayers = useCallback(() => {
    if (!fabricRef.current) return []
    return fabricRef.current.getObjects()
      .filter(o => (o as any).__swagId)
      .map(o => ({
        id: (o as any).__swagId as string,
        type: (o instanceof fabric.IText || o instanceof fabric.FabricText) ? 'text' as const : 'image' as const,
        label: (o instanceof fabric.IText || o instanceof fabric.FabricText) ? (o.text ?? 'Text').slice(0, 20) : 'Image',
        visible: o.visible !== false,
      }))
      .reverse()
  }, [])

  const selectObject = useCallback((id: string) => {
    if (!fabricRef.current) return
    const obj = fabricRef.current.getObjects().find(o => (o as any).__swagId === id)
    if (obj) {
      fabricRef.current.setActiveObject(obj)
      fabricRef.current.renderAll()
      syncSelected()
    }
  }, [syncSelected])

  const toggleVisibility = useCallback((id: string) => {
    if (!fabricRef.current) return
    const obj = fabricRef.current.getObjects().find(o => (o as any).__swagId === id)
    if (obj) {
      obj.set({ visible: !obj.visible })
      fabricRef.current.renderAll()
    }
  }, [])

  const bringForward = useCallback((id: string) => {
    if (!fabricRef.current) return
    const obj = fabricRef.current.getObjects().find(o => (o as any).__swagId === id)
    if (obj) {
      fabricRef.current.bringObjectForward(obj)
      fabricRef.current.renderAll()
    }
  }, [])

  const sendBackward = useCallback((id: string) => {
    if (!fabricRef.current) return
    const obj = fabricRef.current.getObjects().find(o => (o as any).__swagId === id)
    if (obj) {
      fabricRef.current.sendObjectBackwards(obj)
      fabricRef.current.renderAll()
    }
  }, [])

  const switchView = useCallback((view: 'front' | 'back') => {
    setActiveView(view)
  }, [])

  return {
    fabricRef,
    objects,
    selectedId,
    selectedProps,
    activeView,
    addText,
    addImage,
    removeObject,
    deleteSelected,
    moveObject,
    resizeObject,
    updateObject,
    getLayers,
    selectObject,
    toggleVisibility,
    bringForward,
    sendBackward,
    switchView,
  }
}
