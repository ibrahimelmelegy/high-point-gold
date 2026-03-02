<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4 mb-6">
      <button @click="$emit('back')" class="p-2 rounded-lg hover:bg-white/5">
        <span class="text-xl">←</span>
      </button>
      <div>
        <h2 class="text-xl font-bold text-white">{{ t('title') }}</h2>
        <p class="text-sm text-slate-500">{{ t('desc') }}</p>
      </div>
    </div>

    <!-- Export Options Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Portfolio Report -->
      <div class="card p-5 hover:border-purple-500/50 cursor-pointer" @click="exportPortfolio('pdf')">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
            <span class="text-2xl">📊</span>
          </div>
          <div class="flex-1">
            <h3 class="font-bold text-white">{{ t('portfolio') }}</h3>
            <p class="text-xs text-slate-400">{{ t('portfolioDesc') }}</p>
          </div>
          <div class="flex gap-2">
            <button 
              @click.stop="exportPortfolio('pdf')"
              :disabled="exporting === 'portfolio-pdf'"
              class="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/30"
            >
              {{ exporting === 'portfolio-pdf' ? '...' : 'PDF' }}
            </button>
            <button 
              @click.stop="exportPortfolio('excel')"
              :disabled="exporting === 'portfolio-excel'"
              class="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500/30"
            >
              {{ exporting === 'portfolio-excel' ? '...' : 'Excel' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Price History -->
      <div class="card p-5 hover:border-orange-500/50 cursor-pointer">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
            <span class="text-2xl">📈</span>
          </div>
          <div class="flex-1">
            <h3 class="font-bold text-white">{{ t('priceHistory') }}</h3>
            <p class="text-xs text-slate-400">{{ t('priceHistoryDesc') }}</p>
          </div>
          <div class="flex gap-2">
            <button 
              @click="exportPriceHistory('pdf')"
              :disabled="exporting === 'price-pdf'"
              class="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/30"
            >
              {{ exporting === 'price-pdf' ? '...' : 'PDF' }}
            </button>
            <button 
              @click="exportPriceHistory('excel')"
              :disabled="exporting === 'price-excel'"
              class="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500/30"
            >
              {{ exporting === 'price-excel' ? '...' : 'Excel' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Zakat Report -->
      <div class="card p-5 hover:border-emerald-500/50 cursor-pointer">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
            <span class="text-2xl">🕌</span>
          </div>
          <div class="flex-1">
            <h3 class="font-bold text-white">{{ t('zakatReport') }}</h3>
            <p class="text-xs text-slate-400">{{ t('zakatDesc') }}</p>
          </div>
          <button 
            @click="exportZakat"
            :disabled="exporting === 'zakat'"
            class="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/30"
          >
            {{ exporting === 'zakat' ? '...' : 'PDF' }}
          </button>
        </div>
      </div>

      <!-- Investment Certificate -->
      <div class="card p-5 hover:border-amber-500/50 cursor-pointer">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
            <span class="text-2xl">🏆</span>
          </div>
          <div class="flex-1">
            <h3 class="font-bold text-white">{{ t('certificate') }}</h3>
            <p class="text-xs text-slate-400">{{ t('certificateDesc') }}</p>
          </div>
          <button 
            @click="exportCertificate"
            :disabled="exporting === 'certificate'"
            class="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/30"
          >
            {{ exporting === 'certificate' ? '...' : 'PDF' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="card p-4 bg-emerald-500/20 border-emerald-500/30">
      <p class="text-sm text-emerald-400 flex items-center gap-2">
        <span>✅</span>
        {{ successMessage }}
      </p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  goldPrice: { type: Number, default: 2650 },
  silverPrice: { type: Number, default: 30 },
  lang: { type: String, default: 'ar' }
})

const exporting = ref('')
const successMessage = ref('')

// Dynamic imports for PDF and Excel
const loadJsPDF = async () => {
  const { jsPDF } = await import('jspdf')
  await import('jspdf-autotable')
  return jsPDF
}

const loadXLSX = async () => {
  return await import('xlsx')
}

const getPortfolioData = () => {
  if (typeof window === 'undefined') return []
  const saved = localStorage.getItem('portfolio')
  try { return saved ? JSON.parse(saved) : [] } catch { return [] }
}

const exportPortfolio = async (format) => {
  exporting.value = `portfolio-${format}`
  
  try {
    const portfolio = getPortfolioData()
    const date = new Date().toLocaleDateString()
    
    if (format === 'pdf') {
      const jsPDF = await loadJsPDF()
      const doc = new jsPDF()
      
      // Title
      doc.setFontSize(20)
      doc.text('Portfolio Report', 105, 20, { align: 'center' })
      doc.setFontSize(10)
      doc.text(`Generated: ${date}`, 105, 28, { align: 'center' })
      
      // Portfolio table
      if (portfolio.length > 0) {
        const tableData = portfolio.map(item => [
          item.type,
          item.weight + 'g',
          '$' + item.purchasePrice,
          item.purchaseDate,
          '$' + (item.weight * (item.type === 'gold' ? props.goldPrice : props.silverPrice) / 31.1).toFixed(2)
        ])
        
        doc.autoTable({
          head: [['Type', 'Weight', 'Purchase Price', 'Date', 'Current Value']],
          body: tableData,
          startY: 40
        })
      } else {
        doc.text('No portfolio data available', 20, 50)
      }
      
      // Summary
      const totalValue = portfolio.reduce((sum, item) => {
        const price = item.type === 'gold' ? props.goldPrice : props.silverPrice
        return sum + (item.weight * price / 31.1)
      }, 0)
      
      doc.setFontSize(12)
      doc.text(`Total Portfolio Value: $${totalValue.toFixed(2)}`, 20, doc.lastAutoTable?.finalY + 20 || 70)
      
      doc.save('portfolio-report.pdf')
      
    } else {
      const XLSX = await loadXLSX()
      
      const data = portfolio.map(item => ({
        Type: item.type,
        'Weight (g)': item.weight,
        'Purchase Price ($)': item.purchasePrice,
        'Purchase Date': item.purchaseDate,
        'Current Value ($)': (item.weight * (item.type === 'gold' ? props.goldPrice : props.silverPrice) / 31.1).toFixed(2)
      }))
      
      const ws = XLSX.utils.json_to_sheet(data.length > 0 ? data : [{ Message: 'No portfolio data' }])
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Portfolio')
      XLSX.writeFile(wb, 'portfolio-report.xlsx')
    }
    
    showSuccess(format === 'pdf' ? 'PDF exported successfully!' : 'Excel exported successfully!')
    
  } catch (error) {
    console.error('Export error:', error)
  } finally {
    exporting.value = ''
  }
}

const exportPriceHistory = async (format) => {
  exporting.value = `price-${format}`
  
  try {
    const priceData = generatePriceHistory()
    
    if (format === 'pdf') {
      const jsPDF = await loadJsPDF()
      const doc = new jsPDF()
      
      doc.setFontSize(20)
      doc.text('Gold Price History', 105, 20, { align: 'center' })
      doc.setFontSize(10)
      doc.text(`Last 7 days - Generated: ${new Date().toLocaleDateString()}`, 105, 28, { align: 'center' })
      
      doc.autoTable({
        head: [['Date', 'Gold Price ($)', 'Silver Price ($)', 'Change %']],
        body: priceData.map(p => [p.date, p.gold, p.silver, p.change]),
        startY: 40
      })
      
      doc.save('price-history.pdf')
      
    } else {
      const XLSX = await loadXLSX()
      
      const ws = XLSX.utils.json_to_sheet(priceData.map(p => ({
        Date: p.date,
        'Gold Price ($)': p.gold,
        'Silver Price ($)': p.silver,
        'Change (%)': p.change
      })))
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Price History')
      XLSX.writeFile(wb, 'price-history.xlsx')
    }
    
    showSuccess(`${format.toUpperCase()} exported!`)
    
  } finally {
    exporting.value = ''
  }
}

const exportZakat = async () => {
  exporting.value = 'zakat'
  
  try {
    const jsPDF = await loadJsPDF()
    const doc = new jsPDF()
    
    doc.setFontSize(22)
    doc.text('Zakat Certificate', 105, 25, { align: 'center' })
    
    doc.setFontSize(12)
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50)
    doc.text(`Gold Price: $${props.goldPrice}/oz`, 20, 60)
    doc.text(`Silver Price: $${props.silverPrice}/oz`, 20, 70)
    
    doc.setFontSize(10)
    doc.text('Nisab (Gold): 85 grams', 20, 90)
    doc.text('Nisab (Silver): 595 grams', 20, 100)
    doc.text('Zakat Rate: 2.5%', 20, 110)
    
    doc.save('zakat-report.pdf')
    showSuccess('Zakat report exported!')
    
  } finally {
    exporting.value = ''
  }
}

const exportCertificate = async () => {
  exporting.value = 'certificate'
  
  try {
    const jsPDF = await loadJsPDF()
    const doc = new jsPDF('landscape')
    
    // Border
    doc.setDrawColor(218, 165, 32)
    doc.setLineWidth(3)
    doc.rect(10, 10, 277, 190)
    
    doc.setFontSize(32)
    doc.text('Certificate of Investment', 148.5, 50, { align: 'center' })
    
    doc.setFontSize(16)
    doc.text('This certifies that the holder has invested in precious metals', 148.5, 80, { align: 'center' })
    doc.text('through High Point Gold Trading Platform', 148.5, 95, { align: 'center' })
    
    doc.setFontSize(12)
    doc.text(`Issue Date: ${new Date().toLocaleDateString()}`, 148.5, 130, { align: 'center' })
    doc.text(`Gold Price at Issue: $${props.goldPrice}/oz`, 148.5, 145, { align: 'center' })
    
    doc.setFontSize(10)
    doc.text('High Point Technology © 2026', 148.5, 180, { align: 'center' })
    
    doc.save('investment-certificate.pdf')
    showSuccess('Certificate exported!')
    
  } finally {
    exporting.value = ''
  }
}

const generatePriceHistory = () => {
  const data = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const goldVariation = (Math.random() - 0.5) * 50
    const silverVariation = (Math.random() - 0.5) * 2
    data.push({
      date: date.toLocaleDateString(),
      gold: (props.goldPrice + goldVariation).toFixed(2),
      silver: (props.silverPrice + silverVariation).toFixed(2),
      change: ((goldVariation / props.goldPrice) * 100).toFixed(2) + '%'
    })
  }
  return data
}

const showSuccess = (msg) => {
  successMessage.value = msg
  setTimeout(() => { successMessage.value = '' }, 3000)
}

const translations = {
  ar: {
    title: 'تصدير التقارير',
    desc: 'حمّل تقاريرك بصيغة PDF أو Excel',
    portfolio: 'تقرير المحفظة',
    portfolioDesc: 'جميع استثماراتك مع الأرباح',
    priceHistory: 'سجل الأسعار',
    priceHistoryDesc: 'أسعار آخر 7 أيام',
    zakatReport: 'شهادة الزكاة',
    zakatDesc: 'تقرير حساب الزكاة',
    certificate: 'شهادة الاستثمار',
    certificateDesc: 'شهادة رسمية لاستثمارك'
  },
  en: {
    title: 'Export Reports',
    desc: 'Download your reports as PDF or Excel',
    portfolio: 'Portfolio Report',
    portfolioDesc: 'All your investments with profits',
    priceHistory: 'Price History',
    priceHistoryDesc: 'Last 7 days prices',
    zakatReport: 'Zakat Certificate',
    zakatDesc: 'Zakat calculation report',
    certificate: 'Investment Certificate',
    certificateDesc: 'Official investment certificate'
  }
}

const t = (key) => translations[props.lang]?.[key] || key
</script>
