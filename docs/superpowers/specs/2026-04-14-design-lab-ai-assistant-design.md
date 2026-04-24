# SwagPrint Design Lab + AI Assistant — Design Spec

## Context

SwagPrint is a branded merchandise e-commerce platform. The current site ([code.html](../../../code.html)) is a premium landing page built with Tailwind CSS and vanilla JS — no backend, no product database, no interactive tools.

The goal is to build two integrated features:

1. **Design Lab** — A visual product customization tool where users configure merchandise (pick product, color, size, quantity) and design artwork (add logos, text, graphics) on a live mockup canvas.
2. **AI Assistant** — A conversational AI embedded in the Design Lab that acts as both an order guide (product recommendations, pricing, upsells) and a design co-pilot (placing logos, adding text, adjusting layouts on the canvas).

These are not two separate features — they are one unified experience. The AI lives inside the Design Lab and can both talk to the user AND manipulate the canvas. This is inspired by SmartPress Intelligence (a proprietary AI agent for product configuration and quoting) but goes further by integrating the AI directly into the design workflow.

**Why now:** SmartPress launched their AI agent in 2025 and it significantly accelerates their ordering flow. SwagPrint can differentiate by going beyond chat-only — merging AI into the visual design experience so users can go from "I need 50 black tees with our logo" to a finished, quoted mockup in one conversation.

## Architecture

### System Overview

```
Browser (React + Vite)
  ├── Left Panel:   Design tools (Select Product, Add Text, Add Art, Upload Image, Layer Manager)
  ├── Center:       Fabric.js canvas (product mockup with interactive design elements)
  └── Right Panel:  Product info + pricing (top, collapsible) + AI chat (bottom, expandable)
        │
        │  HTTP / Server-Sent Events (SSE)
        ▼
API Server (Express)
  ├── POST /api/chat     — receives user message + full app state, streams AI response
  ├── LLM Abstraction    — provider interface: sendMessage(messages, tools) → response
  │     ├── Claude adapter
  │     ├── OpenAI adapter
  │     └── (future: open-source adapter)
  ├── Product Data Svc   — reads mock JSON catalog, computes pricing
  └── Prompt Engine      — assembles system prompt + product context + canvas state + history
        │
        ▼
  Structured AI Output: { message: string, actions: Action[], quote?: Quote }
```

### Key Technical Decisions

- **Fabric.js** for the canvas — open-source, purpose-built for product mockups. Handles text, images, layers, transforms. AI actions map directly to Fabric.js API calls.
- **LLM Abstraction Layer** — a provider interface (`sendMessage(messages, tools) → response`) so the underlying model (Claude, OpenAI, open-source) can be swapped via config with no code changes.
- **Structured AI Output** — the AI returns JSON with a `message` (shown in chat), `actions[]` (executed on canvas/product state), and optional `quote` (updates pricing display). This separation keeps the AI's conversational response decoupled from its side effects.
- **Server-Sent Events (SSE)** for streaming — the AI's text response streams in real-time (typing effect). Actions execute after the full response is parsed.
- **Zustand** for state management — lightweight, no boilerplate. Single store with four slices: product, canvas, quote, chat.
- **LLM tool-use / function-calling** for structured output — the AI tools (selectProduct, addText, etc.) are registered as native tool definitions with the LLM provider. Claude uses tool_use, OpenAI uses function_calling. The abstraction layer normalizes the response into `{ message, actions[], quote? }`. No JSON parsing from free-text — the provider's structured output mechanism guarantees valid schemas. If the LLM call fails (network error, timeout, malformed response), the chat shows a retry-able error message and no canvas actions execute.
- **Express** for the API server — minimal, handles SSE streaming well, widely documented. Fastify is an alternative if performance becomes a concern, but Express is the default.

## Design Lab UI Layout

### Three-Panel Layout

The Design Lab is a full-screen application with three panels:

**Left Panel — Design Tools (180px fixed)**
- Select Product (opens product catalog browser)
- Add Text (opens text editor with font/size/color)
- Add Art (clipart/graphics library)
- Upload Image (drag-and-drop logo/artwork upload)
- Layer Manager (reorder, show/hide, lock design elements)
- Export Mockup button
- Settings, Help links

**Center — Canvas (flexible width)**
- Fabric.js canvas rendering the product mockup
- Interactive design elements (drag, resize, rotate)
- Print area indicator (dashed boundary showing valid design zone)
- View indicator badge ("FRONT VIEW ACTIVE" / "BACK VIEW ACTIVE")
- Bottom controls: Grid toggle, Zoom level, Flip (front/back)

**Right Panel — Product Info + AI Chat (320px fixed)**

Split into two sections with smart space allocation:

*Top: Product Info (collapsible)*
- Product name, material description
- Price with sale/discount badges
- Color swatches (clickable)
- Size selector (hybrid — see below)
- Quantity control with live total
- Collapses to a compact bar (name + price) when user is actively chatting

*Bottom: AI Chat (expandable)*
- Chat header with SwagPrint AI branding and online indicator
- Message thread (AI messages with action confirmation footers: "✓ Product loaded • ✓ Color set")
- Chat input with paperclip icon for file/image upload
- Quick-action chips below input: "Add logo", "Get quote", "Change color"
- Expands as conversation grows, product info collapses to accommodate

### Hybrid Size Selector (Option C)

The size selector adapts based on order quantity:

- **Qty = 1 (single item):** Simple button row — S, M, L, XL, 2XL, 3XL. Click to select one.
- **Qty 2–9 (small order):** Same button row, but multi-select enabled. User clicks each size they want and enters a quantity per selected size. Compact inline inputs appear next to selected sizes.
- **Qty ≥ 10 (bulk order):** Auto-expands into a size breakdown table with per-size quantity inputs and a visual bar showing distribution. Total must equal the order quantity.
- **AI can populate any mode:** User says "split 50 shirts, heavy on M and L" and the AI fills the breakdown grid via a `setSizeBreakdown` action.

## AI Assistant

### Two Modes, One Interface

The AI detects intent from the user's message and responds in the appropriate mode. No explicit mode switching.

**Order Guide Mode** — triggered by product, pricing, quantity, or timeline questions:
- Product recommendations based on use case, budget, tags
- Real-time price calculations with bulk discount tiers
- Color and size availability
- Upsell suggestions (back print, sleeve print, premium materials)
- Delivery timeline estimates
- Auto-configures product state (selects product, color, quantity)

**Design Co-Pilot Mode** — triggered by design, layout, or artwork requests:
- Place, move, resize, remove elements on canvas
- Add text with font, size, color, position
- Position uploaded logos/images
- Suggest layout improvements
- Switch product views (front/back)
- Adjust colors to match brand guidelines

### AI Tool System

The AI has structured tools it can call. Each maps to a canvas or product operation:

| Tool | Parameters | Effect |
|------|-----------|--------|
| `selectProduct` | `(productId)` | Load product onto canvas, update product info |
| `setColor` | `(colorName)` | Change product color variant, swap mockup image |
| `setQuantity` | `(n)` | Update quantity, recalculate pricing and discount tier |
| `setSizeBreakdown` | `({S: n, M: n, ...})` | Fill the size breakdown grid |
| `addText` | `({text, font, size, color, x, y})` | Place text element on canvas |
| `addImage` | `({url, x, y, width})` | Place uploaded image/logo on canvas |
| `moveObject` | `({id, x, y})` | Reposition element on canvas |
| `resizeObject` | `({id, scale})` | Scale element up or down |
| `removeObject` | `(id)` | Delete element from canvas |
| `switchView` | `(side)` | Flip between front and back view |
| `generateQuote` | `()` | Calculate and display full price breakdown |

### Suggested Replies (Product-Specific Upsells)

After each AI response, the chat displays 2-3 clickable **suggested reply buttons** below the message. These are product-specific upsell prompts defined in the product catalog data — not AI-generated free text.

**How it works:**
- Each product in `products.json` defines an `upgrades` array — product-specific customization upgrades that enhance the item the customer is already looking at. These are NOT cross-sells to other products — they are enhancements to the current product.
- After the AI responds, the frontend picks the 2-3 most relevant upgrades from the pool based on what's already been configured (e.g., don't suggest "Add back print" if back print is already added).
- Clicking a suggested reply sends it as the user's next message — the AI then executes the upgrade and the quote updates automatically.
- **No pricing is shown on the buttons.** The cost change appears only in the quote section on the right panel when the upgrade is applied. This keeps the suggestions feeling helpful, not salesy.

**Example upgrades by product type:**

```json
// Lanyards
"upgrades": [
  "Add laminated sleeve",
  "Make it double-sided print",
  "Add safety breakaway clip",
  "Upgrade to woven fabric",
  "Add custom buckle",
  "Add badge reel attachment"
]

// T-Shirts
"upgrades": [
  "Add a back print",
  "Add a sleeve print",
  "Upgrade to premium fabric",
  "Add inside neck label",
  "Add individual names"
]

// Tote Bags
"upgrades": [
  "Add inside pocket",
  "Print on both sides",
  "Upgrade to canvas material",
  "Add zipper closure"
]
```

**UI:** Buttons appear as horizontally-scrollable chips below the AI's message, styled as outlined pills (matching DESIGN.md's tertiary button style). They disappear once the user sends a new message (typed or clicked).

### Conversation Flow Example

1. User lands on homepage → clicks "Get Started" → Design Lab opens with default product and AI welcome message
2. User: "I need 50 black t-shirts for a company retreat"
3. AI recommends Heavyweight Essential, executes `selectProduct`, `setColor("black")`, `setQuantity(50)`. Canvas updates, quote appears. **Suggested upgrades appear:** `[Add a back print]` `[Add a sleeve print]` `[Upgrade to premium fabric]`
4. User uploads logo via paperclip in chat
5. AI places logo center-chest via `addImage`, confirms placement. **Suggested upgrades:** `[Add a back print]` `[Add a sleeve print]` `[Add inside neck label]`
6. User: "Make it smaller and add RETREAT 2025 underneath"
7. AI executes `resizeObject` + `addText`. **Suggested upgrades:** `[Add a back print]` `[Add a sleeve print]` `[Add individual names]`
8. User: "Yeah show me" → AI executes `switchView("back")` + `addImage`, updates quote
9. User: "Looks great, let's order" → AI generates order summary → checkout

### Prompt Engineering

Each API call to the LLM includes:

1. **System prompt** — SwagPrint's personality, rules (never fabricate prices, always reference catalog data, suggest upsells naturally), available tools
2. **Product catalog context** — full catalog JSON (or relevant subset for large catalogs)
3. **Current canvas state** — a simplified projection of canvas objects (see `CanvasObject` type below), NOT raw Fabric.js JSON. Only includes id, type, position, dimensions, and content — no internal Fabric.js state. This keeps token usage low and avoids confusing the model.
4. **Current product state** — selected product, color, sizes, quantity, current quote
5. **Conversation history** — full message thread
6. **Pricing rules** — bulk tier logic, add-on pricing, so the AI calculates accurately

### Image Upload Flow

When a user uploads an image (via the left panel "Upload Image" tool or the chat paperclip icon):

1. File is validated client-side: accepted formats (PNG, JPG, SVG, WebP), max size 10MB.
2. File is uploaded to the Express server via `POST /api/upload` as multipart form data.
3. Server stores the file locally in an `uploads/` directory (MVP) and returns a URL path (e.g., `/uploads/abc123-logo.png`).
4. The URL is passed to the Fabric.js canvas to render the image, and included in the AI context so it can reference the image in `addImage` actions.
5. For production, `uploads/` would be replaced with S3 or similar object storage. The URL contract stays the same.

### Error States & Loading

- **AI thinking:** A typing indicator (animated dots) appears in the chat while waiting for the first SSE chunk from the server.
- **LLM failure:** If the API call fails (network error, timeout, provider outage), the chat shows an error message with a "Retry" button. No canvas actions execute on failure.
- **Malformed AI output:** If the provider's tool-use response is malformed, the message is shown as-is (text only) with no actions. A subtle warning appears: "I wasn't able to update the canvas — try asking again."
- **Image load failure:** If a product mockup image fails to load, the canvas shows a placeholder silhouette with a retry option.
- **Concurrent messages:** If the user sends a message while a previous response is still streaming, the new message is queued and sent after the current stream completes. The input is disabled during streaming with a "Responding..." indicator.
- **Conversation persistence:** Conversations are ephemeral for MVP — cleared on page reload. Server stores no chat history. Session persistence (localStorage or server-side) is a future enhancement.

## Data Model

### Product Catalog (Mock JSON)

```json
{
  "id": "heavyweight-essential",
  "name": "Heavyweight Essential",
  "category": "apparel",
  "subcategory": "t-shirts",
  "description": "100% Organic Cotton • 240 GSM",
  "basePrice": 32.00,
  "colors": [
    { "name": "Optic White", "hex": "#FFFFFF", "image": "white-tee.png" },
    { "name": "Black", "hex": "#1A1A1A", "image": "black-tee.png" },
    { "name": "Navy", "hex": "#2C3E50", "image": "navy-tee.png" }
  ],
  "sizes": ["S", "M", "L", "XL", "2XL", "3XL"],
  "printAreas": {
    "front": { "x": 150, "y": 120, "width": 280, "height": 320 },
    "back": { "x": 150, "y": 100, "width": 280, "height": 340 }
  },
  "mockupImages": {
    "front": "heavyweight-front.png",
    "back": "heavyweight-back.png"
  },
  "pricing": {
    "bulkTiers": [
      { "minQty": 1, "discount": 0 },
      { "minQty": 10, "discount": 0.10 },
      { "minQty": 25, "discount": 0.15 },
      { "minQty": 50, "discount": 0.20 },
      { "minQty": 100, "discount": 0.25 }
    ],
    "addOns": {
      "backPrint": { "perUnit": 3.00, "label": "Back print" },
      "sleevePrint": { "perUnit": 2.00, "label": "Sleeve print" }
    }
  },
  "upgrades": [
    "Add a back print",
    "Add a sleeve print",
    "Upgrade to premium fabric",
    "Add inside neck label",
    "Add individual names"
  ],
  "tags": ["eco-friendly", "premium", "bestseller"],
  "turnaround": "5-7 business days"
}
```

### Core Types

```typescript
// Simplified projection of a Fabric.js object — this is what gets stored in state
// and sent to the LLM as canvas context. NOT the raw Fabric.js internal state.
interface CanvasObject {
  id: string;                          // unique ID, e.g., "logo-1", "text-2"
  type: 'image' | 'text';
  // Image-specific
  src?: string;                        // URL for images (e.g., "/uploads/abc123-logo.png")
  // Text-specific
  text?: string;                       // text content
  fontFamily?: string;                 // e.g., "Plus Jakarta Sans"
  fontSize?: number;                   // in px
  fontWeight?: 'normal' | 'bold';
  fill?: string;                       // text color hex
  // Common positioning
  x: number;                           // left position on canvas
  y: number;                           // top position on canvas
  width: number;                       // rendered width
  height: number;                      // rendered height
  scaleX?: number;                     // scale factor (default 1)
  scaleY?: number;
  angle?: number;                      // rotation in degrees
}

interface ChatMessage {
  id: string;                          // unique message ID
  role: 'user' | 'assistant' | 'system';
  content: string;                     // display text
  timestamp: number;
  // Assistant-only fields
  actions?: Action[];                  // canvas/product actions that were executed
  quote?: Quote | null;                // updated quote if pricing changed
  actionStatus?: Record<string, 'success' | 'failed'>;  // per-action execution result
}

// An action the AI requests via tool-use. Maps 1:1 to the AI Tool System table.
interface Action {
  tool: string;                        // tool name, e.g., "addText", "selectProduct"
  params: Record<string, unknown>;     // tool-specific parameters
}

interface Quote {
  baseTotal: number;
  bulkDiscount: number;
  addOnTotal: number;
  grandTotal: number;
  perUnit: number;
}
```

### App State Shape (Zustand Store)

```typescript
interface DesignLabState {
  product: {
    id: string;
    selectedColor: string;
    selectedSizes: Record<string, number>; // { S: 5, M: 18, L: 17, ... }
    totalQuantity: number;
    addOns: string[];
  };
  canvas: {
    activeView: 'front' | 'back';
    objects: CanvasObject[];
  };
  quote: Quote;
  chat: {
    messages: ChatMessage[];
    isStreaming: boolean;
  };
}
```

**Quote auto-calculation:** The quote recalculates automatically whenever `product.totalQuantity`, `product.selectedSizes`, or `product.addOns` change (via a Zustand `subscribe` or derived selector). The `generateQuote` AI tool exists for the AI to trigger an explicit detailed breakdown in the chat, but pricing always stays in sync with product state.

## Entry Points

The Design Lab is accessible from two places:

1. **Homepage "Get Started" button** — prominent CTA that links directly to `/design-lab`. Opens with a default product and the AI welcome message.
2. **Product pages** — each product has a "Customize" or "Design It" button that opens the Design Lab with that product pre-loaded.

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend framework | React + Vite | Component-based, fast HMR, great ecosystem |
| Styling | Tailwind CSS + DESIGN.md tokens | Follow existing design system (Plus Jakarta Sans + Inter, tonal depth, no 1px borders, ambient shadows) |
| Canvas | Fabric.js | Open-source, purpose-built for product mockups |
| State management | Zustand | Lightweight, no boilerplate, supports slices |
| API server | Express | Minimal, handles SSE streaming well, widely documented |
| LLM integration | Abstraction layer | Swap Claude / OpenAI / open-source via config |
| Streaming | Server-Sent Events (SSE) | Real-time AI response streaming |
| Product data | Mock JSON files | Start simple, replace with DB/API later |

## Visual Design

The Design Lab UI must follow the existing design system defined in [DESIGN.md](../../../DESIGN.md):

- **Typography:** Plus Jakarta Sans for headings/labels, Inter for body/chat text
- **Colors:** Use the existing token system — primary `#001f9d`, primary-container `#1032cf`, surface hierarchy, tonal layering
- **Borders:** No 1px borders — use surface color shifts and ambient shadows for separation (per DESIGN.md "no-line" rule)
- **Shadows:** Ambient shadows (40–60px blur, 4–6% opacity) for elevation, not hard drop shadows
- **Buttons:** Follow existing button styles (pill-shaped, gradient hover effects)
- **Chat bubbles:** AI messages use tonal surface shift (not bordered boxes). User messages use primary color fill.
- **Panel backgrounds:** Use surface hierarchy — left panel and right panel are one surface level above the canvas background

## Security & API Keys (MVP)

- **API keys:** LLM provider keys stored as environment variables (`.env` file, gitignored). The Express server reads from `process.env`.
- **Authentication:** MVP has no user authentication. The `/api/chat` endpoint is public.
- **Rate limiting:** Express rate-limiter middleware on `/api/chat` — 20 requests per minute per IP. Prevents abuse of the LLM API.
- **File upload limits:** `multer` middleware with 10MB max file size, accepted MIME types only (image/png, image/jpeg, image/svg+xml, image/webp).
- **Production hardening (deferred):** User auth, API key rotation, request signing, CORS restrictions, and moving uploads to S3 are all deferred to post-MVP.

## Viewport & Responsiveness

- **Minimum supported width:** 1024px. Below this, a "Please use a larger screen" message is shown.
- **Target viewport:** 1280px–1920px desktop.
- **Mobile/tablet (deferred):** The three-panel layout is desktop-only for MVP. A responsive version (stacked panels, swipeable views) is a future phase.

## Verification

To verify the implementation works end-to-end:

1. **Design Lab loads** — navigate to `/design-lab`, verify three-panel layout renders with default product on canvas
2. **Manual design tools work** — add text, upload an image, move/resize elements, switch front/back view
3. **Product configuration** — change color (mockup image swaps), change quantity (price updates), size selector adapts at qty 1 vs qty 10+
4. **AI chat — order guide** — type "I need 50 black tees", verify AI recommends product, canvas updates, quote calculates correctly
5. **AI chat — design co-pilot** — type "add TEAM 2025 in bold white text centered", verify text appears on canvas
6. **AI upsells** — verify AI naturally suggests add-ons (back print) during conversation
7. **Streaming** — verify AI response streams in real-time (typing effect)
8. **LLM swap** — change provider config, verify chat still works with different LLM
9. **Responsive** — verify layout works on desktop (1280px+); mobile is stretch goal
