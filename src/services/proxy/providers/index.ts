import type { ProviderType, ProxySettings } from '../types.js'
import { BaseProvider } from './base.js'
import { NvidiaNimProvider } from './nvidia-nim.js'
import { OpenRouterProvider } from './open-router.js'
import { LMStudioProvider } from './lm-studio.js'
import { LlamaCppProvider } from './llamacpp.js'
import { getApiKeyForProvider, getBaseUrlForProvider, isProviderConfigured } from '../settings.js'

const providers: Map<ProviderType, BaseProvider> = new Map()

export function getProvider(providerType: ProviderType, settings: ProxySettings): BaseProvider {
  if (providers.has(providerType)) {
    return providers.get(providerType)!
  }

  if (!isProviderConfigured(providerType, settings)) {
    throw new Error(`Provider ${providerType} is not configured. Set the required API key.`)
  }

  const apiKey = getApiKeyForProvider(providerType, settings)
  const baseUrl = getBaseUrlForProvider(providerType, settings)

  let provider: BaseProvider

  switch (providerType) {
    case 'nvidia_nim':
      provider = new NvidiaNimProvider({
        apiKey,
        baseUrl,
        rateLimit: settings.providerRateLimit,
        rateWindow: settings.providerRateWindow,
        maxConcurrency: settings.providerMaxConcurrency,
        httpReadTimeout: settings.httpReadTimeout,
        httpWriteTimeout: settings.httpWriteTimeout,
        httpConnectTimeout: settings.httpConnectTimeout,
      })
      break
    case 'open_router':
      provider = new OpenRouterProvider({
        apiKey,
        baseUrl,
        rateLimit: settings.providerRateLimit,
        rateWindow: settings.providerRateWindow,
        maxConcurrency: settings.providerMaxConcurrency,
        httpReadTimeout: settings.httpReadTimeout,
        httpWriteTimeout: settings.httpWriteTimeout,
        httpConnectTimeout: settings.httpConnectTimeout,
      })
      break
    case 'lmstudio':
      provider = new LMStudioProvider({
        apiKey,
        baseUrl,
        rateLimit: settings.providerRateLimit,
        rateWindow: settings.providerRateWindow,
        maxConcurrency: settings.providerMaxConcurrency,
        httpReadTimeout: settings.httpReadTimeout,
        httpWriteTimeout: settings.httpWriteTimeout,
        httpConnectTimeout: settings.httpConnectTimeout,
      })
      break
    case 'llamacpp':
      provider = new LlamaCppProvider({
        apiKey,
        baseUrl,
        rateLimit: settings.providerRateLimit,
        rateWindow: settings.providerRateWindow,
        maxConcurrency: settings.providerMaxConcurrency,
        httpReadTimeout: settings.httpReadTimeout,
        httpWriteTimeout: settings.httpWriteTimeout,
        httpConnectTimeout: settings.httpConnectTimeout,
      })
      break
    default:
      throw new Error(`Unknown provider type: ${providerType}`)
  }

  providers.set(providerType, provider)
  return provider
}

export async function cleanupAllProviders(): Promise<void> {
  for (const provider of providers.values()) {
    await provider.cleanup()
  }
  providers.clear()
}

export function isProviderAvailable(providerType: ProviderType, settings: ProxySettings): boolean {
  return isProviderConfigured(providerType, settings)
}
