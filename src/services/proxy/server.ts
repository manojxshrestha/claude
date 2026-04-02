import { getProxySettings, resolveModelForClaudeModel, getProviderType } from './settings.js'
import { getProvider, cleanupAllProviders, isProviderAvailable } from './providers/index.js'
import type { AnthropicRequest } from './types.js'

export interface ProxyServer {
  start(port: number): Promise<void>
  stop(): Promise<void>
}

export async function handleProxyRequest(
  request: AnthropicRequest,
  options?: {
    inputTokens?: number
    requestId?: string
  }
): Promise<ReadableStream<Uint8Array>> {
  const settings = getProxySettings()
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

export function getProxyServerInfo(): {
  settings: ReturnType<typeof getProxySettings>
  availableProviders: string[]
} {
  const settings = getProxySettings()
  const providerTypes: Array<'nvidia_nim' | 'open_router' | 'lmstudio' | 'llamacpp'> = [
    'nvidia_nim',
    'open_router',
    'lmstudio',
    'llamacpp',
  ]

  const available = providerTypes
    .filter(pt => isProviderAvailable(pt, settings))
    .map(pt => pt)

  return {
    settings,
    availableProviders: available,
  }
}

export async function shutdownProxyServer(): Promise<void> {
  await cleanupAllProviders()
}
