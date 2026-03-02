import { getCached, setCache } from '../utils/cache'

const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const query = getQuery(event)
    const lang = String(query.lang || 'ar')
    const goldPrice = Number(query.goldPrice) || 2650
    const silverPrice = Number(query.silverPrice) || 30
    const goldChange = Number(query.goldChange) || 0
    const silverChange = Number(query.silverChange) || 0

    // Round gold price to reduce cache fragmentation
    const cacheKey = `ai-analysis-${lang}-${Math.round(goldPrice / 10)}`
    const cached = getCached(cacheKey)
    if (cached) return cached

    const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY || process.env.NUXT_GEMINI_API_KEY

    if (!apiKey) {
        return {
            error: 'GEMINI_API_KEY not configured',
            analysis: getDefaultAnalysis(lang)
        }
    }

    try {
        const prompt = lang === 'ar'
            ? `أنت محلل أسواق ذهب محترف. قدم تحليلاً موجزاً لسوق الذهب بناءً على:
         - سعر الذهب الحالي: $${goldPrice}
         - تغير الذهب: ${goldChange}%
         - سعر الفضة: $${silverPrice}
         - تغير الفضة: ${silverChange}%

         قدم:
         1. تحليل عام للسوق (جملتين)
         2. توصية (شراء/بيع/احتفاظ)
         3. مستوى الثقة (0-100)
         4. السبب (جملة واحدة)

         الرد بتنسيق JSON فقط:
         {"summary": "...", "recommendation": "buy أو sell أو hold", "confidence": 75, "reason": "..."}`
            : `You are a professional gold market analyst. Provide a brief analysis based on:
         - Current gold price: $${goldPrice}
         - Gold change: ${goldChange}%
         - Silver price: $${silverPrice}
         - Silver change: ${silverChange}%

         Provide:
         1. General market analysis (2 sentences)
         2. Recommendation (buy/sell/hold)
         3. Confidence level (0-100)
         4. Reason (1 sentence)

         Reply in JSON format only:
         {"summary": "...", "recommendation": "buy or sell or hold", "confidence": 75, "reason": "..."}`

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
                }),
                signal: AbortSignal.timeout(10000)
            }
        )

        const data = await response.json()

        if (data.error) {
            console.error('Gemini API Error:', data.error)
            return { error: data.error.message, analysis: getDefaultAnalysis(lang) }
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

        const jsonMatch = text.match(/\{[\s\S]*?\}/)
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0])
                const result = {
                    success: true,
                    analysis: parsed,
                    timestamp: new Date().toISOString()
                }
                setCache(cacheKey, result, CACHE_TTL)
                return result
            } catch (e) {
                // Failed to parse JSON
            }
        }

        const result = {
            success: true,
            analysis: { summary: text, recommendation: 'hold', confidence: 50, reason: '' },
            timestamp: new Date().toISOString()
        }
        setCache(cacheKey, result, CACHE_TTL)
        return result

    } catch (error: any) {
        console.error('Gemini API Error:', error.message)
        return { error: error.message, analysis: getDefaultAnalysis(lang) }
    }
})

function getDefaultAnalysis(lang: string) {
    return {
        summary: lang === 'ar'
            ? 'يظهر سوق الذهب استقراراً نسبياً مع ميل صعودي طفيف. الطلب المؤسسي لا يزال قوياً مما يدعم الأسعار الحالية.'
            : 'Gold market shows relative stability with a slight bullish bias. Institutional demand remains strong, supporting current price levels.',
        recommendation: 'hold',
        confidence: 65,
        reason: lang === 'ar'
            ? 'المؤشرات الفنية محايدة مع ميل إيجابي طفيف'
            : 'Technical indicators are neutral with a slight positive bias'
    }
}
