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

    <!-- Location Selector -->
    <div class="flex gap-2 overflow-x-auto pb-2">
      <button 
        v-for="city in cities" 
        :key="city.id"
        @click="selectedCity = city.id"
        :class="[
          'px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all',
          selectedCity === city.id 
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
            : 'bg-[var(--bg-card)] text-slate-400 border border-[var(--border-primary)]'
        ]"
      >
        {{ city.name }}
      </button>
    </div>

    <!-- Best Deal Banner -->
    <div v-if="bestDeal" class="card p-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/30">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🏆</span>
          <div>
            <p class="text-xs text-emerald-300">{{ t('bestDeal') }}</p>
            <p class="font-bold text-white">{{ bestDeal.name }}</p>
          </div>
        </div>
        <div class="text-right">
          <p class="text-xl font-bold text-emerald-400">{{ bestDeal.price }} {{ t('currency') }}</p>
          <p class="text-xs text-emerald-300">{{ t('perGram') }}</p>
        </div>
      </div>
    </div>

    <!-- Stores List -->
    <div class="space-y-3">
      <div 
        v-for="store in filteredStores" 
        :key="store.id"
        :class="[
          'card p-5 transition-all',
          store.isBest ? 'border-emerald-500/40 bg-emerald-500/5' : ''
        ]"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-3">
            <div :class="[
              'w-12 h-12 rounded-xl flex items-center justify-center text-xl',
              store.type === 'dealer' ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-purple-500/20 border border-purple-500/30'
            ]">
              {{ store.type === 'dealer' ? '🏪' : '🏬' }}
            </div>
            <div>
              <h3 class="font-bold text-white flex items-center gap-2">
                {{ store.name }}
                <span v-if="store.isBest" class="text-xs bg-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full">
                  {{ t('lowest') }}
                </span>
              </h3>
              <p class="text-xs text-slate-500">{{ store.address }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-lg font-bold text-amber-400">{{ store.price }} {{ t('currency') }}</p>
            <p class="text-xs text-slate-500">{{ t('perGram') }}</p>
          </div>
        </div>

        <!-- Store Details -->
        <div class="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-tertiary)]">
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-1">
              <span class="text-amber-400">★</span>
              <span class="text-sm text-white">{{ store.rating }}</span>
            </div>
            <span class="text-xs text-slate-500">{{ store.reviews }} {{ t('reviews') }}</span>
            <span :class="['text-xs px-2 py-0.5 rounded-full', store.isOpen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400']">
              {{ store.isOpen ? t('open') : t('closed') }}
            </span>
          </div>
          <div class="flex gap-2">
            <a :href="'tel:' + store.phone" class="p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30">
              <span class="text-sm">📞</span>
            </a>
            <a :href="store.mapUrl" target="_blank" class="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30">
              <span class="text-sm">📍</span>
            </a>
          </div>
        </div>

        <!-- Gold Types -->
        <div class="mt-3 flex gap-2 text-xs">
          <span v-for="karat in store.karats" :key="karat" class="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {{ karat }}K
          </span>
        </div>
      </div>
    </div>

    <!-- Disclaimer -->
    <p class="text-xs text-slate-600 text-center">
      {{ t('disclaimer') }}
    </p>
  </div>
</template>

<script setup>
const props = defineProps({
  goldPrice: { type: Number, default: 2650 },
  lang: { type: String, default: 'ar' }
})

const selectedCity = ref('riyadh')

const cities = [
  { id: 'riyadh', name: props.lang === 'ar' ? 'الرياض' : 'Riyadh' },
  { id: 'jeddah', name: props.lang === 'ar' ? 'جدة' : 'Jeddah' },
  { id: 'dubai', name: props.lang === 'ar' ? 'دبي' : 'Dubai' },
  { id: 'cairo', name: props.lang === 'ar' ? 'القاهرة' : 'Cairo' }
]

// Calculate prices based on gold price (different markups per store)
const stores = computed(() => {
  const baseGram = props.goldPrice / 31.1 // oz to gram
  const hour = new Date().getHours()
  
  return [
    {
      id: 1,
      name: props.lang === 'ar' ? 'مجوهرات الراجحي' : 'Al Rajhi Jewelry',
      address: props.lang === 'ar' ? 'طريق الملك فهد، الرياض' : 'King Fahd Road, Riyadh',
      price: Math.round(baseGram * 1.02 * 3.75), // 2% markup, SAR
      rating: 4.8,
      reviews: 324,
      isOpen: hour >= 9 && hour < 22,
      phone: '+966500000001',
      mapUrl: 'https://maps.google.com/?q=Al+Rajhi+Jewelry+Riyadh',
      type: 'dealer',
      karats: [24, 22, 21, 18],
      city: 'riyadh'
    },
    {
      id: 2,
      name: props.lang === 'ar' ? 'ذهب الحرمين' : 'Al Haramain Gold',
      address: props.lang === 'ar' ? 'سوق الذهب، جدة' : 'Gold Souk, Jeddah',
      price: Math.round(baseGram * 1.015 * 3.75), // 1.5% markup
      rating: 4.9,
      reviews: 512,
      isOpen: hour >= 10 && hour < 23,
      phone: '+966500000002',
      mapUrl: 'https://maps.google.com/?q=Gold+Souk+Jeddah',
      type: 'dealer',
      karats: [24, 22, 21],
      city: 'jeddah'
    },
    {
      id: 3,
      name: props.lang === 'ar' ? 'داماس للمجوهرات' : 'Damas Jewelry',
      address: props.lang === 'ar' ? 'دبي مول' : 'Dubai Mall',
      price: Math.round(baseGram * 1.03 * 3.67), // 3% markup, AED
      rating: 4.7,
      reviews: 892,
      isOpen: hour >= 10 && hour < 24,
      phone: '+971500000001',
      mapUrl: 'https://maps.google.com/?q=Damas+Dubai+Mall',
      type: 'retail',
      karats: [24, 22, 21, 18],
      city: 'dubai'
    },
    {
      id: 4,
      name: props.lang === 'ar' ? 'لازوردي' : 'L\'azurde',
      address: props.lang === 'ar' ? 'بانوراما مول، الرياض' : 'Panorama Mall, Riyadh',
      price: Math.round(baseGram * 1.025 * 3.75),
      rating: 4.6,
      reviews: 256,
      isOpen: hour >= 10 && hour < 22,
      phone: '+966500000003',
      mapUrl: 'https://maps.google.com/?q=Lazurde+Riyadh',
      type: 'retail',
      karats: [21, 18],
      city: 'riyadh'
    },
    {
      id: 5,
      name: props.lang === 'ar' ? 'الصاغة للذهب' : 'Al Sagha Gold',
      address: props.lang === 'ar' ? 'خان الخليلي، القاهرة' : 'Khan El Khalili, Cairo',
      price: Math.round(baseGram * 1.01 * 30.9), // 1% markup, EGP
      rating: 4.5,
      reviews: 678,
      isOpen: hour >= 9 && hour < 21,
      phone: '+20100000001',
      mapUrl: 'https://maps.google.com/?q=Khan+El+Khalili+Cairo',
      type: 'dealer',
      karats: [24, 21, 18],
      city: 'cairo'
    },
    {
      id: 6,
      name: props.lang === 'ar' ? 'مجوهرات المعلم' : 'Al Moallem Jewelry',
      address: props.lang === 'ar' ? 'سوق الذهب، دبي' : 'Gold Souk, Dubai',
      price: Math.round(baseGram * 1.018 * 3.67),
      rating: 4.8,
      reviews: 445,
      isOpen: hour >= 10 && hour < 23,
      phone: '+971500000002',
      mapUrl: 'https://maps.google.com/?q=Gold+Souk+Dubai',
      type: 'dealer',
      karats: [24, 22, 21],
      city: 'dubai'
    }
  ]
})

const filteredStores = computed(() => {
  const cityStores = stores.value.filter(s => s.city === selectedCity.value)
  const minPrice = Math.min(...cityStores.map(s => s.price))
  
  return cityStores.map(store => ({
    ...store,
    isBest: store.price === minPrice
  })).sort((a, b) => a.price - b.price)
})

const bestDeal = computed(() => filteredStores.value.find(s => s.isBest))

const translations = {
  ar: {
    title: 'أسعار المتاجر المحلية',
    desc: 'قارن أسعار الذهب في متاجر قريبة منك',
    bestDeal: 'أفضل سعر',
    currency: 'ر.س',
    perGram: 'للجرام',
    lowest: 'الأقل',
    reviews: 'تقييم',
    open: 'مفتوح',
    closed: 'مغلق',
    disclaimer: '* الأسعار تقريبية وقد تختلف. اتصل بالمتجر للتأكيد.'
  },
  en: {
    title: 'Local Store Prices',
    desc: 'Compare gold prices at nearby stores',
    bestDeal: 'Best Deal',
    currency: 'SAR',
    perGram: 'per gram',
    lowest: 'Lowest',
    reviews: 'reviews',
    open: 'Open',
    closed: 'Closed',
    disclaimer: '* Prices are approximate and may vary. Contact store to confirm.'
  }
}

const t = (key) => translations[props.lang]?.[key] || key
</script>
