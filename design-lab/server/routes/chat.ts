import { Router } from 'express'
import { getProvider } from '../llm/provider'
import { toolDefinitions, homepageToolDefinitions } from '../tools'
import { buildMessages } from '../prompt'

const router = Router()

router.post('/', async (req, res) => {
  const { message, mode = 'studio', state, history } = req.body

  if (!message) {
    res.status(400).json({ error: 'message is required' })
    return
  }

  if (mode === 'studio' && !state) {
    res.status(400).json({ error: 'state is required for studio mode' })
    return
  }

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  try {
    const provider = getProvider()
    const messages = buildMessages(message, mode, state, history)
    const tools = mode === 'homepage' ? homepageToolDefinitions : toolDefinitions

    const response = await provider.sendMessage(
      messages,
      tools,
      (chunk) => {
        res.write(`data: ${JSON.stringify({ type: 'text', content: chunk })}\n\n`)
      },
    )

    // Send tool calls
    if (response.toolCalls.length > 0) {
      res.write(`data: ${JSON.stringify({ type: 'actions', actions: response.toolCalls })}\n\n`)
    }

    // Send done signal
    res.write(`data: ${JSON.stringify({ type: 'done', message: response.message })}\n\n`)
    res.end()
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    res.write(`data: ${JSON.stringify({ type: 'error', error: errMsg })}\n\n`)
    res.end()
  }
})

export default router
