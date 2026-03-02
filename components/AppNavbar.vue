<template>
  <nav class="navbar fixed top-0 left-0 right-0 z-50">
    <div class="flex items-center justify-between h-16 px-4 lg:px-6">
      <!-- Logo & Menu Toggle -->
      <div class="flex items-center gap-4">
        <button 
          @click="$emit('toggle-sidebar')"
          class="lg:hidden w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
        >
          <span class="text-lg">☰</span>
        </button>
        
        <!-- Logo -->
        <div class="flex items-center gap-3">
          <div class="relative">
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-400 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <span class="text-white font-black text-lg">HP</span>
            </div>
            <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0f0a1a]"></div>
          </div>
          <div class="hidden sm:block">
            <h1 class="font-bold text-white text-sm tracking-tight">High Point</h1>
            <p class="text-[10px] text-violet-300/80 font-medium">Gold Trading Pro</p>
          </div>
        </div>
      </div>

      <!-- Center - Live Prices (Desktop) -->
      <div class="hidden lg:flex items-center gap-3">
        <!-- Gold Price -->
        <div class="flex items-center gap-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 backdrop-blur-sm">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-md">
            <span class="text-sm">🥇</span>
          </div>
          <div>
            <p class="text-xs text-amber-200/70 font-medium">Gold</p>
            <p class="text-sm font-bold text-white">${{ goldPrice?.toLocaleString() || '---' }}</p>
          </div>
          <div :class="['px-2 py-1 rounded-lg text-xs font-bold', goldChange >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400']">
            {{ goldChange >= 0 ? '↑' : '↓' }} {{ Math.abs(goldChange)?.toFixed(2) || '0.00' }}%
          </div>
        </div>

        <!-- Silver Price -->
        <div class="flex items-center gap-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-slate-500/10 to-slate-400/10 border border-slate-500/20 backdrop-blur-sm">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-md">
            <span class="text-sm">🥈</span>
          </div>
          <div>
            <p class="text-xs text-slate-300/70 font-medium">Silver</p>
            <p class="text-sm font-bold text-white">${{ silverPrice?.toFixed(2) || '---' }}</p>
          </div>
          <div :class="['px-2 py-1 rounded-lg text-xs font-bold', silverChange >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400']">
            {{ silverChange >= 0 ? '↑' : '↓' }} {{ Math.abs(silverChange)?.toFixed(2) || '0.00' }}%
          </div>
        </div>
      </div>

      <!-- Right Side Controls -->
      <div class="flex items-center gap-2">
        <!-- Currency Selector - Separate Buttons -->
        <div class="hidden md:flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <button 
            v-for="curr in currencies" 
            :key="curr.code"
            @click="$emit('currency-change', curr.code)"
            :class="[
              'px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1',
              selectedCurrency === curr.code 
                ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg' 
                : 'text-white/60 hover:text-white hover:bg-white/10'
            ]"
          >
            <span>{{ curr.flag }}</span>
            <span class="hidden lg:inline">{{ curr.code }}</span>
          </button>
        </div>

        <!-- Language Toggle -->
        <div class="flex items-center rounded-xl overflow-hidden border border-white/10 backdrop-blur-sm">
          <button 
            @click="$emit('lang-change', 'ar')"
            :class="[
              'px-3 py-2 text-xs font-bold transition-all',
              currentLang === 'ar' 
                ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white' 
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            ]"
          >
            عربي
          </button>
          <button 
            @click="$emit('lang-change', 'en')"
            :class="[
              'px-3 py-2 text-xs font-bold transition-all',
              currentLang === 'en' 
                ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white' 
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            ]"
          >
            EN
          </button>
        </div>

        <!-- Theme Toggle -->
        <button 
          @click="toggleTheme"
          :class="[
            'w-10 h-10 rounded-xl flex items-center justify-center transition-all border',
            isDark 
              ? 'bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border-violet-500/30 hover:border-violet-400' 
              : 'bg-gradient-to-br from-orange-500/20 to-amber-500/20 border-orange-500/30 hover:border-orange-400'
          ]"
        >
          <span class="text-lg transition-transform duration-300" :class="isDark ? 'rotate-0' : 'rotate-180'">
            {{ isDark ? '🌙' : '☀️' }}
          </span>
        </button>

        <!-- Notifications -->
        <button class="relative w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/20 flex items-center justify-center hover:border-pink-400 transition-all">
          <span class="text-lg">🔔</span>
          <span class="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-gradient-to-r from-pink-500 to-rose-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center px-1 shadow-lg shadow-pink-500/50">
            3
          </span>
        </button>

        <!-- PWA Install Button -->
        <InstallPwa :lang="currentLang" />

        <!-- User Avatar -->
        <div class="hidden sm:block">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-orange-400 p-[2px]">
            <div class="w-full h-full rounded-[10px] bg-[#1a1025] flex items-center justify-center">
              <span class="text-base">👤</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
const props = defineProps({
  selectedCurrency: { type: String, default: 'USD' },
  currentLang: { type: String, default: 'ar' },
  goldPrice: { type: Number, default: 0 },
  silverPrice: { type: Number, default: 0 },
  goldChange: { type: Number, default: 0 },
  silverChange: { type: Number, default: 0 }
});

const emit = defineEmits(['toggle-sidebar', 'currency-change', 'lang-change']);

const currencies = [
  { code: 'USD', flag: '🇺🇸' },
  { code: 'SAR', flag: '🇸🇦' },
  { code: 'AED', flag: '🇦🇪' },
  { code: 'EGP', flag: '🇪🇬' },
  { code: 'EUR', flag: '🇪🇺' }
];

const isDark = ref(true);

const toggleTheme = () => {
  isDark.value = !isDark.value;
  document.body.classList.toggle('light', !isDark.value);
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
  }
};

onMounted(() => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      isDark.value = false;
      document.body.classList.add('light');
    }
  }
});
</script>
