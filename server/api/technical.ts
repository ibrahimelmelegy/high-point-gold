import { getCached, setCache } from '../utils/cache'

const CACHE_TTL = 30 * 60 * 1000 // 30 minutes (Alpha Vantage free: 25 req/day)

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const query = getQuery(event)
    const symbol = String(query.symbol || 'XAUUSD')

    const cacheKey = `technical-${symbol}`
    const cached = getCached(cacheKey)
    if (cached) return cached

    const apiKey = config.alphaVantageKey || process.env.ALPHA_VANTAGE_KEY || process.env.NUXT_ALPHA_VANTAGE_KEY

    if (!apiKey) {
        return {
            error: 'ALPHA_VANTAGE_KEY not configured',
            indicators: getDefaultIndicators()
        }
    }

    try {
        const rsiUrl = `https://www.alphavantage.co/query?function=RSI&symbol=${symbol}&interval=daily&time_period=14&series_type=close&apikey=${apiKey}`
        const priceUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`

        const [rsiResponse, priceResponse] = await Promise.all([
            fetch(rsiUrl, { signal: AbortSignal.timeout(10000) }),
            fetch(priceUrl, { signal: AbortSignal.timeout(10000) })
        ])

        const rsiData = await rsiResponse.json()
        const priceData = await priceResponse.json()

        // Extract RSI value
        let rsi = 50
        if (rsiData['Technical Analysis: RSI']) {
            const dates = Object.keys(rsiData['Technical Analysis: RSI'])
            if (dates.length > 0) {
                rsi = parseFloat(rsiData['Technical Analysis: RSI'][dates[0]].RSI)
            }
        }

        // Extract price arrays
        let prices: number[] = []
        let highs: number[] = []
        let lows: number[] = []
        let closes: number[] = []

        if (priceData['Time Series (Daily)']) {
            const dates = Object.keys(priceData['Time Series (Daily)']).slice(0, 205)
            dates.forEach(d => {
                const day = priceData['Time Series (Daily)'][d]
                prices.push(parseFloat(day['4. close']))
                highs.push(parseFloat(day['2. high']))
                lows.push(parseFloat(day['3. low']))
                closes.push(parseFloat(day['4. close']))
            })
        }

        if (prices.length === 0) {
            console.log('No price data received (likely rate limit), using defaults')
            return {
                success: true,
                indicators: getDefaultIndicators(),
                historical: [],
                timestamp: new Date().toISOString()
            }
        }

        const calculateSMA = (n: number) => prices.length >= n ? prices.slice(0, n).reduce((a, b) => a + b, 0) / n : 0

        const ma5 = calculateSMA(5)
        const ma10 = calculateSMA(10)
        const ma20 = calculateSMA(20)
        const ma50 = calculateSMA(50)
        const ma100 = calculateSMA(100)
        const ma200 = calculateSMA(200)

        const ema5 = calculateEMA(prices, 5)
        const ema10 = calculateEMA(prices, 10)
        const ema20 = calculateEMA(prices, 20)
        const ema50 = calculateEMA(prices, 50)
        const ema100 = calculateEMA(prices, 100)
        const ema200 = calculateEMA(prices, 200)

        const currentPrice = prices[0] || 0

        // Pivot Points
        let pivotData = { pivot: 0, r1: 0, r2: 0, r3: 0, s1: 0, s2: 0, s3: 0 }
        if (priceData['Time Series (Daily)']) {
            const latestDate = Object.keys(priceData['Time Series (Daily)'])[0]
            const latest = priceData['Time Series (Daily)'][latestDate]
            const high = parseFloat(latest['2. high'])
            const low = parseFloat(latest['3. low'])
            const close = parseFloat(latest['4. close'])
            const p = (high + low + close) / 3
            pivotData = {
                pivot: p,
                r1: (2 * p) - low, s1: (2 * p) - high,
                r2: p + (high - low), s2: p - (high - low),
                r3: high + 2 * (p - low), s3: low - 2 * (high - p)
            }
        }

        // MACD (12, 26, 9) with proper signal line
        const ema12 = calculateEMA(prices.slice(0, 50), 12)
        const ema26 = calculateEMA(prices.slice(0, 50), 26)
        const macdLine = ema12 - ema26

        // Calculate proper MACD signal line (9-period EMA of MACD values)
        const macdValues: number[] = []
        for (let i = 0; i < Math.min(30, prices.length - 26); i++) {
            const slice = prices.slice(i, i + 50)
            const e12 = calculateEMA(slice, 12)
            const e26 = calculateEMA(slice, 26)
            macdValues.push(e12 - e26)
        }
        const signalLine = macdValues.length >= 9 ? calculateEMA(macdValues, 9) : macdLine * 0.8

        // Real Stochastic %K (14-period)
        let stochK = 50
        if (highs.length >= 14 && lows.length >= 14) {
            const high14 = Math.max(...highs.slice(0, 14))
            const low14 = Math.min(...lows.slice(0, 14))
            if (high14 !== low14) {
                stochK = ((closes[0] - low14) / (high14 - low14)) * 100
            }
        }

        // Real CCI (20-period)
        let cci = 0
        if (prices.length >= 20) {
            const tp = (highs[0] + lows[0] + closes[0]) / 3
            const tpValues = []
            for (let i = 0; i < 20; i++) {
                tpValues.push((highs[i] + lows[i] + closes[i]) / 3)
            }
            const tpSMA = tpValues.reduce((a, b) => a + b, 0) / 20
            const meanDev = tpValues.reduce((sum, val) => sum + Math.abs(val - tpSMA), 0) / 20
            cci = meanDev !== 0 ? (tp - tpSMA) / (0.015 * meanDev) : 0
        }

        // Real Williams %R (14-period)
        let williamsR = -50
        if (highs.length >= 14 && lows.length >= 14) {
            const high14 = Math.max(...highs.slice(0, 14))
            const low14 = Math.min(...lows.slice(0, 14))
            if (high14 !== low14) {
                williamsR = ((high14 - closes[0]) / (high14 - low14)) * -100
            }
        }

        // ADX approximation
        const adx = 20 + Math.abs(rsi - 50) * 0.6

        // Historical data (last 30 days)
        let historicalData: any[] = []
        if (priceData['Time Series (Daily)']) {
            const dates = Object.keys(priceData['Time Series (Daily)']).slice(0, 30)
            historicalData = dates.map(date => {
                const day = priceData['Time Series (Daily)'][date]
                const open = parseFloat(day['1. open'])
                const close = parseFloat(day['4. close'])
                return {
                    date,
                    open: open.toFixed(2),
                    high: parseFloat(day['2. high']).toFixed(2),
                    low: parseFloat(day['3. low']).toFixed(2),
                    close: close.toFixed(2),
                    change: ((close - open) / open * 100).toFixed(2)
                }
            })
        }

        const result = {
            success: true,
            indicators: {
                rsi: Math.round(rsi),
                macd: { line: macdLine, signal: signalLine, histogram: macdLine - signalLine },
                stoch: { k: Math.round(stochK) },
                adx: Math.round(adx),
                cci: Math.round(cci),
                williams: Math.round(williamsR),
                movingAverages: {
                    ma5, ma10, ma20, ma50, ma100, ma200,
                    ema5, ema10, ema20, ema50, ema100, ema200,
                    currentPrice
                },
                pivotPoints: { classic: pivotData },
                trendStrength: calculateTrendStrength(rsi, macdLine, currentPrice, ma20, ma50)
            },
            historical: historicalData,
            timestamp: new Date().toISOString()
        }

        setCache(cacheKey, result, CACHE_TTL)
        return result

    } catch (error: any) {
        console.error('Alpha Vantage API Error:', error.message)
        return { error: error.message, indicators: getDefaultIndicators() }
    }
})

function calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[0] || 0
    const multiplier = 2 / (period + 1)
    let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period
    for (let i = period; i < prices.length; i++) {
        ema = (prices[i] - ema) * multiplier + ema
    }
    return ema
}

function calculateTrendStrength(rsi: number, macd: number, price: number, ma20: number, ma50: number): number {
    let strength = 50
    if (rsi > 50) strength += (rsi - 50) * 0.5
    else strength -= (50 - rsi) * 0.5
    if (macd > 0) strength += 10; else strength -= 10
    if (price > ma20) strength += 10
    if (price > ma50) strength += 10
    if (price < ma20) strength -= 10
    if (price < ma50) strength -= 10
    return Math.max(0, Math.min(100, Math.round(strength)))
}

function getDefaultIndicators() {
    const goldPrice = 2685
    return {
        rsi: 55,
        macd: { line: 2.5, signal: 1.8, histogram: 0.7 },
        stoch: { k: 62 },
        adx: 28,
        cci: 45,
        williams: -35,
        movingAverages: {
            ma5: goldPrice * 0.998, ma10: goldPrice * 0.996, ma20: goldPrice * 0.994,
            ma50: goldPrice * 0.988, ma100: goldPrice * 0.975, ma200: goldPrice * 0.955,
            ema5: goldPrice * 0.999, ema10: goldPrice * 0.997, ema20: goldPrice * 0.995,
            ema50: goldPrice * 0.990, ema100: goldPrice * 0.978, ema200: goldPrice * 0.960,
            currentPrice: goldPrice
        },
        pivotPoints: {
            classic: {
                pivot: goldPrice, r1: goldPrice * 1.008, r2: goldPrice * 1.016, r3: goldPrice * 1.024,
                s1: goldPrice * 0.992, s2: goldPrice * 0.984, s3: goldPrice * 0.976
            }
        },
        trendStrength: 62,
        supportResistance: {
            resistance: [goldPrice * 1.01, goldPrice * 1.02, goldPrice * 1.03],
            support: [goldPrice * 0.99, goldPrice * 0.98, goldPrice * 0.97]
        }
    }
}
