<template>
  <div class="card p-5">
    <div class="flex items-center gap-2 mb-4">
      <span class="text-xl">⏰</span>
      <h3 class="font-bold text-white text-sm">{{ lang === 'ar' ? 'ساعات السوق' : 'Market Hours' }}</h3>
    </div>

    <div class="space-y-3">
      <div v-for="market in markets" :key="market.name" class="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-tertiary)]">
        <div class="flex items-center gap-3">
          <span class="text-xl">{{ market.flag }}</span>
          <div>
            <p class="font-semibold text-white text-sm">{{ market.name }}</p>
            <p class="text-xs text-slate-500">{{ market.time }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div :class="['w-2 h-2 rounded-full', market.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400']"></div>
          <span :class="['text-xs font-semibold', market.isOpen ? 'text-emerald-400' : 'text-red-400']">
            {{ market.isOpen ? (lang === 'ar' ? 'مفتوح' : 'Open') : (lang === 'ar' ? 'مغلق' : 'Closed') }}
          </span>
        </div>
      </div>
    </div>

    <!-- Next Opening -->
    <div class="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
      <p class="text-xs text-slate-400 mb-1">{{ lang === 'ar' ? 'افتتاح طوكيو بعد' : 'Tokyo opens in' }}</p>
      <p class="font-bold text-amber-400">{{ nextOpen }}</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  lang: { type: String, default: 'ar' }
});

const now = new Date();
const hour = now.getUTCHours();

const markets = computed(() => [
  {
    name: props.lang === 'ar' ? 'لندن' : 'London',
    flag: '🇬🇧',
    time: '08:00 - 17:00 GMT',
    isOpen: hour >= 8 && hour < 17
  },
  {
    name: props.lang === 'ar' ? 'نيويورك' : 'New York',
    flag: '🇺🇸',
    time: '13:00 - 22:00 GMT',
    isOpen: hour >= 13 && hour < 22
  },
  {
    name: props.lang === 'ar' ? 'طوكيو' : 'Tokyo',
    flag: '🇯🇵',
    time: '00:00 - 09:00 GMT',
    isOpen: hour >= 0 && hour < 9
  },
  {
    name: props.lang === 'ar' ? 'سيدني' : 'Sydney',
    flag: '🇦🇺',
    time: '22:00 - 07:00 GMT',
    isOpen: hour >= 22 || hour < 7
  }
]);

const nextOpen = computed(() => {
  // Simplified next opening calculation
  return props.lang === 'ar' ? '2 ساعة 30 دقيقة' : '2h 30m';
});
</script>
