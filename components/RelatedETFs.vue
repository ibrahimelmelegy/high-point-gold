<template>
  <div class="card p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-bold text-white flex items-center gap-2">
        <span>📊</span>
        {{ t('etfsTitle') }}
      </h3>
      <span class="text-xs text-slate-500">{{ t('delayed') }}</span>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-xs text-slate-500 border-b border-slate-700">
            <th class="text-start pb-3">{{ t('symbol') }}</th>
            <th class="text-start pb-3">{{ t('name') }}</th>
            <th class="text-center pb-3">{{ t('price') }}</th>
            <th class="text-end pb-3">{{ t('change') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="etf in etfs" :key="etf.symbol" class="border-b border-slate-800 last:border-0 hover:bg-white/5 transition-colors">
            <td class="py-3 font-bold text-white">{{ etf.symbol }}</td>
            <td class="py-3 text-slate-400 text-xs">{{ etf.name }}</td>
            <td class="py-3 text-center text-white">${{ etf.price.toFixed(2) }}</td>
            <td class="py-3 text-end">
              <span :class="['px-2 py-0.5 rounded-full text-xs font-semibold', etf.change >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400']">
                {{ etf.change >= 0 ? '+' : '' }}{{ etf.change }}%
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  lang: {
    type: String,
    default: 'ar'
  }
})

const t = (key) => {
  const translations = {
    ar: {
      etfsTitle: 'صناديق الذهب المتداولة (ETFs)',
      delayed: 'بيانات متأخرة 15 دقيقة',
      symbol: 'الرمز',
      name: 'الاسم',
      price: 'السعر',
      change: 'التغيير'
    },
    en: {
      etfsTitle: 'Gold ETFs',
      delayed: 'Data delayed 15m',
      symbol: 'Symbol',
      name: 'Name',
      price: 'Price',
      change: 'Change'
    }
  }
  return translations[props.lang]?.[key] || key
}

// Realistic static data for ETFs
const etfs = [
  { symbol: 'GLD', name: 'SPDR Gold Shares', price: 236.45, change: 0.34 },
  { symbol: 'IAU', name: 'iShares Gold Trust', price: 48.20, change: 0.32 },
  { symbol: 'SGOL', name: 'abrdn Physical Gold', price: 25.80, change: 0.35 },
  { symbol: 'OUNZ', name: 'VanEck Merk Gold', price: 24.15, change: 0.31 },
  { symbol: 'GLDM', name: 'SPDR Gold MiniShares', price: 48.85, change: 0.33 },
  { symbol: 'GDX', name: 'VanEck Gold Miners', price: 28.90, change: -1.2 },
  { symbol: 'GDXJ', name: 'VanEck Junior Miners', price: 34.50, change: -1.5 }
]
</script>
