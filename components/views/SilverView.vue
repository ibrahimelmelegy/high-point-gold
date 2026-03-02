<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-white">{{ t('silverPrices') }}</h2>
        <p class="text-sm text-slate-500">{{ t('silverDesc') }}</p>
      </div>
      <div class="live-indicator flex items-center gap-2 px-3 py-1.5 bg-slate-500/10 rounded-full border border-slate-500/20">
        <div class="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
        <span class="text-xs font-semibold text-slate-400">LIVE</span>
      </div>
    </div>

    <!-- Main Price Card -->
    <div class="card card-silver p-6">
      <div class="flex justify-between items-start mb-6">
        <div>
          <span class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">XAG/{{ currency }}</span>
          <div class="flex items-baseline gap-2 mt-2">
            <span class="price-display text-5xl text-white">{{ (data?.price || 0).toFixed(2) }}</span>
            <span class="text-sm text-slate-500 font-semibold">{{ currency }}</span>
          </div>
        </div>
        <div class="w-16 h-16 bg-gradient-to-br from-slate-300 to-slate-500 rounded-2xl flex items-center justify-center shadow-lg">
          <span class="text-3xl">🥈</span>
        </div>
      </div>

      <!-- Price Change -->
      <div class="flex items-center gap-4 mb-6">
        <div :class="['flex items-center gap-2 px-4 py-2 rounded-xl', change >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10']">
          <span :class="change >= 0 ? 'text-emerald-400' : 'text-red-400'" class="text-lg">{{ change >= 0 ? '↑' : '↓' }}</span>
          <span :class="change >= 0 ? 'text-emerald-400' : 'text-red-400'" class="font-bold">{{ change >= 0 ? '+' : '' }}{{ (change || 0).toFixed(2) }}%</span>
        </div>
        <span class="text-xs text-slate-500">{{ t('sinceOpen') }}</span>
      </div>

      <!-- Chart -->
      <div class="chart-container">
        <PriceChart :data="chartData" :labels="chartLabels" label="Silver" color="#94a3b8" />
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card p-4">
        <p class="text-xs text-slate-500 mb-1">{{ t('open') }}</p>
        <p class="font-bold text-white price-display">{{ (data?.open_price || 0).toFixed(2) }}</p>
      </div>
      <div class="card p-4">
        <p class="text-xs text-slate-500 mb-1">{{ t('high') }}</p>
        <p class="font-bold text-emerald-400 price-display">{{ (data?.high_price || 0).toFixed(2) }}</p>
      </div>
      <div class="card p-4">
        <p class="text-xs text-slate-500 mb-1">{{ t('low') }}</p>
        <p class="font-bold text-red-400 price-display">{{ (data?.low_price || 0).toFixed(2) }}</p>
      </div>
      <div class="card p-4">
        <p class="text-xs text-slate-500 mb-1">{{ t('gram') }}</p>
        <p class="font-bold text-slate-300 price-display">{{ (data?.price_gram || 0).toFixed(2) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  data: Object,
  currency: { type: String, default: 'USD' },
  lang: { type: String, default: 'ar' },
  chartData: Array,
  chartLabels: Array
});

const translations = {
  ar: {
    silverPrices: 'أسعار الفضة',
    silverDesc: 'أسعار الفضة العالمية لحظة بلحظة',
    sinceOpen: 'منذ الافتتاح',
    open: 'الافتتاح',
    high: 'أعلى سعر',
    low: 'أدنى سعر',
    gram: 'جرام'
  },
  en: {
    silverPrices: 'Silver Prices',
    silverDesc: 'Live global silver prices',
    sinceOpen: 'Since Open',
    open: 'Open',
    high: 'High',
    low: 'Low',
    gram: 'Gram'
  }
};

const t = (key) => translations[props.lang]?.[key] || key;

const change = computed(() => {
  if (!props.data?.price || !props.data?.open_price) return 0;
  return ((props.data.price - props.data.open_price) / props.data.open_price) * 100;
});
</script>
