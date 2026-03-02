// @ts-nocheck
import { getCached, setCache } from '../utils/cache'

const CACHE_TTL = 60 * 1000 // 60 seconds

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const currency = (query.currency as string) || 'USD'
    const metal = (query.metal as string) || 'XAU'
    const config = useRuntimeConfig()

    const cacheKey = `metal-${metal}-${currency}`
    const cached = getCached(cacheKey)
    if (cached) return cached

    // Try GoldAPI (primary source)
    const goldApiKey = config.goldApiKey || process.env.GOLD_API_KEY || process.env.NUXT_GOLD_API_KEY
    if (goldApiKey) {
        try {
            const data = await fetchFromGoldAPI(metal, currency, goldApiKey)
            if (data) {
                setCache(cacheKey, data, CACHE_TTL)
                return data
            }
        } catch (e) {
            console.error('GoldAPI failed:', e)
        }
    } else {
        console.warn('No GOLD_API_KEY configured')
    }

    // Fallback to mock data
    console.log('All APIs failed, using mock data')
    const mockData = getMockData(metal, currency)
    setCache(cacheKey, mockData, CACHE_TTL)
    return mockData
})

async function fetchFromGoldAPI(metal: string, currency: string, apiKey: string) {
    const response = await fetch(`https://www.goldapi.io/api/${metal}/${currency}`, {
        headers: {
            "x-access-token": apiKey,
            "Content-Type": "application/json"
        },
        signal: AbortSignal.timeout(5000)
    })

    if (!response.ok) return null
    const data = await response.json()
    if (!data || data.error || !data.price) return null
    return data
}

function getMockData(metalType: string, curr: string) {
    const rates: Record<string, number> = { 'USD': 1, 'SAR': 3.75, 'AED': 3.67, 'EGP': 50.5 }
    const rate = rates[curr] || 1
    const now = new Date()
    const hourSeed = now.getHours() + now.getDate() * 24
    const seededRandom = (seed: number) => {
        const x = Math.sin(seed) * 10000
        return x - Math.floor(x)
    }

    if (metalType === 'XAU') {
        const basePrice = 2685
        const variation = (seededRandom(hourSeed) - 0.5) * 30
        const price = (basePrice + variation) * rate
        const openPrice = (basePrice + (seededRandom(hourSeed + 1) - 0.5) * 20) * rate
        return {
            timestamp: Math.floor(now.getTime() / 1000),
            metal: 'XAU', currency: curr, exchange: 'MOCK', symbol: 'XAUUSD',
            prev_close_price: openPrice - (seededRandom(hourSeed + 4) * 5 * rate),
            open_price: openPrice,
            low_price: Math.min(price, openPrice) - (seededRandom(hourSeed + 2) * 8 * rate),
            high_price: Math.max(price, openPrice) + (seededRandom(hourSeed + 3) * 8 * rate),
            open_time: Math.floor(now.setHours(0, 0, 0, 0) / 1000),
            price, ch: price - openPrice, chp: ((price - openPrice) / openPrice) * 100,
            ask: price + (0.5 * rate), bid: price - (0.5 * rate),
            price_gram_24k: price / 31.1035,
            price_gram_22k: (price / 31.1035) * 0.9167,
            price_gram_21k: (price / 31.1035) * 0.875,
            price_gram_18k: (price / 31.1035) * 0.75
        }
    } else {
        const basePrice = 31.25
        const variation = (seededRandom(hourSeed) - 0.5) * 0.8
        const price = (basePrice + variation) * rate
        const openPrice = (basePrice + (seededRandom(hourSeed + 1) - 0.5) * 0.5) * rate
        return {
            timestamp: Math.floor(now.getTime() / 1000),
            metal: 'XAG', currency: curr, exchange: 'MOCK', symbol: 'XAGUSD',
            prev_close_price: openPrice - (seededRandom(hourSeed + 4) * 0.1 * rate),
            open_price: openPrice,
            low_price: Math.min(price, openPrice) - (seededRandom(hourSeed + 2) * 0.2 * rate),
            high_price: Math.max(price, openPrice) + (seededRandom(hourSeed + 3) * 0.2 * rate),
            open_time: Math.floor(now.setHours(0, 0, 0, 0) / 1000),
            price, ch: price - openPrice, chp: ((price - openPrice) / openPrice) * 100,
            ask: price + (0.02 * rate), bid: price - (0.02 * rate),
            price_gram: price / 31.1035
        }
    }
}
