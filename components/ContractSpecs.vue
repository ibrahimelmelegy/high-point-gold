<template>
  <div class="card p-6">
    <h3 class="text-lg font-bold text-white mb-4">
      {{ lang === 'ar' ? 'تفاصيل العقد' : 'Contract Specifications' }}
    </h3>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Column 1: Price Data -->
      <div class="space-y-3">
        <div class="flex justify-between items-center py-2 border-b border-slate-800">
          <span class="text-slate-400 text-sm">{{ lang === 'ar' ? 'الإغلاق السابق' : 'Prev. Close' }}</span>
          <span class="text-white font-medium">{{ formatPrice(specs.prevClose) }}</span>
        </div>
        <div class="flex justify-between items-center py-2 border-b border-slate-800">
          <span class="text-slate-400 text-sm">{{ lang === 'ar' ? 'الافتتاح' : 'Open' }}</span>
          <span class="text-white font-medium">{{ formatPrice(specs.open) }}</span>
        </div>
        <div class="flex justify-between items-center py-2 border-b border-slate-800">
          <span class="text-slate-400 text-sm">{{ lang === 'ar' ? 'نطاق اليوم' : "Day's Range" }}</span>
          <span class="text-white font-medium">{{ formatPrice(specs.dayLow) }} - {{ formatPrice(specs.dayHigh) }}</span>
        </div>
        <div class="flex justify-between items-center py-2 border-b border-slate-800">
          <span class="text-slate-400 text-sm">{{ lang === 'ar' ? 'نطاق 52 أسبوع' : '52 wk Range' }}</span>
          <span class="text-white font-medium">{{ formatPrice(specs.week52Low) }} - {{ formatPrice(specs.week52High) }}</span>
        </div>
        <div class="flex justify-between items-center py-2 border-b border-slate-800">
          <span class="text-slate-400 text-sm">{{ lang === 'ar' ? 'الحجم' : 'Volume' }}</span>
          <span class="text-white font-medium">{{ formatNumber(specs.volume) }}</span>
        </div>
        <div class="flex justify-between items-center py-2">
          <span class="text-slate-400 text-sm">{{ lang === 'ar' ? 'التغير السنوي' : '1-Year Change' }}</span>
          <span :class="specs.yearChange >= 0 ? 'text-emerald-400' : 'text-red-400'" class="font-medium">
            {{ specs.yearChange >= 0 ? '+' : '' }}{{ specs.yearChange }}%
          </span>
        </div>
      </div>

      <!-- Column 2: Settlement Data -->
      <div class="space-y-3">
        <div class="flex justify-between items-center py-2 border-b border-slate-800">
          <span class="text-slate-400 text-sm">{{ lang === 'ar' ? 'يوم التسوية' : 'Settlement Day' }}</span>
          <span class="text-white font-medium">{{ specs.settlementDay }}</span>
        </div>
        <div class="flex justify-between items-center py-2 border-b border-slate-800">
          <span class="text-slate-400 text-sm">{{ lang === 'ar' ? 'نوع التسوية' : 'Settlement Type' }}</span>
          <span class="text-blue-400 font-medium">{{ specs.settlementType }}</span>
        </div>
        <div class="flex justify-between items-center py-2 border-b border-slate-800">
          <span class="text-slate-400 text-sm">{{ lang === 'ar' ? 'الشهر' : 'Month' }}</span>
          <span class="text-white font-medium">{{ specs.month }}</span>
        </div>
        <div class="flex justify-between items-center py-2 border-b border-slate-800">
          <span class="text-slate-400 text-sm">{{ lang === 'ar' ? 'آخر يوم تجديد' : 'Last Rollover Day' }}</span>
          <span class="text-white font-medium">{{ specs.lastRolloverDay }}</span>
        </div>
        <div class="flex justify-between items-center py-2">
          <span class="text-slate-400 text-sm">{{ lang === 'ar' ? 'حجم العقد' : 'Contract Size' }}</span>
          <span class="text-white font-medium">{{ specs.contractSize }}</span>
        </div>
      </div>

      <!-- Column 3: Contract Details -->
      <div class="space-y-3">
        <div class="flex justify-between items-center py-2 border-b border-slate-800">
          <span class="text-slate-400 text-sm">{{ lang === 'ar' ? 'حجم النقطة' : 'Tick Size' }}</span>
          <span class="text-white font-medium">{{ specs.tickSize }}</span>
        </div>
        <div class="flex justify-between items-center py-2 border-b border-slate-800">
          <span class="text-slate-400 text-sm">{{ lang === 'ar' ? 'قيمة النقطة' : 'Tick Value' }}</span>
          <span class="text-white font-medium">{{ specs.tickValue }}</span>
        </div>
        <div class="flex justify-between items-center py-2 border-b border-slate-800">
          <span class="text-slate-400 text-sm">{{ lang === 'ar' ? 'الرمز الأساسي' : 'Base Symbol' }}</span>
          <span class="text-white font-medium">{{ specs.baseSymbol }}</span>
        </div>
        <div class="flex justify-between items-center py-2 border-b border-slate-800">
          <span class="text-slate-400 text-sm">{{ lang === 'ar' ? 'قيمة النقطة' : 'Point Value' }}</span>
          <span class="text-white font-medium">{{ specs.pointValue }}</span>
        </div>
        <div class="flex justify-between items-center py-2">
          <span class="text-slate-400 text-sm">{{ lang === 'ar' ? 'الأشهر' : 'Months' }}</span>
          <span class="text-white font-medium">{{ specs.months }}</span>
        </div>
      </div>
    </div>

    <!-- Tags -->
    <div class="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-800">
      <span class="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
        {{ lang === 'ar' ? 'النوع:' : 'Type:' }} {{ lang === 'ar' ? 'سلعة' : 'Commodity' }}
      </span>
      <span class="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
        {{ lang === 'ar' ? 'المجموعة:' : 'Group:' }} {{ lang === 'ar' ? 'معادن' : 'Metals' }}
      </span>
      <span class="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
        {{ lang === 'ar' ? 'الوحدة:' : 'Unit:' }} 1 Troy Ounce
      </span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  goldPrice: {
    type: Number,
    default: 2650
  },
  priceData: {
    type: Object,
    default: () => ({})
  },
  lang: {
    type: String,
    default: 'ar'
  }
})

const specs = computed(() => {
  const price = props.goldPrice || 2650
  const data = props.priceData || {}
  
  // Calculate dates
  const today = new Date()
  const settlementDate = new Date(today)
  settlementDate.setMonth(settlementDate.getMonth() + 2)
  settlementDate.setDate(28)
  
  const rolloverDate = new Date(settlementDate)
  rolloverDate.setDate(rolloverDate.getDate() - 3)
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  return {
    prevClose: data.prev_close || (price + 12.5),
    open: data.open_price || (price - 5),
    dayLow: data.low_price || (price - 25),
    dayHigh: data.high_price || (price + 20),
    week52Low: Math.round(price * 0.85),
    week52High: Math.round(price * 1.15),
    volume: data.volume || 129184,
    yearChange: 58.12,
    settlementDay: `${settlementDate.getMonth() + 1}/${settlementDate.getDate()}/${settlementDate.getFullYear()}`,
    settlementType: 'Physical',
    month: `${monthNames[settlementDate.getMonth()]} ${settlementDate.getFullYear()}`,
    lastRolloverDay: `${rolloverDate.getMonth() + 1}/${rolloverDate.getDate()}/${rolloverDate.getFullYear()}`,
    contractSize: '100 Troy Ounces',
    tickSize: '0.1',
    tickValue: '$10',
    baseSymbol: 'ZG',
    pointValue: '1 = $100',
    months: 'GJMQVZ'
  }
})

const formatPrice = (value) => {
  if (!value) return '---'
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatNumber = (value) => {
  if (!value) return '---'
  return value.toLocaleString()
}
</script>

<style scoped>
.card {
  background: var(--bg-card);
  border-radius: 1rem;
  border: 1px solid var(--border-primary);
}
</style>
