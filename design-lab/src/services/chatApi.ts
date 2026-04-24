const API_BASE = 'http://localhost:3001'

interface ChatRequest {
  message: string
  state: Record<string, unknown>
  history: Array<{ role: string; content: string }>
}

interface SSEEvent {
  type: 'text' | 'actions' | 'done' | 'error'
  content?: string
  actions?: Array<{ tool: string; params: Record<string, unknown> }>
  message?: string
  error?: string
}

export async function sendChatMessage(
  request: ChatRequest,
  onChunk: (event: SSEEvent) => void,
): Promise<void> {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`Chat API error: ${response.status}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const event: SSEEvent = JSON.parse(line.slice(6))
          onChunk(event)
        } catch {
          // Skip malformed events
        }
      }
    }
  }
}

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Upload error: ${response.status}`)
  }

  const data = await response.json()
  return data.url
}
