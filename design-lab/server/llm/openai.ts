import OpenAI from 'openai'
import type { LLMProvider, LLMMessage, LLMTool, LLMResponse, LLMToolCall } from './provider'

export function createOpenAIProvider(): LLMProvider {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  return {
    async sendMessage(messages, tools, onChunk) {
      const openaiMessages = messages.map(m => ({
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content,
      }))

      const openaiTools = tools.map(t => ({
        type: 'function' as const,
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      }))

      const stream = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: openaiMessages,
        tools: openaiTools,
        stream: true,
      })

      let messageText = ''
      const toolCalls: LLMToolCall[] = []
      const partialToolCalls: Record<number, { name: string; args: string }> = {}

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta

        if (delta?.content) {
          messageText += delta.content
          onChunk?.(delta.content)
        }

        if (delta?.tool_calls) {
          for (const tc of delta.tool_calls) {
            if (!partialToolCalls[tc.index]) {
              partialToolCalls[tc.index] = { name: '', args: '' }
            }
            if (tc.function?.name) {
              partialToolCalls[tc.index].name = tc.function.name
            }
            if (tc.function?.arguments) {
              partialToolCalls[tc.index].args += tc.function.arguments
            }
          }
        }
      }

      // Parse accumulated tool calls
      for (const tc of Object.values(partialToolCalls)) {
        try {
          toolCalls.push({
            tool: tc.name,
            params: JSON.parse(tc.args),
          })
        } catch {
          // Skip malformed tool calls
        }
      }

      return { message: messageText, toolCalls }
    },
  }
}
