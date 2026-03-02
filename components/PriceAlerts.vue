<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4 mb-6">
      <button @click="$emit('back')" class="p-2 rounded-lg hover:bg-white/5">
        <span class="text-xl">←</span>
      </button>
      <div>
        <h2 class="text-xl font-bold text-white">{{ t('title') }}</h2>
        <p class="text-sm text-slate-500">{{ t('desc') }}</p>
      </div>
    </div>

    <!-- Add Alert Button -->
    <button @click="showModal = true" class="btn-primary w-full">
      + {{ t('addAlert') }}
    </button>

    <!-- Active Alerts -->
    <div class="space-y-3">
      <div v-for="(alert, idx) in alerts" :key="idx" :class="['card p-5', alert.triggered ? 'border-2 border-emerald-500' : '']">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-3">
            <span class="text-2xl">{{ alert.metal === 'gold' ? '🥇' : '🥈' }}</span>
            <div>
              <p class="font-semibold text-white">{{ alert.metal === 'gold' ? t('gold') : t('silver') }}</p>
              <p class="text-xs text-slate-500">{{ alert.condition }}</p>
            </div>
          </div>
          <button @click="removeAlert(idx)" class="text-slate-500 hover:text-red-400 transition-colors">
            <span class="text-xl">🗑️</span>
          </button>
        </div>

        <div class="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-tertiary)]">
          <div>
            <p class="text-xs text-slate-500 mb-1">{{ t('targetPrice') }}</p>
            <p class="text-xl font-bold text-amber-400 price-display">{{ alert.targetPrice }}</p>
          </div>
          <div class="text-right">
            <p class="text-xs text-slate-500 mb-1">{{ t('current') }}</p>
            <p class="text-lg font-semibold text-white price-display">{{ alert.currentPrice }}</p>
          </div>
        </div>

        <div v-if="alert.triggered" class="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <p class="text-sm font-semibold text-emerald-400 flex items-center gap-2">
            <span>✅</span> {{ t('alertTriggered') }}
          </p>
        </div>
      </div>

      <div v-if="alerts.length === 0" class="text-center py-8 text-slate-500">
        <span class="text-4xl mb-2 block">🔔</span>
        {{ t('noAlerts') }}
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="showModal = false"></div>
          
          <div class="relative bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-bold text-white">{{ t('addAlert') }}</h3>
              <button @click="showModal = false" class="p-2 hover:bg-white/5 rounded-lg">
                <span class="text-xl text-slate-400">✕</span>
              </button>
            </div>

            <div class="space-y-4">
              <!-- Metal -->
              <div>
                <label class="block text-xs text-slate-500 mb-2 font-medium">{{ t('metal') }}</label>
                <div class="flex gap-2">
                  <button 
                    @click="newAlert.metal = 'gold'"
                    :class="[
                      'flex-1 py-3 rounded-xl font-semibold text-sm transition-all',
                      newAlert.metal === 'gold' 
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900' 
                        : 'bg-[var(--bg-tertiary)] text-slate-400 border border-[var(--border-primary)]'
                    ]"
                  >
                    🥇 {{ t('gold') }}
                  </button>
                  <button 
                    @click="newAlert.metal = 'silver'"
                    :class="[
                      'flex-1 py-3 rounded-xl font-semibold text-sm transition-all',
                      newAlert.metal === 'silver' 
                        ? 'bg-gradient-to-r from-slate-400 to-slate-300 text-slate-900' 
                        : 'bg-[var(--bg-tertiary)] text-slate-400 border border-[var(--border-primary)]'
                    ]"
                  >
                    🥈 {{ t('silver') }}
                  </button>
                </div>
              </div>

              <!-- Condition -->
              <div>
                <label class="block text-xs text-slate-500 mb-2 font-medium">{{ t('condition') }}</label>
                <select v-model="newAlert.condition" class="input w-full">
                  <option value="above">{{ t('above') }}</option>
                  <option value="below">{{ t('below') }}</option>
                </select>
              </div>

              <!-- Target Price -->
              <div>
                <label class="block text-xs text-slate-500 mb-2 font-medium">{{ t('targetPrice') }}</label>
                <input 
                  v-model.number="newAlert.targetPrice" 
                  type="number" 
                  :placeholder="t('enterPrice')"
                  class="input w-full"
                />
              </div>

              <!-- Notifications -->
              <div class="space-y-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input v-model="newAlert.browserNotif" type="checkbox" class="w-4 h-4 rounded bg-[var(--bg-tertiary)] border-[var(--border-primary)]" />
                  <span class="text-sm text-slate-300">{{ t('browserNotif') }}</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input v-model="newAlert.sound" type="checkbox" class="w-4 h-4 rounded bg-[var(--bg-tertiary)] border-[var(--border-primary)]" />
                  <span class="text-sm text-slate-300">{{ t('sound') }}</span>
                </label>
              </div>

              <!-- Buttons -->
              <div class="flex gap-3 pt-2">
                <button @click="showModal = false" class="btn-secondary flex-1">
                  {{ t('cancel') }}
                </button>
                <button 
                  @click="addAlert" 
                  :disabled="!newAlert.targetPrice"
                  class="btn-primary flex- disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ t('create') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
const props = defineProps({
  goldPrice: { type: Number, default: 0 },
  silverPrice: { type: Number, default: 0 },
  lang: { type: String, default: 'ar' }
});

const showModal = ref(false);
const alerts = ref([]);

const newAlert = ref({
  metal: 'gold',
  condition: 'above',
  targetPrice: null,
  browserNotif: true,
  sound: true
});

const translations = {
  ar: {
    title: 'تنبيهات الأسعار',
    desc: 'احصل على تنبيه فوري عند الوصول للسعر المستهدف',
    addAlert: 'إضافة تنبيه',
    gold: 'ذهب',
    silver: 'فضة',
    targetPrice: 'السعر المستهدف',
    current: 'الحالي',
    alertTriggered: 'تم الوصول للسعر المستهدف!',
    noAlerts: 'لا توجد تنبيهات نشطة',
    metal: 'المعدن',
    condition: 'الشرط',
    above: 'أعلى من',
    below: 'أقل من',
    enterPrice: 'أدخل السعر',
    browserNotif: 'تنبيه المتصفح',
    sound: 'تنبيه صوتي',
    cancel: 'إلغاء',
    create: 'إنشاء'
  },
  en: {
    title: 'Price Alerts',
    desc: 'Get instant notification when target price is reached',
    addAlert: 'Add Alert',
    gold: 'Gold',
    silver: 'Silver',
    targetPrice: 'Target Price',
    current: 'Current',
    alertTriggered: 'Target price reached!',
    noAlerts: 'No active alerts',
    metal: 'Metal',
    condition: 'Condition',
    above: 'Above',
    below: 'Below',
    enterPrice: 'Enter price',
    browserNotif: 'Browser Notification',
    sound: 'Sound Alert',
    cancel: 'Cancel',
    create: 'Create'
  }
};

const t = (key) => translations[props.lang]?.[key] || key;

const addAlert = () => {
  if (!newAlert.value.targetPrice) return;
  
  alerts.value.push({
    metal: newAlert.value.metal,
    condition: newAlert.value.condition,
    targetPrice: newAlert.value.targetPrice,
    currentPrice: newAlert.value.metal === 'gold' ? props.goldPrice : props.silverPrice,
    browserNotif: newAlert.value.browserNotif,
    sound: newAlert.value.sound,
    triggered: false
  });
  
  saveAlerts();
  
  newAlert.value = {
    metal: 'gold',
    condition: 'above',
    targetPrice: null,
    browserNotif: true,
    sound: true
  };
  
  showModal.value = false;
};

const removeAlert = (idx) => {
  alerts.value.splice(idx, 1);
  saveAlerts();
};

const checkAlerts = () => {
  alerts.value.forEach(alert => {
    alert.currentPrice = alert.metal === 'gold' ? props.goldPrice : props.silverPrice;
    
    const triggered = alert.condition === 'above' 
      ? alert.currentPrice >= alert.targetPrice 
      : alert.currentPrice <= alert.targetPrice;
    
    if (triggered && !alert.triggered) {
      alert.triggered = true;
      
      if (alert.browserNotif && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('High Point Gold', {
          body: `${alert.metal === 'gold' ? 'الذهب' : 'الفضة'} وصل ${alert.targetPrice}`,
          icon: '/icons/icon-192x192.png'
        });
      }
      
      if (alert.sound) {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(() => {});
      }
      
      saveAlerts();
    }
  });
};

const saveAlerts = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('price_alerts', JSON.stringify(alerts.value));
  }
};

const loadAlerts = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('price_alerts');
    if (saved) {
      try { alerts.value = JSON.parse(saved); } catch {}
    }
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
};

watch([() => props.goldPrice, () => props.silverPrice], () => {
  checkAlerts();
});

onMounted(() => {
  loadAlerts();
  checkAlerts();
});
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
