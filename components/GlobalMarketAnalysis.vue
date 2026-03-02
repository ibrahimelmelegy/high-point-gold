<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4 mb-6">
      <button @click="$emit('back')" class="p-2 rounded-lg hover:bg-white/5">
        <span class="text-xl">←</span>
      </button>
      <div>
        <h2 class="text-xl font-bold text-white">{{ t('title') }}</h2>
        <p class="text-sm text-slate-500">{{ t('desc') }}</p>
      </div>
      <div v-if="loading" class="ml-auto">
        <div class="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>

    <!-- AI Analysis Card -->
    <div class="card p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
          <span class="text-2xl">🤖</span>
        </div>
        <div>
          <h3 class="font-bold text-white">{{ t('aiAnalysis') }}</h3>
          <p class="text-xs text-slate-400">Powered by Gemini AI</p>
        </div>
        <span v-if="!loading && aiData" class="ml-auto text-xs text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-full">
          ✓ Live
        </span>
      </div>
      
      <div class="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-purple-500/20">
        <p v-if="loading" class="text-sm text-slate-400 animate-pulse">{{ t('analyzing') }}</p>
        <p v-else class="text-sm text-slate-300 leading-relaxed">
          {{ aiData?.analysis?.summary || t('noData') }}
        </p>
      </div>

      <!-- AI Recommendation -->
      <div class="mt-4 flex items-center justify-between p-3 rounded-xl" :class="recommendationClass">
        <span class="text-sm font-semibold text-white">{{ t('recommendation') }}</span>
        <span class="text-lg font-bold" :class="recommendationTextClass">
          {{ recommendationIcon }} {{ t(aiData?.analysis?.recommendation || 'hold') }}
        </span>
      </div>

      <!-- Confidence -->
      <div class="mt-3">
        <div class="flex justify-between text-xs text-slate-400 mb-2">
          <span>{{ t('confidence') }}</span>
          <span>{{ aiData?.analysis?.confidence || 50 }}%</span>
        </div>
        <div class="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div 
            class="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
            :style="{ width: (aiData?.analysis?.confidence || 50) + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Markets Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- New York -->
      <div class="card p-5">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <span class="text-3xl">🇺🇸</span>
            <div>
              <h3 class="font-bold text-white">{{ t('nyTitle') }}</h3>
              <p class="text-xs text-slate-500">{{ markets.ny.localTime }}</p>
            </div>
          </div>
          <div :class="['w-3 h-3 rounded-full', markets.ny.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400']"></div>
        </div>

        <div class="mb-3">
          <p class="text-xs text-slate-500 mb-1">{{ t('currentPrice') }}</p>
          <p class="text-2xl font-bold text-white price-display">${{ (goldPrice || 0).toLocaleString() }}</p>
        </div>

        <div class="p-3 rounded-xl bg-[var(--bg-tertiary)]">
          <p class="text-xs text-slate-400 mb-1">{{ t('marketStatus') }}</p>
          <p class="text-sm text-slate-300">{{ markets.ny.isOpen ? t('open') : t('closed') }}</p>
        </div>
      </div>

      <!-- London -->
      <div class="card p-5">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <span class="text-3xl">🇬🇧</span>
            <div>
              <h3 class="font-bold text-white">{{ t('londonTitle') }}</h3>
              <p class="text-xs text-slate-500">{{ markets.london.localTime }}</p>
            </div>
          </div>
          <div :class="['w-3 h-3 rounded-full', markets.london.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400']"></div>
        </div>

        <div class="mb-3">
          <p class="text-xs text-slate-500 mb-1">{{ t('currentPrice') }}</p>
          <p class="text-2xl font-bold text-white price-display">${{ (goldPrice || 0).toLocaleString() }}</p>
        </div>

        <div class="p-3 rounded-xl bg-[var(--bg-tertiary)]">
          <p class="text-xs text-slate-400 mb-1">{{ t('marketStatus') }}</p>
          <p class="text-sm text-slate-300">{{ markets.london.isOpen ? t('open') : t('closed') }}</p>
        </div>
      </div>

      <!-- Shanghai -->
      <div class="card p-5">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <span class="text-3xl">🇨🇳</span>
            <div>
              <h3 class="font-bold text-white">{{ t('shanghaiTitle') }}</h3>
              <p class="text-xs text-slate-500">{{ markets.shanghai.localTime }}</p>
            </div>
          </div>
          <div :class="['w-3 h-3 rounded-full', markets.shanghai.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400']"></div>
        </div>

        <div class="mb-3">
          <p class="text-xs text-slate-500 mb-1">{{ t('currentPrice') }}</p>
          <p class="text-2xl font-bold text-white price-display">${{ (goldPrice || 0).toLocaleString() }}</p>
        </div>

        <div class="p-3 rounded-xl bg-[var(--bg-tertiary)]">
          <p class="text-xs text-slate-400 mb-1">{{ t('marketStatus') }}</p>
          <p class="text-sm text-slate-300">{{ markets.shanghai.isOpen ? t('open') : t('closed') }}</p>
        </div>
      </div>
    </div>

    <!-- AI Reason -->
    <div v-if="aiData?.analysis?.reason" class="card p-5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
      <div class="flex items-center gap-3 mb-3">
        <span class="text-xl">💡</span>
        <h3 class="font-semibold text-white">{{ t('reason') }}</h3>
      </div>
      <p class="text-sm text-slate-300">{{ aiData.analysis.reason }}</p>
    </div>

    <!-- Refresh Button -->
    <button 
      @click="fetchAnalysis" 
      :disabled="loading"
      class="btn-primary w-full flex items-center justify-center gap-2"
    >
      <span v-if="loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
      {{ loading ? t('loading') : t('refresh') }}
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  goldPrice: { type: Number, default: 2650 },
  lang: { type: String, default: 'ar' }
});

const loading = ref(false)
const aiData = ref(null)

const now = new Date()
const hour = now.getUTCHours()

const markets = computed(() => ({
  ny: {
    isOpen: hour >= 13 && hour < 22,
    localTime: 'EST 08:00-17:00'
  },
  london: {
    isOpen: hour >= 8 && hour < 17,
    localTime: 'GMT 08:00-17:00'
  },
  shanghai: {
    isOpen: hour >= 1 && hour < 9,
    localTime: 'CST 09:00-15:30'
  }
}))

const recommendationClass = computed(() => {
  const rec = aiData.value?.analysis?.recommendation
  if (rec === 'buy') return 'bg-emerald-500/20'
  if (rec === 'sell') return 'bg-red-500/20'
  return 'bg-amber-500/20'
})

const recommendationTextClass = computed(() => {
  const rec = aiData.value?.analysis?.recommendation
  if (rec === 'buy') return 'text-emerald-400'
  if (rec === 'sell') return 'text-red-400'
  return 'text-amber-400'
})

const recommendationIcon = computed(() => {
  const rec = aiData.value?.analysis?.recommendation
  if (rec === 'buy') return '🟢'
  if (rec === 'sell') return '🔴'
  return '🟡'
})

const fetchAnalysis = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/ai-analysis', {
      query: {
        lang: props.lang,
        goldPrice: props.goldPrice
      }
    })
    aiData.value = response
  } catch (error) {
    console.error('Failed to fetch AI analysis:', error)
  } finally {
    loading.value = false
  }
}

const translations = {
  ar: {
    title: 'التحليل العالمي الذكي',
    desc: 'تحليل بالذكاء الاصطناعي لأسواق الذهب',
    aiAnalysis: 'تحليل Gemini AI',
    analyzing: 'جاري التحليل...',
    noData: 'اضغط تحديث للحصول على التحليل',
    recommendation: 'التوصية',
    confidence: 'مستوى الثقة',
    buy: 'شراء',
    sell: 'بيع',
    hold: 'احتفاظ',
    reason: 'السبب',
    refresh: '🔄 تحديث التحليل',
    loading: 'جاري التحميل...',
    nyTitle: 'نيويورك',
    londonTitle: 'لندن',
    shanghaiTitle: 'شنغهاي',
    currentPrice: 'السعر الحالي',
    marketStatus: 'حالة السوق',
    open: '🟢 مفتوح',
    closed: '🔴 مغلق'
  },
  en: {
    title: 'Smart Global Analysis',
    desc: 'AI-powered gold market analysis',
    aiAnalysis: 'Gemini AI Analysis',
    analyzing: 'Analyzing...',
    noData: 'Press refresh to get analysis',
    recommendation: 'Recommendation',
    confidence: 'Confidence Level',
    buy: 'Buy',
    sell: 'Sell',
    hold: 'Hold',
    reason: 'Reason',
    refresh: '🔄 Refresh Analysis',
    loading: 'Loading...',
    nyTitle: 'New York',
    londonTitle: 'London',
    shanghaiTitle: 'Shanghai',
    currentPrice: 'Current Price',
    marketStatus: 'Market Status',
    open: '🟢 Open',
    closed: '🔴 Closed'
  }
}

const t = (key) => translations[props.lang]?.[key] || key

onMounted(() => {
  fetchAnalysis()
})
</script>
