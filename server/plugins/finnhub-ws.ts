import { setRealtimePrice, setConnectionStatus } from '../utils/realtimeStore'

// Finnhub WebSocket symbols to subscribe
const WS_SYMBOLS = [
  'BINANCE:BTCUSDT',
  'BINANCE:ETHUSDT',
  'OANDA:EUR_USD',
  'OANDA:XAU_USD',
  'OANDA:XAG_USD',
]

// Map Finnhub symbols to display names
const SYMBOL_MAP: Record<string, string> = {
  'BINANCE:BTCUSDT': 'BTC/USD',
  'BINANCE:ETHUSDT': 'ETH/USD',
  'OANDA:EUR_USD': 'EUR/USD',
  'OANDA:XAU_USD': 'XAU/USD',
  'OANDA:XAG_USD': 'XAG/USD',
}

let ws: any = null
let reconnectTimeout: any = null
let pingInterval: any = null
let reconnectAttempts = 0
const MAX_RECONNECT_DELAY = 60000 // 1 minute max

function connect(apiKey: string) {
  if (!apiKey) {
    console.warn('[Finnhub WS] No API key, skipping WebSocket connection')
    return
  }

  try {
    // Dynamic import for ws package
    import('ws').then((WebSocketModule) => {
      const WebSocket = WebSocketModule.default || WebSocketModule

      if (ws) {
        try { ws.close() } catch {}
      }

      console.log('[Finnhub WS] Connecting...')
      ws = new WebSocket(`wss://ws.finnhub.io?token=${apiKey}`)

      ws.on('open', () => {
        console.log('[Finnhub WS] Connected!')
        setConnectionStatus(true)
        reconnectAttempts = 0 // Reset on successful connection

        // Subscribe to symbols
        WS_SYMBOLS.forEach(symbol => {
          ws.send(JSON.stringify({ type: 'subscribe', symbol }))
        })

        // Keep alive ping every 30 seconds
        if (pingInterval) clearInterval(pingInterval)
        pingInterval = setInterval(() => {
          if (ws?.readyState === 1) {
            ws.ping()
          }
        }, 30000)
      })

      ws.on('message', (raw: any) => {
        try {
          const msg = JSON.parse(raw.toString())
          if (msg.type === 'trade' && msg.data?.length) {
            // Process trade data - take the latest trade for each symbol
            const latest = new Map<string, any>()
            for (const trade of msg.data) {
              latest.set(trade.s, trade)
            }
            latest.forEach((trade, finnhubSymbol) => {
              const displaySymbol = SYMBOL_MAP[finnhubSymbol] || finnhubSymbol
              setRealtimePrice(displaySymbol, trade.p, trade.t, trade.v)
            })
          }
        } catch {}
      })

      ws.on('close', () => {
        setConnectionStatus(false)
        if (pingInterval) clearInterval(pingInterval)
        reconnectAttempts++
        const delay = Math.min(5000 * Math.pow(2, reconnectAttempts - 1), MAX_RECONNECT_DELAY)
        console.log(`[Finnhub WS] Disconnected, reconnecting in ${delay / 1000}s...`)
        scheduleReconnect(apiKey, delay)
      })

      ws.on('error', (err: any) => {
        console.error('[Finnhub WS] Error:', err.message)
        setConnectionStatus(false)
        // After 3 failed attempts, fall back to REST polling
        if (reconnectAttempts >= 3 && !pollingInterval) {
          console.log('[Finnhub WS] Too many failures, switching to REST polling')
          startRestPolling(apiKey)
        }
      })
    }).catch(err => {
      console.error('[Finnhub WS] Failed to import ws:', err.message)
      // Fallback: use REST polling
      startRestPolling(apiKey)
    })
  } catch (err: any) {
    console.error('[Finnhub WS] Connection failed:', err.message)
    startRestPolling(apiKey)
  }
}

function scheduleReconnect(apiKey: string, delay: number = 5000) {
  if (reconnectTimeout) clearTimeout(reconnectTimeout)
  reconnectTimeout = setTimeout(() => connect(apiKey), delay)
}

// Fallback: REST API polling every 10 seconds
let pollingInterval: any = null
const REST_SYMBOLS = [
  { finnhub: 'BINANCE:BTCUSDT', display: 'BTC/USD' },
  { finnhub: 'OANDA:EUR_USD', display: 'EUR/USD' },
]

function startRestPolling(apiKey: string) {
  console.log('[Finnhub] Falling back to REST polling...')
  if (pollingInterval) clearInterval(pollingInterval)

  const poll = async () => {
    for (const sym of REST_SYMBOLS) {
      try {
        const res = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym.finnhub)}&token=${apiKey}`,
          { signal: AbortSignal.timeout(5000) }
        )
        const data = await res.json()
        if (data.c && data.c > 0) {
          setRealtimePrice(sym.display, data.c, Date.now())
        }
      } catch {}
    }
  }

  poll()
  pollingInterval = setInterval(poll, 10000)
  setConnectionStatus(true)
}

export default defineNitroPlugin((nitro) => {
  const config = useRuntimeConfig()
  const apiKey = config.finnhubApiKey as string

  // Start WebSocket connection after a short delay to let the server boot
  setTimeout(() => connect(apiKey), 2000)

  // Cleanup on shutdown
  nitro.hooks.hook('close', () => {
    if (ws) { try { ws.close() } catch {} }
    if (reconnectTimeout) clearTimeout(reconnectTimeout)
    if (pingInterval) clearInterval(pingInterval)
    if (pollingInterval) clearInterval(pollingInterval)
  })
})
