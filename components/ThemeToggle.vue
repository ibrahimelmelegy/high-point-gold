<template>
  <button 
    @click="toggleTheme"
    class="fixed top-4 left-4 z-50 w-14 h-14 rounded-2xl backdrop-blur-xl border transition-all duration-500 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95"
    :class="isDark 
      ? 'bg-slate-900/60 border-yellow-500/30 hover:border-yellow-500/50' 
      : 'bg-white/60 border-slate-300 hover:border-slate-400'"
  >
    <Transition name="spin" mode="out-in">
      <span v-if="isDark" key="moon" class="text-2xl">🌙</span>
      <span v-else key="sun" class="text-2xl">☀️</span>
    </Transition>
  </button>
</template>

<script setup>
const isDark = ref(true);

const toggleTheme = () => {
  isDark.value = !isDark.value;
  updateTheme();
};

const updateTheme = () => {
  if (typeof document !== 'undefined') {
    if (isDark.value) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
  }
};

onMounted(() => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      isDark.value = savedTheme === 'dark';
    } else {
      // Auto-detect system preference
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    updateTheme();
  }
});

// Expose for parent components
defineExpose({ isDark });
</script>

<style scoped>
.spin-enter-active,
.spin-leave-active {
  transition: all 0.3s ease;
}

.spin-enter-from {
  opacity: 0;
  transform: rotate(-180deg) scale(0.5);
}

.spin-leave-to {
  opacity: 0;
  transform: rotate(180deg) scale(0.5);
}
</style>
