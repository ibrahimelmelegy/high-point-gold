<template>
  <div class="card p-6">
    <h3 class="font-bold text-white mb-4 flex items-center gap-2">
      <span>🗳️</span>
      {{ t('sentimentTitle') }}
    </h3>
    
    <div v-if="!hasVoted" class="text-center">
      <p class="text-slate-400 text-sm mb-6">{{ t('votePrompt') }}</p>
      
      <div class="flex gap-4">
        <button 
          @click="vote('bullish')" 
          class="flex-1 py-3 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/50 hover:bg-emerald-500/20 text-emerald-400 font-bold transition-all flex items-center justify-center gap-2 group"
        >
          <span class="group-hover:-translate-y-1 transition-transform">🚀</span>
          {{ t('bullish') }}
        </button>
        
        <button 
          @click="vote('bearish')" 
          class="flex-1 py-3 px-4 rounded-xl bg-red-500/10 border border-red-500/50 hover:bg-red-500/20 text-red-400 font-bold transition-all flex items-center justify-center gap-2 group"
        >
          <span class="group-hover:translate-y-1 transition-transform">🐻</span>
          {{ t('bearish') }}
        </button>
      </div>
    </div>

    <div v-else class="animate-fade-in">
      <div class="flex justify-between items-end mb-2">
        <span class="text-emerald-400 font-bold">{{ bullishPercent }}% {{ t('bullish') }}</span>
        <span class="text-red-400 font-bold">{{ bearishPercent }}% {{ t('bearish') }}</span>
      </div>
      
      <div class="h-4 bg-slate-800 rounded-full overflow-hidden flex relative">
        <div 
          class="h-full bg-emerald-500 transition-all duration-1000 ease-out"
          :style="{ width: `${bullishPercent}%` }"
        ></div>
        <div 
          class="h-full bg-red-500 transition-all duration-1000 ease-out"
          :style="{ width: `${bearishPercent}%` }"
        ></div>
        
        <!-- Separator Line -->
        <div class="absolute top-0 bottom-0 w-1 bg-slate-900" :style="{ left: `${bullishPercent}%` }"></div>
      </div>

      <p class="text-center text-xs text-slate-500 mt-4">
        {{ t('totalVotes') }}: {{ totalVotes.toLocaleString() }}
      </p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  lang: {
    type: String,
    default: 'ar'
  }
})

const hasVoted = ref(false)
const bullishPercent = ref(65)
const bearishPercent = computed(() => 100 - bullishPercent.value)
const totalVotes = ref(15420)

const t = (key) => {
  const translations = {
    ar: {
      sentimentTitle: 'ما هو توقعك للذهب؟',
      votePrompt: 'شارك برأيك مع آلاف المتداولين، هل سيرتفع الذهب أم ينخفض؟',
      bullish: 'صعود (Bullish)',
      bearish: 'هبوط (Bearish)',
      totalVotes: 'إجمالي الأصوات',
    },
    en: {
      sentimentTitle: 'What is your sentiment on Gold?',
      votePrompt: 'Share your opinion with thousands of traders. Will Gold rise or fall?',
      bullish: 'Bullish',
      bearish: 'Bearish',
      totalVotes: 'Total Votes',
    }
  }
  return translations[props.lang]?.[key] || key
}

const vote = (type) => {
  // Simulate API call
  hasVoted.value = true
  totalVotes.value++
  
  // Adjust percentages slightly based on vote
  // In a real app, this would come from the backend
  if (type === 'bullish') {
    bullishPercent.value = Math.min(bullishPercent.value + 1, 99)
  } else {
    bullishPercent.value = Math.max(bullishPercent.value - 1, 1)
  }
  
  // Save to local storage
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('hasVotedGold', 'true')
  }
}

onMounted(() => {
  if (typeof localStorage !== 'undefined' && localStorage.getItem('hasVotedGold')) {
    hasVoted.value = true
  }
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
