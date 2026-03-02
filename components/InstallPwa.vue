<template>
  <button 
    v-if="canInstall"
    @click="installPwa"
    class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
  >
    <span>📱</span>
    <span class="hidden sm:inline">{{ lang === 'ar' ? 'تثبيت التطبيق' : 'Install App' }}</span>
  </button>
</template>

<script setup>
const props = defineProps({
  lang: { type: String, default: 'ar' }
})

const canInstall = ref(false)
let deferredPrompt = null

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt = e
      canInstall.value = true
    })
  }
})

const installPwa = async () => {
  if (!deferredPrompt) {
    alert(props.lang === 'ar' ? 'التطبيق لا يمكن تثبيته حالياً (ربما مثبت بالفعل أو المتصفح لا يدعم).' : 'App cannot be installed right now (maybe already installed).')
    return
  }
  
  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  
  if (outcome === 'accepted') {
    canInstall.value = false
    deferredPrompt = null
  }
}
</script>
