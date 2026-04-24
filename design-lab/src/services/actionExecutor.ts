import { useStore } from '../store'

interface Action {
  tool: string
  params: Record<string, unknown>
}

// Canvas actions need to be dispatched to the Fabric.js instance
// We use the window.__designLab bridge for now (will be replaced with context in Phase 6)
function getCanvasApi() {
  return (window as any).__designLab as {
    addText: (text?: string, options?: any) => string | undefined
    addImage: (src: string, options?: any) => Promise<string | undefined>
    removeObject: (id: string) => void
    moveObject: (id: string, x: number, y: number) => void
    resizeObject: (id: string, scale: number) => void
    switchView: (view: 'front' | 'back') => void
  } | undefined
}

export async function executeActions(actions: Action[]): Promise<Record<string, 'success' | 'failed'>> {
  const store = useStore.getState()
  const canvas = getCanvasApi()
  const results: Record<string, 'success' | 'failed'> = {}

  for (const action of actions) {
    const key = action.tool
    try {
      switch (action.tool) {
        case 'selectProduct':
          store.selectProduct(action.params.productId as string)
          break

        case 'addColorOrder':
          store.addColorOrder(action.params.color as string)
          break

        case 'removeColorOrder':
          store.removeColorOrder(action.params.color as string)
          break

        case 'updateColorOrder':
          store.updateColorOrder(
            action.params.color as string,
            { quantity: action.params.quantity as number }
          )
          break

        case 'addText':
          if (canvas) {
            canvas.addText(action.params.text as string, {
              font: action.params.font,
              size: action.params.size,
              color: action.params.color,
              x: action.params.x,
              y: action.params.y,
            })
          }
          break

        case 'addImage':
          if (canvas) {
            await canvas.addImage(action.params.url as string, {
              x: action.params.x,
              y: action.params.y,
              width: action.params.width,
            })
          }
          break

        case 'moveObject':
          if (canvas) {
            canvas.moveObject(action.params.id as string, action.params.x as number, action.params.y as number)
          }
          break

        case 'resizeObject':
          if (canvas) {
            canvas.resizeObject(action.params.id as string, action.params.scale as number)
          }
          break

        case 'removeObject':
          if (canvas) {
            canvas.removeObject(action.params.id as string)
          }
          break

        case 'switchView':
          store.setActiveView(action.params.side as 'front' | 'back')
          if (canvas) {
            canvas.switchView(action.params.side as 'front' | 'back')
          }
          break

        case 'generateQuote':
          // Quote is auto-calculated, but we could trigger a detailed breakdown in chat
          break

        default:
          results[key] = 'failed'
          continue
      }
      results[key] = 'success'
    } catch {
      results[key] = 'failed'
    }
  }

  return results
}
