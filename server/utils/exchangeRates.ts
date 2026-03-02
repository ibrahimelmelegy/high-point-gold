import { getCached, setCache } from './cache'

const CACHE_KEY = 'exchange-rates-USD'
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

const DEFAULT_RATES: Record<string, number> = {
  USD: 1,
  SAR: 3.75,
  AED: 3.67,
  EGP: 50.5,
  EUR: 0.92,
  GBP: 0.79,
  KWD: 0.31
}

export async function getExchangeRates(): Promise<Record<string, number>> {
  const cached = getCached<Record<string, number>>(CACHE_KEY)
  if (cached) return cached

  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
    const data = await response.json()

    if (data.rates) {
      const rates: Record<string, number> = {
        USD: 1,
        SAR: data.rates.SAR || DEFAULT_RATES.SAR,
        AED: data.rates.AED || DEFAULT_RATES.AED,
        EGP: data.rates.EGP || DEFAULT_RATES.EGP,
        EUR: data.rates.EUR || DEFAULT_RATES.EUR,
        GBP: data.rates.GBP || DEFAULT_RATES.GBP,
        KWD: data.rates.KWD || DEFAULT_RATES.KWD,
      }
      setCache(CACHE_KEY, rates, CACHE_TTL)
      return rates
    }
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error)
  }

  return DEFAULT_RATES
}

export function getRate(rates: Record<string, number>, currency: string): number {
  return rates[currency] || 1
}
