<template>
  <div class="technical-gauge">
    <h4 class="gauge-title">{{ title }}</h4>
    <div class="gauge-container">
      <svg viewBox="0 0 200 120" class="gauge-svg">
        <!-- Gradient definitions -->
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#ef4444" />
            <stop offset="25%" stop-color="#f97316" />
            <stop offset="50%" stop-color="#eab308" />
            <stop offset="75%" stop-color="#84cc16" />
            <stop offset="100%" stop-color="#22c55e" />
          </linearGradient>
        </defs>
        
        <!-- Background arc (gray) -->
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#374151"
          stroke-width="12"
          stroke-linecap="round"
        />
        
        <!-- Colored arc segments -->
        <!-- Strong Sell (red) -->
        <path
          d="M 20 100 A 80 80 0 0 1 52 45"
          fill="none"
          stroke="#ef4444"
          stroke-width="12"
          stroke-linecap="round"
        />
        <!-- Sell (orange) -->
        <path
          d="M 52 45 A 80 80 0 0 1 100 20"
          fill="none"
          stroke="#f97316"
          stroke-width="12"
        />
        <!-- Neutral (yellow) -->
        <path
          d="M 100 20 A 80 80 0 0 1 148 45"
          fill="none"
          stroke="#eab308"
          stroke-width="12"
        />
        <!-- Buy (light green) -->
        <path
          d="M 148 45 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#22c55e"
          stroke-width="12"
          stroke-linecap="round"
        />
        
        <!-- Needle -->
        <g :style="{ transform: `rotate(${needleRotation}deg)`, transformOrigin: '100px 100px' }" class="needle-group">
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="35"
            stroke="#1f2937"
            stroke-width="3"
            stroke-linecap="round"
          />
          <circle cx="100" cy="100" r="8" fill="#1f2937" />
          <circle cx="100" cy="100" r="4" fill="#6366f1" />
        </g>
      </svg>
      
      <!-- Labels -->
      <div class="gauge-labels">
        <span class="label label-strong-sell">{{ lang === 'ar' ? 'بيع قوي' : 'Strong Sell' }}</span>
        <span class="label label-sell">{{ lang === 'ar' ? 'بيع' : 'Sell' }}</span>
        <span class="label label-neutral">{{ lang === 'ar' ? 'محايد' : 'Neutral' }}</span>
        <span class="label label-buy">{{ lang === 'ar' ? 'شراء' : 'Buy' }}</span>
        <span class="label label-strong-buy">{{ lang === 'ar' ? 'شراء قوي' : 'Strong Buy' }}</span>
      </div>
    </div>
    
    <!-- Signal Badge -->
    <div :class="['signal-badge', signalClass]">
      {{ signalText }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  value: {
    type: Number,
    default: 50, // 0-100
    validator: (v) => v >= 0 && v <= 100
  },
  title: {
    type: String,
    default: 'Technical Indicators'
  },
  lang: {
    type: String,
    default: 'ar'
  }
})

// Convert value (0-100) to rotation angle (-90 to 90 degrees)
const needleRotation = computed(() => {
  // 0 = -90deg (Strong Sell), 50 = 0deg (Neutral), 100 = 90deg (Strong Buy)
  return ((props.value / 100) * 180) - 90
})

const signalText = computed(() => {
  if (props.value <= 20) return props.lang === 'ar' ? 'بيع قوي' : 'Strong Sell'
  if (props.value <= 40) return props.lang === 'ar' ? 'بيع' : 'Sell'
  if (props.value <= 60) return props.lang === 'ar' ? 'محايد' : 'Neutral'
  if (props.value <= 80) return props.lang === 'ar' ? 'شراء' : 'Buy'
  return props.lang === 'ar' ? 'شراء قوي' : 'Strong Buy'
})

const signalClass = computed(() => {
  if (props.value <= 20) return 'signal-strong-sell'
  if (props.value <= 40) return 'signal-sell'
  if (props.value <= 60) return 'signal-neutral'
  if (props.value <= 80) return 'signal-buy'
  return 'signal-strong-buy'
})
</script>

<style scoped>
.technical-gauge {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  min-width: 180px;
}

.gauge-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #9ca3af;
  margin-bottom: 0.5rem;
  text-align: center;
}

.gauge-container {
  position: relative;
  width: 160px;
  height: 100px;
}

.gauge-svg {
  width: 100%;
  height: auto;
}

.needle-group {
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.gauge-labels {
  position: absolute;
  bottom: -20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 5px;
}

.label {
  font-size: 0.5rem;
  color: #6b7280;
  white-space: nowrap;
}

.label-strong-sell { color: #ef4444; }
.label-sell { color: #f97316; }
.label-neutral { color: #eab308; }
.label-buy { color: #84cc16; }
.label-strong-buy { color: #22c55e; }

.signal-badge {
  margin-top: 1.5rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.signal-strong-sell {
  background-color: #ef4444;
  color: white;
}

.signal-sell {
  background-color: #f97316;
  color: white;
}

.signal-neutral {
  background-color: #eab308;
  color: #1f2937;
}

.signal-buy {
  background-color: #84cc16;
  color: #1f2937;
}

.signal-strong-buy {
  background-color: #22c55e;
  color: white;
}
</style>
