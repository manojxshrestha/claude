export type ProviderType = 'nvidia_nim' | 'open_router' | 'lmstudio' | 'llamacpp'

export interface ProviderConfig {
  apiKey: string
  baseUrl: string
  rateLimit: number
  rateWindow: number
  maxConcurrency: number
  httpReadTimeout: number
  httpWriteTimeout: number
  httpConnectTimeout: number
}

export interface ModelConfig {
  opus: string | null
  sonnet: string | null
  haiku: string | null
  default: string
}

export interface NimSettings {
  enableThinking: boolean
  temperature: number
  topP: number
  topK: number
  maxTokens: number
}

export interface ProxySettings {
  model: ModelConfig
  nvidiaNimApiKey: string
  openRouterApiKey: string
  lmStudioBaseUrl: string
  llamacppBaseUrl: string
  nimSettings: NimSettings
  providerRateLimit: number
  providerRateWindow: number
  providerMaxConcurrency: number
  httpReadTimeout: number
  httpWriteTimeout: number
  httpConnectTimeout: number
  anthropicAuthToken: string
  enableNetworkProbeMock: boolean
  enableTitleGenerationSkip: boolean
  enableSuggestionModeSkip: boolean
  enableFilepathExtractionMock: boolean
  fastPrefixDetection: boolean
}

export interface AnthropicMessage {
  role: 'user' | 'assistant'
  content: string | ContentBlock[]
}

export interface ContentBlock {
  type: 'text' | 'tool_use' | 'thinking'
  text?: string
  thinking?: string
  id?: string
  name?: string
  input?: Record<string, unknown>
}

export interface AnthropicTool {
  name: string
  description: string
  input_schema: Record<string, unknown>
}

export interface AnthropicRequest {
  model: string
  messages: AnthropicMessage[]
  system?: string
  tools?: AnthropicTool[]
  max_tokens?: number
  temperature?: number
  top_p?: number
  top_k?: number
  stream?: boolean
}

export interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string | OpenAIContentPart[]
  tool_calls?: OpenAIToolCall[]
  reasoning?: string
}

export interface OpenAIContentPart {
  type: 'text'
  text: string
}

export interface OpenAIToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

export interface OpenAIRequest {
  model: string
  messages: OpenAIMessage[]
  temperature?: number
  top_p?: number
  max_tokens?: number
  stream?: boolean
  tools?: OpenAITool[]
}

export interface OpenAITool {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}

export interface SSEEvent {
  type: string
  data?: string
  error?: {
    type: string
    message: string
  }
}

export type ResolveResult = {
  model: string
  provider: ProviderType
  modelName: string
}
