import { useState, useRef, useEffect } from 'react'
import { useStore } from '../store'
import { sendChatMessage } from '../services/chatApi'
import { executeActions } from '../services/actionExecutor'

const quickActions = ['Add logo', 'Get quote', 'Change color']

export function ChatPanel() {
  const [input, setInput] = useState('')
  const messages = useStore(s => s.messages)
  const isStreaming = useStore(s => s.isStreaming)
  const addMessage = useStore(s => s.addMessage)
  const setStreaming = useStore(s => s.setStreaming)
  const product = useStore(s => s.product)
  const activeAddOns = useStore(s => s.activeAddOns)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Get relevant upgrade suggestions (filter out already-applied ones)
  const relevantUpgrades = product.upgrades.filter(u => {
    const lower = u.toLowerCase()
    return !activeAddOns.some(ao => lower.includes(ao.toLowerCase()))
  }).slice(0, 3)

  const handleSend = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || isStreaming) return

    setInput('')
    addMessage({ role: 'user', content: msg })
    setStreaming(true)

    // Build state snapshot for the API
    const state = {
      product: { id: useStore.getState().product.id, name: useStore.getState().product.name },
      colorOrders: useStore.getState().colorOrders,
      activeCanvasColor: useStore.getState().activeCanvasColor,
      totalQuantity: useStore.getState().totalQuantity,
      activeAddOns: useStore.getState().activeAddOns,
      activeView: useStore.getState().activeView,
      canvasObjects: useStore.getState().canvasObjects,
      quote: useStore.getState().quote,
    }

    // Build history (last 10 messages for context)
    const history = useStore.getState().messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content,
    }))

    let responseText = ''
    let actions: Array<{ tool: string; params: Record<string, unknown> }> = []

    try {
      await sendChatMessage({ message: msg, state, history }, (event) => {
        switch (event.type) {
          case 'text':
            responseText += event.content || ''
            break
          case 'actions':
            actions = event.actions || []
            break
          case 'error':
            responseText = `Sorry, something went wrong: ${event.error}. Please try again.`
            break
        }
      })
    } catch {
      responseText = "I'm having trouble connecting right now. Please check that the server is running and try again."
    }

    // Execute actions on canvas/product state
    let actionStatus: Record<string, 'success' | 'failed'> | undefined
    if (actions.length > 0) {
      actionStatus = await executeActions(actions)
    }

    addMessage({
      role: 'assistant',
      content: responseText,
      actions,
      actionStatus,
    })
    setStreaming(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Chat header */}
      <div className="px-4 py-2.5 border-b border-outline flex items-center gap-2">
        <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center text-[10px] text-on-primary">
          ✦
        </div>
        <span className="text-on-surface text-xs font-semibold">SwagPrint AI</span>
        <span className="w-1.5 h-1.5 bg-[#8ECAB0] rounded-full ml-0.5" />
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={msg.id}>
            {msg.role === 'assistant' ? (
              <div className="max-w-[90%]">
                <div className="bg-surface-container-low rounded-xl rounded-bl-sm px-3 py-2.5 text-xs text-on-surface leading-relaxed">
                  {msg.content}
                  {msg.actionStatus && Object.keys(msg.actionStatus).length > 0 && (
                    <div className="mt-1.5 pt-1.5 border-t border-outline text-on-surface-variant text-[10px]">
                      {Object.entries(msg.actionStatus).map(([tool, status], j) => (
                        <span key={tool}>
                          {j > 0 && ' \u00A0\u2022\u00A0 '}
                          {status === 'success' ? '✓' : '✗'} {formatToolName(tool)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Suggested upgrade chips — show on latest assistant message only */}
                {i === messages.length - 1 && relevantUpgrades.length > 0 && !isStreaming && (
                  <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
                    {relevantUpgrades.map((upgrade) => (
                      <button
                        key={upgrade}
                        onClick={() => handleSend(upgrade)}
                        className="shrink-0 border border-outline hover:border-primary/40 text-on-surface-variant hover:text-primary text-[10px] px-2.5 py-1 rounded-full transition-colors"
                      >
                        {upgrade}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="max-w-[80%] ml-auto">
                <div className="bg-primary rounded-xl rounded-br-sm px-3 py-2.5 text-xs text-on-primary leading-relaxed">
                  {msg.content}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isStreaming && (
          <div className="max-w-[90%]">
            <div className="bg-surface-container-low rounded-xl rounded-bl-sm px-3 py-2.5 text-xs text-secondary">
              <span className="inline-flex gap-1">
                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="px-3 py-2.5 border-t border-outline">
        <div className="flex items-center gap-2 bg-surface-container-low rounded-full px-3 py-2 border border-outline focus-within:border-primary/30 transition-colors">
          <button className="text-on-surface-variant hover:text-on-surface transition-colors text-sm">
            📎
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isStreaming ? 'Responding...' : 'Ask anything or describe your design...'}
            disabled={isStreaming}
            className="flex-1 bg-transparent text-xs text-on-surface placeholder:text-on-surface-variant/50 outline-none disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={isStreaming || !input.trim()}
            className="text-primary hover:text-primary-container transition-colors text-lg disabled:opacity-30"
          >
            ➤
          </button>
        </div>
        <div className="flex gap-1.5 mt-1.5">
          {quickActions.map((action) => (
            <button
              key={action}
              onClick={() => handleSend(action)}
              disabled={isStreaming}
              className="text-[9px] text-on-surface-variant px-2 py-0.5 rounded border border-outline hover:border-primary/30 hover:text-primary transition-colors disabled:opacity-30"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function formatToolName(tool: string): string {
  const names: Record<string, string> = {
    selectProduct: 'Product loaded',
    addColorOrder: 'Color added',
    removeColorOrder: 'Color removed',
    updateColorOrder: 'Order updated',
    addText: 'Text added',
    addImage: 'Image placed',
    moveObject: 'Object moved',
    resizeObject: 'Object resized',
    removeObject: 'Object removed',
    switchView: 'View switched',
    generateQuote: 'Quote updated',
  }
  return names[tool] || tool
}
