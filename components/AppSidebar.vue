<template>
  <aside 
    :class="[
      'sidebar fixed top-16 w-72 h-[calc(100vh-4rem)] z-40 transition-all duration-300 overflow-y-auto',
      isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0',
      currentLang === 'ar' ? 'right-0' : 'left-0'
    ]"
  >
    <!-- Overlay for mobile -->
    <div 
      v-if="isOpen"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden -z-10"
      @click="$emit('close')"
    ></div>

    <div class="p-5 space-y-6">
      <!-- Profile Card -->
      <div class="card p-4 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center shadow-lg">
            <span class="text-xl">👤</span>
          </div>
          <div class="flex-1">
            <p class="font-bold text-white text-sm">{{ currentLang === 'ar' ? 'مستثمر ذهبي' : 'Gold Investor' }}</p>
            <p class="text-xs text-purple-300">{{ currentLang === 'ar' ? 'حساب مميز' : 'Premium Account' }}</p>
          </div>
          <div class="w-3 h-3 bg-emerald-400 rounded-full live-indicator"></div>
        </div>
      </div>

      <!-- Main Navigation -->
      <div>
        <p class="text-[10px] font-bold text-purple-400/60 uppercase tracking-wider mb-3 px-2">
          {{ t('mainMenu') }}
        </p>
        <nav class="space-y-1">
          <button 
            v-for="item in mainMenu" 
            :key="item.id"
            @click="navigate(item.id)"
            :class="[
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-semibold',
              activeItem === item.id 
                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30' 
                : 'text-purple-200 hover:bg-purple-500/10 hover:text-white'
            ]"
          >
            <span class="text-lg w-7 text-center">{{ item.icon }}</span>
            <span class="flex-1 text-start">{{ t(item.labelKey) }}</span>
            <span 
              v-if="activeItem === item.id" 
              class="w-2 h-2 bg-purple-400 rounded-full"
            ></span>
          </button>
        </nav>
      </div>

      <!-- Tools Section -->
      <div>
        <p class="text-[10px] font-bold text-orange-400/60 uppercase tracking-wider mb-3 px-2">
          {{ t('tools') }}
        </p>
        <nav class="space-y-1">
          <button 
            v-for="item in tools" 
            :key="item.id"
            @click="navigate(item.id)"
            :class="[
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-semibold',
              activeItem === item.id 
                ? 'bg-gradient-to-r from-orange-500/20 to-pink-500/20 text-white border border-orange-500/30' 
                : 'text-orange-200 hover:bg-orange-500/10 hover:text-white'
            ]"
          >
            <span class="text-lg w-7 text-center">{{ item.icon }}</span>
            <span class="flex-1 text-start">{{ t(item.labelKey) }}</span>
            <span 
              v-if="item.badge"
              :class="[
                'text-[10px] px-2 py-0.5 rounded-full font-bold',
                item.badge === 'AI' ? 'bg-purple-500/30 text-purple-300' : 'bg-pink-500/30 text-pink-300'
              ]"
            >
              {{ item.badge }}
            </span>
          </button>
        </nav>
      </div>

      <!-- Quick Actions -->
      <div class="card p-4 bg-gradient-to-br from-pink-500/10 to-purple-500/10">
        <p class="text-xs font-bold text-pink-300 mb-3">{{ currentLang === 'ar' ? '🚀 إجراءات سريعة' : '🚀 Quick Actions' }}</p>
        <div class="grid grid-cols-2 gap-2">
          <button 
            @click="navigate('calculator')"
            class="p-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 transition-all border border-purple-500/20 text-center"
          >
            <span class="text-xl block mb-1">🧮</span>
            <span class="text-[10px] text-purple-200">{{ currentLang === 'ar' ? 'احسب' : 'Calculate' }}</span>
          </button>
          <button 
            @click="navigate('alerts')"
            class="p-3 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 transition-all border border-orange-500/20 text-center"
          >
            <span class="text-xl block mb-1">🔔</span>
            <span class="text-[10px] text-orange-200">{{ currentLang === 'ar' ? 'تنبيه' : 'Alert' }}</span>
          </button>
          <button 
            @click="navigate('analysis')"
            class="p-3 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 transition-all border border-pink-500/20 text-center"
          >
            <span class="text-xl block mb-1">🤖</span>
            <span class="text-[10px] text-pink-200">{{ currentLang === 'ar' ? 'تحليل' : 'Analyze' }}</span>
          </button>
          <button 
            @click="navigate('technical')"
            class="p-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 transition-all border border-emerald-500/20 text-center"
          >
            <span class="text-xl block mb-1">📊</span>
            <span class="text-[10px] text-emerald-200">{{ currentLang === 'ar' ? 'فني' : 'Technical' }}</span>
          </button>
        </div>
      </div>

      <!-- Version Info -->
      <div class="text-center py-3 border-t border-purple-500/10">
        <p class="text-[10px] text-purple-400/50">High Point Gold v2.0</p>
        <p class="text-[10px] text-pink-400/50">✨ Premium Edition</p>
      </div>
    </div>
  </aside>
</template>

<script setup>
const props = defineProps({
  isOpen: { type: Boolean, default: false },
  activeItem: { type: String, default: 'dashboard' },
  currentLang: { type: String, default: 'ar' }
});

const emit = defineEmits(['navigate', 'close', 'lang-change']);

const mainMenu = [
  { id: 'dashboard', icon: '🏠', labelKey: 'dashboard' },
  { id: 'gold', icon: '🥇', labelKey: 'goldPrices' },
  { id: 'silver', icon: '🥈', labelKey: 'silverPrices' },
  { id: 'technical', icon: '📈', labelKey: 'technicalAnalysis' },
  { id: 'analysis', icon: '🤖', labelKey: 'globalAnalysis', badge: 'AI' }
];

const tools = [
  { id: 'calculator', icon: '🧮', labelKey: 'calculator', badge: '' },
  { id: 'zakat', icon: '🕌', labelKey: 'zakat', badge: '' },
  { id: 'goals', icon: '🎯', labelKey: 'goals', badge: '' },
  { id: 'alerts', icon: '🔔', labelKey: 'priceAlerts', badge: '' },
  { id: 'converter', icon: '💱', labelKey: 'converter', badge: '' },
  { id: 'settings', icon: '⚙️', labelKey: 'settings', badge: '' }
];

const translations = {
  ar: {
    mainMenu: 'القائمة الرئيسية',
    tools: 'الأدوات',
    dashboard: 'لوحة التحكم',
    goldPrices: 'أسعار الذهب',
    silverPrices: 'أسعار الفضة',
    calculator: 'حاسبة الأرباح',
    history: 'السجل التاريخي',
    priceAlerts: 'تنبيهات الأسعار',
    globalAnalysis: 'التحليل العالمي',
    technicalAnalysis: 'التحليل الفني',
    whatsapp: 'واتساب',
    zakat: 'حاسبة الزكاة',
    goals: 'الأهداف الاستثمارية',
    localPrices: 'الأسعار المحلية',
    converter: 'تحويل العملات',
    goldDetails: 'تفاصيل الذهب (جديد)',
    reports: 'التقارير',
    settings: 'الإعدادات'
  },
  en: {
    mainMenu: 'Main Menu',
    tools: 'Tools',
    dashboard: 'Dashboard',
    goldPrices: 'Gold Prices',
    silverPrices: 'Silver Prices',
    calculator: 'Profit Calculator',
    history: 'Price History',
    priceAlerts: 'Price Alerts',
    globalAnalysis: 'Global Analysis',
    technicalAnalysis: 'Technical Analysis',
    whatsapp: 'WhatsApp',
    zakat: 'Zakat Calculator',
    goals: 'Investment Goals',
    localPrices: 'Local Prices',
    converter: 'Currency Converter',
    goldDetails: 'Gold Details (New)',
    reports: 'Reports',
    settings: 'Settings'
  }
};

const t = (key) => translations[props.currentLang]?.[key] || key;

const navigate = (id) => {
  emit('navigate', id);
  emit('close');
};
</script>
