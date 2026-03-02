<template>
  <div class="card p-5">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <span class="text-xl">📡</span>
        <h3 class="font-bold text-white text-sm">{{ lang === 'ar' ? 'إشارات التداول' : 'Trading Signals' }}</h3>
      </div>
      <div class="live-indicator flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 rounded-full">
        <div class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
        <span class="text-[10px] font-semibold text-emerald-400">LIVE</span>
      </div>
    </div>

    <div class="space-y-3">
      <div 
        v-for="signal in signals" 
        :key="signal.id"
        :class="[
          'p-3 rounded-xl border transition-all',
          signal.type === 'buy' ? 'bg-emerald-500/5 border-emerald-500/20' :
          signal.type === 'sell' ? 'bg-red-500/5 border-red-500/20' :
          'bg-amber-500/5 border-amber-500/20'
        ]"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="text-lg">{{ signal.icon }}</span>
            <span class="font-semibold text-white text-sm">{{ signal.metal }}</span>
          </div>
          <span 
            :class="[
              'text-xs font-bold px-2 py-0.5 rounded-full',
              signal.type === 'buy' ? 'bg-emerald-500/20 text-emerald-400' :
              signal.type === 'sell' ? 'bg-red-500/20 text-red-400' :
              'bg-amber-500/20 text-amber-400'
            ]"
          >
            {{ signal.action }}
          </span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-xs text-slate-500">{{ signal.reason }}</span>
          <div class="flex items-center gap-1">
            <div class="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div 
                :class="[
                  'h-full rounded-full transition-all',
                  signal.confidence >= 80 ? 'bg-emerald-500' :
                  signal.confidence >= 60 ? 'bg-amber-500' : 'bg-red-500'
                ]"
                :style="{ width: signal.confidence + '%' }"
              ></div>
            </div>
            <span class="text-xs text-slate-400">{{ signal.confidence }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  goldChange: { type: Number, default: 0 },
  silverChange: { type: Number, default: 0 },
  lang: { type: String, default: 'ar' }
});

const signals = computed(() => {
  const goldSignal = props.goldChange < -1.5 ? 'buy' : props.goldChange > 2 ? 'sell' : 'hold';
  const silverSignal = props.silverChange < -1 ? 'buy' : props.silverChange > 1.5 ? 'sell' : 'hold';

  return [
    {
      id: 1,
      icon: '🥇',
      metal: props.lang === 'ar' ? 'الذهب' : 'Gold',
      type: goldSignal,
      action: goldSignal === 'buy' ? (props.lang === 'ar' ? 'شراء' : 'BUY') :
              goldSignal === 'sell' ? (props.lang === 'ar' ? 'بيع' : 'SELL') :
              (props.lang === 'ar' ? 'احتفاظ' : 'HOLD'),
      reason: goldSignal === 'buy' ? (props.lang === 'ar' ? 'انخفاض مغري للشراء' : 'Attractive dip') :
              goldSignal === 'sell' ? (props.lang === 'ar' ? 'جني أرباح' : 'Take profit') :
              (props.lang === 'ar' ? 'سوق مستقر' : 'Stable market'),
      confidence: goldSignal === 'buy' ? 85 : goldSignal === 'sell' ? 78 : 65
    },
    {
      id: 2,
      icon: '🥈',
      metal: props.lang === 'ar' ? 'الفضة' : 'Silver',
      type: silverSignal,
      action: silverSignal === 'buy' ? (props.lang === 'ar' ? 'شراء' : 'BUY') :
              silverSignal === 'sell' ? (props.lang === 'ar' ? 'بيع' : 'SELL') :
              (props.lang === 'ar' ? 'احتفاظ' : 'HOLD'),
      reason: silverSignal === 'buy' ? (props.lang === 'ar' ? 'فرصة شراء' : 'Buy opportunity') :
              silverSignal === 'sell' ? (props.lang === 'ar' ? 'مستوى مقاومة' : 'Resistance level') :
              (props.lang === 'ar' ? 'انتظار' : 'Wait'),
      confidence: silverSignal === 'buy' ? 82 : silverSignal === 'sell' ? 75 : 60
    }
  ];
});
</script>
