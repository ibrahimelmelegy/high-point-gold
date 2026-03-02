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
      <span v-else class="ml-auto text-xs text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-full">
        ✓ Live Data
      </span>
    </div>

    <!-- Metal Selector -->
    <div class="flex gap-3">
      <button 
        @click="selectedMetal = 'gold'"
        :class="[
          'flex-1 py-3 px-4 rounded-xl font-semibold transition-all',
          selectedMetal === 'gold' 
            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900' 
            : 'bg-[var(--bg-card)] text-slate-400 border border-[var(--border-primary)]'
        ]"
      >
        🥇 {{ t('gold') }}
      </button>
      <button 
        @click="selectedMetal = 'silver'"
        :class="[
          'flex-1 py-3 px-4 rounded-xl font-semibold transition-all',
          selectedMetal === 'silver' 
            ? 'bg-gradient-to-r from-slate-400 to-slate-300 text-slate-900' 
            : 'bg-[var(--bg-card)] text-slate-400 border border-[var(--border-primary)]'
        ]"
      >
        🥈 {{ t('silver') }}
      </button>
    </div>

    <!-- Main Signal Card -->
    <div :class="['card p-6', signalClass]">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <div :class="['w-14 h-14 rounded-xl flex items-center justify-center text-2xl', signalBgClass]">
            {{ signal.icon }}
          </div>
          <div>
            <h3 :class="['text-lg font-bold', signalTextClass]">{{ signal.action }}</h3>
            <p class="text-xs text-slate-500">{{ t('signal') }}</p>
          </div>
        </div>
        <div class="text-right">
          <p class="text-xs text-slate-500">{{ t('strength') }}</p>
          <p :class="['text-2xl font-bold', signalTextClass]">{{ indicators?.trendStrength || 50 }}%</p>
        </div>
      </div>
    </div>

    <!-- Technical Indicators Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- RSI -->
      <div class="card p-5">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-xl">📊</span>
          <h3 class="font-semibold text-white">RSI (14)</h3>
        </div>
        <div class="mb-3">
          <div class="flex justify-between text-xs text-slate-500 mb-2">
            <span>{{ t('oversold') }}</span>
            <span>{{ t('neutral') }}</span>
            <span>{{ t('overbought') }}</span>
          </div>
          <div class="h-3 bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 rounded-full relative">
            <div 
              class="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-slate-800"
              :style="{ left: rsiPosition + '%', transform: 'translateY(-50%) translateX(-50%)' }"
            ></div>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <span :class="['text-2xl font-bold', rsiColor]">{{ indicators?.rsi || 50 }}</span>
          <span :class="['text-xs font-semibold px-2 py-1 rounded-full', rsiBadgeClass]">
            {{ rsiStatus }}
          </span>
        </div>
      </div>

      <!-- MACD -->
      <div class="card p-5">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-xl">📈</span>
          <h3 class="font-semibold text-white">MACD</h3>
        </div>
        <div class="space-y-2 mb-3">
          <div class="flex justify-between text-xs">
            <span class="text-slate-500">{{ t('macdLine') }}</span>
            <span :class="macdLinePositive ? 'text-emerald-400' : 'text-red-400'" class="font-semibold">
              {{ (indicators?.macd?.line || 0).toFixed(2) }}
            </span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-slate-500">{{ t('signalLine') }}</span>
            <span class="text-amber-400 font-semibold">{{ (indicators?.macd?.signal || 0).toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-slate-500">{{ t('histogram') }}</span>
            <span :class="macdHistPositive ? 'text-emerald-400' : 'text-red-400'" class="font-semibold">
              {{ (indicators?.macd?.histogram || 0).toFixed(2) }}
            </span>
          </div>
        </div>
        <div :class="['w-full py-2 rounded-xl text-center text-sm font-semibold', macdStatusClass]">
          {{ macdStatus }}
        </div>
      </div>

      <!-- Moving Averages -->
      <div class="card p-5">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-xl">📉</span>
          <h3 class="font-semibold text-white">{{ t('movingAvg') }}</h3>
        </div>
        <div class="space-y-2 mb-3">
          <div class="flex justify-between text-xs">
            <span class="text-slate-500">MA 20</span>
            <span class="text-blue-400 font-semibold">${{ indicators?.movingAverages?.ma20?.toLocaleString() || '---' }}</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-slate-500">MA 50</span>
            <span class="text-purple-400 font-semibold">${{ indicators?.movingAverages?.ma50?.toLocaleString() || '---' }}</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-slate-500">MA 200</span>
            <span class="text-amber-400 font-semibold">${{ indicators?.movingAverages?.ma200?.toLocaleString() || '---' }}</span>
          </div>
        </div>
        <div :class="['w-full py-2 rounded-xl text-center text-sm font-semibold', maTrendClass]">
          {{ maTrend }}
        </div>
      </div>
    </div>

    <!-- Support & Resistance -->
    <div class="card p-6">
      <div class="flex items-center gap-2 mb-4">
        <span class="text-xl">⚖️</span>
        <h3 class="font-semibold text-white">{{ t('supportResistance') }}</h3>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Resistance Levels -->
        <div>
          <p class="text-xs text-slate-500 mb-3">{{ t('resistance') }}</p>
          <div class="space-y-2">
            <div v-for="(level, idx) in indicators?.supportResistance?.resistance || []" :key="'r' + idx" class="flex items-center justify-between p-2 rounded-xl bg-red-500/10 border border-red-500/20">
              <span class="text-xs text-slate-400">R{{ idx + 1 }}</span>
              <span class="font-semibold text-red-400">${{ level?.toLocaleString() || '---' }}</span>
            </div>
          </div>
        </div>

        <!-- Support Levels -->
        <div>
          <p class="text-xs text-slate-500 mb-3">{{ t('support') }}</p>
          <div class="space-y-2">
            <div v-for="(level, idx) in indicators?.supportResistance?.support || []" :key="'s' + idx" class="flex items-center justify-between p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span class="text-xs text-slate-400">S{{ idx + 1 }}</span>
              <span class="font-semibold text-emerald-400">${{ level?.toLocaleString() || '---' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Current Price Position -->
      <div class="mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <p class="text-xs text-slate-400 mb-1">{{ t('currentPrice') }}</p>
        <p class="text-xl font-bold text-blue-400 price-display">${{ indicators?.movingAverages?.currentPrice?.toLocaleString() || (goldPrice || 0).toLocaleString() }}</p>
      </div>
    </div>

    <!-- Refresh Button -->
    <button 
      @click="fetchIndicators" 
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
  silverPrice: { type: Number, default: 30 },
  lang: { type: String, default: 'ar' }
})

const selectedMetal = ref('gold')
const loading = ref(false)
const indicators = ref(null)

const rsiPosition = computed(() => Math.min(100, Math.max(0, indicators.value?.rsi || 50)))
const rsiColor = computed(() => {
  const rsi = indicators.value?.rsi || 50
  if (rsi < 30) return 'text-emerald-400'
  if (rsi > 70) return 'text-red-400'
  return 'text-amber-400'
})
const rsiBadgeClass = computed(() => {
  const rsi = indicators.value?.rsi || 50
  if (rsi < 30) return 'bg-emerald-500/20 text-emerald-400'
  if (rsi > 70) return 'bg-red-500/20 text-red-400'
  return 'bg-amber-500/20 text-amber-400'
})
const rsiStatus = computed(() => {
  const rsi = indicators.value?.rsi || 50
  if (rsi < 30) return props.lang === 'ar' ? 'تشبع بيع' : 'Oversold'
  if (rsi > 70) return props.lang === 'ar' ? 'تشبع شراء' : 'Overbought'
  return props.lang === 'ar' ? 'محايد' : 'Neutral'
})

const macdLinePositive = computed(() => (indicators.value?.macd?.line || 0) >= 0)
const macdHistPositive = computed(() => (indicators.value?.macd?.histogram || 0) >= 0)
const macdStatus = computed(() => {
  if (macdHistPositive.value) return props.lang === 'ar' ? '🟢 إشارة شراء' : '🟢 Buy Signal'
  return props.lang === 'ar' ? '🔴 إشارة بيع' : '🔴 Sell Signal'
})
const macdStatusClass = computed(() => macdHistPositive.value ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400')

const maTrend = computed(() => {
  const ma = indicators.value?.movingAverages
  if (!ma) return props.lang === 'ar' ? '➡️ غير متاح' : '➡️ N/A'
  if (ma.currentPrice > ma.ma20 && ma.ma20 > ma.ma50) return props.lang === 'ar' ? '📈 اتجاه صاعد' : '📈 Bullish'
  if (ma.currentPrice < ma.ma20 && ma.ma20 < ma.ma50) return props.lang === 'ar' ? '📉 اتجاه هابط' : '📉 Bearish'
  return props.lang === 'ar' ? '➡️ عرضي' : '➡️ Sideways'
})
const maTrendClass = computed(() => {
  const ma = indicators.value?.movingAverages
  if (!ma) return 'bg-slate-500/20 text-slate-400'
  if (ma.currentPrice > ma.ma20) return 'bg-emerald-500/20 text-emerald-400'
  if (ma.currentPrice < ma.ma20) return 'bg-red-500/20 text-red-400'
  return 'bg-amber-500/20 text-amber-400'
})

const signal = computed(() => {
  const strength = indicators.value?.trendStrength || 50
  if (strength > 65) return { 
    icon: '🟢', 
    action: props.lang === 'ar' ? 'إشارة شراء قوية' : 'Strong Buy Signal'
  }
  if (strength < 35) return {
    icon: '🔴',
    action: props.lang === 'ar' ? 'إشارة بيع' : 'Sell Signal'
  }
  return {
    icon: '🟡',
    action: props.lang === 'ar' ? 'احتفاظ' : 'Hold'
  }
})

const signalClass = computed(() => {
  const s = indicators.value?.trendStrength || 50
  if (s > 65) return 'bg-emerald-500/10 border-emerald-500/30'
  if (s < 35) return 'bg-red-500/10 border-red-500/30'
  return 'bg-amber-500/10 border-amber-500/30'
})
const signalBgClass = computed(() => {
  const s = indicators.value?.trendStrength || 50
  if (s > 65) return 'bg-emerald-500/20 border border-emerald-500/30'
  if (s < 35) return 'bg-red-500/20 border border-red-500/30'
  return 'bg-amber-500/20 border border-amber-500/30'
})
const signalTextClass = computed(() => {
  const s = indicators.value?.trendStrength || 50
  if (s > 65) return 'text-emerald-400'
  if (s < 35) return 'text-red-400'
  return 'text-amber-400'
})

const fetchIndicators = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/technical', {
      query: { symbol: selectedMetal.value === 'gold' ? 'XAUUSD' : 'XAGUSD' }
    })
    if (response.indicators) {
      indicators.value = response.indicators
    }
  } catch (error) {
    console.error('Failed to fetch indicators:', error)
  } finally {
    loading.value = false
  }
}

watch(selectedMetal, () => {
  fetchIndicators()
})

const translations = {
  ar: {
    title: 'التحليل الفني',
    desc: 'مؤشرات فنية حقيقية من Alpha Vantage',
    gold: 'ذهب',
    silver: 'فضة',
    signal: 'الإشارة',
    strength: 'القوة',
    oversold: 'تشبع بيع',
    neutral: 'محايد',
    overbought: 'تشبع شراء',
    macdLine: 'خط MACD',
    signalLine: 'خط الإشارة',
    histogram: 'الهستوجرام',
    movingAvg: 'المتوسطات المتحركة',
    supportResistance: 'الدعم والمقاومة',
    resistance: 'مستويات المقاومة',
    support: 'مستويات الدعم',
    currentPrice: 'السعر الحالي',
    refresh: '🔄 تحديث البيانات',
    loading: 'جاري التحميل...'
  },
  en: {
    title: 'Technical Analysis',
    desc: 'Real indicators from Alpha Vantage',
    gold: 'Gold',
    silver: 'Silver',
    signal: 'Signal',
    strength: 'Strength',
    oversold: 'Oversold',
    neutral: 'Neutral',
    overbought: 'Overbought',
    macdLine: 'MACD Line',
    signalLine: 'Signal Line',
    histogram: 'Histogram',
    movingAvg: 'Moving Averages',
    supportResistance: 'Support & Resistance',
    resistance: 'Resistance Levels',
    support: 'Support Levels',
    currentPrice: 'Current Price',
    refresh: '🔄 Refresh Data',
    loading: 'Loading...'
  }
}

const t = (key) => translations[props.lang]?.[key] || key

onMounted(() => {
  fetchIndicators()
})
</script>
