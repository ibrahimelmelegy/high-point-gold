<template>
  <div :class="['min-h-screen bg-[var(--bg-primary)] text-white font-sans', lang === 'ar' ? 'rtl' : 'ltr']" :dir="lang === 'ar' ? 'rtl' : 'ltr'">
    <!-- Navbar -->
    <AppNavbar 
      :selectedCurrency="selectedCurrency"
      :currentLang="lang"
      :goldPrice="goldData?.price || 0"
      :silverPrice="silverData?.price || 0"
      :goldChange="goldChange"
      :silverChange="silverChange"
      @toggle-sidebar="sidebarOpen = !sidebarOpen"
      @currency-change="handleCurrencyChange"
      @lang-change="lang = $event"
    />

    <!-- Global Market Ticker -->
    <div class="fixed top-16 left-0 right-0 z-40">
      <MarketTicker />
    </div>
    
    <!-- Sidebar -->
    <AppSidebar 
      :isOpen="sidebarOpen"
      :activeItem="activeSection"
      :currentLang="lang"
      @navigate="activeSection = $event"
      @close="sidebarOpen = false"
    />

    <!-- Main Content -->
    <main :class="['pt-28 min-h-screen transition-all duration-300', lang === 'ar' ? 'lg:pr-64' : 'lg:pl-64']">
      <div class="p-6 max-w-6xl mx-auto">
        
        <!-- ================= DASHBOARD VIEW ================= -->
        <div v-if="activeSection === 'dashboard'">
          <!-- News Ticker -->
          <div class="-mx-6 mb-6">
            <NewsTicker :lang="lang" />
          </div>

          <!-- Real News Section -->
          <div class="mb-8">
            <NewsSection :lang="lang" :limit="6" />
          </div>

          <div class="mb-8">
            <div class="flex items-center gap-3 mb-1">
              <h1 class="text-2xl font-bold text-white">{{ t('welcome') }} 👋</h1>
              <div v-if="realtimeConnected" class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 live-dot"></span>
                <span class="text-[10px] font-bold text-emerald-400">LIVE</span>
              </div>
            </div>
            <p class="text-slate-500 text-sm">{{ t('welcomeDesc') }}</p>
          </div>

          <!-- Quick Stats -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div class="card p-4" v-for="(stat, idx) in quickStats" :key="idx">
              <div class="flex items-center justify-between mb-2">
                <span class="text-2xl">{{ stat.icon }}</span>
                <span :class="['text-xs font-semibold px-2 py-0.5 rounded-full', stat.change >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400']">
                  {{ stat.change >= 0 ? '+' : '' }}{{ stat.change }}%
                </span>
              </div>
              <p class="text-xs text-slate-500 mb-1">{{ stat.label }}</p>
              <p class="font-bold text-lg text-white price-display">{{ stat.value }}</p>
            </div>
          </div>

          <!-- Price Cards Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <!-- Gold Card -->
            <div class="card card-gold p-6 cursor-pointer hover:scale-[1.01] transition-transform" @click="activeSection = 'gold'">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <span class="text-[10px] font-semibold uppercase tracking-widest text-amber-500">XAU/{{ selectedCurrency }}</span>
                  <div class="flex items-baseline gap-2 mt-1">
                    <span class="price-display text-4xl text-white">{{ goldData?.price?.toLocaleString() || '---' }}</span>
                  </div>
                </div>
                <div class="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <span class="text-2xl">🥇</span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span :class="goldChange >= 0 ? 'text-emerald-400' : 'text-red-400'" class="text-sm font-semibold">
                  {{ goldChange >= 0 ? '+' : '' }}{{ (goldChange || 0).toFixed(2) }}%
                </span>
                <span class="text-xs text-slate-500">{{ t('clickDetails') }}</span>
              </div>
              <div class="mt-4 pt-4 border-t border-[var(--border-primary)]">
                <PriceChart :data="goldHistory" :labels="historyLabels" label="Gold" color="#f59e0b" />
              </div>
            </div>

            <!-- Silver Card -->
            <div class="card card-silver p-6 cursor-pointer hover:scale-[1.01] transition-transform" @click="activeSection = 'silver'">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <span class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">XAG/{{ selectedCurrency }}</span>
                  <div class="flex items-baseline gap-2 mt-1">
                    <span class="price-display text-4xl text-white">{{ (silverData?.price || 0).toFixed(2) }}</span>
                  </div>
                </div>
                <div class="w-14 h-14 bg-gradient-to-br from-slate-300 to-slate-500 rounded-xl flex items-center justify-center">
                  <span class="text-2xl">🥈</span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span :class="silverChange >= 0 ? 'text-emerald-400' : 'text-red-400'" class="text-sm font-semibold">
                  {{ silverChange >= 0 ? '+' : '' }}{{ (silverChange || 0).toFixed(2) }}%
                </span>
                <span class="text-xs text-slate-500">{{ t('clickDetails') }}</span>
              </div>
              <div class="mt-4 pt-4 border-t border-[var(--border-primary)]">
                <PriceChart :data="silverHistory" :labels="historyLabels" label="Silver" color="#94a3b8" />
              </div>
            </div>
          </div>

          <!-- Advanced Widgets Row 1 -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <TradingSignals :goldChange="goldChange" :silverChange="silverChange" :lang="lang" />
            <MarketSentiment :goldChange="goldChange" :lang="lang" />
            <GoldSilverRatio :goldPrice="goldData?.price || 2650" :silverPrice="silverData?.price || 30" :lang="lang" />
          </div>

          <!-- Advanced Widgets Row 2 -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <PortfolioTracker 
              :goldPrice="goldData?.price_gram_24k || 85" 
              :silverPrice="silverData?.price || 30"
              :currency="selectedCurrency"
              :lang="lang"
            />
            <MarketHours :lang="lang" />
          </div>
        </div>

        <!-- ================= GOLD DETAIL VIEW ================= -->
        <GoldDetailPage
          v-else-if="activeSection === 'gold'"
          :goldPrice="goldData?.price || 2650"
          :priceChange="goldChange"
          :goldData="goldData"
          :lang="lang"
          @back="activeSection = 'dashboard'"
        />

        <!-- ================= SILVER VIEW ================= -->
        <div v-else-if="activeSection === 'silver'" class="space-y-6">
          <div class="flex items-center gap-4 mb-6">
            <button @click="activeSection = 'dashboard'" class="p-2 rounded-lg hover:bg-white/5">
              <span class="text-xl">←</span>
            </button>
            <div>
              <h2 class="text-xl font-bold text-white">{{ t('silverPrices') }}</h2>
              <p class="text-sm text-slate-500">{{ t('silverDesc') }}</p>
            </div>
          </div>

          <div class="card card-silver p-6">
            <div class="flex justify-between items-start mb-6">
              <div>
                <span class="text-[10px] font-semibold uppercase tracking-widest text-slate-400">XAG/{{ selectedCurrency }}</span>
                <div class="flex items-baseline gap-2 mt-2">
                  <span class="price-display text-5xl text-white">{{ (silverData?.price || 0).toFixed(2) }}</span>
                  <span class="text-sm text-slate-500 font-semibold">{{ selectedCurrency }}</span>
                </div>
              </div>
              <div class="w-16 h-16 bg-gradient-to-br from-slate-300 to-slate-500 rounded-2xl flex items-center justify-center">
                <span class="text-3xl">🥈</span>
              </div>
            </div>

            <div class="flex items-center gap-4 mb-6">
              <div :class="['flex items-center gap-2 px-4 py-2 rounded-xl', silverChange >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10']">
                <span :class="silverChange >= 0 ? 'text-emerald-400' : 'text-red-400'" class="font-bold">
                  {{ silverChange >= 0 ? '+' : '' }}{{ (silverChange || 0).toFixed(2) }}%
                </span>
              </div>
              <span class="text-xs text-slate-500">{{ t('sinceOpen') }}</span>
            </div>

            <div class="chart-container">
              <PriceChart :data="silverHistory" :labels="historyLabels" label="Silver" color="#94a3b8" />
            </div>
          </div>
        </div>

        <!-- ================= CALCULATOR VIEW ================= -->
        <div v-else-if="activeSection === 'calculator'" class="space-y-6">
          <div class="flex items-center gap-4 mb-6">
            <button @click="activeSection = 'dashboard'" class="p-2 rounded-lg hover:bg-white/5">
              <span class="text-xl">←</span>
            </button>
            <div>
              <h2 class="text-xl font-bold text-white">{{ t('calculator') }}</h2>
              <p class="text-sm text-slate-500">{{ t('calculatorDesc') }}</p>
            </div>
          </div>
          <div class="max-w-lg">
            <ProfitCalculator 
              :currentGoldPrice="goldData?.price_gram_24k || 0" 
              :currentSilverPrice="silverData?.price_gram || 0"
              :currency="selectedCurrency"
            />
          </div>
        </div>

        <!-- ================= ALERTS / WHATSAPP VIEW ================= -->
        <div v-else-if="activeSection === 'whatsapp'" class="space-y-6">
          <div class="flex items-center gap-4 mb-6">
            <button @click="activeSection = 'dashboard'" class="p-2 rounded-lg hover:bg-white/5">
              <span class="text-xl">←</span>
            </button>
            <div>
              <h2 class="text-xl font-bold text-white">{{ t('alertsTitle') }}</h2>
              <p class="text-sm text-slate-500">{{ t('alertsDesc') }}</p>
            </div>
          </div>
          <div class="max-w-lg">
            <WhatsAppAlert 
              :goldPrice="goldData?.price_gram_24k || 0"
              :silverPrice="silverData?.price_gram || 0"
              :goldAdvice="getAdvice(goldData)"
              :silverAdvice="getAdvice(silverData)"
              :currency="selectedCurrency"
            />
          </div>
        </div>

        <!-- ================= PRICE ALERTS VIEW ================= -->
        <div v-else-if="activeSection === 'alerts'">
          <PriceAlerts 
            :goldPrice="goldData?.price_gram_24k || 0"
            :silverPrice="silverData?.price || 0"
            :lang="lang"
            @back="activeSection = 'dashboard'"
          />
        </div>

        <!-- ================= GLOBAL MARKET ANALYSIS VIEW ================= -->
        <div v-else-if="activeSection === 'analysis'">
          <GlobalMarketAnalysis 
            :goldPrice="goldData?.price || 2650"
            :lang="lang"
            @back="activeSection = 'dashboard'"
          />
        </div>

        <!-- ================= TECHNICAL ANALYSIS VIEW ================= -->
        <div v-else-if="activeSection === 'technical'">
          <TechnicalAnalysis 
            :goldPrice="goldData?.price || 2650"
            :silverPrice="silverData?.price || 30"
            :lang="lang"
            @back="activeSection = 'dashboard'"
          />
        </div>

        <!-- ================= ZAKAT VIEW ================= -->
        <div v-else-if="activeSection === 'zakat'">
          <ZakatCalculator 
            :goldPrice="goldData?.price_gram_24k || 0"
            :silverPrice="silverData?.price || 0"
            :currency="selectedCurrency"
            :lang="lang"
            @back="activeSection = 'dashboard'"
          />
        </div>

        <!-- ================= INVESTMENT GOALS VIEW ================= -->
        <div v-else-if="activeSection === 'goals'">
          <InvestmentGoals 
            :currency="selectedCurrency"
            :lang="lang"
            @back="activeSection = 'dashboard'"
          />
        </div>

        <!-- ================= LOCAL PRICES VIEW ================= -->
        <div v-else-if="activeSection === 'local'">
          <LocalPrices 
            :lang="lang"
            @back="activeSection = 'dashboard'"
          />
        </div>

        <!-- ================= CURRENCY CONVERTER VIEW ================= -->
        <div v-else-if="activeSection === 'converter'">
          <CurrencyConverter 
            :lang="lang"
            @back="activeSection = 'dashboard'"
          />
        </div>

        <!-- ================= EXPORT REPORTS VIEW ================= -->
        <div v-else-if="activeSection === 'reports'">
          <ExportReports 
            :lang="lang"
            @back="activeSection = 'dashboard'"
          />
        </div>

        <!-- ================= HISTORY VIEW ================= -->
        <div v-else-if="activeSection === 'history'" class="space-y-6">
          <div class="flex items-center gap-4 mb-6">
            <button @click="activeSection = 'dashboard'" class="p-2 rounded-lg hover:bg-white/5">
              <span class="text-xl">←</span>
            </button>
            <div>
              <h2 class="text-xl font-bold text-white">{{ t('history') }}</h2>
              <p class="text-sm text-slate-500">{{ t('historyDesc') }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="card card-gold p-6">
              <div class="flex items-center gap-3 mb-4">
                <span class="text-xl">🥇</span>
                <h3 class="font-bold text-white">{{ t('goldHistory') }}</h3>
              </div>
              <div class="chart-container">
                <PriceChart :data="goldHistory" :labels="historyLabels" label="Gold" color="#f59e0b" />
              </div>
            </div>

            <div class="card card-silver p-6">
              <div class="flex items-center gap-3 mb-4">
                <span class="text-xl">🥈</span>
                <h3 class="font-bold text-white">{{ t('silverHistory') }}</h3>
              </div>
              <div class="chart-container">
                <PriceChart :data="silverHistory" :labels="historyLabels" label="Silver" color="#94a3b8" />
              </div>
            </div>
          </div>
        </div>



        <!-- ================= SETTINGS VIEW ================= -->
        <div v-else-if="activeSection === 'settings'" class="space-y-6">
          <div class="flex items-center gap-4 mb-6">
            <button @click="activeSection = 'dashboard'" class="p-2 rounded-lg hover:bg-white/5">
              <span class="text-xl">←</span>
            </button>
            <div>
              <h2 class="text-xl font-bold text-white">{{ t('settings') }}</h2>
              <p class="text-sm text-slate-500">{{ t('settingsDesc') }}</p>
            </div>
          </div>
          
          <!-- Theme Switcher -->
          <div class="max-w-lg">
            <ThemeSwitcher :lang="lang" />
          </div>

          <!-- Language Settings -->
          <div class="card p-6 max-w-lg">
            <h3 class="font-bold text-white mb-4">{{ t('language') }}</h3>
            <div class="flex gap-2">
              <button 
                @click="lang = 'ar'"
                :class="lang === 'ar' ? 'btn-primary' : 'btn-secondary'"
                class="flex-1"
              >
                العربية
              </button>
              <button 
                @click="lang = 'en'"
                :class="lang === 'en' ? 'btn-primary' : 'btn-secondary'"
                class="flex-1"
              >
                English
              </button>
            </div>
          </div>

          <!-- Sound Alert Settings -->
          <div class="card p-6 max-w-lg">
            <h3 class="font-bold text-white mb-4">{{ t('soundAlert') }}</h3>
            <button 
              @click="isAlertEnabled = !isAlertEnabled"
              :class="isAlertEnabled ? 'btn-primary' : 'btn-secondary'"
              class="w-full"
            >
              {{ isAlertEnabled ? t('soundOn') : t('soundOff') }}
            </button>
          </div>
        </div>

        <!-- Footer -->
        <footer class="text-center py-8 mt-8 border-t border-purple-500/10">
          <p class="text-xs text-purple-400/60">
            {{ t('footer') }} • <span class="text-gradient">High Point Technology</span> © 2026
          </p>
        </footer>
      </div>
    </main>
  </div>
</template>

<script setup>
const selectedCurrency = ref('USD');
const isAlertEnabled = ref(false);
const sidebarOpen = ref(false);
const activeSection = ref('dashboard');
const lang = ref('ar');

// Real-time price streaming
const { prices: realtimePrices, connected: realtimeConnected } = useRealtimePrices();

const { data: goldData, refresh: refreshGold } = await useFetch(() => `/api/metal?metal=XAU&currency=${selectedCurrency.value}`, {
  transform: (data) => data || { price: 2650, price_gram_24k: 85, open_price: 2640, currency: selectedCurrency.value }
});
const { data: silverData, refresh: refreshSilver } = await useFetch(() => `/api/metal?metal=XAG&currency=${selectedCurrency.value}`, {
  transform: (data) => data || { price: 30, price_gram: 1, open_price: 29.5, currency: selectedCurrency.value }
});

// Real historical data from API
const goldHistoricalData = ref([])
const silverHistoricalData = ref([])

const historyLabels = computed(() => {
  if (goldHistoricalData.value.length > 0) {
    return goldHistoricalData.value.map(d => d.date?.slice(5) || '')
  }
  return ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7']
})

const goldHistory = computed(() => {
  if (goldHistoricalData.value.length > 0) {
    return goldHistoricalData.value.map(d => parseFloat(d.close))
  }
  return generateMockHistory(goldData.value?.price || 2650, 20)
})

const silverHistory = computed(() => {
  if (silverHistoricalData.value.length > 0) {
    return silverHistoricalData.value.map(d => parseFloat(d.close))
  }
  return generateMockHistory(silverData.value?.price || 30, 0.5)
})

const goldChange = computed(() => calculateChange(goldData.value));
const silverChange = computed(() => calculateChange(silverData.value));

const translations = {
  ar: {
    welcome: 'مرحباً بك',
    welcomeDesc: 'تابع أسعار الذهب والفضة لحظة بلحظة',
    clickDetails: 'اضغط للتفاصيل',
    goldPrices: 'أسعار الذهب',
    goldDesc: 'أسعار الذهب العالمية لحظة بلحظة',
    silverPrices: 'أسعار الفضة',
    silverDesc: 'أسعار الفضة العالمية',
    sinceOpen: 'منذ الافتتاح',
    open: 'الافتتاح',
    high: 'أعلى سعر',
    low: 'أدنى سعر',
    gram24k: 'جرام 24K',
    calculator: 'حاسبة الأرباح',
    calculatorDesc: 'احسب أرباحك من الذهب والفضة',
    alertsTitle: 'التنبيهات',
    alertsDesc: 'إعداد تنبيهات واتساب',
    history: 'السجل التاريخي',
    historyDesc: 'تتبع تغيرات الأسعار',
    goldHistory: 'تاريخ الذهب',
    silverHistory: 'تاريخ الفضة',
    settings: 'الإعدادات',
    settingsDesc: 'تخصيص التطبيق',
    language: 'اللغة',
    soundAlert: 'التنبيه الصوتي',
    soundOn: '🔊 التنبيه مفعل',
    soundOff: '🔇 تفعيل التنبيه',
    footer: 'تحديث لحظي مباشر',
    gold24k: 'الذهب 24K',
    silver: 'الفضة',
    signals: 'إشارات اليوم',
    alertsCount: 'التنبيهات'
  },
  en: {
    welcome: 'Welcome',
    welcomeDesc: 'Track gold and silver prices in real-time',
    clickDetails: 'Click for details',
    goldPrices: 'Gold Prices',
    goldDesc: 'Live global gold prices',
    silverPrices: 'Silver Prices',
    silverDesc: 'Live global silver prices',
    sinceOpen: 'Since Open',
    open: 'Open',
    high: 'High',
    low: 'Low',
    gram24k: '24K Gram',
    calculator: 'Profit Calculator',
    calculatorDesc: 'Calculate your gold and silver profits',
    alertsTitle: 'Alerts',
    alertsDesc: 'Set up WhatsApp alerts',
    history: 'Price History',
    historyDesc: 'Track price changes over time',
    goldHistory: 'Gold History',
    silverHistory: 'Silver History',
    settings: 'Settings',
    settingsDesc: 'Customize the app',
    language: 'Language',
    soundAlert: 'Sound Alert',
    soundOn: '🔊 Alert On',
    soundOff: '🔇 Enable Alert',
    footer: 'Live real-time updates',
    gold24k: 'Gold 24K',
    silver: 'Silver',
    signals: 'Today\'s Signals',
    alertsCount: 'Alerts'
  }
};

const t = (key) => translations[lang.value]?.[key] || key;

const quickStats = computed(() => [
  { icon: '🥇', label: t('gold24k'), value: `${(goldData.value?.price_gram_24k || 0).toLocaleString()} ${selectedCurrency.value}`, change: goldChange.value },
  { icon: '🥈', label: t('silver'), value: `${(silverData.value?.price || 0).toFixed(2)} ${selectedCurrency.value}`, change: silverChange.value },
  { icon: '📊', label: t('signals'), value: lang.value === 'ar' ? '3 إشارات' : '3 Signals', change: 12 },
  { icon: '🔔', label: t('alertsCount'), value: lang.value === 'ar' ? 'نشطة' : 'Active', change: 0 }
]);

function calculateChange(data) {
  if (!data?.price || !data?.open_price) return 0;
  return Number(((data.price - data.open_price) / data.open_price * 100).toFixed(2));
}

function generateMockHistory(basePrice, volatility) {
  const data = [];
  let current = basePrice;
  for (let i = 0; i < 7; i++) {
    current += (Math.random() - 0.5) * volatility;
    data.push(current);
  }
  data[data.length - 1] = basePrice;
  return data;
}

function getAdvice(data) {
  if (!data?.price || !data?.open_price) return lang.value === 'ar' ? 'جاري التحليل...' : 'Analyzing...';
  const diff = ((data.price - data.open_price) / data.open_price) * 100;
  if (diff < -1.5) return lang.value === 'ar' ? 'إشارة شراء قوية' : 'Strong Buy Signal';
  if (diff > 2.5) return lang.value === 'ar' ? 'إشارة بيع' : 'Sell Signal';
  return lang.value === 'ar' ? 'استقرار' : 'Stable';
}

function handleCurrencyChange(curr) {
  selectedCurrency.value = curr;
  refreshGold();
  refreshSilver();
}

const fetchHistoricalData = async () => {
  try {
    const goldTech = await $fetch('/api/technical', { query: { symbol: 'XAUUSD' } })
    if (goldTech?.historical?.length) {
      goldHistoricalData.value = goldTech.historical.slice(0, 7).reverse()
    }
  } catch (e) { console.error('Gold history fetch error:', e) }

  try {
    const silverTech = await $fetch('/api/technical', { query: { symbol: 'XAGUSD' } })
    if (silverTech?.historical?.length) {
      silverHistoricalData.value = silverTech.historical.slice(0, 7).reverse()
    }
  } catch (e) { console.error('Silver history fetch error:', e) }
}

onMounted(() => {
  fetchHistoricalData()
  // Fast refresh for gold/silver prices (every 15 seconds)
  setInterval(() => { refreshGold(); refreshSilver(); }, 15000);
});
</script>