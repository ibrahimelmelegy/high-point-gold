import { getCached, setCache } from '../utils/cache'

const CACHE_TTL = 2 * 60 * 1000 // 2 minutes

const SYMBOLS = [
    { display: 'XAU/USD', finnhub: 'OANDA:XAU_USD', fallbackPrice: 2685, fallbackChange: 0.45 },
    { display: 'XAG/USD', finnhub: 'OANDA:XAG_USD', fallbackPrice: 31.25, fallbackChange: 0.32 },
    { display: 'BTC/USD', finnhub: 'BINANCE:BTCUSDT', fallbackPrice: 95420, fallbackChange: -1.2 },
    { display: 'EUR/USD', finnhub: 'OANDA:EUR_USD', fallbackPrice: 1.0842, fallbackChange: 0.15 },
    { display: 'Oil WTI', finnhub: 'TVC:USOIL', fallbackPrice: 78.45, fallbackChange: -0.38 },
    { display: 'S&P 500', finnhub: 'FOREXCOM:SPXUSD', fallbackPrice: 5985, fallbackChange: 0.22 },
    { display: 'NASDAQ', finnhub: 'FOREXCOM:NSXUSD', fallbackPrice: 18950, fallbackChange: 0.18 },
    { display: 'DXY', finnhub: 'TVC:DXY', fallbackPrice: 104.25, fallbackChange: -0.12 }
]

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()

    const cacheKey = 'market-ticker'
    const cached = getCached(cacheKey)
    if (cached) return cached

    const apiKey = config.finnhubApiKey

    if (!apiKey) {
        return getFallbackData()
    }

    try {
        const quotePromises = SYMBOLS.map(async (sym) => {
            try {
                const response = await fetch(
                    `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym.finnhub)}&token=${apiKey}`,
                    { signal: AbortSignal.timeout(5000) }
                )
                const data = await response.json()

                if (data.c && data.c > 0) {
                    return {
                        symbol: sym.display,
                        price: data.c,
                        change: data.dp || 0,
                        high: data.h || data.c,
                        low: data.l || data.c,
                        open: data.o || data.c
                    }
                }
            } catch (e) {
                // Individual symbol failed
            }

            return {
                symbol: sym.display,
                price: sym.fallbackPrice,
                change: sym.fallbackChange,
                high: sym.fallbackPrice * 1.005,
                low: sym.fallbackPrice * 0.995,
                open: sym.fallbackPrice * (1 - sym.fallbackChange / 100)
            }
        })

        const items = await Promise.all(quotePromises)

        const result = {
            success: true,
            items,
            timestamp: new Date().toISOString()
        }

        setCache(cacheKey, result, CACHE_TTL)
        return result

    } catch (error: any) {
        console.error('Market Ticker Error:', error.message)
        return getFallbackData()
    }
})

function getFallbackData() {
    return {
        success: false,
        items: SYMBOLS.map(sym => ({
            symbol: sym.display,
            price: sym.fallbackPrice,
            change: sym.fallbackChange,
            high: sym.fallbackPrice * 1.005,
            low: sym.fallbackPrice * 0.995,
            open: sym.fallbackPrice * (1 - sym.fallbackChange / 100)
        })),
        timestamp: new Date().toISOString()
    }
}
