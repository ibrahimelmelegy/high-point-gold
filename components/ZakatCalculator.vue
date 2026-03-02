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

    <!-- Zakat Calculator Card -->
    <div class="card p-6">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
          <span class="text-2xl">🕌</span>
        </div>
        <div>
          <h3 class="font-bold text-white">{{ t('calculator') }}</h3>
          <p class="text-xs text-slate-500">{{ t('nisabInfo') }}</p>
        </div>
      </div>

      <!-- Holdings Input -->
      <div class="space-y-4 mb-6">
        <div>
          <label class="block text-xs text-slate-500 mb-2 font-medium">{{ t('goldAmount') }} ({{ t('gram') }})</label>
          <input 
            v-model.number="goldGrams" 
            type="number" 
            :placeholder="t('enterAmount')"
            class="input w-full"
          />
        </div>

        <div>
          <label class="block text-xs text-slate-500 mb-2 font-medium">{{ t('silverAmount') }} ({{ t('gram') }})</label>
          <input 
            v-model.number="silverGrams" 
            type="number" 
            :placeholder="t('enterAmount')"
            class="input w-full"
          />
        </div>

        <div>
          <label class="block text-xs text-slate-500 mb-2 font-medium">{{ t('cashAmount') }} ({{ currency }})</label>
          <input 
            v-model.number="cashAmount" 
            type="number" 
            :placeholder="t('enterAmount')"
            class="input w-full"
          />
        </div>
      </div>

      <!-- Results -->
      <div class="space-y-4">
        <!-- Total Value -->
        <div class="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)]">
          <p class="text-xs text-slate-500 mb-1">{{ t('totalValue') }}</p>
          <p class="text-2xl font-bold text-white price-display">{{ (totalValue || 0).toLocaleString() }} {{ currency }}</p>
        </div>

        <!-- Nisab Status -->
        <div :class="['p-4 rounded-xl border', nisabMet ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20']">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">{{ nisabMet ? '✅' : '⚠️' }}</span>
            <p class="font-semibold" :class="nisabMet ? 'text-emerald-400' : 'text-amber-400'">
              {{ nisabMet ? t('nisabMet') : t('nisabNotMet') }}
            </p>
          </div>
          <p class="text-xs text-slate-400">{{ t('nisabValue') }}: {{ (nisabValue || 0).toLocaleString() }} {{ currency }}</p>
        </div>

        <!-- Zakat Amount -->
        <div v-if="nisabMet" class="p-5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20">
          <p class="text-xs text-slate-500 mb-2">{{ t('zakatDue') }}</p>
          <p class="text-3xl font-bold text-emerald-400 price-display">{{ (zakatAmount || 0).toLocaleString() }} {{ currency }}</p>
          <p class="text-xs text-slate-400 mt-1">{{ t('zakatPercentage') }}</p>
          
          <div class="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div class="p-2 rounded bg-[var(--bg-card)]">
              <p class="text-slate-500">{{ t('monthlyEquivalent') }}</p>
              <p class="font-semibold text-white">{{ ((zakatAmount || 0) / 12).toFixed(2) }}</p>
            </div>
            <div class="p-2 rounded bg-[var(--bg-card)]">
              <p class="text-slate-500">{{ t('weeklyEquivalent') }}</p>
              <p class="font-semibold text-white">{{ ((zakatAmount || 0) / 52).toFixed(2) }}</p>
            </div>
          </div>
        </div>

        <!-- Set Reminder -->
        <div class="p-4 rounded-xl bg-[var(--bg-tertiary)]">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-semibold text-white">{{ t('annualReminder') }}</span>
            <button
              @click="toggleReminder"
              :class="[
                'relative w-12 h-6 rounded-full transition-all',
                reminderEnabled ? 'bg-emerald-500' : 'bg-slate-600'
              ]"
            >
              <div
                :class="[
                  'absolute top-1 w-4 h-4 bg-white rounded-full transition-all',
                  reminderEnabled ? 'right-1' : 'right-7'
                ]"
              ></div>
            </button>
          </div>
          <input 
            v-if="reminderEnabled"
            v-model="reminderDate" 
            type="date" 
            class="input w-full text-sm"
          />
        </div>
      </div>
    </div>

    <!-- Info Card -->
    <div class="card p-5 bg-blue-500/5 border-blue-500/20">
      <div class="flex gap-3">
        <span class="text-2xl">ℹ️</span>
        <div class="text-sm text-slate-300">
          <p class="font-semibold text-white mb-2">{{ t('infoTitle') }}</p>
          <ul class="space-y-1 text-xs">
            <li>• {{ t('info1') }}</li>
            <li>• {{ t('info2') }}</li>
            <li>• {{ t('info3') }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  goldPrice: { type: Number, default: 0 },
  silverPrice: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  lang: { type: String, default: 'ar' }
});

const goldGrams = ref(0);
const silverGrams = ref(0);
const cashAmount = ref(0);
const reminderEnabled = ref(false);
const reminderDate = ref(new Date().toISOString().split('T')[0]);

const translations = {
  ar: {
    title: 'حاسبة الزكاة',
    desc: 'احسب زكاة الذهب والفضة والأموال',
    calculator: 'حاسبة الزكاة',
    nisabInfo: 'النصاب: 85 جرام ذهب أو 595 جرام فضة',
    goldAmount: 'كمية الذهب',
    silverAmount: 'كمية الفضة',
    cashAmount: 'الأموال النقدية',
    gram: 'جرام',
    enterAmount: 'أدخل الكمية',
    totalValue: 'إجمالي القيمة',
    nisabMet: 'بلغ النصاب - الزكاة واجبة',
    nisabNotMet: 'لم يبلغ النصاب',
    nisabValue: 'قيمة النصاب',
    zakatDue: 'الزكاة الواجبة (2.5%)',
    zakatPercentage: '2.5% من إجمالي القيمة',
    monthlyEquivalent: 'معدل شهري',
    weeklyEquivalent: 'معدل أسبوعي',
    annualReminder: 'تذكير سنوي',
    infoTitle: 'معلومات مهمة',
    info1: 'يجب أن يمر عام هجري كامل على المال',
    info2: 'الزكاة 2.5% من إجمالي الأموال',
    info3: 'النصاب يُحسب بسعر الذهب أو الفضة الأقل'
  },
  en: {
    title: 'Zakat Calculator',
    desc: 'Calculate Zakat for gold, silver and cash',
    calculator: 'Zakat Calculator',
    nisabInfo: 'Nisab: 85g gold or 595g silver',
    goldAmount: 'Gold Amount',
    silverAmount: 'Silver Amount',
    cashAmount: 'Cash Amount',
    gram: 'grams',
    enterAmount: 'Enter amount',
    totalValue: 'Total Value',
    nisabMet: 'Nisab Met - Zakat Required',
    nisabNotMet: 'Nisab Not Met',
    nisabValue: 'Nisab Value',
    zakatDue: 'Zakat Due (2.5%)',
    zakatPercentage: '2.5% of total value',
    monthlyEquivalent: 'Monthly',
    weeklyEquivalent: 'Weekly',
    annualReminder: 'Annual Reminder',
    infoTitle: 'Important Info',
    info1: 'Must pass one Hijri year',
    info2: 'Zakat is 2.5% of total wealth',
    info3: 'Nisab calculated using lower gold/silver price'
  }
};

const t = (key) => translations[props.lang]?.[key] || key;

// Calculate total value
const goldValue = computed(() => goldGrams.value * props.goldPrice);
const silverValue = computed(() => silverGrams.value * (props.silverPrice / 31.1));
const totalValue = computed(() => goldValue.value + silverValue.value + cashAmount.value);

// Nisab calculation (85g gold or 595g silver - whichever is lower)
const goldNisab = computed(() => 85 * props.goldPrice);
const silverNisab = computed(() => 595 * (props.silverPrice / 31.1));
const nisabValue = computed(() => Math.min(goldNisab.value, silverNisab.value));
const nisabMet = computed(() => totalValue.value >= nisabValue.value);

// Zakat amount (2.5%)
const zakatAmount = computed(() => nisabMet.value ? totalValue.value * 0.025 : 0);

const toggleReminder = () => {
  reminderEnabled.value = !reminderEnabled.value;
  saveData();
};

const saveData = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('zakat_data', JSON.stringify({
      goldGrams: goldGrams.value,
      silverGrams: silverGrams.value,
      cashAmount: cashAmount.value,
      reminderEnabled: reminderEnabled.value,
      reminderDate: reminderDate.value
    }));
  }
};

const loadData = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('zakat_data');
    if (saved) {
      const data = JSON.parse(saved);
      goldGrams.value = data.goldGrams || 0;
      silverGrams.value = data.silverGrams || 0;
      cashAmount.value = data.cashAmount || 0;
      reminderEnabled.value = data.reminderEnabled || false;
      reminderDate.value = data.reminderDate || new Date().toISOString().split('T')[0];
    }
  }
};

watch([goldGrams, silverGrams, cashAmount, reminderDate], () => {
  saveData();
});

onMounted(() => {
  loadData();
});
</script>
