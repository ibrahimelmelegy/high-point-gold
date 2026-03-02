<template>
  <div class="card p-5">
    <div class="flex items-center gap-2 mb-4">
      <span class="text-xl">🎨</span>
      <h3 class="font-bold text-white text-sm">{{ t('title') }}</h3>
    </div>

    <!-- Theme Buttons -->
    <div class="grid grid-cols-2 gap-3 mb-4">
      <button
        @click="setTheme('dark')"
        :class="[
          'p-4 rounded-xl border-2 transition-all',
          currentTheme === 'dark'
            ? 'border-amber-500 bg-amber-500/10'
            : 'border-[var(--border-primary)] hover:border-amber-500/50'
        ]"
      >
        <div class="flex flex-col items-center gap-2">
          <div class="w-12 h-12 bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-center">
            <span class="text-2xl">🌙</span>
          </div>
          <span class="text-sm font-semibold text-white">{{ t('dark') }}</span>
        </div>
      </button>

      <button
        @click="setTheme('light')"
        :class="[
          'p-4 rounded-xl border-2 transition-all',
          currentTheme === 'light'
            ? 'border-amber-500 bg-amber-500/10'
            : 'border-[var(--border-primary)] hover:border-amber-500/50'
        ]"
      >
        <div class="flex flex-col items-center gap-2">
          <div class="w-12 h-12 bg-white rounded-lg border border-slate-300 flex items-center justify-center">
            <span class="text-2xl">☀️</span>
          </div>
          <span class="text-sm font-semibold text-white">{{ t('light') }}</span>
        </div>
      </button>
    </div>

    <!-- Auto Theme -->
    <div class="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-tertiary)]">
      <div class="flex items-center gap-2">
        <span class="text-lg">🤖</span>
        <span class="text-sm text-slate-300">{{ t('auto') }}</span>
      </div>
      <button
        @click="toggleAuto"
        :class="[
          'relative w-12 h-6 rounded-full transition-all',
          autoTheme ? 'bg-amber-500' : 'bg-slate-600'
        ]"
      >
        <div
          :class="[
            'absolute top-1 w-4 h-4 bg-white rounded-full transition-all',
            autoTheme ? 'right-1' : 'right-7'
          ]"
        ></div>
      </button>
    </div>

    <!-- Accent Colors -->
    <div class="mt-4">
      <p class="text-xs text-slate-500 mb-3 font-medium">{{ t('accentColor') }}</p>
      <div class="flex gap-2">
        <button
          v-for="color in accentColors"
          :key="color.name"
          @click="setAccentColor(color.name)"
          :class="[
            'w-10 h-10 rounded-lg transition-all flex items-center justify-center',
            accent === color.name ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
          ]"
          :style="{ backgroundColor: color.value }"
        >
          <span v-if="accent === color.name" class="text-white text-lg">✓</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  lang: { type: String, default: 'ar' }
});

const currentTheme = ref('dark');
const autoTheme = ref(false);
const accent = ref('gold');

const accentColors = [
  { name: 'gold', value: '#f59e0b' },
  { name: 'blue', value: '#3b82f6' },
  { name: 'green', value: '#10b981' },
  { name: 'purple', value: '#8b5cf6' },
  { name: 'red', value: '#ef4444' }
];

const translations = {
  ar: {
    title: 'المظهر',
    dark: 'داكن',
    light: 'فاتح',
    auto: 'تلقائي (حسب النظام)',
    accentColor: 'اللون المميز'
  },
  en: {
    title: 'Theme',
    dark: 'Dark',
    light: 'Light',
    auto: 'Auto (System)',
    accentColor: 'Accent Color'
  }
};

const t = (key) => translations[props.lang]?.[key] || key;

const setTheme = (theme) => {
  currentTheme.value = theme;
  autoTheme.value = false;
  applyTheme(theme);
  savePreferences();
};

const toggleAuto = () => {
  autoTheme.value = !autoTheme.value;
  if (autoTheme.value) {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    applyTheme(systemTheme);
  }
  savePreferences();
};

const setAccentColor = (color) => {
  accent.value = color;
  applyAccentColor(color);
  savePreferences();
};

const applyTheme = (theme) => {
  if (theme === 'light') {
    document.documentElement.style.setProperty('--bg-primary', '#f8fafc');
    document.documentElement.style.setProperty('--bg-secondary', '#f1f5f9');
    document.documentElement.style.setProperty('--bg-tertiary', '#e2e8f0');
    document.documentElement.style.setProperty('--bg-card', '#ffffff');
    document.documentElement.style.setProperty('--text-primary', '#0f172a');
    document.documentElement.style.setProperty('--text-secondary', '#475569');
    document.documentElement.style.setProperty('--border-primary', 'rgba(15, 23, 42, 0.1)');
  } else {
    document.documentElement.style.setProperty('--bg-primary', '#0a0f1a');
    document.documentElement.style.setProperty('--bg-secondary', '#0f1629');
    document.documentElement.style.setProperty('--bg-tertiary', '#151d32');
    document.documentElement.style.setProperty('--bg-card', '#12192b');
    document.documentElement.style.setProperty('--text-primary', '#f8fafc');
    document.documentElement.style.setProperty('--text-secondary', '#94a3b8');
    document.documentElement.style.setProperty('--border-primary', 'rgba(148, 163, 184, 0.1)');
  }
  document.body.className = theme;
};

const applyAccentColor = (color) => {
  const colorMap = {
    gold: '#f59e0b',
    blue: '#3b82f6',
    green: '#10b981',
    purple: '#8b5cf6',
    red: '#ef4444'
  };
  document.documentElement.style.setProperty('--accent-color', colorMap[color]);
};

const savePreferences = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme_preferences', JSON.stringify({
      theme: currentTheme.value,
      auto: autoTheme.value,
      accent: accent.value
    }));
  }
};

const loadPreferences = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('theme_preferences');
    if (saved) {
      const prefs = JSON.parse(saved);
      currentTheme.value = prefs.theme || 'dark';
      autoTheme.value = prefs.auto || false;
      accent.value = prefs.accent || 'gold';
      applyTheme(currentTheme.value);
      applyAccentColor(accent.value);
    }
  }
};

onMounted(() => {
  loadPreferences();
});
</script>
