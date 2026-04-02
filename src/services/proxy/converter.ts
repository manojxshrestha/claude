import type { AnthropicMessage, ContentBlock, AnthropicTool, OpenAIMessage, OpenAIContentPart, OpenAIToolCall, OpenAITool } from './types.js'

function getBlockAttr(block: unknown, attr: string, defaultValue: unknown = null): unknown {
  if (block && typeof block === 'object') {
    const obj = block as Record<string, unknown>
    if (attr in obj) return obj[attr]
  }
  return defaultValue
}

function getBlockType(block: unknown): string | null {
  return getBlockAttr(block, 'type') as string | null
}

export function convertToOpenAIMessage(
  messages: unknown[],
  system?: string,
  tools?: unknown[]
): OpenAIMessage[] {
  const result: OpenAIMessage[] = []

  for (const msg of messages) {
    const role = getBlockAttr(msg, 'role') as string
    const content = getBlockAttr(msg, 'content')

    if (typeof content === 'string') {
      result.push({ role: role as 'user' | 'assistant' | 'system', content })
    } else if (Array.isArray(content)) {
      if (role === 'assistant') {
        result.push(...convertAssistantMessage(content))
      } else if (role === 'user') {
        result.push(...convertUserMessage(content))
      } else {
        result.push({ role: role as 'user' | 'assistant' | 'system', content: JSON.stringify(content) })
      }
    } else {
      result.push({ role: role as 'user' | 'assistant' | 'system', content: String(content) })
    }
  }

  if (system) {
    result.unshift({ role: 'system', content: system })
  }

  return result
}

function convertAssistantMessage(content: unknown[]): OpenAIMessage[] {
  const contentParts: string[] = []
  const toolCalls: OpenAIToolCall[] = []

  for (const block of content) {
    const blockType = getBlockType(block)

    if (blockType === 'text') {
      contentParts.push(getBlockAttr(block, 'text', '') as string)
    } else if (blockType === 'thinking') {
      const thinking = getBlockAttr(block, 'thinking', '') as string
      contentParts.push(`<thinking>${thinking}</thinking>`)
    } else if (blockType === 'tool_use') {
      const toolInput = getBlockAttr(block, 'input', {}) as Record<string, unknown>
      toolCalls.push({
        id: getBlockAttr(block, 'id', '') as string,
        type: 'function',
        function: {
          name: getBlockAttr(block, 'name', '') as string,
          arguments: JSON.stringify(toolInput),
        },
      })
    }
  }

  const contentStr = contentParts.join('\n\n')
  const messages: OpenAIMessage[] = []

  if (contentStr) {
    messages.push({ role: 'assistant', content: contentStr })
  }

  if (toolCalls.length > 0) {
    for (const tc of toolCalls) {
      messages.push({
        role: 'assistant',
        content: '',
        tool_calls: [tc],
      })
    }
  }

  if (messages.length === 0) {
    messages.push({ role: 'assistant', content: ' ' })
  }

  return messages
}

function convertUserMessage(content: unknown[]): OpenAIMessage[] {
  const parts: OpenAIContentPart[] = []

  for (const block of content) {
    const blockType = getBlockType(block)

    if (blockType === 'text') {
      parts.push({
        type: 'text',
        text: getBlockAttr(block, 'text', '') as string,
      })
    } else if (blockType === 'tool_result') {
      parts.push({
        type: 'text',
        text: `[Tool: ${getBlockAttr(block, 'tool_use_id', 'unknown')}] ${getBlockAttr(block, 'content', '')}`,
      })
    }
  }

  return [{ role: 'user', content: parts }]
}

export function convertToolsToOpenAI(tools: unknown[]): OpenAITool[] {
  return tools.map(tool => ({
    type: 'function',
    function: {
      name: getBlockAttr(tool, 'name', '') as string,
      description: getBlockAttr(tool, 'description', '') as string,
      parameters: getBlockAttr(tool, 'input_schema', {}) as Record<string, unknown>,
    },
  }))
}

export interface OpenAIResponseChunk {
  id: string
  choices: Array<{
    index: number
    delta: {
      role?: string
      content?: string
      reasoning?: string
      tool_calls?: Array<{
        id: string
        type: string
        function: {
          name: string
          arguments: string
        }
      }>
    }
    finish_reason?: string
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface ConvertedEvent {
  type: 'content' | 'thinking' | 'tool_use' | 'usage' | 'done'
  data?: Record<string, unknown>
}

export function convertFromOpenAIResponse(chunk: OpenAIResponseChunk): ConvertedEvent[] {
  const events: ConvertedEvent[] = []
  const choice = chunk.choices[0]

  if (!choice) return events

  const delta = choice.delta

  if (delta?.reasoning) {
    events.push({ type: 'thinking', data: { thinking: delta.reasoning } })
  }

  if (delta?.content) {
    events.push({ type: 'content', data: { content: delta.content } })
  }

  if (delta?.tool_calls && delta.tool_calls.length > 0) {
    for (const tc of delta.tool_calls) {
      events.push({
        type: 'tool_use',
        data: {
          id: tc.id,
          name: tc.function.name,
          input: JSON.parse(tc.function.arguments || '{}'),
        },
      })
    }
  }

  if (choice.finish_reason) {
    events.push({ type: 'done' })
  }

  if (chunk.usage) {
    events.push({
      type: 'usage',
      data: {
        inputTokens: chunk.usage.prompt_tokens,
        outputTokens: chunk.usage.completion_tokens,
      },
    })
  }

  return events
}
