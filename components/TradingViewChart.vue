<template>
  <div class="tradingview-chart-container">
    <div class="chart-header" v-if="showHeader">
      <h3 class="text-lg font-bold text-white">{{ title }}</h3>
      <div class="chart-controls">
        <button 
          v-for="interval in intervals" 
          :key="interval.value"
          @click="changeInterval(interval.value)"
          :class="['interval-btn', { active: currentInterval === interval.value }]"
        >
          {{ interval.label }}
        </button>
      </div>
    </div>
    <div :id="containerId" class="tradingview-widget"></div>
  </div>
</template>

<script setup>
const props = defineProps({
  symbol: {
    type: String,
    default: 'OANDA:XAUUSD' // Gold spot price
  },
  interval: {
    type: String,
    default: '60' // 1 hour
  },
  theme: {
    type: String,
    default: 'dark'
  },
  height: {
    type: [Number, String],
    default: 500
  },
  width: {
    type: String,
    default: '100%'
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  title: {
    type: String,
    default: 'الرسم البياني'
  },
  lang: {
    type: String,
    default: 'ar'
  }
})

const containerId = ref(`tradingview_${Math.random().toString(36).substr(2, 9)}`)
const currentInterval = ref(props.interval)
const widget = ref(null)

const intervals = [
  { label: '1س', value: '60' },
  { label: '4س', value: '240' },
  { label: 'يوم', value: 'D' },
  { label: 'أسبوع', value: 'W' },
  { label: 'شهر', value: 'M' }
]

const symbolMap = {
  'XAU': 'OANDA:XAUUSD',
  'XAG': 'OANDA:XAGUSD',
  'GOLD': 'COMEX:GC1!',
  'SILVER': 'COMEX:SI1!'
}

const getSymbol = () => {
  return symbolMap[props.symbol.toUpperCase()] || props.symbol
}

const initWidget = () => {
  if (typeof window === 'undefined') return
  
  // Clear previous widget
  const container = document.getElementById(containerId.value)
  if (container) {
    container.innerHTML = ''
  }

  // Create new widget
  widget.value = new window.TradingView.widget({
    autosize: true,
    symbol: getSymbol(),
    interval: currentInterval.value,
    timezone: 'Asia/Riyadh',
    theme: props.theme,
    style: '1', // Candlestick
    locale: props.lang === 'ar' ? 'ar_AE' : 'en',
    toolbar_bg: '#1e293b',
    enable_publishing: false,
    hide_top_toolbar: false,
    hide_legend: false,
    save_image: true,
    container_id: containerId.value,
    hide_side_toolbar: false,
    allow_symbol_change: true,
    details: true,
    hotlist: false,
    calendar: false,
    studies: [
      'MASimple@tv-basicstudies',
      'RSI@tv-basicstudies',
      'MACD@tv-basicstudies'
    ],
    show_popup_button: true,
    popup_width: '1000',
    popup_height: '650',
    overrides: {
      'paneProperties.background': '#0f172a',
      'paneProperties.backgroundType': 'solid',
      'scalesProperties.textColor': '#94a3b8',
      'mainSeriesProperties.candleStyle.upColor': '#10b981',
      'mainSeriesProperties.candleStyle.downColor': '#ef4444',
      'mainSeriesProperties.candleStyle.borderUpColor': '#10b981',
      'mainSeriesProperties.candleStyle.borderDownColor': '#ef4444',
      'mainSeriesProperties.candleStyle.wickUpColor': '#10b981',
      'mainSeriesProperties.candleStyle.wickDownColor': '#ef4444'
    }
  })
}

const changeInterval = (interval) => {
  currentInterval.value = interval
  initWidget()
}

// Load TradingView script
onMounted(() => {
  if (typeof window !== 'undefined' && !window.TradingView) {
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/tv.js'
    script.async = true
    script.onload = () => {
      initWidget()
    }
    document.head.appendChild(script)
  } else if (window.TradingView) {
    initWidget()
  }
})

onUnmounted(() => {
  widget.value = null
})

// Watch for symbol changes
watch(() => props.symbol, () => {
  initWidget()
})
</script>

<style scoped>
.tradingview-chart-container {
  background: var(--bg-card, #1e293b);
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
}

.chart-controls {
  display: flex;
  gap: 0.5rem;
}

.interval-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background: var(--bg-tertiary, #334155);
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.interval-btn:hover {
  background: var(--bg-secondary, #475569);
  color: white;
}

.interval-btn.active {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.tradingview-widget {
  height: v-bind('typeof height === "number" ? height + "px" : height');
  width: 100%;
}

@media (max-width: 640px) {
  .chart-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .chart-controls {
    width: 100%;
    justify-content: center;
  }
  
  .interval-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
  }
}
</style>
