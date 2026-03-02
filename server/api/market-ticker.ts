import { getCached, setCache } from '../utils/cache'

const CACHE_TTL = 2 * 60 * 1000 // 2 minutes

const SYMBOLS = [
    { display: 'XAU/USD', yahoo: 'GC=F', fallbackPrice: 5400, fallbackChange: 0.45 },
    { display: 'XAG/USD', yahoo: 'SI=F', fallbackPrice: 95, fallbackChange: 0.32 },
    { display: 'BTC/USD', yahoo: 'BTC-USD', fallbackPrice: 95420, fallbackChange: -1.2 },
    { display: 'EUR/USD', yahoo: 'EURUSD=X', fallbackPrice: 1.0842, fallbackChange: 0.15 },
    { display: 'Oil WTI', yahoo: 'CL=F', fallbackPrice: 78.45, fallbackChange: -0.38 },
    { display: 'S&P 500', yahoo: '^GSPC', fallbackPrice: 5985, fallbackChange: 0.22 },
    { display: 'NASDAQ', yahoo: '^IXIC', fallbackPrice: 18950, fallbackChange: 0.18 },
    { display: 'DXY', yahoo: 'DX-Y.NYB', fallbackPrice: 104.25, fallbackChange: -0.12 }
]

export default defineEventHandler(async (event) => {
    const cacheKey = 'market-ticker'
    const cached = getCached(cacheKey)
    if (cached) return cached

    try {
        // Fetch all symbols from Yahoo Finance in parallel
        const quotePromises = SYMBOLS.map(async (sym) => {
            try {
                const response = await fetch(
                    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym.yahoo)}?interval=1d&range=1d`,
                    {
                        headers: { 'User-Agent': 'Mozilla/5.0' },
                        signal: AbortSignal.timeout(8000)
                    }
                )

                if (!response.ok) return getFallbackItem(sym)

                const json = await response.json()
                const meta = json?.chart?.result?.[0]?.meta

                if (meta?.regularMarketPrice && meta.regularMarketPrice > 0) {
                    const price = meta.regularMarketPrice
                    const prevClose = meta.chartPreviousClose || meta.previousClose || price
                    const change = prevClose ? ((price - prevClose) / prevClose) * 100 : 0
                    return {
                        symbol: sym.display,
                        price,
                        change: Math.round(change * 100) / 100,
                        high: meta.regularMarketDayHigh || price,
                        low: meta.regularMarketDayLow || price,
                        open: price,
                        source: 'live'
                    }
                }
            } catch {}

            return getFallbackItem(sym)
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

function getFallbackItem(sym: typeof SYMBOLS[0]) {
    return {
        symbol: sym.display,
        price: sym.fallbackPrice,
        change: sym.fallbackChange,
        high: sym.fallbackPrice * 1.005,
        low: sym.fallbackPrice * 0.995,
        open: sym.fallbackPrice * (1 - sym.fallbackChange / 100),
        source: 'fallback'
    }
}

function getFallbackData() {
    return {
        success: false,
        items: SYMBOLS.map(sym => getFallbackItem(sym)),
        timestamp: new Date().toISOString()
    }
}
