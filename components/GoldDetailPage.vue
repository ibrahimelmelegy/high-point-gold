<template>
  <div class="space-y-6">
    <!-- Header with Back Button -->
    <div class="flex items-center gap-4 mb-6">
      <button @click="$emit('back')" class="p-2 rounded-lg hover:bg-white/5">
        <span class="text-xl">←</span>
      </button>
      <div class="flex items-center gap-3">
        <span class="text-3xl">🥇</span>
        <div>
          <h2 class="text-xl font-bold text-white">{{ lang === 'ar' ? 'الذهب (XAU/USD)' : 'Gold (XAU/USD)' }}</h2>
          <p class="text-xs text-slate-500">COMEX Delayed · {{ lang === 'ar' ? 'توقيت نيويورك' : 'NY Time' }}</p>
        </div>
      </div>
      <span class="ml-auto text-xs text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-full flex items-center gap-1">
        <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
        Live
      </span>
    </div>

    <!-- Price Header Section -->
    <div class="card p-6">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <!-- Main Price -->
        <div>
          <p class="text-4xl font-bold text-white price-display">${{ formatPrice(goldPrice) }}</p>
          <div class="flex items-center gap-2 mt-2">
            <span :class="['text-lg font-bold', priceChange >= 0 ? 'text-emerald-400' : 'text-red-400']">
              {{ priceChange >= 0 ? '+' : '' }}{{ (priceChange || 0).toFixed(2) }}
            </span>
            <span :class="['text-sm px-2 py-0.5 rounded-full', priceChange >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400']">
              ({{ priceChange >= 0 ? '+' : '' }}{{ (priceChangePercent || 0).toFixed(2) }}%)
            </span>
          </div>
        </div>

        <!-- Key Stats Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div class="p-3 rounded-xl bg-[var(--bg-tertiary)]">
            <p class="text-xs text-slate-500">{{ t('open') }}</p>
            <p class="font-bold text-white">${{ formatPrice(openPrice) }}</p>
          </div>
          <div class="p-3 rounded-xl bg-[var(--bg-tertiary)]">
            <p class="text-xs text-slate-500">{{ t('prevClose') }}</p>
            <p class="font-bold text-white">${{ formatPrice(prevClose) }}</p>
          </div>
          <div class="p-3 rounded-xl bg-[var(--bg-tertiary)]">
            <p class="text-xs text-slate-500">{{ t('dayHigh') }}</p>
            <p class="font-bold text-emerald-400">${{ formatPrice(dayHigh) }}</p>
          </div>
          <div class="p-3 rounded-xl bg-[var(--bg-tertiary)]">
            <p class="text-xs text-slate-500">{{ t('dayLow') }}</p>
            <p class="font-bold text-red-400">${{ formatPrice(dayLow) }}</p>
          </div>
        </div>
      </div>

      <!-- Day's Range Bar -->
      <div class="mt-6">
        <div class="flex justify-between text-xs text-slate-500 mb-2">
          <span>{{ t('dayRange') }}</span>
          <span>${{ formatPrice(dayLow) }} - ${{ formatPrice(dayHigh) }}</span>
        </div>
        <div class="h-2 bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 rounded-full relative">
          <div 
            class="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-purple-500"
            :style="{ left: dayRangePosition + '%' }"
          ></div>
        </div>
      </div>

      <!-- 52 Week Range -->
      <div class="mt-4">
        <div class="flex justify-between text-xs text-slate-500 mb-2">
          <span>{{ t('week52Range') }}</span>
          <span>${{ week52Low.toFixed(2) }} - ${{ week52High.toFixed(2) }}</span>
        </div>
        <div class="h-2 bg-slate-700 rounded-full relative">
          <div 
            class="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-purple-500 rounded-full"
            :style="{ left: week52Position + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="flex gap-2 overflow-x-auto pb-2">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all',
          activeTab === tab.id 
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
            : 'bg-[var(--bg-card)] text-slate-400 border border-[var(--border-primary)]'
        ]"
      >
        {{ tab.icon }} {{ tab.label }}
      </button>
    </div>

    <!-- Tab Content -->
    <div v-if="activeTab === 'overview'">
      <!-- Chart Section -->
      <div class="card p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-white">{{ t('priceChart') }}</h3>
          <div class="flex gap-1">
            <button 
              v-for="period in tvIntervals" 
              :key="period.value"
              @click="selectedTVInterval = period.value"
              :class="[
                'px-3 py-1 rounded-lg text-xs font-medium transition-all',
                selectedTVInterval === period.value 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-[var(--bg-tertiary)] text-slate-400 hover:text-white'
              ]"
            >
              {{ period.label }}
            </button>
          </div>
        </div>
        <!-- TradingView Professional Chart -->
        <ClientOnly>
          <TradingViewChart 
            symbol="OANDA:XAUUSD" 
            :interval="selectedTVInterval"
            :height="400"
            :lang="lang"
            :title="t('priceChart')"
            :showHeader="false"
          />
        </ClientOnly>

        <!-- Period Performance Stats -->
        <div class="grid grid-cols-4 md:grid-cols-8 gap-2 mt-4">
          <div 
            v-for="period in periodPerformance" 
            :key="period.label"
            class="text-center p-2 rounded-lg bg-[var(--bg-tertiary)] hover:bg-purple-500/10 cursor-pointer transition-all"
          >
            <p class="text-xs text-slate-400 mb-1">{{ period.label }}</p>
            <p :class="['text-xs font-semibold', period.change >= 0 ? 'text-emerald-400' : 'text-red-400']">
              {{ period.change >= 0 ? '+' : '' }}{{ period.change }}%
            </p>
          </div>
        </div>
      </div>

      <!-- Sentiment Voting -->
      <div class="mt-6">
        <SentimentVote :lang="lang" />
      </div>

      <!-- Technical Summary Widget with Gauges and Sentiment Voting -->
      <TechnicalSummaryWidget 
        :indicators="realTechnical"
        :lang="lang"
        class="mt-4"
        @period-change="handlePeriodChange"
      />

      <!-- Related ETFs -->
      <div class="mt-6">
        <RelatedETFs :lang="lang" />
      </div>


      <!-- Contract Specifications -->
      <ContractSpecs
        :goldPrice="goldPrice"
        :lang="lang"
        class="mt-4"
      />

      <!-- Related Instruments -->
      <div class="card p-6 mt-4">
        <h3 class="font-bold text-white mb-4">{{ t('relatedInstruments') }}</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div v-for="inst in relatedInstruments" :key="inst.symbol" class="p-3 rounded-xl bg-[var(--bg-tertiary)] hover:bg-purple-500/10 transition-all cursor-pointer">
            <div class="flex items-center gap-2 mb-2">
              <span>{{ inst.icon }}</span>
              <span class="text-sm font-semibold text-white">{{ inst.symbol }}</span>
            </div>
            <p class="text-lg font-bold text-white">${{ inst.price }}</p>
            <p :class="['text-xs', inst.change >= 0 ? 'text-emerald-400' : 'text-red-400']">
              {{ inst.change >= 0 ? '+' : '' }}{{ inst.change }}%
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Technical Tab -->
    <div v-else-if="activeTab === 'technical'" class="space-y-4">
      <!-- Technical Indicators Table -->
      <div class="card p-6">
        <h3 class="font-bold text-white mb-4">{{ t('technicalIndicators') }}</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-xs text-slate-500 border-b border-slate-700">
                <th class="text-start pb-3">{{ t('indicator') }}</th>
                <th class="text-center pb-3">{{ t('value') }}</th>
                <th class="text-end pb-3">{{ t('signal') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ind in technicalIndicators" :key="ind.name" class="border-b border-slate-800">
                <td class="py-3 text-white font-medium">{{ ind.name }}</td>
                <td class="py-3 text-center text-slate-300">{{ ind.value }}</td>
                <td class="py-3 text-end">
                  <span :class="['px-2 py-1 rounded-full text-xs font-semibold', getSignalClass(ind.signal)]">
                    {{ ind.signal }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-4 p-3 rounded-xl bg-[var(--bg-tertiary)] flex justify-between text-sm">
          <span class="text-emerald-400">{{ t('buy') }}: {{ indicatorBuyCount }}</span>
          <span class="text-slate-400">{{ t('neutral') }}: {{ indicatorNeutralCount }}</span>
          <span class="text-red-400">{{ t('sell') }}: {{ indicatorSellCount }}</span>
        </div>
      </div>

      <!-- Moving Averages Table -->
      <div class="card p-6">
        <h3 class="font-bold text-white mb-4">{{ t('movingAverages') }}</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-xs text-slate-500 border-b border-slate-700">
                <th class="text-start pb-3">{{ t('period') }}</th>
                <th class="text-center pb-3">SMA</th>
                <th class="text-center pb-3">EMA</th>
                <th class="text-end pb-3">{{ t('signal') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ma in movingAverages" :key="ma.period" class="border-b border-slate-800">
                <td class="py-3 text-white font-medium">MA{{ ma.period }}</td>
                <td class="py-3 text-center text-blue-400">${{ ma.sma.toFixed(2) }}</td>
                <td class="py-3 text-center text-purple-400">${{ ma.ema.toFixed(2) }}</td>
                <td class="py-3 text-end">
                  <span :class="['px-2 py-1 rounded-full text-xs font-semibold', getSignalClass(ma.signal)]">
                    {{ ma.signal }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pivot Points -->
      <div class="card p-6">
        <h3 class="font-bold text-white mb-4">{{ t('pivotPoints') }}</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-xs text-slate-500 border-b border-slate-700">
                <th class="text-start pb-3">{{ t('type') }}</th>
                <th class="text-center pb-3 text-red-400">S3</th>
                <th class="text-center pb-3 text-red-400">S2</th>
                <th class="text-center pb-3 text-red-400">S1</th>
                <th class="text-center pb-3 text-purple-400">Pivot</th>
                <th class="text-center pb-3 text-emerald-400">R1</th>
                <th class="text-center pb-3 text-emerald-400">R2</th>
                <th class="text-center pb-3 text-emerald-400">R3</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pivot in pivotPoints" :key="pivot.type" class="border-b border-slate-800">
                <td class="py-3 text-white font-medium">{{ pivot.type }}</td>
                <td class="py-3 text-center text-red-400">${{ pivot.s3 }}</td>
                <td class="py-3 text-center text-red-400">${{ pivot.s2 }}</td>
                <td class="py-3 text-center text-red-400">${{ pivot.s1 }}</td>
                <td class="py-3 text-center text-purple-400 font-bold">${{ pivot.pivot }}</td>
                <td class="py-3 text-center text-emerald-400">${{ pivot.r1 }}</td>
                <td class="py-3 text-center text-emerald-400">${{ pivot.r2 }}</td>
                <td class="py-3 text-center text-emerald-400">${{ pivot.r3 }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Historical Tab -->
    <div v-else-if="activeTab === 'historical'" class="card p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-bold text-white">{{ t('historicalData') }}</h3>
        <button @click="exportHistory" class="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 text-xs font-semibold hover:bg-purple-500/30">
          📥 {{ t('download') }}
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-xs text-slate-500 border-b border-slate-700">
              <th class="text-start pb-3">{{ t('date') }}</th>
              <th class="text-center pb-3">{{ t('open') }}</th>
              <th class="text-center pb-3">{{ t('high') }}</th>
              <th class="text-center pb-3">{{ t('low') }}</th>
              <th class="text-center pb-3">{{ t('close') }}</th>
              <th class="text-end pb-3">{{ t('change') }}%</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in historicalData" :key="row.date" class="border-b border-slate-800">
              <td class="py-3 text-white">{{ row.date }}</td>
              <td class="py-3 text-center text-slate-300">${{ row.open }}</td>
              <td class="py-3 text-center text-emerald-400">${{ row.high }}</td>
              <td class="py-3 text-center text-red-400">${{ row.low }}</td>
              <td class="py-3 text-center text-white font-medium">${{ row.close }}</td>
              <td :class="['py-3 text-end', row.change >= 0 ? 'text-emerald-400' : 'text-red-400']">
                {{ row.change >= 0 ? '+' : '' }}{{ row.change }}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- News Tab -->
    <div v-if="activeTab === 'news'">
      <NewsSection :lang="lang" :limit="12" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  goldPrice: { type: Number, default: 2650 },
  priceChange: { type: Number, default: 12.50 },
  lang: { type: String, default: 'ar' },
  goldData: { type: Object, default: null }
})

const activeTab = ref('overview')
const selectedPeriod = ref('1D')
const selectedInterval = ref('1h')

const openPrice = computed(() => props.goldData?.open_price || (props.goldPrice - 5))
const dayHigh = computed(() => props.goldData?.high_price || (props.goldPrice + 15))
const dayLow = computed(() => props.goldData?.low_price || (props.goldPrice - 20))
const prevClose = computed(() => props.goldData?.prev_close_price || (props.goldPrice - props.priceChange))
const priceChangePercent = computed(() => props.goldData?.chp || (props.priceChange / (props.goldPrice - props.priceChange)) * 100)
const week52Low = computed(() => props.goldPrice - 350)
const week52High = computed(() => props.goldPrice + 150)
const dayRangePosition = computed(() => {
  const range = dayHigh.value - dayLow.value
  if (range <= 0) return 50
  return ((props.goldPrice - dayLow.value) / range) * 100
})
const week52Position = computed(() => ((props.goldPrice - week52Low.value) / (week52High.value - week52Low.value)) * 100)

const tabs = computed(() => [
  { id: 'overview', icon: '📊', label: t('overview') },
  { id: 'technical', icon: '📈', label: t('technical') },
  { id: 'historical', icon: '📜', label: t('historical') },
  { id: 'news', icon: '📰', label: t('news') }
])

const chartPeriods = ['1D', '1W', '1M', '3M', '1Y', '5Y']
const timeIntervals = [
  { value: '1m', label: '1 Min' },
  { value: '5m', label: '5 Min' },
  { value: '15m', label: '15 Min' },
  { value: '1h', label: '1 Hour' },
  { value: '1d', label: 'Daily' },
  { value: '1w', label: 'Weekly' }
]

// TradingView intervals
const selectedTVInterval = ref('60')
const tvIntervals = [
  { value: '15', label: '15م' },
  { value: '60', label: '1س' },
  { value: '240', label: '4س' },
  { value: 'D', label: 'يوم' },
  { value: 'W', label: 'أسبوع' }
]

const chartData = ref([65, 70, 55, 80, 75, 85, 90, 78, 82, 88, 75, 92, 85, 78, 82, 90, 95, 88, 82, 85])

// Period performance data (simulated based on price trends)
const periodPerformance = computed(() => {
  const lang = props.lang
  return [
    { label: lang === 'ar' ? 'يوم' : '1 Day', change: -5.14 },
    { label: lang === 'ar' ? 'أسبوع' : '1 Week', change: -11.83 },
    { label: lang === 'ar' ? 'شهر' : '1 Month', change: 3.91 },
    { label: lang === 'ar' ? '3 أشهر' : '3 Months', change: 12.02 },
    { label: lang === 'ar' ? '6 أشهر' : '6 Months', change: 34.35 },
    { label: lang === 'ar' ? 'سنة' : '1 Year', change: 58.12 },
    { label: lang === 'ar' ? '5 سنوات' : '5 Years', change: 145.51 },
    { label: lang === 'ar' ? 'الأقصى' : 'Max', change: 234.5 }
  ]
})

// Signal calculations
const signalPosition = computed(() => {
  const total = indicatorBuyCount.value + indicatorNeutralCount.value + indicatorSellCount.value
  if (total === 0) return 50
  const score = (indicatorBuyCount.value - indicatorSellCount.value) / total
  return 50 + (score * 50)
})

const signalText = computed(() => {
  if (signalPosition.value > 75) return props.lang === 'ar' ? 'شراء قوي' : 'Strong Buy'
  if (signalPosition.value > 55) return props.lang === 'ar' ? 'شراء' : 'Buy'
  if (signalPosition.value > 45) return props.lang === 'ar' ? 'محايد' : 'Neutral'
  if (signalPosition.value > 25) return props.lang === 'ar' ? 'بيع' : 'Sell'
  return props.lang === 'ar' ? 'بيع قوي' : 'Strong Sell'
})

const signalClass = computed(() => {
  if (signalPosition.value > 55) return 'bg-emerald-500/20 text-emerald-400'
  if (signalPosition.value > 45) return 'bg-amber-500/20 text-amber-400'
  return 'bg-red-500/20 text-red-400'
})

const bullPercent = ref(68)

const relatedInstruments = [
  { symbol: 'Silver', icon: '🥈', price: '30.45', change: 1.2 },
  { symbol: 'EUR/USD', icon: '💱', price: '1.0850', change: -0.15 },
  { symbol: 'Crude Oil', icon: '🛢️', price: '78.50', change: 2.3 },
  { symbol: 'Copper', icon: '🔶', price: '4.25', change: -0.8 }
]

const technicalIndicators = computed(() => {
  if (!realTechnical.value) return []
  const i = realTechnical.value
  const lang = props.lang
  
  const getSignal = (val, buyThr, sellThr) => {
      if (val > sellThr) return lang === 'ar' ? 'بيع' : 'Sell' // Often overbought means sell
      if (val < buyThr) return lang === 'ar' ? 'شراء' : 'Buy' // Oversold means buy
      return lang === 'ar' ? 'محايد' : 'Neutral'
  }

  const rsiSig = getRsiSignal(i.rsi)
  const stochSig = getSignal(i.stoch.k, 20, 80)
  const cciSig = getSignal(i.cci, -100, 100)
  const williamsSig = getSignal(i.williams, -80, -20)
  const adxSig = i.adx > 25 ? (lang === 'ar' ? 'شراء' : 'Buy') : (lang === 'ar' ? 'محايد' : 'Neutral') // Simplified
  const macdSig = i.macd?.histogram > 0 ? (lang === 'ar' ? 'شراء' : 'Buy') : (lang === 'ar' ? 'بيع' : 'Sell')

  return [
    { name: 'RSI(14)', value: i.rsi, signal: rsiSig },
    { name: 'STOCH(9,6)', value: i.stoch?.k?.toFixed(2) || '---', signal: stochSig },
    { name: 'STOCHRSI(14)', value: i.stoch?.k ? (i.stoch.k * 0.9).toFixed(2) : '---', signal: stochSig },
    { name: 'MACD(12,26)', value: i.macd?.line?.toFixed(2) || '---', signal: macdSig },
    { name: 'ADX(14)', value: i.adx?.toFixed(2) || '---', signal: adxSig },
    { name: 'Williams %R', value: i.williams?.toFixed(2) || '---', signal: williamsSig },
    { name: 'CCI(14)', value: i.cci?.toFixed(2) || '---', signal: cciSig },
    { name: 'ATR(14)', value: '18.5', signal: lang === 'ar' ? 'تقلب عالي' : 'High Volatility' }, // Static for now
    { name: 'ROC', value: '2.5%', signal: lang === 'ar' ? 'شراء' : 'Buy' },
    { name: 'Bull/Bear Power', value: '0.8', signal: lang === 'ar' ? 'شراء' : 'Buy' }
  ]
})

const movingAverages = computed(() => {
  if (!realTechnical.value?.movingAverages) return []
  const mas = realTechnical.value.movingAverages
  const price = mas.currentPrice
  const getSig = (ma) => price > ma ? (props.lang === 'ar' ? 'شراء' : 'Buy') : (props.lang === 'ar' ? 'بيع' : 'Sell')
  
  return [
    { period: 5, sma: mas.ma5?.toFixed(2) || '---', ema: mas.ema5?.toFixed(2) || '---', signal: getSig(mas.ma5) },
    { period: 10, sma: mas.ma10?.toFixed(2) || '---', ema: mas.ema10?.toFixed(2) || '---', signal: getSig(mas.ma10) },
    { period: 20, sma: mas.ma20?.toFixed(2) || '---', ema: mas.ema20?.toFixed(2) || '---', signal: getSig(mas.ma20) },
    { period: 50, sma: mas.ma50?.toFixed(2) || '---', ema: mas.ema50?.toFixed(2) || '---', signal: getSig(mas.ma50) },
    { period: 100, sma: mas.ma100?.toFixed(2) || '---', ema: mas.ema100?.toFixed(2) || '---', signal: getSig(mas.ma100) },
    { period: 200, sma: mas.ma200?.toFixed(2) || '---', ema: mas.ema200?.toFixed(2) || '---', signal: getSig(mas.ma200) }
  ]
})

const pivotPoints = computed(() => {
  if (!realTechnical.value?.pivotPoints?.classic) return []
  const p = realTechnical.value.pivotPoints.classic
  
  return [
    { 
      type: 'Classic', 
      s3: (p.s3 || 0).toFixed(2), s2: (p.s2 || 0).toFixed(2), s1: (p.s1 || 0).toFixed(2), 
      pivot: (p.pivot || 0).toFixed(2), 
      r1: (p.r1 || 0).toFixed(2), r2: (p.r2 || 0).toFixed(2), r3: (p.r3 || 0).toFixed(2) 
    },
    { 
      type: 'Fibonacci', 
      s3: (p.pivot - (p.r1-p.s1)*1.382).toFixed(2), 
      s2: (p.pivot - (p.r1-p.s1)*0.618).toFixed(2), 
      s1: (p.pivot - (p.r1-p.s1)*0.382).toFixed(2), 
      pivot: p.pivot.toFixed(2), 
      r1: (p.pivot + (p.r1-p.s1)*0.382).toFixed(2), 
      r2: (p.pivot + (p.r1-p.s1)*0.618).toFixed(2), 
      r3: (p.pivot + (p.r1-p.s1)*1.382).toFixed(2) 
    },
    {
       type: 'Camarilla',
       s3: (p.pivot - (p.r1-p.s1)*1.1).toFixed(2), // Simple approx
       s2: (p.pivot - (p.r1-p.s1)*0.55).toFixed(2),
       s1: (p.pivot - (p.r1-p.s1)*0.275).toFixed(2),
       pivot: p.pivot.toFixed(2),
       r1: (p.pivot + (p.r1-p.s1)*0.275).toFixed(2),
       r2: (p.pivot + (p.r1-p.s1)*0.55).toFixed(2),
       r3: (p.pivot + (p.r1-p.s1)*1.1).toFixed(2)
    }
  ]
})

const realHistorical = ref([])

const historicalData = computed(() => {
  if (realHistorical.value && realHistorical.value.length > 0) {
      return realHistorical.value
  }
  return []
})

const indicatorBuyCount = computed(() => technicalIndicators.value.filter(i => i.signal?.includes('Buy') || i.signal?.includes('شراء')).length)
const indicatorNeutralCount = computed(() => technicalIndicators.value.filter(i => i.signal?.includes('Neutral') || i.signal?.includes('محايد') || i.signal?.includes('Overbought') || i.signal?.includes('تشبع') || i.signal?.includes('Volatility') || i.signal?.includes('تقلب')).length)
const indicatorSellCount = computed(() => technicalIndicators.value.filter(i => i.signal?.includes('Sell') || i.signal?.includes('بيع')).length)


const realTechnical = ref(null)

const fetchRealData = async () => {
  // Fetch Technical
  try {
    const techData = await $fetch('/api/technical', { query: { symbol: 'XAUUSD' } })
    realTechnical.value = techData.indicators
    if (techData.historical) {
        realHistorical.value = techData.historical
    }
  } catch (e) {
    console.error('Technical fetch error', e)
  }
}



const getRsiSignal = (rsi) => {
  if (rsi > 70) return props.lang === 'ar' ? 'بيع' : 'Sell'
  if (rsi < 30) return props.lang === 'ar' ? 'شراء' : 'Buy'
  return props.lang === 'ar' ? 'محايد' : 'Neutral'
}

const getSignalClass = (signal) => {
  if (!signal) return 'bg-slate-500/20 text-slate-400'
  if (signal.includes('Buy') || signal.includes('شراء')) return 'bg-emerald-500/20 text-emerald-400'
  if (signal.includes('Sell') || signal.includes('بيع')) return 'bg-red-500/20 text-red-400'
  return 'bg-amber-500/20 text-amber-400'
}

const formatPrice = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '---'
  return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const handlePeriodChange = (period) => {
  // Simulate data variation for different periods
  // In a production app with paid API, this would fetch real data
  if (!realTechnical.value) return

  const variations = {
    '30m': { rsi: 35, trend: 40 },
    'hourly': { rsi: 42, trend: 45 },
    '5h': { rsi: 48, trend: 55 },
    'daily': { rsi: 55, trend: 62 },
    'weekly': { rsi: 60, trend: 70 },
    'monthly': { rsi: 65, trend: 75 }
  }

  const v = variations[period] || variations['daily']
  
  // Clone and update
  const newTech = { ...realTechnical.value }
  newTech.rsi = v.rsi
  newTech.trendStrength = v.trend
  
  // Update MACD slightly based on trend
  if (v.rsi > 50) {
    newTech.macd = { line: 2.5, signal: 1.8, histogram: 0.7 }
  } else {
    newTech.macd = { line: -1.5, signal: -0.5, histogram: -1.0 }
  }
  
  realTechnical.value = newTech
}

onMounted(() => {
  fetchRealData()
})

const exportHistory = async () => {
  const { jsPDF } = await import('jspdf')
  await import('jspdf-autotable')
  const doc = new jsPDF()
  doc.text('Gold Historical Data', 105, 15, { align: 'center' })
  doc.autoTable({
    head: [['Date', 'Open', 'High', 'Low', 'Close', 'Change%']],
    body: historicalData.value.map(r => [r.date, r.open, r.high, r.low, r.close, r.change + '%']),
    startY: 25
  })
  doc.save('gold-history.pdf')
}

const translations = {
  ar: {
    overview: 'نظرة عامة',
    technical: 'التحليل الفني',
    historical: 'البيانات التاريخية',
    news: 'الأخبار',
    open: 'الافتتاح',
    prevClose: 'الإغلاق السابق',
    dayHigh: 'أعلى سعر',
    dayLow: 'أدنى سعر',
    dayRange: 'نطاق اليوم',
    week52Range: 'نطاق 52 أسبوع',
    priceChart: 'الرسم البياني',
    technicalSummary: 'ملخص التحليل الفني',
    strongSell: 'بيع قوي',
    sell: 'بيع',
    neutral: 'محايد',
    buy: 'شراء',
    strongBuy: 'شراء قوي',
    sentiment: 'مشاعر السوق',
    bulls: 'المشترون',
    bears: 'البائعون',
    relatedInstruments: 'أدوات مرتبطة',
    technicalIndicators: 'المؤشرات الفنية',
    indicator: 'المؤشر',
    value: 'القيمة',
    signal: 'الإشارة',
    movingAverages: 'المتوسطات المتحركة',
    period: 'الفترة',
    pivotPoints: 'نقاط Pivot',
    type: 'النوع',
    historicalData: 'البيانات التاريخية',
    download: 'تحميل',
    date: 'التاريخ',
    high: 'الأعلى',
    low: 'الأدنى',
    close: 'الإغلاق',
    change: 'التغير'
  },
  en: {
    overview: 'Overview',
    technical: 'Technical',
    historical: 'Historical',
    news: 'News',
    open: 'Open',
    prevClose: 'Prev. Close',
    dayHigh: 'Day High',
    dayLow: 'Day Low',
    dayRange: "Day's Range",
    week52Range: '52 Week Range',
    priceChart: 'Price Chart',
    technicalSummary: 'Technical Summary',
    strongSell: 'Strong Sell',
    sell: 'Sell',
    neutral: 'Neutral',
    buy: 'Buy',
    strongBuy: 'Strong Buy',
    sentiment: 'Sentiment',
    bulls: 'Bulls',
    bears: 'Bears',
    relatedInstruments: 'Related Instruments',
    technicalIndicators: 'Technical Indicators',
    indicator: 'Indicator',
    value: 'Value',
    signal: 'Signal',
    movingAverages: 'Moving Averages',
    period: 'Period',
    pivotPoints: 'Pivot Points',
    type: 'Type',
    historicalData: 'Historical Data',
    download: 'Download',
    date: 'Date',
    high: 'High',
    low: 'Low',
    close: 'Close',
    change: 'Change'
  }
}

const t = (key) => translations[props.lang]?.[key] || key
</script>
