import { isEnvTruthy } from '../../utils/envUtils.js'
import type { ProviderType, ProxySettings, ModelConfig, NimSettings } from './types.js'

const DEFAULT_NIM_MODEL = 'nvidia_nim/z-ai/glm4.7'
const DEFAULT_OPENROUTER_MODEL = 'open_router/stepfun/step-3.5-flash:free'

function getEnv(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue
}

function getEnvBool(key: string, defaultValue: boolean = false): boolean {
  return isEnvTruthy(process.env[key]) ?? defaultValue
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key]
  if (!value) return defaultValue
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

function parseModelString(model: string | undefined): { provider: ProviderType; name: string } | null {
  if (!model || !model.includes('/')) return null
  const [provider, ...nameParts] = model.split('/')
  const providerLower = provider.toLowerCase()
  if (!['nvidia_nim', 'open_router', 'lmstudio', 'llamacpp'].includes(providerLower)) return null
  return {
    provider: providerLower as ProviderType,
    name: nameParts.join('/'),
  }
}

export function getProxySettings(): ProxySettings {
  const model = getEnv('MODEL', DEFAULT_NIM_MODEL)
  const modelOpus = getEnv('MODEL_OPUS') || null
  const modelSonnet = getEnv('MODEL_SONNET') || null
  const modelHaiku = getEnv('MODEL_HAIKU') || null

  return {
    model: {
      opus: modelOpus,
      sonnet: modelSonnet,
      haiku: modelHaiku,
      default: model,
    },
    nvidiaNimApiKey: getEnv('NVIDIA_NIM_API_KEY'),
    openRouterApiKey: getEnv('OPENROUTER_API_KEY'),
    lmStudioBaseUrl: getEnv('LM_STUDIO_BASE_URL', 'http://localhost:1234/v1'),
    llamacppBaseUrl: getEnv('LLAMACPP_BASE_URL', 'http://localhost:8080/v1'),
    nimSettings: {
      enableThinking: getEnvBool('NIM_ENABLE_THINKING', false),
      temperature: getEnvNumber('NIM_TEMPERATURE', 1.0),
      topP: getEnvNumber('NIM_TOP_P', 0.95),
      topK: getEnvNumber('NIM_TOP_K', 200),
      maxTokens: getEnvNumber('NIM_MAX_TOKENS', 4096),
    },
    providerRateLimit: getEnvNumber('PROVIDER_RATE_LIMIT', 40),
    providerRateWindow: getEnvNumber('PROVIDER_RATE_WINDOW', 60),
    providerMaxConcurrency: getEnvNumber('PROVIDER_MAX_CONCURRENCY', 5),
    httpReadTimeout: getEnvNumber('HTTP_READ_TIMEOUT', 300),
    httpWriteTimeout: getEnvNumber('HTTP_WRITE_TIMEOUT', 10),
    httpConnectTimeout: getEnvNumber('HTTP_CONNECT_TIMEOUT', 2),
    anthropicAuthToken: getEnv('ANTHROPIC_AUTH_TOKEN'),
    enableNetworkProbeMock: getEnvBool('ENABLE_NETWORK_PROBE_MOCK', true),
    enableTitleGenerationSkip: getEnvBool('ENABLE_TITLE_GENERATION_SKIP', true),
    enableSuggestionModeSkip: getEnvBool('ENABLE_SUGGESTION_MODE_SKIP', true),
    enableFilepathExtractionMock: getEnvBool('ENABLE_FILEPATH_EXTRACTION_MOCK', true),
    fastPrefixDetection: getEnvBool('FAST_PREFIX_DETECTION', true),
  }
}

export function resolveModelForClaudeModel(claudeModel: string, settings: ProxySettings): string {
  const modelLower = claudeModel.toLowerCase()
  
  if (modelLower.includes('opus') && settings.model.opus) {
    return settings.model.opus
  }
  if (modelLower.includes('sonnet') && settings.model.sonnet) {
    return settings.model.sonnet
  }
  if (modelLower.includes('haiku') && settings.model.haiku) {
    return settings.model.haiku
  }
  
  return settings.model.default
}

export function getProviderType(modelString: string): ProviderType | null {
  const parsed = parseModelString(modelString)
  return parsed?.provider || null
}

export function getModelName(modelString: string): string {
  const parsed = parseModelString(modelString)
  return parsed?.name || modelString
}

export function getApiKeyForProvider(provider: ProviderType, settings: ProxySettings): string {
  switch (provider) {
    case 'nvidia_nim':
      return settings.nvidiaNimApiKey
    case 'open_router':
      return settings.openRouterApiKey
    case 'lmstudio':
      return 'lm-studio'
    case 'llamacpp':
      return 'llamacpp'
    default:
      return ''
  }
}

export function getBaseUrlForProvider(provider: ProviderType, settings: ProxySettings): string {
  switch (provider) {
    case 'nvidia_nim':
      return 'https://integrate.api.nvidia.com/v1'
    case 'open_router':
      return 'https://openrouter.ai/api/v1'
    case 'lmstudio':
      return settings.lmStudioBaseUrl
    case 'llamacpp':
      return settings.llamacppBaseUrl
    default:
      return ''
  }
}

export function isProviderConfigured(provider: ProviderType, settings: ProxySettings): boolean {
  switch (provider) {
    case 'nvidia_nim':
      return !!settings.nvidiaNimApiKey
    case 'open_router':
      return !!settings.openRouterApiKey
    case 'lmstudio':
    case 'llamacpp':
      return true
    default:
      return false
  }
}

export function getDefaultProvider(): ProviderType {
  const model = getEnv('MODEL', DEFAULT_NIM_MODEL)
  const parsed = parseModelString(model)
  return parsed?.provider || 'nvidia_nim'
}
