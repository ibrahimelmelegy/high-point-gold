// Global in-memory store for real-time prices from Finnhub WebSocket
interface RealtimePrice {
  symbol: string
  price: number
  timestamp: number
  volume?: number
}

interface RealtimeState {
  prices: Map<string, RealtimePrice>
  connected: boolean
  lastUpdate: number
  subscribers: Set<(data: any) => void>
}

// Global singleton - persists across requests
const state: RealtimeState = {
  prices: new Map(),
  connected: false,
  lastUpdate: 0,
  subscribers: new Set()
}

export function getRealtimePrice(symbol: string): RealtimePrice | null {
  return state.prices.get(symbol) || null
}

export function getAllRealtimePrices(): Record<string, RealtimePrice> {
  const result: Record<string, RealtimePrice> = {}
  state.prices.forEach((v, k) => { result[k] = v })
  return result
}

export function setRealtimePrice(symbol: string, price: number, timestamp: number, volume?: number) {
  const prev = state.prices.get(symbol)
  state.prices.set(symbol, { symbol, price, timestamp, volume })
  state.lastUpdate = Date.now()

  // Notify subscribers
  if (prev?.price !== price) {
    const update = { symbol, price, previousPrice: prev?.price, timestamp, volume }
    state.subscribers.forEach(fn => {
      try { fn(update) } catch {}
    })
  }
}

export function subscribe(fn: (data: any) => void): () => void {
  state.subscribers.add(fn)
  return () => state.subscribers.delete(fn)
}

export function setConnectionStatus(connected: boolean) {
  state.connected = connected
}

export function getConnectionStatus() {
  return { connected: state.connected, lastUpdate: state.lastUpdate, symbolCount: state.prices.size }
}
