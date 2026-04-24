// AI tool definitions — these get registered with the LLM provider as native tools

export const toolDefinitions = [
  {
    name: 'selectProduct',
    description: 'Load a product onto the canvas and update product info. Use when the user asks about or wants a specific product.',
    parameters: {
      type: 'object' as const,
      properties: {
        productId: { type: 'string', description: 'The product ID from the catalog (e.g., "heavyweight-essential", "custom-lanyard")' },
      },
      required: ['productId'],
    },
  },
  {
    name: 'setColor',
    description: 'Change the product color variant and swap the mockup image.',
    parameters: {
      type: 'object' as const,
      properties: {
        colorName: { type: 'string', description: 'The color name (e.g., "Black", "Navy")' },
      },
      required: ['colorName'],
    },
  },
  {
    name: 'setQuantity',
    description: 'Update the order quantity. This automatically recalculates pricing with bulk discounts.',
    parameters: {
      type: 'object' as const,
      properties: {
        quantity: { type: 'number', description: 'The quantity to set' },
      },
      required: ['quantity'],
    },
  },
  {
    name: 'setSizeBreakdown',
    description: 'Fill the size breakdown grid with per-size quantities. Only for products that have sizes (e.g., apparel).',
    parameters: {
      type: 'object' as const,
      properties: {
        sizes: {
          type: 'object',
          description: 'Object mapping size labels to quantities, e.g., {"S": 5, "M": 18, "L": 17, "XL": 8, "2XL": 2}',
        },
      },
      required: ['sizes'],
    },
  },
  {
    name: 'addText',
    description: 'Place a text element on the design canvas.',
    parameters: {
      type: 'object' as const,
      properties: {
        text: { type: 'string', description: 'The text content' },
        font: { type: 'string', description: 'Font family (default: "Plus Jakarta Sans")' },
        size: { type: 'number', description: 'Font size in pixels (default: 24)' },
        color: { type: 'string', description: 'Text color hex (default: "#ffffff")' },
        x: { type: 'number', description: 'X position on canvas' },
        y: { type: 'number', description: 'Y position on canvas' },
      },
      required: ['text'],
    },
  },
  {
    name: 'addImage',
    description: 'Place an uploaded image or logo on the design canvas.',
    parameters: {
      type: 'object' as const,
      properties: {
        url: { type: 'string', description: 'URL of the image to place' },
        x: { type: 'number', description: 'X position on canvas' },
        y: { type: 'number', description: 'Y position on canvas' },
        width: { type: 'number', description: 'Desired width in pixels' },
      },
      required: ['url'],
    },
  },
  {
    name: 'moveObject',
    description: 'Reposition an element on the canvas.',
    parameters: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'Object ID on canvas' },
        x: { type: 'number', description: 'New X position' },
        y: { type: 'number', description: 'New Y position' },
      },
      required: ['id', 'x', 'y'],
    },
  },
  {
    name: 'resizeObject',
    description: 'Scale an element up or down on the canvas.',
    parameters: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'Object ID on canvas' },
        scale: { type: 'number', description: 'Scale factor (e.g., 0.8 to shrink, 1.2 to enlarge)' },
      },
      required: ['id', 'scale'],
    },
  },
  {
    name: 'removeObject',
    description: 'Delete an element from the canvas.',
    parameters: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: 'Object ID to remove' },
      },
      required: ['id'],
    },
  },
  {
    name: 'switchView',
    description: 'Flip between front and back view of the product.',
    parameters: {
      type: 'object' as const,
      properties: {
        side: { type: 'string', enum: ['front', 'back'], description: 'Which side to show' },
      },
      required: ['side'],
    },
  },
  {
    name: 'generateQuote',
    description: 'Calculate and display a full price breakdown in the chat. Use when the user asks for a quote or total.',
    parameters: {
      type: 'object' as const,
      properties: {},
    },
  },
]

// Homepage-only tool for product recommendations
export const homepageToolDefinitions = [
  {
    name: 'recommendProduct',
    description: 'Recommend a product to the customer. This renders a product card with a "Design This" button that takes them to the Design Studio. Use this whenever you want to suggest a specific product.',
    parameters: {
      type: 'object' as const,
      properties: {
        productId: { type: 'string', description: 'The product ID from the catalog (e.g., "heavyweight-essential", "custom-lanyard")' },
        colorName: { type: 'string', description: 'Suggested color name (optional)' },
        quantity: { type: 'number', description: 'Suggested quantity based on conversation (optional)' },
        reason: { type: 'string', description: 'Brief reason for the recommendation (shown to user)' },
      },
      required: ['productId', 'reason'],
    },
  },
]
