import { BaseProvider, type ProviderOptions } from './base.js'
import type { ProviderConfig } from '../types.js'
import { GlobalRateLimiter } from '../rate-limiter.js'

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

export class OpenRouterProvider extends BaseProvider {
  private rateLimiter: GlobalRateLimiter

  constructor(config: ProviderConfig) {
    super(config, 'open_router')
    this.rateLimiter = GlobalRateLimiter.getInstance({
      rateLimit: config.rateLimit,
      rateWindow: config.rateWindow,
      maxConcurrency: config.maxConcurrency,
    })
  }

  static create(config: ProviderConfig): OpenRouterProvider {
    return new OpenRouterProvider(config)
  }

  async *streamResponse(
    request: ProviderOptions,
    options?: { inputTokens?: number; requestId?: string }
  ): AsyncGenerator<string, void, unknown> {
    await this.rateLimiter.acquire()

    const { convertToOpenAIMessage, convertFromOpenAIResponse, convertToolsToOpenAI } = require('../converter.js')

    let messages = convertToOpenAIMessage(request.messages, request.system, request.tools)

    const requestBody: Record<string, unknown> = {
      model: request.model,
      messages: messages,
      stream: true,
    }

    if (request.temperature !== undefined) requestBody.temperature = request.temperature
    if (request.topP !== undefined) requestBody.top_p = request.topP
    if (request.maxTokens !== undefined) requestBody.max_tokens = request.maxTokens

    const url = `${this.config.baseUrl}/chat/completions`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        'HTTP-Referer': 'https://claude-code.local',
        'X-Title': 'Claude Code',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const error = await response.text()
      yield this.buildErrorEvent('provider_error', error)
      return
    }

    if (!response.body) {
      yield this.buildErrorEvent('provider_error', 'No response body')
      return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data: ')) continue

          const data = trimmed.slice(6)
          if (data === '[DONE]') {
            yield 'data: {"type":"message_stop"}\n\n'
            return
          }

          try {
            const parsed = JSON.parse(data)
            const events = convertFromOpenAIResponse(parsed)
            for (const event of events) {
              yield this.buildSSEEvent(event)
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  private buildSSEEvent(event: { type: string; data?: Record<string, unknown> }): string {
    if (event.type === 'content') {
      return `data: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'text_delta', text: event.data?.content } })}\n\n`
    }
    if (event.type === 'thinking') {
      return `data: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'thinking_delta', thinking: event.data?.thinking } })}\n\n`
    }
    if (event.type === 'tool_use') {
      return `data: ${JSON.stringify({ type: 'content_block_delta', delta: { type: 'input_json_delta', partial_json: JSON.stringify(event.data?.input) } })}\n\n`
    }
    if (event.type === 'usage') {
      return `data: ${JSON.stringify({ type: 'message_delta', usage: event.data, delta: { stop_reason: 'end_turn', stop_sequence: '' } })}\n\n`
    }
    return ''
  }

  private buildErrorEvent(type: string, message: string): string {
    return `data: ${JSON.stringify({ type: 'error', error: { type, message } })}\n\n`
  }

  async cleanup(): Promise<void> {
    // Cleanup if needed
  }
}

export function createOpenRouterProvider(settings: { apiKey: string; baseUrl?: string; rateLimit: number; rateWindow: number; maxConcurrency: number; httpReadTimeout: number; httpWriteTimeout: number; httpConnectTimeout: number }): OpenRouterProvider {
  const config: ProviderConfig = {
    apiKey: settings.apiKey,
    baseUrl: settings.baseUrl || OPENROUTER_BASE_URL,
    rateLimit: settings.rateLimit,
    rateWindow: settings.rateWindow,
    maxConcurrency: settings.maxConcurrency,
    httpReadTimeout: settings.httpReadTimeout,
    httpWriteTimeout: settings.httpWriteTimeout,
    httpConnectTimeout: settings.httpConnectTimeout,
  }
  return new OpenRouterProvider(config)
}
