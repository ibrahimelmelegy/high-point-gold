<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-xl font-bold text-white flex items-center gap-2">
        <span class="text-2xl">📰</span>
        {{ title }}
      </h3>
      <div v-if="loading" class="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-if="!loading && articles.length === 0" class="text-center py-8 text-slate-500 bg-[var(--bg-card)] rounded-xl">
      {{ t('noNews') }}
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <a 
        v-for="(article, idx) in articles" 
        :key="idx"
        :href="article.url"
        target="_blank"
        rel="noopener noreferrer"
        class="group block bg-[var(--bg-card)] rounded-xl overflow-hidden border border-[var(--border-primary)] hover:border-purple-500/50 transition-all hover:-translate-y-1"
      >
        <!-- Image -->
        <div class="aspect-video bg-slate-800 relative overflow-hidden">
          <img 
            v-if="article.image" 
            :src="article.image" 
            :alt="article.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            @error="article.image = null"
          >
          <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <span class="text-4xl">📰</span>
          </div>
          
          <!-- Date Badge -->
          <div class="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur rounded text-[10px] text-white">
            {{ formatDate(article.publishedAt) }}
          </div>
        </div>

        <!-- Content -->
        <div class="p-4">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xs font-bold text-purple-400">{{ article.source }}</span>
            <span :class="[
              'w-2 h-2 rounded-full', 
              article.sentiment === 'positive' ? 'bg-emerald-500' : 
              article.sentiment === 'negative' ? 'bg-red-500' : 'bg-amber-500'
            ]"></span>
          </div>
          
          <h4 class="font-bold text-white mb-2 line-clamp-2">{{ article.title }}</h4>
          <p class="text-xs text-slate-400 line-clamp-3">{{ article.description }}</p>

          <div class="mt-4 flex items-center text-xs text-slate-500 group-hover:text-purple-400 transition-colors">
            {{ t('readMore') }}
            <span class="mx-1">→</span>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  lang: {
    type: String,
    default: 'ar'
  },
  limit: {
    type: Number,
    default: 6
  }
})

const articles = ref([])
const loading = ref(true)

const t = (key) => {
  const translations = {
    ar: {
      latestNews: 'آخر أخبار الذهب والأسواق',
      noNews: 'لا توجد أخبار متاحة حالياً',
      readMore: 'اقرأ المزيد'
    },
    en: {
      latestNews: 'Latest Gold & Market News',
      noNews: 'No news available at the moment',
      readMore: 'Read more'
    }
  }
  return translations[props.lang]?.[key] || key
}

const title = computed(() => {
  return t('latestNews')
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat(props.lang === 'ar' ? 'ar-EG' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const fetchNews = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/news', {
      query: { lang: props.lang }
    })
    
    if (response.articles) {
      articles.value = response.articles.slice(0, props.limit)
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
