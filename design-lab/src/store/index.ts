import { create } from 'zustand'
import products from '../data/products.json'

// ---- Types ----

export interface Product {
  id: string
  name: string
  category: string
  subcategory: string
  description: string
  basePrice: number
  colors: { name: string; hex: string }[]
  sizes: string[]
  printAreas: Record<string, { x: number; y: number; width: number; height: number }>
  pricing: {
    bulkTiers: { minQty: number; discount: number }[]
    addOns: Record<string, { perUnit: number; label: string }>
  }
  upgrades: string[]
  tags: string[]
  turnaround: string
}

export interface CanvasObject {
  id: string
  type: 'image' | 'text'
  text?: string
  fontFamily?: string
  fontSize?: number
  fill?: string
  src?: string
  x: number
  y: number
  width: number
  height: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  actions?: { tool: string; params: Record<string, unknown> }[]
  actionStatus?: Record<string, 'success' | 'failed'>
}

export interface Quote {
  baseTotal: number
  bulkDiscount: number
  addOnTotal: number
  grandTotal: number
  perUnit: number
}

export interface ColorOrder {
  color: string
  quantity: number
  sizes: Record<string, number>
}

export interface DesignLabState {
  // Product
  product: Product
  colorOrders: ColorOrder[]
  activeCanvasColor: string
  drawerOpen: boolean
  selectedWidth: string
  selectedLength: string
  selectedAttachment: string
  selectedPrintMethod: string
  selectedImprintSide: string
  selectedStitchStyle: string
  totalQuantity: number
  activeAddOns: string[]

  // Canvas
  activeView: 'front' | 'back'
  canvasObjects: CanvasObject[]

  // Quote
  quote: Quote

  // Chat
  messages: ChatMessage[]
  isStreaming: boolean

  // Actions
  selectProduct: (productId: string) => void
  addColorOrder: (color: string) => void
  removeColorOrder: (color: string) => void
  updateColorOrder: (color: string, updates: Partial<Omit<ColorOrder, 'color'>>) => void
  toggleColorOrder: (color: string) => void
  setActiveCanvasColor: (color: string) => void
  setDrawerOpen: (open: boolean) => void
  setWidth: (width: string) => void
  setLength: (length: string) => void
  setAttachment: (attachment: string) => void
  setPrintMethod: (method: string) => void
  setImprintSide: (side: string) => void
  setStitchStyle: (style: string) => void
  toggleAddOn: (addOnKey: string) => void
  setActiveView: (view: 'front' | 'back') => void
  setCanvasObjects: (objects: CanvasObject[]) => void
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  setStreaming: (streaming: boolean) => void
}

// ---- Helpers ----

const catalog = products as unknown as Product[]

function calcQuote(product: Product, qty: number, addOns: string[]): Quote {
  const tier = [...product.pricing.bulkTiers]
    .reverse()
    .find(t => qty >= t.minQty)
  const discount = tier?.discount ?? 0
  const baseTotal = product.basePrice * qty
  const bulkDiscount = -(baseTotal * discount)
  const addOnTotal = addOns.reduce((sum, key) => {
    const addOn = product.pricing.addOns[key]
    return sum + (addOn ? addOn.perUnit * qty : 0)
  }, 0)
  const grandTotal = baseTotal + bulkDiscount + addOnTotal
  return {
    baseTotal,
    bulkDiscount,
    addOnTotal,
    grandTotal,
    perUnit: qty > 0 ? grandTotal / qty : 0,
  }
}

function getTotalQuantity(colorOrders: ColorOrder[]): number {
  return colorOrders.reduce((sum, co) => sum + co.quantity, 0)
}

// ---- Store ----

const defaultProduct = catalog[0]

export const useStore = create<DesignLabState>((set) => ({
  product: defaultProduct,
  colorOrders: [{ color: defaultProduct.colors[0]?.name ?? '', quantity: 50, sizes: {} }],
  activeCanvasColor: defaultProduct.colors[0]?.name ?? '',
  drawerOpen: false,
  selectedWidth: (defaultProduct as any).widths?.[2] ?? '',
  selectedLength: (defaultProduct as any).lengths?.[1] ?? '',
  selectedAttachment: (defaultProduct as any).attachments?.[0] ?? '',
  selectedPrintMethod: (defaultProduct as any).printMethods?.[0] ?? '',
  selectedImprintSide: (defaultProduct as any).imprintSides?.[0] ?? 'One-Sided',
  selectedStitchStyle: (defaultProduct as any).stitchStyles?.[0] ?? 'Sewn',
  totalQuantity: 50,
  activeAddOns: [],

  activeView: 'front',
  canvasObjects: [],

  quote: calcQuote(defaultProduct, 50, []),

  messages: [
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hey! I'm your SwagPrint assistant. I can help you pick products, customize your design, or get a quote. What are you working on?",
      timestamp: Date.now(),
    },
  ],
  isStreaming: false,

  selectProduct: (productId) => {
    const product = catalog.find(p => p.id === productId)
    if (!product) return
    const fromUrl = new URLSearchParams(window.location.search).get('product') === productId
    const firstColor = product.colors[0]?.name ?? ''
    set((s) => ({
      product,
      colorOrders: [{ color: firstColor, quantity: s.totalQuantity, sizes: {} }],
      activeCanvasColor: firstColor,
      selectedWidth: (product as any).widths?.[2] ?? (product as any).widths?.[0] ?? '',
      selectedLength: (product as any).lengths?.[1] ?? (product as any).lengths?.[0] ?? '',
      selectedAttachment: (product as any).attachments?.[0] ?? '',
      selectedPrintMethod: (product as any).printMethods?.[0] ?? '',
      selectedImprintSide: (product as any).imprintSides?.[0] ?? 'One-Sided',
      selectedStitchStyle: (product as any).stitchStyles?.[0] ?? 'Sewn',
      activeAddOns: [],
      quote: calcQuote(product, s.totalQuantity, []),
      messages: fromUrl ? [{
        id: 'welcome',
        role: 'assistant' as const,
        content: `I've loaded your ${product.name}. Let's customize it! Upload your logo or tell me what you'd like to add.`,
        timestamp: Date.now(),
      }] : s.messages,
    }))
  },

  addColorOrder: (color) => {
    set((s) => {
      if (s.colorOrders.some(co => co.color === color)) return s
      const newOrders = [...s.colorOrders, { color, quantity: 1, sizes: {} }]
      const total = getTotalQuantity(newOrders)
      return {
        colorOrders: newOrders,
        activeCanvasColor: color,
        totalQuantity: total,
        quote: calcQuote(s.product, total, s.activeAddOns),
      }
    })
  },

  removeColorOrder: (color) => {
    set((s) => {
      if (s.colorOrders.length <= 1) return s
      const newOrders = s.colorOrders.filter(co => co.color !== color)
      const total = getTotalQuantity(newOrders)
      return {
        colorOrders: newOrders,
        activeCanvasColor: newOrders[0].color,
        totalQuantity: total,
        quote: calcQuote(s.product, total, s.activeAddOns),
      }
    })
  },

  updateColorOrder: (color, updates) => {
    set((s) => {
      const newOrders = s.colorOrders.map(co => {
        if (co.color !== color) return co
        const updated = { ...co, ...updates }
        // If sizes were updated, recalc quantity from sizes
        if (updates.sizes) {
          const sizeTotal = Object.values(updates.sizes).reduce((a, b) => a + b, 0)
          if (sizeTotal > 0) updated.quantity = sizeTotal
        }
        return updated
      })
      const total = getTotalQuantity(newOrders)
      return {
        colorOrders: newOrders,
        totalQuantity: total,
        quote: calcQuote(s.product, total, s.activeAddOns),
      }
    })
  },

  toggleColorOrder: (color) => {
    set((s) => {
      const exists = s.colorOrders.some(co => co.color === color)
      if (exists) {
        if (s.colorOrders.length <= 1) return s
        const newOrders = s.colorOrders.filter(co => co.color !== color)
        const total = getTotalQuantity(newOrders)
        return {
          colorOrders: newOrders,
          activeCanvasColor: newOrders[0].color,
          totalQuantity: total,
          quote: calcQuote(s.product, total, s.activeAddOns),
        }
      } else {
        const newOrders = [...s.colorOrders, { color, quantity: 1, sizes: {} }]
        const total = getTotalQuantity(newOrders)
        return {
          colorOrders: newOrders,
          activeCanvasColor: color,
          totalQuantity: total,
          quote: calcQuote(s.product, total, s.activeAddOns),
        }
      }
    })
  },

  setActiveCanvasColor: (color) => set({ activeCanvasColor: color }),
  setDrawerOpen: (open) => set({ drawerOpen: open }),
  setWidth: (width) => set({ selectedWidth: width }),
  setLength: (length) => set({ selectedLength: length }),
  setAttachment: (attachment) => set({ selectedAttachment: attachment }),
  setPrintMethod: (method) => set({ selectedPrintMethod: method }),
  setImprintSide: (side) => set({ selectedImprintSide: side }),
  setStitchStyle: (style) => set({ selectedStitchStyle: style }),

  toggleAddOn: (addOnKey) => {
    set((s) => {
      const addOns = s.activeAddOns.includes(addOnKey)
        ? s.activeAddOns.filter(k => k !== addOnKey)
        : [...s.activeAddOns, addOnKey]
      const total = getTotalQuantity(s.colorOrders)
      return {
        activeAddOns: addOns,
        quote: calcQuote(s.product, total, addOns),
      }
    })
  },

  setActiveView: (view) => set({ activeView: view }),

  setCanvasObjects: (objects) => set({ canvasObjects: objects }),

  addMessage: (msg) => {
    set((s) => ({
      messages: [...s.messages, { ...msg, id: `msg-${Date.now()}`, timestamp: Date.now() }],
    }))
  },

  setStreaming: (streaming) => set({ isStreaming: streaming }),
}))

export { catalog }
