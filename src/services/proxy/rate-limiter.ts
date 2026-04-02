export class GlobalRateLimiter {
  private static instance: GlobalRateLimiter | null = null
  private requests: number[] = []
  private waitQueue: Array<() => void> = []
  private rateLimit: number
  private rateWindow: number
  private maxConcurrency: number
  private currentConcurrency: number = 0
  private concurrencyQueue: Array<() => void> = []

  private constructor(options: { rateLimit: number; rateWindow: number; maxConcurrency: number }) {
    this.rateLimit = options.rateLimit
    this.rateWindow = options.rateWindow
    this.maxConcurrency = options.maxConcurrency

    setInterval(() => this.cleanupInterval(), 1000)
  }

  static getInstance(options: { rateLimit: number; rateWindow: number; maxConcurrency: number }): GlobalRateLimiter {
    if (!GlobalRateLimiter.instance) {
      GlobalRateLimiter.instance = new GlobalRateLimiter(options)
    }
    return GlobalRateLimiter.instance
  }

  private cleanupInterval(): void {
    const now = Date.now()
    const windowMs = this.rateWindow * 1000
    this.requests = this.requests.filter(time => now - time < windowMs)

    if (this.waitQueue.length > 0 && this.requests.length < this.rateLimit) {
      const next = this.waitQueue.shift()
      if (next) next()
    }
  }

  async acquire(): Promise<void> {
    if (this.currentConcurrency >= this.maxConcurrency) {
      await new Promise<void>(resolve => {
        this.concurrencyQueue.push(resolve)
      })
    }

    const now = Date.now()
    const windowMs = this.rateWindow * 1000

    if (this.requests.length >= this.rateLimit) {
      const oldestRequest = this.requests[0]
      const waitTime = oldestRequest ? windowMs - (now - oldestRequest) : 0

      if (waitTime > 0) {
        await new Promise<void>(resolve => {
          const timeout = setTimeout(resolve, waitTime)
          this.waitQueue.push(() => clearTimeout(timeout))
        })
      }

      this.cleanupInterval()
    }

    this.requests.push(now)
    this.currentConcurrency++

    if (this.concurrencyQueue.length > 0 && this.currentConcurrency < this.maxConcurrency) {
      const next = this.concurrencyQueue.shift()
      if (next) next()
    }
  }

  release(): void {
    this.currentConcurrency--
    if (this.concurrencyQueue.length > 0 && this.currentConcurrency < this.maxConcurrency) {
      const next = this.concurrencyQueue.shift()
      if (next) next()
    }
  }

  async reset(): Promise<void> {
    this.requests = []
    this.waitQueue = []
    this.concurrencyQueue = []
    this.currentConcurrency = 0
  }
}
