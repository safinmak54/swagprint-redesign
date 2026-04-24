import Anthropic from '@anthropic-ai/sdk'
import type { LLMProvider, LLMMessage, LLMTool, LLMResponse, LLMToolCall } from './provider'

export function createClaudeProvider(): LLMProvider {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  return {
    async sendMessage(messages, tools, onChunk) {
      const systemMsg = messages.find(m => m.role === 'system')
      const chatMessages = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }))

      const claudeTools = tools.map(t => ({
        name: t.name,
        description: t.description,
        input_schema: t.parameters as Anthropic.Tool['input_schema'],
      }))

      const stream = client.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemMsg?.content || '',
        messages: chatMessages,
        tools: claudeTools,
      })

      let messageText = ''
      const toolCalls: LLMToolCall[] = []

      stream.on('text', (text) => {
        messageText += text
        onChunk?.(text)
      })

      const finalMessage = await stream.finalMessage()

      // Extract tool calls from content blocks
      for (const block of finalMessage.content) {
        if (block.type === 'tool_use') {
          toolCalls.push({
            tool: block.name,
            params: block.input as Record<string, unknown>,
          })
        }
      }

      return { message: messageText, toolCalls }
    },
  }
}
