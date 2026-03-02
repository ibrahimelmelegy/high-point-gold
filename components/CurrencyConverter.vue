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
      <span v-if="rates" class="ml-auto text-xs text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-full">
        ✓ Live Rates
      </span>
    </div>

    <!-- Converter Card -->
    <div class="card p-6">
      <!-- From Amount -->
      <div class="mb-4">
        <label class="block text-xs text-slate-400 mb-2">{{ t('from') }}</label>
        <div class="flex gap-2">
          <input 
            v-model.number="amount"
            type="number"
            class="input flex-1 text-xl font-bold"
            placeholder="0.00"
            @input="convert"
          />
          <select v-model="fromCurrency" @change="convert" class="input w-28 text-center font-bold">
            <option v-for="curr in currencies" :key="curr.code" :value="curr.code">
              {{ curr.flag }} {{ curr.code }}
            </option>
          </select>
        </div>
      </div>

      <!-- Swap Button -->
      <div class="flex justify-center my-4">
        <button @click="swap" class="p-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 transition-all">
          <span class="text-lg">🔄</span>
        </button>
      </div>

      <!-- To Amount -->
      <div class="mb-4">
        <label class="block text-xs text-slate-400 mb-2">{{ t('to') }}</label>
        <div class="flex gap-2">
          <input 
            :value="result.toFixed(2)"
            type="text"
            readonly
            class="input flex-1 text-xl font-bold bg-emerald-500/10 text-emerald-400"
          />
          <select v-model="toCurrency" @change="convert" class="input w-28 text-center font-bold">
            <option v-for="curr in currencies" :key="curr.code" :value="curr.code">
              {{ curr.flag }} {{ curr.code }}
            </option>
          </select>
        </div>
      </div>

      <!-- Exchange Rate Info -->
      <div class="p-4 rounded-xl bg-[var(--bg-tertiary)] mt-4">
        <div class="flex items-center justify-between">
          <span class="text-sm text-slate-400">{{ t('rate') }}</span>
          <span class="font-bold text-white">
            1 {{ fromCurrency }} = {{ currentRate.toFixed(4) }} {{ toCurrency }}
          </span>
        </div>
        <p v-if="loading" class="text-xs text-amber-400 mt-2 animate-pulse">{{ t('loading') }}</p>
      </div>
    </div>

    <!-- Popular Pairs -->
    <div class="card p-5">
      <h3 class="font-semibold text-white mb-4">{{ t('popular') }}</h3>
      <div class="grid grid-cols-2 gap-3">
        <button 
          v-for="pair in popularPairs" 
          :key="pair.from + pair.to"
          @click="selectPair(pair)"
          class="p-3 rounded-xl bg-[var(--bg-tertiary)] hover:bg-purple-500/10 border border-[var(--border-primary)] transition-all text-start"
        >
          <p class="text-sm font-semibold text-white">{{ pair.from }}/{{ pair.to }}</p>
          <p class="text-xs text-slate-400">{{ pair.flag }}</p>
        </button>
      </div>
    </div>

    <!-- All Rates Table -->
    <div class="card p-5">
      <h3 class="font-semibold text-white mb-4">{{ t('allRates') }}</h3>
      <div class="space-y-2">
        <div 
          v-for="curr in currencies.filter(c => c.code !== fromCurrency)" 
          :key="curr.code"
          class="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-tertiary)]"
        >
          <div class="flex items-center gap-2">
            <span class="text-lg">{{ curr.flag }}</span>
            <span class="text-sm font-semibold text-white">{{ curr.code }}</span>
            <span class="text-xs text-slate-500">{{ curr.name }}</span>
          </div>
          <span class="font-bold text-emerald-400">
            {{ rates?.[curr.code]?.toFixed(4) || '---' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  lang: { type: String, default: 'ar' }
})

const amount = ref(100)
const fromCurrency = ref('USD')
const toCurrency = ref('SAR')
const result = ref(375)
const currentRate = ref(3.75)
const loading = ref(false)
const rates = ref(null)

const currencies = [
  { code: 'USD', flag: '🇺🇸', name: 'US Dollar' },
  { code: 'SAR', flag: '🇸🇦', name: 'Saudi Riyal' },
  { code: 'AED', flag: '🇦🇪', name: 'UAE Dirham' },
  { code: 'EGP', flag: '🇪🇬', name: 'Egyptian Pound' },
  { code: 'EUR', flag: '🇪🇺', name: 'Euro' },
  { code: 'GBP', flag: '🇬🇧', name: 'British Pound' },
  { code: 'KWD', flag: '🇰🇼', name: 'Kuwaiti Dinar' }
]

const popularPairs = [
  { from: 'USD', to: 'SAR', flag: '🇺🇸 → 🇸🇦' },
  { from: 'USD', to: 'EGP', flag: '🇺🇸 → 🇪🇬' },
  { from: 'EUR', to: 'SAR', flag: '🇪🇺 → 🇸🇦' },
  { from: 'GBP', to: 'SAR', flag: '🇬🇧 → 🇸🇦' }
]

const convert = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/exchange-rate', {
      query: {
        from: fromCurrency.value,
        to: toCurrency.value,
        amount: amount.value
      }
    })
    
    if (response.result !== undefined) {
      result.value = response.result
      currentRate.value = response.rate
      rates.value = response.rates
    }
  } catch (error) {
    console.error('Failed to fetch exchange rate:', error)
  } finally {
    loading.value = false
  }
}

const swap = () => {
  const temp = fromCurrency.value
  fromCurrency.value = toCurrency.value
  toCurrency.value = temp
  convert()
}

const selectPair = (pair) => {
  fromCurrency.value = pair.from
  toCurrency.value = pair.to
  convert()
}

const translations = {
  ar: {
    title: 'تحويل العملات',
    desc: 'أسعار صرف حقيقية ومباشرة',
    from: 'من',
    to: 'إلى',
    rate: 'سعر الصرف',
    loading: 'جاري تحديث الأسعار...',
    popular: 'أزواج شائعة',
    allRates: 'جميع الأسعار'
  },
  en: {
    title: 'Currency Converter',
    desc: 'Real-time exchange rates',
    from: 'From',
    to: 'To',
    rate: 'Exchange Rate',
    loading: 'Updating rates...',
    popular: 'Popular Pairs',
    allRates: 'All Rates'
  }
}

const t = (key) => translations[props.lang]?.[key] || key

onMounted(() => {
  convert()
})
</script>
