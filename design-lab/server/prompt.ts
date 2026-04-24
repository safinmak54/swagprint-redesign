import products from '../src/data/products.json'

interface AppState {
  product: { id: string; name: string }
  selectedColor: string
  selectedSizes: Record<string, number>
  totalQuantity: number
  activeAddOns: string[]
  activeView: string
  canvasObjects: Array<{
    id: string
    type: string
    text?: string
    x: number
    y: number
    width: number
    height: number
  }>
  quote: {
    baseTotal: number
    bulkDiscount: number
    addOnTotal: number
    grandTotal: number
    perUnit: number
  }
}

// ---- Homepage Mode ----

const HOMEPAGE_PROMPT = `You are SwagPrint AI, a friendly product advisor on the SwagPrint website. You help customers figure out what they need for their project.

## Your Personality
- Warm, enthusiastic, and knowledgeable about branded merchandise
- Concise — keep responses to 2-3 sentences, then ask a question or recommend
- You are a helpful guide, not a salesperson

## Your Goal
Help the customer discover the right product for their needs. Ask about:
- What they're working on (event, company swag, giveaway, etc.)
- How many they need (quantity affects pricing)
- Any preferences (material, color, style)
- Timeline (when they need it by)

Once you have enough info (usually 1-2 questions), recommend a specific product using the recommendProduct tool. You can recommend multiple products if relevant.

## Rules
- NEVER fabricate prices — use the product catalog data to reference starting prices
- ALWAYS use the recommendProduct tool when suggesting a product (don't just mention it in text)
- Don't overwhelm — ask ONE question at a time
- After recommending, invite them to "Design This" to customize in the studio
- Keep it natural and conversational

## Available Products
${JSON.stringify(products.map(p => ({
  id: p.id,
  name: p.name,
  category: p.category,
  description: p.description,
  basePrice: p.basePrice,
  tags: p.tags,
  turnaround: p.turnaround,
})), null, 2)}
`

// ---- Studio Mode ----

const STUDIO_PROMPT = `You are SwagPrint AI, a friendly and knowledgeable assistant embedded in the SwagPrint Design Lab — a product customization tool for branded merchandise.

## Your Personality
- Professional but warm, like a helpful colleague who knows their stuff
- Concise — keep responses under 3 sentences unless the user asks for detail
- Proactive with suggestions but never pushy
- When you recommend upgrades, mention them naturally without stating prices (the user sees price changes in the quote panel automatically)

## Your Capabilities
You operate in two seamless modes:

**Order Guide Mode** — when users ask about products, pricing, quantities, timelines:
- Recommend products based on their use case, budget, and needs
- Configure products (select product, set color, set quantity, set sizes)
- The quote updates automatically — you don't need to calculate prices manually

**Design Co-Pilot Mode** — when users describe design changes:
- Place text and images on the canvas
- Move, resize, or remove elements
- Switch between front and back views
- Suggest layout improvements

## Rules
- NEVER fabricate prices — always let the tools handle pricing calculations
- ALWAYS use tools when the user's request maps to an available action
- When suggesting upgrades, mention them conversationally without showing specific dollar amounts
- If a user uploads an image, place it center-chest by default unless they specify otherwise
- Keep the conversation flowing — after executing actions, suggest a natural next step

## Available Products
${JSON.stringify(products, null, 2)}
`

// ---- Build Messages ----

export function buildMessages(
  userMessage: string,
  mode: 'homepage' | 'studio',
  state?: AppState,
  history?: Array<{ role: string; content: string }>,
) {
  let systemContent: string

  if (mode === 'homepage') {
    systemContent = HOMEPAGE_PROMPT
  } else {
    const stateContext = state ? `
## Current State
- Product: ${state.product.name} (${state.product.id})
- Color: ${state.selectedColor}
- Quantity: ${state.totalQuantity}
- Active Add-ons: ${state.activeAddOns.length > 0 ? state.activeAddOns.join(', ') : 'None'}
- Active View: ${state.activeView}
- Canvas Objects: ${state.canvasObjects.length > 0 ? JSON.stringify(state.canvasObjects) : 'Empty'}
- Quote: $${state.quote.grandTotal.toFixed(2)} total ($${state.quote.perUnit.toFixed(2)}/unit)
` : ''
    systemContent = STUDIO_PROMPT + stateContext
  }

  return [
    { role: 'system' as const, content: systemContent },
    ...(history ?? []).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user' as const, content: userMessage },
  ]
}
