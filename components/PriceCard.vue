<template>
  <div :class="['card p-6 animate-slide-up', variant === 'gold' ? 'card-gold' : 'card-silver']">
    <!-- Header -->
    <div class="flex justify-between items-start mb-6">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="text-[10px] font-semibold uppercase tracking-widest" :class="variant === 'gold' ? 'text-amber-500' : 'text-slate-400'">
            Global Market
          </span>
          <span class="live-indicator" v-if="isLive"></span>
        </div>
        <h2 class="text-xl font-bold text-white">{{ title }}</h2>
      </div>
      <div 
        :class="[
          'w-12 h-12 rounded-xl flex items-center justify-center',
          variant === 'gold' ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-slate-500/10 border border-slate-500/20'
        ]"
      >
        <span class="text-xl">{{ variant === 'gold' ? '🥇' : '🥈' }}</span>
      </div>
    </div>

    <!-- Price Display -->
    <div class="mb-6">
      <div class="flex items-baseline gap-2">
        <span class="price-display text-4xl text-white">{{ formattedPrice }}</span>
        <span class="text-sm text-slate-500 font-semibold">{{ currency }}</span>
      </div>
      <div class="flex items-center gap-2 mt-2">
        <span 
          :class="[
            'text-sm font-semibold',
            priceChange >= 0 ? 'text-emerald-400' : 'text-red-400'
          ]"
        >
          {{ priceChange >= 0 ? '+' : '' }}{{ priceChange.toFixed(2) }}%
        </span>
        <span class="text-xs text-slate-500">منذ الافتتاح</span>
      </div>
    </div>

    <!-- Status Badge -->
    <div 
      :class="[
        'flex items-center gap-3 p-4 rounded-xl mb-6',
        statusClass
      ]"
    >
      <div class="w-2 h-2 rounded-full animate-pulse" :class="statusDotClass"></div>
      <span class="font-semibold text-sm">{{ statusMessage }}</span>
    </div>

    <!-- Chart -->
    <div class="chart-container">
      <PriceChart 
        :data="chartData" 
        :labels="chartLabels" 
        :label="title"
        :color="variant === 'gold' ? '#f59e0b' : '#94a3b8'"
      />
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-[var(--border-primary)]">
      <div class="text-center">
        <p class="text-xs text-slate-500 mb-1">أعلى سعر</p>
        <p class="font-semibold text-sm text-white">{{ highPrice }}</p>
      </div>
      <div class="text-center">
        <p class="text-xs text-slate-500 mb-1">أدنى سعر</p>
        <p class="font-semibold text-sm text-white">{{ lowPrice }}</p>
      </div>
      <div class="text-center">
        <p class="text-xs text-slate-500 mb-1">الافتتاح</p>
        <p class="font-semibold text-sm text-white">{{ openPrice }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: { type: String, default: 'سبائك الذهب' },
  variant: { type: String, default: 'gold' },
  price: { type: Number, default: 0 },
  openPrice: { type: [Number, String], default: 0 },
  highPrice: { type: [Number, String], default: 0 },
  lowPrice: { type: [Number, String], default: 0 },
  currency: { type: String, default: 'USD' },
  chartData: { type: Array, default: () => [] },
  chartLabels: { type: Array, default: () => [] },
  isLive: { type: Boolean, default: true }
});

const formattedPrice = computed(() => {
  return props.price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
});

const priceChange = computed(() => {
  if (!props.price || !props.openPrice) return 0;
  return ((props.price - Number(props.openPrice)) / Number(props.openPrice)) * 100;
});

const statusMessage = computed(() => {
  if (priceChange.value < -1.5) return '📈 إشارة شراء قوية';
  if (priceChange.value > 2.5) return '📉 إشارة بيع - جني أرباح';
  return '📊 استقرار - احتفاظ';
});

const statusClass = computed(() => {
  if (priceChange.value < -1.5) return 'badge-success';
  if (priceChange.value > 2.5) return 'badge-danger';
  return 'badge-warning';
});

const statusDotClass = computed(() => {
  if (priceChange.value < -1.5) return 'bg-emerald-400';
  if (priceChange.value > 2.5) return 'bg-red-400';
  return 'bg-amber-400';
});
</script>
