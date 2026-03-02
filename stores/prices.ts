import { defineStore } from 'pinia'

export const usePriceStore = defineStore('prices', () => {
  const goldData = ref<any>(null)
  const silverData = ref<any>(null)
  const selectedCurrency = ref('USD')
  const loading = ref(false)

  const goldChange = computed(() => {
    if (!goldData.value?.price || !goldData.value?.open_price) return 0
    return Number(((goldData.value.price - goldData.value.open_price) / goldData.value.open_price * 100).toFixed(2))
  })

  const silverChange = computed(() => {
    if (!silverData.value?.price || !silverData.value?.open_price) return 0
    return Number(((silverData.value.price - silverData.value.open_price) / silverData.value.open_price * 100).toFixed(2))
  })

  async function fetchPrices() {
    loading.value = true
    try {
      const [gold, silver] = await Promise.all([
        $fetch(`/api/metal?metal=XAU&currency=${selectedCurrency.value}`),
        $fetch(`/api/metal?metal=XAG&currency=${selectedCurrency.value}`)
      ])
      goldData.value = gold || { price: 2650, price_gram_24k: 85, open_price: 2640 }
      silverData.value = silver || { price: 30, price_gram: 1, open_price: 29.5 }
    } catch (e) {
      console.error('Failed to fetch prices:', e)
    } finally {
      loading.value = false
    }
  }

  function setCurrency(curr: string) {
    selectedCurrency.value = curr
    fetchPrices()
  }

  return {
    goldData,
    silverData,
    selectedCurrency,
    loading,
    goldChange,
    silverChange,
    fetchPrices,
    setCurrency
  }
})
