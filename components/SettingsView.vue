<template>
  <div class="space-y-6">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-white mb-1">{{ t('settingsTitle') }} ⚙️</h1>
      <p class="text-slate-500 text-sm">{{ t('settingsDesc') }}</p>
    </div>

    <!-- Appearance Settings -->
    <div class="card p-6">
      <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span>🎨</span>
        {{ t('appearance') }}
      </h2>
      
      <div class="space-y-4">
        <!-- Theme Toggle -->
        <div class="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
          <div>
            <p class="text-white font-medium text-sm">{{ t('darkMode') }}</p>
            <p class="text-slate-400 text-xs">{{ t('darkModeDesc') }}</p>
          </div>
          <button
            @click="toggleTheme"
            :class="[
              'relative w-14 h-7 rounded-full transition-colors',
              isDark ? 'bg-purple-500' : 'bg-slate-600'
            ]"
          >
            <div
              :class="[
                'absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white transition-transform',
                isDark ? 'translate-x-7' : 'translate-x-0'
              ]"
            >
              <span class="flex items-center justify-center text-xs">{{ isDark ? '🌙' : '☀️' }}</span>
            </div>
          </button>
        </div>

        <!-- Language Selection -->
        <div class="p-3 rounded-lg bg-slate-800/50">
          <p class="text-white font-medium text-sm mb-3">{{ t('language') }}</p>
          <div class="grid grid-cols-2 gap-2">
            <button
              @click="setLanguage('ar')"
              :class="[
                'p-3 rounded-lg border-2 transition-all',
                currentLang === 'ar'
                  ? 'border-purple-500 bg-purple-500/20 text-white'
                  : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
              ]"
            >
              <span class="block text-xl mb-1">🇸🇦</span>
              <span class="text-xs font-medium">العربية</span>
            </button>
            <button
              @click="setLanguage('en')"
              :class="[
                'p-3 rounded-lg border-2 transition-all',
                currentLang === 'en'
                  ? 'border-purple-500 bg-purple-500/20 text-white'
                  : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
              ]"
            >
              <span class="block text-xl mb-1">🇬🇧</span>
              <span class="text-xs font-medium">English</span>
            </button>
          </div>
        </div>

        <!-- Currency Selection -->
        <div class="p-3 rounded-lg bg-slate-800/50">
          <p class="text-white font-medium text-sm mb-3">{{ t('currency') }}</p>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="curr in currencies"
              :key="curr.code"
              @click="setCurrency(curr.code)"
              :class="[
                'p-2 rounded-lg border-2 transition-all',
                selectedCurrency === curr.code
                  ? 'border-orange-500 bg-orange-500/20 text-white'
                  : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
              ]"
            >
              <span class="block text-lg mb-1">{{ curr.flag }}</span>
              <span class="text-xs font-medium">{{ curr.code }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Notifications Settings -->
    <div class="card p-6">
      <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span>🔔</span>
        {{ t('notifications') }}
      </h2>
      
      <div class="space-y-3">
        <div class="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
          <div>
            <p class="text-white font-medium text-sm">{{ t('priceAlerts') }}</p>
            <p class="text-slate-400 text-xs">{{ t('priceAlertsDesc') }}</p>
          </div>
          <button
            @click="toggleSetting('priceAlerts')"
            :class="[
              'relative w-14 h-7 rounded-full transition-colors',
              settings.priceAlerts ? 'bg-emerald-500' : 'bg-slate-600'
            ]"
          >
            <div
              :class="[
                'absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white transition-transform',
                settings.priceAlerts ? 'translate-x-7' : 'translate-x-0'
              ]"
            ></div>
          </button>
        </div>

        <div class="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
          <div>
            <p class="text-white font-medium text-sm">{{ t('newsAlerts') }}</p>
            <p class="text-slate-400 text-xs">{{ t('newsAlertsDesc') }}</p>
          </div>
          <button
            @click="toggleSetting('newsAlerts')"
            :class="[
              'relative w-14 h-7 rounded-full transition-colors',
              settings.newsAlerts ? 'bg-emerald-500' : 'bg-slate-600'
            ]"
          >
            <div
              :class="[
                'absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white transition-transform',
                settings.newsAlerts ? 'translate-x-7' : 'translate-x-0'
              ]"
            ></div>
          </button>
        </div>

        <div class="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
          <div>
            <p class="text-white font-medium text-sm">{{ t('soundEffects') }}</p>
            <p class="text-slate-400 text-xs">{{ t('soundEffectsDesc') }}</p>
          </div>
          <button
            @click="toggleSetting('soundEffects')"
            :class="[
              'relative w-14 h-7 rounded-full transition-colors',
              settings.soundEffects ? 'bg-emerald-500' : 'bg-slate-600'
            ]"
          >
            <div
              :class="[
                'absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white transition-transform',
                settings.soundEffects ? 'translate-x-7' : 'translate-x-0'
              ]"
            ></div>
          </button>
        </div>
      </div>
    </div>

    <!-- Data & Privacy -->
    <div class="card p-6">
      <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span>🔐</span>
        {{ t('dataPrivacy') }}
      </h2>
      
      <div class="space-y-3">
        <button
          @click="clearCache"
          class="w-full p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-all text-start"
        >
          <p class="text-white font-medium text-sm">{{ t('clearCache') }}</p>
          <p class="text-slate-400 text-xs">{{ t('clearCacheDesc') }}</p>
        </button>

        <button
          @click="exportData"
          class="w-full p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-all text-start"
        >
          <p class="text-white font-medium text-sm">{{ t('exportData') }}</p>
          <p class="text-slate-400 text-xs">{{ t('exportDataDesc') }}</p>
        </button>

        <button
          @click="resetSettings"
          class="w-full p-3 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all text-start"
        >
          <p class="text-red-400 font-medium text-sm">{{ t('resetSettings') }}</p>
          <p class="text-slate-400 text-xs">{{ t('resetSettingsDesc') }}</p>
        </button>
      </div>
    </div>

    <!-- About -->
    <div class="card p-6 text-center">
      <div class="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
        <span class="text-3xl font-black text-white">HP</span>
      </div>
      <h3 class="text-white font-bold mb-1">High Point Gold</h3>
      <p class="text-slate-400 text-sm mb-4">v2.0 Premium Edition</p>
      <p class="text-xs text-slate-500">{{ t('copyright') }}</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  currentLang: { type: String, default: 'ar' },
  selectedCurrency: { type: String, default: 'USD' }
})

const emit = defineEmits(['lang-change', 'currency-change'])

const isDark = ref(true)
const settings = ref({
  priceAlerts: true,
  newsAlerts: true,
  soundEffects: false
})

const currencies = [
  { code: 'USD', flag: '🇺🇸' },
  { code: 'SAR', flag: '🇸🇦' },
  { code: 'AED', flag: '🇦🇪' },
  { code: 'EGP', flag: '🇪🇬' },
  { code: 'EUR', flag: '🇪🇺' },
  { code: 'GBP', flag: '🇬🇧' }
]

const translations = {
  ar: {
    settingsTitle: 'الإعدادات',
    settingsDesc: 'تخصيص تجربتك في التطبيق',
    appearance: 'المظهر',
    darkMode: 'الوضع الليلي',
    darkModeDesc: 'تفعيل/إيقاف الوضع الداكن',
    language: 'اللغة',
    currency: 'العملة الافتراضية',
    notifications: 'الإشعارات',
    priceAlerts: 'تنبيهات الأسعار',
    priceAlertsDesc: 'إشعار عند تغير أسعار الذهب',
    newsAlerts: 'أخبار السوق',
    newsAlertsDesc: 'إشعار بأحدث الأخبار',
    soundEffects: 'المؤثرات الصوتية',
    soundEffectsDesc: 'صوت عند التنبيهات',
    dataPrivacy: 'البيانات والخصوصية',
    clearCache: 'مسح ذاكرة التخزين المؤقت',
    clearCacheDesc: 'حذف البيانات المخزنة محلياً',
    exportData: 'تصدير البيانات',
    exportDataDesc: 'تنزيل بياناتك كملف JSON',
    resetSettings: 'إعادة تعيين الإعدادات',
    resetSettingsDesc: 'العودة للإعدادات الافتراضية',
    copyright: '© 2026 High Point Gold. جميع الحقوق محفوظة.'
  },
  en: {
    settingsTitle: 'Settings',
    settingsDesc: 'Customize your app experience',
    appearance: 'Appearance',
    darkMode: 'Dark Mode',
    darkModeDesc: 'Toggle dark/light theme',
    language: 'Language',
    currency: 'Default Currency',
    notifications: 'Notifications',
    priceAlerts: 'Price Alerts',
    priceAlertsDesc: 'Notify when gold price changes',
    newsAlerts: 'Market News',
    newsAlertsDesc: 'Latest news notifications',
    soundEffects: 'Sound Effects',
    soundEffectsDesc: 'Sound on alerts',
    dataPrivacy: 'Data & Privacy',
    clearCache: 'Clear Cache',
    clearCacheDesc: 'Delete locally stored data',
    exportData: 'Export Data',
    exportDataDesc: 'Download your data as JSON',
    resetSettings: 'Reset Settings',
    resetSettingsDesc: 'Restore default settings',
    copyright: '© 2026 High Point Gold. All rights reserved.'
  }
}

const t = (key) => translations[props.currentLang]?.[key] || key

// Load settings from localStorage
onMounted(() => {
  if (typeof localStorage !== 'undefined') {
    const savedSettings = localStorage.getItem('hpg-settings')
    if (savedSettings) {
      settings.value = { ...settings.value, ...JSON.parse(savedSettings) }
    }
    
    const savedTheme = localStorage.getItem('hpg-theme')
    isDark.value = savedTheme !== 'light'
  }
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.body.classList.toggle('light', !isDark.value)
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('hpg-theme', isDark.value ? 'dark' : 'light')
  }
}

const setLanguage = (lang) => {
  emit('lang-change', lang)
}

const setCurrency = (currency) => {
  emit('currency-change', currency)
}

const toggleSetting = (key) => {
  settings.value[key] = !settings.value[key]
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('hpg-settings', JSON.stringify(settings.value))
  }
}

const clearCache = () => {
  if (typeof localStorage !== 'undefined') {
    const confirmClear = confirm(t('clearCacheDesc') + '?')
    if (confirmClear) {
      localStorage.clear()
      alert('✅ ' + (props.currentLang === 'ar' ? 'تم مسح البيانات بنجاح' : 'Cache cleared successfully'))
      location.reload()
    }
  }
}

const exportData = () => {
  if (typeof localStorage !== 'undefined') {
    const data = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) data[key] = localStorage.getItem(key)
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'hpg-data-' + new Date().toISOString().split('T')[0] + '.json'
    a.click()
    URL.revokeObjectURL(url)
  }
}

const resetSettings = () => {
  const confirmReset = confirm(props.currentLang === 'ar' ? 'هل أنت متأكد من إعادة تعيين الإعدادات؟' : 'Are you sure you want to reset settings?')
  if (confirmReset && typeof localStorage !== 'undefined') {
    localStorage.removeItem('hpg-settings')
    localStorage.removeItem('hpg-theme')
    settings.value = {
      priceAlerts: true,
      newsAlerts: true,
      soundEffects: false
    }
    isDark.value = true
    alert('✅ ' + (props.currentLang === 'ar' ? 'تم إعادة التعيين بنجاح' : 'Settings reset successfully'))
  }
}
</script>

<style scoped>
.card {
  background: var(--bg-card);
  border-radius: 1rem;
  border: 1px solid var(--border-primary);
}
</style>
