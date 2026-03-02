<template>
  <div class="card p-5">
    <div class="flex items-center gap-2 mb-4">
      <span class="text-xl">💼</span>
      <h3 class="font-bold text-white text-sm">{{ t('title') }}</h3>
    </div>

    <!-- Total Value -->
    <div class="bg-gradient-to-r from-amber-500/10 to-transparent p-4 rounded-xl mb-4">
      <p class="text-xs text-slate-500 mb-1">{{ t('totalValue') }}</p>
      <p class="text-2xl font-bold text-white price-display">{{ (totalValue || 0).toLocaleString() }} <span class="text-sm text-slate-400">{{ currency }}</span></p>
      <p :class="['text-sm font-semibold', totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400']">
        {{ totalProfit >= 0 ? '+' : '' }}{{ (totalProfit || 0).toLocaleString() }} ({{ (totalProfitPercent || 0).toFixed(2) }}%)
      </p>
    </div>

    <!-- Holdings -->
    <div class="space-y-3 max-h-48 overflow-y-auto">
      <div v-for="(holding, idx) in holdings" :key="idx" class="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-tertiary)]">
        <div class="flex items-center gap-3">
          <span class="text-xl">{{ holding.type === 'gold' ? '🥇' : '🥈' }}</span>
          <div>
            <p class="font-semibold text-white text-sm">{{ holding.type === 'gold' ? t('gold') : t('silver') }}</p>
            <p class="text-xs text-slate-500">{{ holding.amount }} {{ t('gram') }}</p>
          </div>
        </div>
        <div class="text-right">
          <p class="font-semibold text-white text-sm">{{ (holding.currentValue || 0).toLocaleString() }}</p>
          <p :class="['text-xs', holding.profit >= 0 ? 'text-emerald-400' : 'text-red-400']">
            {{ holding.profit >= 0 ? '+' : '' }}{{ (holding.profitPercent || 0).toFixed(2) }}%
          </p>
        </div>
      </div>

      <div v-if="holdings.length === 0" class="text-center py-4 text-slate-500 text-sm">
        {{ t('noHoldings') }}
      </div>
    </div>

    <!-- Add Button -->
    <button @click="showModal = true" class="w-full mt-4 py-3 rounded-xl border border-dashed border-slate-600 text-slate-400 hover:border-amber-500 hover:text-amber-400 transition-all text-sm font-semibold">
      + {{ t('addInvestment') }}
    </button>

    <!-- Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="showModal = false"></div>
          
          <!-- Modal Content -->
          <div class="relative bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-bold text-white">{{ t('addInvestment') }}</h3>
              <button @click="showModal = false" class="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <span class="text-xl text-slate-400">✕</span>
              </button>
            </div>

            <div class="space-y-4">
              <!-- Metal Type -->
              <div>
                <label class="block text-xs text-slate-500 mb-2 font-medium">{{ t('metalType') }}</label>
                <div class="flex gap-2">
                  <button 
                    @click="newHolding.type = 'gold'"
                    :class="[
                      'flex-1 py-3 rounded-xl font-semibold text-sm transition-all',
                      newHolding.type === 'gold' 
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900' 
                        : 'bg-[var(--bg-tertiary)] text-slate-400 border border-[var(--border-primary)]'
                    ]"
                  >
                    🥇 {{ t('gold') }}
                  </button>
                  <button 
                    @click="newHolding.type = 'silver'"
                    :class="[
                      'flex-1 py-3 rounded-xl font-semibold text-sm transition-all',
                      newHolding.type === 'silver' 
                        ? 'bg-gradient-to-r from-slate-400 to-slate-300 text-slate-900' 
                        : 'bg-[var(--bg-tertiary)] text-slate-400 border border-[var(--border-primary)]'
                    ]"
                  >
                    🥈 {{ t('silver') }}
                  </button>
                </div>
              </div>

              <!-- Amount -->
              <div>
                <label class="block text-xs text-slate-500 mb-2 font-medium">{{ t('amount') }} ({{ t('gram') }})</label>
                <input 
                  v-model.number="newHolding.amount" 
                  type="number" 
                  :placeholder="t('enterAmount')"
                  class="input w-full"
                />
              </div>

              <!-- Buy Price -->
              <div>
                <label class="block text-xs text-slate-500 mb-2 font-medium">{{ t('buyPrice') }} ({{ currency }}/{{ t('gram') }})</label>
                <input 
                  v-model.number="newHolding.buyPrice" 
                  type="number" 
                  :placeholder="t('enterPrice')"
                  class="input w-full"
                />
              </div>

              <!-- Buy Date -->
              <div>
                <label class="block text-xs text-slate-500 mb-2 font-medium">{{ t('buyDate') }}</label>
                <input 
                  v-model="newHolding.date" 
                  type="date" 
                  class="input w-full"
                />
              </div>

              <!-- Preview -->
              <div v-if="newHolding.amount && newHolding.buyPrice" class="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)]">
                <p class="text-xs text-slate-500 mb-2">{{ t('preview') }}</p>
                <div class="flex justify-between">
                  <span class="text-sm text-slate-400">{{ t('totalCost') }}:</span>
                  <span class="font-semibold text-white">{{ (newHolding.amount * newHolding.buyPrice || 0).toLocaleString() }} {{ currency }}</span>
                </div>
                <div class="flex justify-between mt-1">
                  <span class="text-sm text-slate-400">{{ t('currentValue') }}:</span>
                  <span class="font-semibold text-white">{{ (currentPreviewValue || 0).toLocaleString() }} {{ currency }}</span>
                </div>
                <div class="flex justify-between mt-1">
                  <span class="text-sm text-slate-400">{{ t('profitLoss') }}:</span>
                  <span :class="['font-semibold', previewProfit >= 0 ? 'text-emerald-400' : 'text-red-400']">
                    {{ previewProfit >= 0 ? '+' : '' }}{{ (previewProfit || 0).toLocaleString() }} {{ currency }}
                  </span>
                </div>
              </div>

              <!-- Buttons -->
              <div class="flex gap-3 pt-2">
                <button @click="showModal = false" class="btn-secondary flex-1">
                  {{ t('cancel') }}
                </button>
                <button 
                  @click="addHolding" 
                  :disabled="!newHolding.amount || !newHolding.buyPrice"
                  class="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ t('add') }}
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
  currency: { type: String, default: 'USD' },
  lang: { type: String, default: 'ar' }
});

const showModal = ref(false);
const holdings = ref([]);

const newHolding = ref({
  type: 'gold',
  amount: null,
  buyPrice: null,
  date: new Date().toISOString().split('T')[0]
});

const translations = {
  ar: {
    title: 'محفظتي',
    totalValue: 'إجمالي القيمة',
    gold: 'ذهب 24K',
    silver: 'فضة',
    gram: 'جرام',
    addInvestment: 'إضافة استثمار',
    noHoldings: 'لا توجد استثمارات بعد',
    metalType: 'نوع المعدن',
    amount: 'الكمية',
    enterAmount: 'أدخل الكمية',
    buyPrice: 'سعر الشراء',
    enterPrice: 'أدخل السعر',
    buyDate: 'تاريخ الشراء',
    preview: 'معاينة',
    totalCost: 'إجمالي التكلفة',
    currentValue: 'القيمة الحالية',
    profitLoss: 'الربح/الخسارة',
    cancel: 'إلغاء',
    add: 'إضافة'
  },
  en: {
    title: 'My Portfolio',
    totalValue: 'Total Value',
    gold: 'Gold 24K',
    silver: 'Silver',
    gram: 'gram',
    addInvestment: 'Add Investment',
    noHoldings: 'No investments yet',
    metalType: 'Metal Type',
    amount: 'Amount',
    enterAmount: 'Enter amount',
    buyPrice: 'Buy Price',
    enterPrice: 'Enter price',
    buyDate: 'Buy Date',
    preview: 'Preview',
    totalCost: 'Total Cost',
    currentValue: 'Current Value',
    profitLoss: 'Profit/Loss',
    cancel: 'Cancel',
    add: 'Add'
  }
};

const t = (key) => translations[props.lang]?.[key] || key;

// Load holdings from localStorage
onMounted(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('portfolio_holdings');
    if (saved) {
      holdings.value = JSON.parse(saved);
    }
  }
});

// Save holdings to localStorage
const saveHoldings = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('portfolio_holdings', JSON.stringify(holdings.value));
  }
};

// Get current price per gram based on type
const getCurrentPrice = (type) => {
  return type === 'gold' ? props.goldPrice : (props.silverPrice / 31.1);
};

// Calculate holdings with current values
const holdingsWithValues = computed(() => {
  return holdings.value.map(h => {
    const currentPrice = getCurrentPrice(h.type);
    const currentValue = h.amount * currentPrice;
    const totalCost = h.amount * h.buyPrice;
    const profit = currentValue - totalCost;
    const profitPercent = totalCost > 0 ? (profit / totalCost) * 100 : 0;
    return { ...h, currentValue, totalCost, profit, profitPercent };
  });
});

const totalValue = computed(() => holdingsWithValues.value.reduce((sum, h) => sum + h.currentValue, 0));
const totalCost = computed(() => holdingsWithValues.value.reduce((sum, h) => sum + h.totalCost, 0));
const totalProfit = computed(() => totalValue.value - totalCost.value);
const totalProfitPercent = computed(() => totalCost.value > 0 ? (totalProfit.value / totalCost.value) * 100 : 0);

// Preview calculations
const currentPreviewValue = computed(() => {
  if (!newHolding.value.amount) return 0;
  return newHolding.value.amount * getCurrentPrice(newHolding.value.type);
});

const previewProfit = computed(() => {
  if (!newHolding.value.amount || !newHolding.value.buyPrice) return 0;
  return currentPreviewValue.value - (newHolding.value.amount * newHolding.value.buyPrice);
});

// Add new holding
const addHolding = () => {
  if (!newHolding.value.amount || !newHolding.value.buyPrice) return;
  
  holdings.value.push({
    type: newHolding.value.type,
    amount: newHolding.value.amount,
    buyPrice: newHolding.value.buyPrice,
    date: newHolding.value.date
  });
  
  saveHoldings();
  
  // Reset form
  newHolding.value = {
    type: 'gold',
    amount: null,
    buyPrice: null,
    date: new Date().toISOString().split('T')[0]
  };
  
  showModal.value = false;
};
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

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.9);
}
</style>
