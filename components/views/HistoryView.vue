<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h2 class="text-xl font-bold text-white">{{ t('history') }}</h2>
      <p class="text-sm text-slate-500">{{ t('historyDesc') }}</p>
    </div>

    <!-- Time Range Selector -->
    <div class="flex gap-2">
      <button 
        v-for="range in timeRanges" 
        :key="range.id"
        @click="selectedRange = range.id"
        :class="[
          'px-4 py-2 rounded-xl text-sm font-semibold transition-all',
          selectedRange === range.id 
            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900' 
            : 'bg-[var(--bg-tertiary)] text-slate-400 border border-[var(--border-primary)] hover:border-amber-500/30'
        ]"
      >
        {{ range.label }}
      </button>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card card-gold p-6">
        <div class="flex items-center gap-3 mb-4">
          <span class="text-xl">🥇</span>
          <h3 class="font-bold text-white">{{ t('goldHistory') }}</h3>
        </div>
        <div class="chart-container">
          <PriceChart :data="goldChartData" :labels="chartLabels" label="Gold" color="#f59e0b" />
        </div>
      </div>

      <div class="card card-silver p-6">
        <div class="flex items-center gap-3 mb-4">
          <span class="text-xl">🥈</span>
          <h3 class="font-bold text-white">{{ t('silverHistory') }}</h3>
        </div>
        <div class="chart-container">
          <PriceChart :data="silverChartData" :labels="chartLabels" label="Silver" color="#94a3b8" />
        </div>
      </div>
    </div>

    <!-- History Table -->
    <div class="card p-6">
      <h3 class="font-bold text-white mb-4">{{ t('priceTable') }}</h3>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-[var(--border-primary)]">
              <th class="text-right text-xs text-slate-500 font-semibold py-3">{{ t('date') }}</th>
              <th class="text-right text-xs text-slate-500 font-semibold py-3">{{ t('goldPrice') }}</th>
              <th class="text-right text-xs text-slate-500 font-semibold py-3">{{ t('silverPrice') }}</th>
              <th class="text-right text-xs text-slate-500 font-semibold py-3">{{ t('change') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in historyData" :key="row.date" class="border-b border-[var(--border-secondary)]">
              <td class="py-3 text-sm text-slate-300">{{ row.date }}</td>
              <td class="py-3 text-sm text-amber-400 font-semibold price-display">{{ row.gold }}</td>
              <td class="py-3 text-sm text-slate-300 price-display">{{ row.silver }}</td>
              <td class="py-3">
                <span :class="['text-sm font-semibold', row.change >= 0 ? 'text-emerald-400' : 'text-red-400']">
                  {{ row.change >= 0 ? '+' : '' }}{{ row.change }}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  goldData: Array,
  silverData: Array,
  lang: { type: String, default: 'ar' }
});

const selectedRange = ref('7d');

const timeRanges = [
  { id: '24h', label: '24H' },
  { id: '7d', label: '7D' },
  { id: '30d', label: '30D' },
  { id: '90d', label: '90D' }
];

const translations = {
  ar: {
    history: 'السجل التاريخي',
    historyDesc: 'تتبع تغيرات الأسعار على مدار الوقت',
    goldHistory: 'تاريخ الذهب',
    silverHistory: 'تاريخ الفضة',
    priceTable: 'جدول الأسعار',
    date: 'التاريخ',
    goldPrice: 'الذهب',
    silverPrice: 'الفضة',
    change: 'التغير'
  },
  en: {
    history: 'Price History',
    historyDesc: 'Track price changes over time',
    goldHistory: 'Gold History',
    silverHistory: 'Silver History',
    priceTable: 'Price Table',
    date: 'Date',
    goldPrice: 'Gold',
    silverPrice: 'Silver',
    change: 'Change'
  }
};

const t = (key) => translations[props.lang]?.[key] || key;

const chartLabels = computed(() => {
  const days = selectedRange.value === '24h' ? 24 : selectedRange.value === '7d' ? 7 : selectedRange.value === '30d' ? 30 : 90;
  return Array.from({ length: Math.min(days, 10) }, (_, i) => `${i + 1}`);
});

const goldChartData = computed(() => props.goldData || [2650, 2680, 2670, 2700, 2690, 2720, 2710]);
const silverChartData = computed(() => props.silverData || [30, 30.5, 30.2, 31, 30.8, 31.2, 31]);

const historyData = [
  { date: '2026-02-01', gold: '2,654.00', silver: '30.04', change: 0.5 },
  { date: '2026-01-31', gold: '2,641.00', silver: '29.85', change: -0.3 },
  { date: '2026-01-30', gold: '2,649.00', silver: '30.12', change: 1.2 },
  { date: '2026-01-29', gold: '2,617.00', silver: '29.76', change: -0.8 },
  { date: '2026-01-28', gold: '2,638.00', silver: '30.00', change: 0.6 }
];
</script>
