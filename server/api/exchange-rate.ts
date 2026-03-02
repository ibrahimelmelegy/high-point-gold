import { getCached, setCache } from '../utils/cache'

const CACHE_TTL = 60 * 60 * 1000 // 1 hour

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const from = String(query.from || 'USD')
    const to = String(query.to || 'SAR')
    const amount = Number(query.amount) || 1

    const cacheKey = `exchange-rate-${from}`
    const cached = getCached<any>(cacheKey)

    if (cached) {
        const rate = cached.rates[to] || 1
        return {
            success: true,
            from, to, amount, rate,
            result: Number((amount * rate).toFixed(4)),
            rates: cached.rates,
            timestamp: new Date().toISOString()
        }
    }

    try {
        const response = await fetch(
            `https://api.exchangerate-api.com/v4/latest/${from}`,
            { signal: AbortSignal.timeout(5000) }
        )
        const data = await response.json()

        if (data.rates && data.rates[to]) {
            const rates = {
                USD: data.rates.USD || 1,
                SAR: data.rates.SAR || 3.75,
                AED: data.rates.AED || 3.67,
                EGP: data.rates.EGP || 50.5,
                EUR: data.rates.EUR || 0.92,
                GBP: data.rates.GBP || 0.79,
                KWD: data.rates.KWD || 0.31
            }

            setCache(cacheKey, { rates }, CACHE_TTL)

            const rate = data.rates[to]
            return {
                success: true,
                from, to, amount, rate,
                result: Number((amount * rate).toFixed(4)),
                rates,
                timestamp: new Date().toISOString()
            }
        }

        return { error: 'Currency not found', ...getDefaultRates(from, to, amount) }
    } catch (error: any) {
        console.error('Exchange Rate API Error:', error.message)
        return { error: error.message, ...getDefaultRates(from, to, amount) }
    }
})

function getDefaultRates(from: string, to: string, amount: number) {
    const defaultRates: Record<string, number> = {
        USD: 1, SAR: 3.75, AED: 3.67, EGP: 50.5,
        EUR: 0.92, GBP: 0.79, KWD: 0.31
    }
    const fromRate = defaultRates[from] || 1
    const toRate = defaultRates[to] || 1
    const rate = toRate / fromRate
    return {
        from, to, amount, rate,
        result: Number((amount * rate).toFixed(4)),
        rates: defaultRates
    }
}
