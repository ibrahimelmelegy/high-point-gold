<template>
  <div class="card p-6 animate-slide-up" style="animation-delay: 0.15s">
    <!-- Header -->
    <div class="flex justify-between items-start mb-6">
      <div>
        <span class="text-[10px] font-semibold uppercase tracking-widest text-green-400">WhatsApp Alerts</span>
        <h2 class="text-xl font-bold text-white mt-1">تنبيهات واتساب</h2>
      </div>
      <div class="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20">
        <span class="text-xl">📱</span>
      </div>
    </div>

    <!-- Phone Input -->
    <div class="mb-5">
      <label class="block text-xs text-slate-500 mb-2 font-medium">رقم واتساب (مع رمز الدولة)</label>
      <input 
        v-model="phoneNumber" 
        type="tel" 
        placeholder="966501234567"
        dir="ltr"
        class="input w-full text-left"
      />
    </div>

    <!-- Status Toggle -->
    <div class="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] mb-5">
      <div class="flex items-center gap-3">
        <div :class="['w-2.5 h-2.5 rounded-full', isEnabled ? 'bg-green-400 animate-pulse' : 'bg-slate-600']"></div>
        <span class="text-sm text-slate-300">{{ isEnabled ? 'التنبيهات مفعلة' : 'التنبيهات معطلة' }}</span>
      </div>
      <button 
        @click="toggleAlerts"
        :class="[
          'px-4 py-1.5 rounded-lg text-sm font-semibold transition-all',
          isEnabled 
            ? 'bg-green-500 text-white' 
            : 'bg-[var(--bg-card)] text-slate-400 border border-[var(--border-primary)] hover:border-green-500/30'
        ]"
      >
        {{ isEnabled ? 'إيقاف' : 'تفعيل' }}
      </button>
    </div>

    <!-- Quick Send Buttons -->
    <div class="space-y-3">
      <p class="text-xs text-slate-500 font-medium">إرسال تنبيه فوري:</p>
      
      <button 
        @click="sendAlert('gold')"
        :disabled="!phoneNumber"
        class="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>🥇</span> سعر الذهب
      </button>

      <button 
        @click="sendAlert('silver')"
        :disabled="!phoneNumber"
        class="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all bg-gradient-to-r from-slate-400 to-slate-300 text-slate-900 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>🥈</span> سعر الفضة
      </button>

      <button 
        @click="sendAlert('both')"
        :disabled="!phoneNumber"
        class="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>📊</span> تقرير كامل
      </button>
    </div>

    <p class="text-[10px] text-slate-600 text-center mt-4">سيتم فتح واتساب مع رسالة جاهزة</p>
  </div>
</template>

<script setup>
const props = defineProps({
  goldPrice: { type: Number, default: 0 },
  silverPrice: { type: Number, default: 0 },
  goldAdvice: { type: String, default: '' },
  silverAdvice: { type: String, default: '' },
  currency: { type: String, default: 'USD' }
});

const phoneNumber = ref('');
const isEnabled = ref(false);

watch(phoneNumber, (val) => {
  if (typeof window !== 'undefined') localStorage.setItem('whatsapp_number', val);
});

onMounted(() => {
  if (typeof window !== 'undefined') {
    phoneNumber.value = localStorage.getItem('whatsapp_number') || '';
    isEnabled.value = localStorage.getItem('whatsapp_enabled') === 'true';
  }
});

const toggleAlerts = () => {
  isEnabled.value = !isEnabled.value;
  if (typeof window !== 'undefined') localStorage.setItem('whatsapp_enabled', String(isEnabled.value));
};

const sendAlert = (type) => {
  if (!phoneNumber.value) return;

  const now = new Date().toLocaleString('ar-SA');
  let msg = `🏆 *هاي بوينت جولد*\n📅 ${now}\n\n`;

  if (type === 'gold' || type === 'both') {
    msg += `🥇 *الذهب*: ${props.goldPrice?.toLocaleString()} ${props.currency}/جرام\n📊 ${props.goldAdvice}\n\n`;
  }
  if (type === 'silver' || type === 'both') {
    msg += `🥈 *الفضة*: ${props.silverPrice?.toLocaleString()} ${props.currency}/جرام\n📊 ${props.silverAdvice}\n\n`;
  }

  msg += `━━━━━━━━━━━━━━━\nمن منصة هاي بوينت جولد`;

  const url = `https://wa.me/${phoneNumber.value.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
};
</script>
