// @ts-nocheck
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const apiKey = config.goldApiKey || process.env.GOLD_API_KEY || process.env.NUXT_GOLD_API_KEY

    if (!apiKey) {
        return { error: 'GOLD_API_KEY not configured' }
    }

    try {
        const response = await fetch(`https://www.goldapi.io/api/status`, {
            headers: {
                "x-access-token": apiKey,
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();
        return data;
    } catch (error: any) {
        return { error: "خطأ في التحقق من حالة الـ API" };
    }
});
