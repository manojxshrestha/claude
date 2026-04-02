import type { ProviderConfig, ProviderType } from '../types.js'

export abstract class BaseProvider {
  protected config: ProviderConfig
  protected providerType: ProviderType

  constructor(config: ProviderConfig, providerType: ProviderType) {
    this.config = config
    this.providerType = providerType
  }

  abstract streamResponse(
    request: unknown,
    options?: {
      inputTokens?: number
      requestId?: string
    }
  ): AsyncGenerator<string, void, unknown>

  abstract cleanup(): Promise<void>

  getProviderType(): ProviderType {
    return this.providerType
  }

  getBaseUrl(): string {
    return this.config.baseUrl
  }

  getApiKey(): string {
    return this.config.apiKey
  }
}

export interface ProviderResponse {
  type: 'content' | 'delta' | 'done' | 'error'
  content?: string
  thinking?: string
  toolCalls?: Array<{
    id: string
    name: string
    input: Record<string, unknown>
  }>
  error?: {
    type: string
    message: string
  }
  usage?: {
    inputTokens: number
    outputTokens: number
  }
}

export interface ProviderOptions {
  model: string
  messages: unknown[]
  system?: string
  tools?: unknown[]
  temperature?: number
  topP?: number
  topK?: number
  maxTokens?: number
  stream?: boolean
}
