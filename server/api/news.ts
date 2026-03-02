import { getCached, setCache } from '../utils/cache'

const CACHE_TTL = 15 * 60 * 1000 // 15 minutes

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const query = getQuery(event)
    const lang = String(query.lang || 'en')

    const cacheKey = `news-${lang}`
    const cached = getCached(cacheKey)
    if (cached) return cached

    const apiKey = config.gnewsApiKey

    if (!apiKey) {
        return {
            error: 'GNEWS_API_KEY not configured',
            articles: getDefaultNews(lang)
        }
    }

    try {
        const searchQuery = 'gold price OR gold market OR precious metals'
        const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(searchQuery)}&lang=${lang === 'ar' ? 'ar' : 'en'}&country=any&max=10&apikey=${apiKey}`

        const response = await fetch(url, { signal: AbortSignal.timeout(8000) })
        const data = await response.json()

        if (data.articles && data.articles.length > 0) {
            const result = {
                success: true,
                articles: data.articles.map((article: any) => ({
                    title: article.title,
                    description: article.description,
                    source: article.source.name,
                    url: article.url,
                    image: article.image,
                    publishedAt: article.publishedAt,
                    sentiment: analyzeSentiment(article.title)
                })),
                timestamp: new Date().toISOString()
            }
            setCache(cacheKey, result, CACHE_TTL)
            return result
        }

        const fallback = {
            success: true,
            articles: getDefaultNews(lang),
            timestamp: new Date().toISOString()
        }
        setCache(cacheKey, fallback, CACHE_TTL)
        return fallback

    } catch (error: any) {
        console.error('GNews API Error:', error.message)
        return {
            error: error.message,
            articles: getDefaultNews(lang)
        }
    }
})

function analyzeSentiment(title: string): 'positive' | 'negative' | 'neutral' {
    const positive = ['rise', 'surge', 'gain', 'high', 'up', 'bullish', 'record', 'rally', 'soar', 'ارتفاع', 'صعود', 'قياسي']
    const negative = ['fall', 'drop', 'decline', 'low', 'down', 'bearish', 'loss', 'crash', 'plunge', 'انخفاض', 'هبوط', 'تراجع']

    const lowerTitle = title.toLowerCase()

    if (positive.some(word => lowerTitle.includes(word))) return 'positive'
    if (negative.some(word => lowerTitle.includes(word))) return 'negative'
    return 'neutral'
}

function getDefaultNews(lang: string) {
    if (lang === 'ar') {
        return [
            { title: 'أسعار الذهب تستقر عند مستويات قياسية', sentiment: 'positive', source: 'أخبار السوق' },
            { title: 'البنوك المركزية تزيد احتياطاتها من الذهب', sentiment: 'positive', source: 'رويترز', image: null },
            { title: 'توقعات بارتفاع أسعار المعادن الثمينة', sentiment: 'positive', source: 'بلومبرغ', image: null }
        ]
    }
    return [
        { title: 'Gold prices stabilize at record levels', sentiment: 'positive', source: 'Market News' },
        { title: 'Central banks increase gold reserves', sentiment: 'positive', source: 'Reuters', image: null },
        { title: 'Precious metals expected to rise', sentiment: 'positive', source: 'Bloomberg', image: null }
    ]
}
