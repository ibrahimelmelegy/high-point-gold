<template>
  <div class="card p-6 animate-slide-up" style="animation-delay: 0.1s">
    <!-- Header -->
    <div class="flex justify-between items-start mb-6">
      <div>
        <span class="text-[10px] font-semibold uppercase tracking-widest text-emerald-400">Profit Calculator</span>
        <h2 class="text-xl font-bold text-white mt-1">حاسبة الأرباح</h2>
      </div>
      <div class="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
        <span class="text-xl">💰</span>
      </div>
    </div>

    <!-- Metal Selector -->
    <div class="flex gap-2 mb-5">
      <button 
        @click="selectedMetal = 'gold'"
        :class="[
          'flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all',
          selectedMetal === 'gold' 
            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900' 
            : 'bg-[var(--bg-tertiary)] text-slate-400 border border-[var(--border-primary)] hover:border-amber-500/30'
        ]"
      >
        🥇 ذهب
      </button>
      <button 
        @click="selectedMetal = 'silver'"
        :class="[
          'flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all',
          selectedMetal === 'silver' 
            ? 'bg-gradient-to-r from-slate-400 to-slate-300 text-slate-900' 
            : 'bg-[var(--bg-tertiary)] text-slate-400 border border-[var(--border-primary)] hover:border-slate-400/30'
        ]"
      >
        🥈 فضة
      </button>
    </div>

    <!-- Inputs -->
    <div class="space-y-4">
      <div>
        <label class="block text-xs text-slate-500 mb-2 font-medium">سعر الشراء ({{ currency }}/جرام)</label>
        <input 
          v-model.number="buyPrice" 
          type="number" 
          placeholder="0.00"
          class="input w-full"
        />
      </div>

      <div>
        <label class="block text-xs text-slate-500 mb-2 font-medium">الكمية (جرام)</label>
        <input 
          v-model.number="quantity" 
          type="number" 
          placeholder="0"
          class="input w-full"
        />
      </div>
    </div>

    <!-- Results -->
    <Transition name="slide">
      <div v-if="buyPrice && quantity" class="mt-6">
        <div :class="['p-5 rounded-xl', resultClass]">
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p class="text-xs text-slate-500 mb-1">الاستثمار</p>
              <p class="font-bold text-white">{{ (totalInvestment || 0).toLocaleString() }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-500 mb-1">القيمة الحالية</p>
              <p class="font-bold text-white">{{ (currentValue || 0).toLocaleString() }}</p>
            </div>
          </div>
          
          <div class="pt-4 border-t border-white/10 text-center">
            <p class="text-xs text-slate-500 mb-1">{{ profit >= 0 ? 'الربح' : 'الخسارة' }}</p>
            <p :class="['text-2xl font-black', profit >= 0 ? 'text-emerald-400' : 'text-red-400']">
              {{ profit >= 0 ? '+' : '' }}{{ (profit || 0).toLocaleString() }}
              <span class="text-sm">{{ currency }}</span>
            </p>
            <p :class="['text-sm mt-1', profit >= 0 ? 'text-emerald-400/70' : 'text-red-400/70']">
              ({{ profitPercent >= 0 ? '+' : '' }}{{ profitPercent.toFixed(2) }}%)
            </p>
          </div>
        </div>

        <!-- Recommendation -->
        <div :class="['mt-3 p-3 rounded-xl text-center text-sm font-semibold', recommendationClass]">
          {{ recommendation }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
const props = defineProps({
  currentGoldPrice: { type: Number, default: 0 },
  currentSilverPrice: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' }
});

const selectedMetal = ref('gold');
const buyPrice = ref(null);
const quantity = ref(null);

const currentPrice = computed(() => {
  return selectedMetal.value === 'gold' ? props.currentGoldPrice : props.currentSilverPrice;
});

const totalInvestment = computed(() => (buyPrice.value || 0) * (quantity.value || 0));
const currentValue = computed(() => (currentPrice.value || 0) * (quantity.value || 0));
const profit = computed(() => currentValue.value - totalInvestment.value);
const profitPercent = computed(() => totalInvestment.value ? (profit.value / totalInvestment.value) * 100 : 0);

const resultClass = computed(() => {
  if (profit.value > 0) return 'bg-emerald-500/10 border border-emerald-500/20';
  if (profit.value < 0) return 'bg-red-500/10 border border-red-500/20';
  return 'bg-[var(--bg-tertiary)] border border-[var(--border-primary)]';
});

const recommendation = computed(() => {
  if (profitPercent.value >= 5) return '💎 أرباح ممتازة! فكر في جني الأرباح';
  if (profitPercent.value >= 2) return '📈 أرباح جيدة - راقب السوق';
  if (profitPercent.value >= 0) return '⏳ استمر في الاحتفاظ';
  if (profitPercent.value >= -3) return '📉 خسارة بسيطة - انتظر';
  return '⚠️ خسارة كبيرة - راجع استراتيجيتك';
});

const recommendationClass = computed(() => {
  if (profitPercent.value >= 2) return 'bg-emerald-500/10 text-emerald-400';
  if (profitPercent.value >= 0) return 'bg-amber-500/10 text-amber-400';
  return 'bg-red-500/10 text-red-400';
});
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
