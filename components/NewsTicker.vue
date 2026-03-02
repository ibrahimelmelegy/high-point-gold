<template>
  <div class="overflow-hidden py-2 bg-gradient-to-r from-purple-500/5 to-pink-500/5 border-y border-purple-500/10">
    <div class="flex items-center gap-2 px-4 mb-2">
      <span class="text-xs font-bold text-purple-400">📰 {{ lang === 'ar' ? 'أخبار مباشرة' : 'Live News' }}</span>
      <span v-if="loading" class="w-3 h-3 border border-purple-400 border-t-transparent rounded-full animate-spin"></span>
      <span v-else class="text-xs text-emerald-400">✓ Live</span>
    </div>
    <div ref="ticker" class="flex whitespace-nowrap animate-scroll">
      <div 
        v-for="(news, idx) in displayNews" 
        :key="idx"
        class="flex items-center gap-3 px-6 shrink-0"
      >
        <span :class="[
          'w-2 h-2 rounded-full',
          news.sentiment === 'positive' ? 'bg-emerald-400' : 
          news.sentiment === 'negative' ? 'bg-red-400' : 'bg-amber-400'
        ]"></span>
        <span class="text-sm text-slate-300">{{ news.title }}</span>
        <span class="text-xs text-purple-400/60">{{ news.source }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  lang: { type: String, default: 'ar' }
})

const loading = ref(true)
const newsData = ref([])

const displayNews = computed(() => {
  if (newsData.value.length > 0) {
    return [...newsData.value, ...newsData.value] // Duplicate for infinite scroll
  }
  return defaultNews.value
})

const defaultNews = computed(() => {
  if (props.lang === 'ar') {
    return [
      { title: 'أسعار الذهب تستقر عند مستويات قياسية', sentiment: 'positive', source: 'أخبار السوق' },
      { title: 'البنوك المركزية تزيد احتياطاتها من الذهب', sentiment: 'positive', source: 'رويترز' },
      { title: 'توقعات بارتفاع أسعار المعادن الثمينة', sentiment: 'positive', source: 'بلومبرغ' },
      { title: 'أسعار الذهب تستقر عند مستويات قياسية', sentiment: 'positive', source: 'أخبار السوق' },
    ]
  }
  return [
    { title: 'Gold prices stabilize at record levels', sentiment: 'positive', source: 'Market News' },
    { title: 'Central banks increase gold reserves', sentiment: 'positive', source: 'Reuters' },
    { title: 'Precious metals expected to rise', sentiment: 'positive', source: 'Bloomberg' },
    { title: 'Gold prices stabilize at record levels', sentiment: 'positive', source: 'Market News' },
  ]
})

const fetchNews = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/news', {
      query: { lang: props.lang }
    })
    if (response.articles && response.articles.length > 0) {
      newsData.value = response.articles.slice(0, 6)
    }
  } catch (error) {
    console.error('Failed to fetch news:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchNews()
})
</script>

<style scoped>
.animate-scroll {
  animation: scroll 30s linear infinite;
}

@keyframes scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

[dir="rtl"] .animate-scroll {
  animation: scroll-rtl 30s linear infinite;
}

@keyframes scroll-rtl {
  0% { transform: translateX(0); }
  100% { transform: translateX(50%); }
}
</style>
