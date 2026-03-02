<template>
  <div class="bg-slate-900/90 backdrop-blur-sm border-b border-slate-700 h-10 flex items-center overflow-hidden relative">
    <!-- Live Indicator -->
    <div class="flex items-center gap-1.5 px-3 border-r border-slate-700 h-full shrink-0 z-10 bg-slate-900">
      <span :class="['w-2 h-2 rounded-full', connected ? 'bg-emerald-400 live-dot' : 'bg-red-400']"></span>
      <span class="text-[10px] font-bold" :class="connected ? 'text-emerald-400' : 'text-red-400'">LIVE</span>
    </div>

    <!-- Ticker Container -->
    <div class="flex animate-marquee hover:pause whitespace-nowrap">
      <div v-for="i in 2" :key="i" class="flex items-center">
        <div
          v-for="item in tickerItems"
          :key="`${i}-${item.symbol}`"
          class="flex items-center gap-2 px-6 border-r border-slate-800 h-10"
        >
          <span class="font-bold text-xs text-slate-300">{{ item.symbol }}</span>
          <span
            :class="[
              'text-xs font-semibold transition-colors duration-300',
              item.flash === 'up' ? 'text-emerald-300 price-flash-up' :
              item.flash === 'down' ? 'text-red-300 price-flash-down' :
              item.change >= 0 ? 'text-emerald-400' : 'text-red-400'
            ]"
          >
            {{ formatPrice(item.price) }}
          </span>
          <span :class="['text-[10px]', item.change >= 0 ? 'text-emerald-500' : 'text-red-500']">
            {{ item.change >= 0 ? '▲' : '▼' }} {{ Math.abs(item.change).toFixed(2) }}%
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { prices, connected, getPriceDirection } = useRealtimePrices()

const defaultItems = [
  { symbol: 'XAU/USD', price: 2685.50, change: 0.45, flash: '' },
  { symbol: 'XAG/USD', price: 31.25, change: 0.32, flash: '' },
  { symbol: 'BTC/USD', price: 95420, change: -1.2, flash: '' },
  { symbol: 'EUR/USD', price: 1.0842, change: 0.15, flash: '' },
  { symbol: 'Oil WTI', price: 78.45, change: -0.38, flash: '' },
  { symbol: 'S&P 500', price: 5985, change: 0.22, flash: '' },
  { symbol: 'NASDAQ', price: 18950, change: 0.18, flash: '' },
  { symbol: 'DXY', price: 104.25, change: -0.12, flash: '' }
]

const tickerItems = ref(defaultItems)
const flashTimers = ref({})

// Fetch initial data from REST API
const fetchTicker = async () => {
  try {
    const data = await $fetch('/api/market-ticker')
    if (data?.items?.length) {
      tickerItems.value = data.items.map(item => ({ ...item, flash: '' }))
    }
  } catch (e) {
    console.error('Ticker fetch error:', e)
  }
}

// Watch for real-time price updates
watch(prices, (newPrices) => {
  if (!newPrices || Object.keys(newPrices).length === 0) return

  tickerItems.value = tickerItems.value.map(item => {
    const rt = newPrices[item.symbol]
    if (rt && rt.price && rt.price !== item.price) {
      const direction = rt.price > item.price ? 'up' : 'down'
      const newChange = item.open ? ((rt.price - item.open) / item.open * 100) : item.change

      // Clear previous flash timer
      if (flashTimers.value[item.symbol]) clearTimeout(flashTimers.value[item.symbol])
      // Clear flash after 500ms
      flashTimers.value[item.symbol] = setTimeout(() => {
        const idx = tickerItems.value.findIndex(t => t.symbol === item.symbol)
        if (idx >= 0) tickerItems.value[idx] = { ...tickerItems.value[idx], flash: '' }
      }, 500)

      return { ...item, price: rt.price, change: newChange, flash: direction }
    }
    return item
  })
}, { deep: true })

const formatPrice = (price) => {
  if (typeof price === 'string') return price
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (price >= 1) return price.toFixed(2)
  return price.toFixed(4)
}

let refreshInterval = null

onMounted(() => {
  fetchTicker()
  // Still poll REST API every 30s as baseline (real-time updates override instantly)
  refreshInterval = setInterval(fetchTicker, 30000)
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
  Object.values(flashTimers.value).forEach(t => clearTimeout(t))
})
</script>

<style scoped>
.animate-marquee {
  animation: marquee 40s linear infinite;
}

.pause:hover {
  animation-play-state: paused;
}

@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

[dir="rtl"] .animate-marquee {
  animation: marquee-rtl 40s linear infinite;
}

@keyframes marquee-rtl {
  0% { transform: translateX(0); }
  100% { transform: translateX(50%); }
}

.live-dot {
  animation: live-pulse 1.5s ease-in-out infinite;
}

@keyframes live-pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.7); }
  50% { opacity: 0.7; box-shadow: 0 0 0 4px rgba(52, 211, 153, 0); }
}

.price-flash-up {
  animation: flash-green 0.5s ease-out;
}

.price-flash-down {
  animation: flash-red 0.5s ease-out;
}

@keyframes flash-green {
  0% { background-color: rgba(52, 211, 153, 0.3); border-radius: 3px; }
  100% { background-color: transparent; }
}

@keyframes flash-red {
  0% { background-color: rgba(248, 113, 113, 0.3); border-radius: 3px; }
  100% { background-color: transparent; }
}
</style>
