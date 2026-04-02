import type { ProxySettings, ProviderType, AnthropicRequest } from './types.js'
import { getProxySettings, resolveModelForClaudeModel, getProviderType } from './settings.js'
import { getProvider, cleanupAllProviders, isProviderAvailable } from './providers/index.js'
import { isEnvTruthy } from '../../utils/envUtils.js'

let proxySettings: ProxySettings | null = null

export function initProxySettings(): ProxySettings {
  if (!proxySettings) {
    proxySettings = getProxySettings()
  }
  return proxySettings
}

export function getFreeProviderSettings(): ProxySettings | null {
  if (!isEnvTruthy(process.env.USE_FREE_PROVIDER)) {
    return null
  }
  return initProxySettings()
}

export function isFreeProviderEnabled(): boolean {
  return isEnvTruthy(process.env.USE_FREE_PROVIDER)
}

export function resolveToFreeProviderModel(claudeModel: string): string | null {
  const settings = getFreeProviderSettings()
  if (!settings) return null
  return resolveModelForClaudeModel(claudeModel, settings)
}

export function getFreeProviderType(modelString: string): ProviderType | null {
  const settings = getFreeProviderSettings()
  if (!settings) return null
  
  const resolvedModel = resolveModelForClaudeModel(modelString, settings)
  return getProviderType(resolvedModel)
}

export function getFreeProviderBaseUrl(): string | null {
  const settings = getFreeProviderSettings()
  if (!settings) return null
  
  const model = settings.model.default
  const providerType = getProviderType(model)
  
  if (!providerType) return null
  
  switch (providerType) {
    case 'nvidia_nim':
      return 'https://integrate.api.nvidia.com/v1'
    case 'open_router':
      return 'https://openrouter.ai/api/v1'
    case 'lmstudio':
      return settings.lmStudioBaseUrl
    case 'llamacpp':
      return settings.llamacppBaseUrl
    default:
      return null
  }
}

export function getFreeProviderApiKey(): string | null {
  const settings = getFreeProviderSettings()
  if (!settings) return null
  
  const model = settings.model.default
  const providerType = getProviderType(model)
  
  if (!providerType) return null
  
  switch (providerType) {
    case 'nvidia_nim':
      return settings.nvidiaNimApiKey
    case 'open_router':
      return settings.openRouterApiKey
    case 'lmstudio':
      return 'lm-studio'
    case 'llamacpp':
      return 'llamacpp'
    default:
      return null
  }
}

export async function streamFreeProviderResponse(
  request: AnthropicRequest,
  options?: {
    inputTokens?: number
    requestId?: string
  }
): Promise<ReadableStream<Uint8Array>> {
  const settings = initProxySettings()
  const resolvedModel = resolveModelForClaudeModel(request.model, settings)
  const providerType = getProviderType(resolvedModel)

  if (!providerType) {
    throw new Error(`Unable to resolve provider for model: ${request.model}`)
  }

  const provider = getProvider(providerType, settings)

  const stream = provider.streamResponse(
    {
      model: resolvedModel,
      messages: request.messages,
      system: request.system,
      tools: request.tools,
      temperature: request.temperature,
      topP: request.top_p,
      maxTokens: request.max_tokens,
      stream: true,
    },
    options
  )

  const encoder = new TextEncoder()
  let controller: ReadableStreamDefaultController<Uint8Array> | null = null

  const readable = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c
    },
    async pull() {
      try {
        for await (const event of stream) {
          controller?.enqueue(encoder.encode(event))
        }
        controller?.close()
      } catch (error) {
        controller?.error(error)
      }
    },
    cancel() {
      // Cleanup on cancel
    },
  })

  return readable
}

export function getAvailableFreeProviders(): ProviderType[] {
  const settings = initProxySettings()
  const providers: ProviderType[] = []
  
  if (isProviderAvailable('nvidia_nim', settings)) providers.push('nvidia_nim')
  if (isProviderAvailable('open_router', settings)) providers.push('open_router')
  if (isProviderAvailable('lmstudio', settings)) providers.push('lmstudio')
  if (isProviderAvailable('llamacpp', settings)) providers.push('llamacpp')
  
  return providers
}

export async function shutdownProxy(): Promise<void> {
  await cleanupAllProviders()
}
