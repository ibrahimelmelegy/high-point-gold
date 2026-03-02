<template>
  <div class="card p-5">
    <div class="flex items-center gap-2 mb-4">
      <span class="text-xl">📊</span>
      <h3 class="font-bold text-white text-sm">{{ lang === 'ar' ? 'نسبة الذهب/الفضة' : 'Gold/Silver Ratio' }}</h3>
    </div>

    <div class="text-center mb-4">
      <span class="price-display text-4xl font-bold text-gradient-gold">{{ (ratio || 0).toFixed(1) }}</span>
      <p class="text-xs text-slate-500 mt-1">{{ lang === 'ar' ? 'أونصة ذهب = ' + (ratio || 0).toFixed(1) + ' أونصة فضة' : '1 oz Gold = ' + (ratio || 0).toFixed(1) + ' oz Silver' }}</p>
    </div>

    <!-- Gauge -->
    <div class="relative h-4 bg-slate-700 rounded-full overflow-hidden mb-3">
      <div 
        class="absolute inset-y-0 right-0 bg-gradient-to-l from-amber-500 to-slate-400 rounded-full transition-all duration-500"
        :style="{ width: gaugeWidth + '%' }"
      ></div>
      <div 
        class="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg transition-all duration-500"
        :style="{ right: gaugeWidth + '%', transform: 'translateY(-50%) translateX(50%)' }"
      ></div>
    </div>

    <div class="flex justify-between text-xs text-slate-500">
      <span>{{ lang === 'ar' ? 'شراء فضة' : 'Buy Silver' }}</span>
      <span>{{ lang === 'ar' ? 'متوازن' : 'Balanced' }}</span>
      <span>{{ lang === 'ar' ? 'شراء ذهب' : 'Buy Gold' }}</span>
    </div>

    <!-- Recommendation -->
    <div :class="['mt-4 p-3 rounded-xl text-center text-sm', recommendationClass]">
      <span class="font-semibold">{{ recommendation }}</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  goldPrice: { type: Number, default: 2650 },
  silverPrice: { type: Number, default: 30 },
  lang: { type: String, default: 'ar' }
});

const ratio = computed(() => {
  if (!props.silverPrice) return 0;
  return props.goldPrice / props.silverPrice;
});

const gaugeWidth = computed(() => {
  // Normal ratio is around 60-80, scale to 0-100
  const normalized = Math.min(100, Math.max(0, ((ratio.value - 40) / 60) * 100));
  return normalized;
});

const recommendation = computed(() => {
  if (ratio.value > 85) {
    return props.lang === 'ar' ? '💰 الفضة مقومة بأقل من قيمتها - فرصة شراء!' : '💰 Silver is undervalued - Buy opportunity!';
  }
  if (ratio.value < 60) {
    return props.lang === 'ar' ? '🥇 الذهب أكثر جاذبية حالياً' : '🥇 Gold is more attractive now';
  }
  return props.lang === 'ar' ? '⚖️ النسبة متوازنة' : '⚖️ Ratio is balanced';
});

const recommendationClass = computed(() => {
  if (ratio.value > 85) return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
  if (ratio.value < 60) return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
  return 'bg-slate-700/50 text-slate-300';
});
</script>
