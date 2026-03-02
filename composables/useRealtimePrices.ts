// Real-time price streaming composable using SSE (Server-Sent Events)
interface RealtimePrice {
  symbol: string
  price: number
  previousPrice?: number
  timestamp: number
}

export function useRealtimePrices() {
  const prices = ref<Record<string, RealtimePrice>>({})
  const connected = ref(false)
  const lastUpdate = ref(0)

  let eventSource: EventSource | null = null
  let reconnectTimeout: any = null
  let fallbackInterval: any = null
  let retryCount = 0
  const MAX_RETRIES = 3

  function connect() {
    if (import.meta.server) return
    if (retryCount >= MAX_RETRIES) return

    try {
      eventSource = new EventSource('/api/realtime?stream=true')

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.type === 'init') {
            Object.entries(data.prices || {}).forEach(([symbol, info]: [string, any]) => {
              prices.value[symbol] = { ...info, previousPrice: info.price }
            })
            connected.value = data.status?.connected || false
            lastUpdate.value = Date.now()
            retryCount = 0
          } else if (data.type === 'update') {
            const existing = prices.value[data.symbol]
            prices.value[data.symbol] = {
              symbol: data.symbol,
              price: data.price,
              previousPrice: existing?.price || data.previousPrice,
              timestamp: data.timestamp
            }
            lastUpdate.value = Date.now()
            connected.value = true
            retryCount = 0
          }
        } catch {}
      }

      eventSource.onerror = () => {
        connected.value = false
        eventSource?.close()
        eventSource = null
        retryCount++
        if (retryCount < MAX_RETRIES) {
          reconnectTimeout = setTimeout(connect, 10000)
        }
      }

      eventSource.onopen = () => {
        connected.value = true
      }
    } catch {
      // SSE not supported or failed
    }
  }

  function disconnect() {
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
    if (reconnectTimeout) clearTimeout(reconnectTimeout)
    if (fallbackInterval) clearInterval(fallbackInterval)
    connected.value = false
  }

  function getPrice(symbol: string): number | null {
    return prices.value[symbol]?.price ?? null
  }

  function getPriceDirection(symbol: string): 'up' | 'down' | 'neutral' {
    const item = prices.value[symbol]
    if (!item || !item.previousPrice) return 'neutral'
    if (item.price > item.previousPrice) return 'up'
    if (item.price < item.previousPrice) return 'down'
    return 'neutral'
  }

  onMounted(() => connect())
  onUnmounted(() => disconnect())

  return {
    prices: readonly(prices),
    connected: readonly(connected),
    lastUpdate: readonly(lastUpdate),
    getPrice,
    getPriceDirection,
    disconnect
  }
}
