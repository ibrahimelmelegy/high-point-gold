<template>
  <div class="card p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-bold text-white">{{ lang === 'ar' ? 'التحليل الفني' : 'Technical Analysis' }} ›</h3>
    </div>
    
    <!-- Time Period Tabs -->
    <div class="flex flex-wrap gap-1 mb-6 overflow-x-auto pb-2">
      <button
        v-for="period in timePeriods"
        :key="period.value"
        @click="selectPeriod(period)"
        :class="[
          'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border',
          selectedPeriod === period.value
            ? 'bg-slate-800 text-white border-slate-600'
            : 'bg-transparent text-slate-400 border-slate-700 hover:border-slate-500',
          period.locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        ]"
      >
        <span class="flex items-center gap-1">
          {{ period.label }}
          <span v-if="period.locked" class="text-amber-500">🔒</span>
        </span>
      </button>
    </div>

    <!-- TradingView Technical Analysis Widget -->
    <div class="bg-slate-900 rounded-xl overflow-hidden">
      <ClientOnly>
        <div ref="widgetContainer" class="tradingview-widget-container">
          <div :id="widgetId" class="tradingview-widget"></div>
        </div>
      </ClientOnly>
    </div>

    <!-- Sentiment Voting Section -->
    <div class="mt-6 pt-6 border-t border-slate-700">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p class="text-white font-medium">
            {{ lang === 'ar' ? 'ما هو شعورك اليوم تجاه الذهب؟' : 'How do you feel today about Gold?' }}
          </p>
          <p class="text-xs text-slate-500">
            {{ lang === 'ar' ? 'صوّت لرؤية نتائج المجتمع!' : 'Vote to see community\'s results!' }}
          </p>
        </div>
        
        <div class="flex items-center gap-2">
          <button
            @click="vote('bearish')"
            :class="[
              'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all',
              userVote === 'bearish'
                ? 'bg-red-500/20 border-red-500 text-red-400'
                : 'border-slate-600 text-slate-400 hover:border-red-500 hover:text-red-400'
            ]"
          >
            <span>🐻</span>
            <span class="text-sm font-medium">{{ lang === 'ar' ? 'هبوطي' : 'Bearish' }}</span>
          </button>
          
          <span class="text-slate-500 text-sm">{{ lang === 'ar' ? 'أو' : 'or' }}</span>
          
          <button
            @click="vote('bullish')"
            :class="[
              'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all',
              userVote === 'bullish'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                : 'border-slate-600 text-slate-400 hover:border-emerald-500 hover:text-emerald-400'
            ]"
          >
            <span>🐂</span>
            <span class="text-sm font-medium">{{ lang === 'ar' ? 'صعودي' : 'Bullish' }}</span>
          </button>
        </div>
      </div>
      
      <!-- Vote Results Bar (shown after voting) -->
      <div v-if="userVote" class="mt-4">
        <div class="flex justify-between text-xs mb-1">
          <span class="text-red-400">🐻 {{ bearishPercent }}%</span>
          <span class="text-emerald-400">{{ bullishPercent }}% 🐂</span>
        </div>
        <div class="h-2 bg-emerald-500 rounded-full overflow-hidden">
          <div 
            class="h-full bg-red-500 transition-all duration-500"
            :style="{ width: bearishPercent + '%' }"
          ></div>
        </div>
        <p class="text-xs text-slate-500 mt-2 text-center">
          {{ totalVotes.toLocaleString() }} {{ lang === 'ar' ? 'صوت' : 'votes' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  indicators: {
    type: Object,
    default: () => ({})
  },
  lang: {
    type: String,
    default: 'ar'
  }
})

const selectedPeriod = ref('1D')
const userVote = ref(null)
const bearishPercent = ref(35)
const bullishPercent = ref(65)
const totalVotes = ref(1247)
const widgetId = ref('tradingview-ta-widget-' + Math.random().toString(36).substring(7))

// TradingView interval mapping
const intervalMap = {
  '1m': '1m',
  '5m': '5m',
  '15m': '15m',
  '30m': '30m',
  'hourly': '1h',
  '5h': '4h',
  'daily': '1D',
  'weekly': '1W',
  'monthly': '1M'
}

// Load user vote from localStorage (client-side only)
onMounted(() => {
  if (typeof window !== 'undefined') {
    const savedVote = localStorage.getItem('goldSentimentVote')
    if (savedVote) {
      userVote.value = savedVote
    }
    
    // Load TradingView widget
    loadTradingViewWidget()
  }
})

const loadTradingViewWidget = () => {
  if (typeof window === 'undefined') return
  
  // Remove existing widget if any
  const container = document.getElementById(widgetId.value)
  if (container) {
    container.innerHTML = ''
  }
  
  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js'
  script.async = true
  script.innerHTML = JSON.stringify({
    "interval": intervalMap[selectedPeriod.value] || '1D',
    "width": "100%",
    "isTransparent": true,
    "height": 450,
    "symbol": "OANDA:XAUUSD",
    "showIntervalTabs": false,
    "displayMode": "multiple",
    "locale": props.lang === 'ar' ? 'ar_AE' : 'en',
    "colorTheme": "dark"
  })
  
  if (container) {
    container.appendChild(script)
  }
}

// Watch for period changes
watch(selectedPeriod, () => {
  loadTradingViewWidget()
})

const timePeriods = computed(() => {
  const isAr = props.lang === 'ar'
  return [
    { value: '1m', label: isAr ? '1 دقيقة' : '1 Min', locked: true },
    { value: '5m', label: isAr ? '5 دقائق' : '5 Min', locked: true },
    { value: '15m', label: isAr ? '15 دقيقة' : '15 Min', locked: true },
    { value: '30m', label: isAr ? '30 دقيقة' : '30 Min', locked: false },
    { value: 'hourly', label: isAr ? 'ساعة' : 'Hourly', locked: false },
    { value: '5h', label: isAr ? '5 ساعات' : '5 Hours', locked: false },
    { value: 'daily', label: isAr ? 'يومي' : 'Daily', locked: false },
    { value: 'weekly', label: isAr ? 'أسبوعي' : 'Weekly', locked: false },
    { value: 'monthly', label: isAr ? 'شهري' : 'Monthly', locked: false }
  ]
})

const selectPeriod = (period) => {
  if (period.locked) return
  selectedPeriod.value = period.value
}

const vote = (type) => {
  userVote.value = type
  if (typeof window !== 'undefined') {
    localStorage.setItem('goldSentimentVote', type)
  }
  
  // Simulate updating percentages
  if (type === 'bullish') {
    bullishPercent.value = Math.min(99, bullishPercent.value + 1)
    bearishPercent.value = 100 - bullishPercent.value
  } else {
    bearishPercent.value = Math.min(99, bearishPercent.value + 1)
    bullishPercent.value = 100 - bearishPercent.value
  }
  totalVotes.value++
}
</script>

<style scoped>
.card {
  background: var(--bg-card);
  border-radius: 1rem;
  border: 1px solid var(--border-primary);
}

.tradingview-widget-container {
  min-height: 450px;
}
</style>
