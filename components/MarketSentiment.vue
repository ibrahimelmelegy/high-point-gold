<template>
  <div class="card p-5">
    <div class="flex items-center gap-2 mb-4">
      <span class="text-xl">🌍</span>
      <h3 class="font-bold text-white text-sm">{{ lang === 'ar' ? 'معنويات السوق' : 'Market Sentiment' }}</h3>
    </div>

    <!-- Sentiment Gauge -->
    <div class="relative mb-4">
      <div class="flex justify-between text-xs text-slate-500 mb-2">
        <span>{{ lang === 'ar' ? 'خوف شديد' : 'Extreme Fear' }}</span>
        <span>{{ lang === 'ar' ? 'جشع شديد' : 'Extreme Greed' }}</span>
      </div>
      
      <div class="h-3 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 relative">
        <div 
          class="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-slate-800 transition-all duration-500"
          :style="{ left: sentiment + '%', transform: 'translateY(-50%) translateX(-50%)' }"
        ></div>
      </div>
    </div>

    <!-- Sentiment Value -->
    <div class="text-center mb-4">
      <span :class="['text-3xl font-bold', sentimentColor]">{{ sentiment }}</span>
      <p :class="['text-sm font-semibold', sentimentColor]">{{ sentimentLabel }}</p>
    </div>

    <!-- Indicators -->
    <div class="grid grid-cols-2 gap-3">
      <div class="p-3 rounded-xl bg-[var(--bg-tertiary)]">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-emerald-400">📈</span>
          <span class="text-xs text-slate-500">{{ lang === 'ar' ? 'مشترون' : 'Buyers' }}</span>
        </div>
        <p class="font-bold text-emerald-400">{{ buyers }}%</p>
      </div>
      <div class="p-3 rounded-xl bg-[var(--bg-tertiary)]">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-red-400">📉</span>
          <span class="text-xs text-slate-500">{{ lang === 'ar' ? 'بائعون' : 'Sellers' }}</span>
        </div>
        <p class="font-bold text-red-400">{{ sellers }}%</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  goldChange: { type: Number, default: 0 },
  lang: { type: String, default: 'ar' }
});

// Simulate sentiment based on price change
const sentiment = computed(() => {
  const base = 50 + (props.goldChange * 10);
  return Math.min(100, Math.max(0, Math.round(base)));
});

const buyers = computed(() => Math.round(50 + (props.goldChange * 5)));
const sellers = computed(() => 100 - buyers.value);

const sentimentLabel = computed(() => {
  if (sentiment.value >= 80) return props.lang === 'ar' ? 'جشع شديد' : 'Extreme Greed';
  if (sentiment.value >= 60) return props.lang === 'ar' ? 'جشع' : 'Greed';
  if (sentiment.value >= 40) return props.lang === 'ar' ? 'محايد' : 'Neutral';
  if (sentiment.value >= 20) return props.lang === 'ar' ? 'خوف' : 'Fear';
  return props.lang === 'ar' ? 'خوف شديد' : 'Extreme Fear';
});

const sentimentColor = computed(() => {
  if (sentiment.value >= 60) return 'text-emerald-400';
  if (sentiment.value >= 40) return 'text-amber-400';
  return 'text-red-400';
});
</script>
