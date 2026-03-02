<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-white">{{ t('goldPrices') }}</h2>
        <p class="text-sm text-slate-500">{{ t('goldDesc') }}</p>
      </div>
      <div class="live-indicator flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
        <div class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
        <span class="text-xs font-semibold text-emerald-400">LIVE</span>
      </div>
    </div>

    <!-- Main Price Card -->
    <div class="card card-gold p-6">
      <div class="flex justify-between items-start mb-6">
        <div>
          <span class="text-[10px] font-semibold uppercase tracking-widest text-amber-500">XAU/{{ currency }}</span>
          <div class="flex items-baseline gap-2 mt-2">
            <span class="price-display text-5xl text-white">{{ data?.price?.toLocaleString() || '---' }}</span>
            <span class="text-sm text-slate-500 font-semibold">{{ currency }}</span>
          </div>
        </div>
        <div class="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
          <span class="text-3xl">🥇</span>
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
        <PriceChart :data="chartData" :labels="chartLabels" label="Gold" color="#f59e0b" />
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card p-4">
        <p class="text-xs text-slate-500 mb-1">{{ t('open') }}</p>
        <p class="font-bold text-white price-display">{{ data?.open_price?.toLocaleString() || '---' }}</p>
      </div>
      <div class="card p-4">
        <p class="text-xs text-slate-500 mb-1">{{ t('high') }}</p>
        <p class="font-bold text-emerald-400 price-display">{{ data?.high_price?.toLocaleString() || '---' }}</p>
      </div>
      <div class="card p-4">
        <p class="text-xs text-slate-500 mb-1">{{ t('low') }}</p>
        <p class="font-bold text-red-400 price-display">{{ data?.low_price?.toLocaleString() || '---' }}</p>
      </div>
      <div class="card p-4">
        <p class="text-xs text-slate-500 mb-1">{{ t('gram24k') }}</p>
        <p class="font-bold text-amber-400 price-display">{{ data?.price_gram_24k?.toLocaleString() || '---' }}</p>
      </div>
    </div>

    <!-- Trading Signal -->
    <div :class="['card p-6', signalClass]">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center" :class="signalBgClass">
          <span class="text-2xl">{{ signalIcon }}</span>
        </div>
        <div>
          <p class="text-sm text-slate-400">{{ t('tradingSignal') }}</p>
          <p class="text-lg font-bold" :class="signalTextClass">{{ signalMessage }}</p>
        </div>
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
    goldPrices: 'أسعار الذهب',
    goldDesc: 'أسعار الذهب العالمية لحظة بلحظة',
    sinceOpen: 'منذ الافتتاح',
    open: 'الافتتاح',
    high: 'أعلى سعر',
    low: 'أدنى سعر',
    gram24k: 'جرام 24K',
    tradingSignal: 'إشارة التداول',
    buy: 'إشارة شراء قوية',
    sell: 'إشارة بيع - جني أرباح',
    hold: 'استقرار - احتفاظ'
  },
  en: {
    goldPrices: 'Gold Prices',
    goldDesc: 'Live global gold prices',
    sinceOpen: 'Since Open',
    open: 'Open',
    high: 'High',
    low: 'Low',
    gram24k: '24K Gram',
    tradingSignal: 'Trading Signal',
    buy: 'Strong Buy Signal',
    sell: 'Sell Signal - Take Profit',
    hold: 'Stable - Hold'
  }
};

const t = (key) => translations[props.lang]?.[key] || key;

const change = computed(() => {
  if (!props.data?.price || !props.data?.open_price) return 0;
  return ((props.data.price - props.data.open_price) / props.data.open_price) * 100;
});

const signalType = computed(() => {
  if (change.value < -1.5) return 'buy';
  if (change.value > 2.5) return 'sell';
  return 'hold';
});

const signalMessage = computed(() => t(signalType.value));
const signalIcon = computed(() => signalType.value === 'buy' ? '📈' : signalType.value === 'sell' ? '📉' : '📊');
const signalClass = computed(() => signalType.value === 'buy' ? 'border-emerald-500/20' : signalType.value === 'sell' ? 'border-red-500/20' : 'border-amber-500/20');
const signalBgClass = computed(() => signalType.value === 'buy' ? 'bg-emerald-500/20' : signalType.value === 'sell' ? 'bg-red-500/20' : 'bg-amber-500/20');
const signalTextClass = computed(() => signalType.value === 'buy' ? 'text-emerald-400' : signalType.value === 'sell' ? 'text-red-400' : 'text-amber-400');
</script>
