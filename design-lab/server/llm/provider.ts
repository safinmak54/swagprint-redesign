// LLM Provider abstraction — swap Claude/OpenAI/etc via config

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LLMTool {
  name: string
  description: string
  parameters: Record<string, unknown>
}

export interface LLMToolCall {
  tool: string
  params: Record<string, unknown>
}

export interface LLMResponse {
  message: string
  toolCalls: LLMToolCall[]
}

export interface LLMProvider {
  sendMessage(
    messages: LLMMessage[],
    tools: LLMTool[],
    onChunk?: (text: string) => void,
  ): Promise<LLMResponse>
}

export function getProvider(): LLMProvider {
  const providerName = process.env.LLM_PROVIDER || 'claude'

  switch (providerName) {
    case 'claude':
      return require('./claude').createClaudeProvider()
    case 'openai':
      return require('./openai').createOpenAIProvider()
    default:
      throw new Error(`Unknown LLM provider: ${providerName}`)
  }
}
