export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vite-pwa/nuxt'
  ],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    goldApiKey: process.env.GOLD_API_KEY,
    geminiApiKey: process.env.GEMINI_API_KEY,
    gnewsApiKey: process.env.GNEWS_API_KEY,
    alphaVantageKey: process.env.ALPHA_VANTAGE_KEY,
    finnhubApiKey: process.env.FINNHUB_API_KEY,
  },
  nitro: {
    preset: 'node-server',
    externals: {
      inline: [],
      external: ['ws']
    }
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'هاي بوينت جولد',
      short_name: 'HPG',
      description: 'المنصة العالمية لتحليل وتداول المعادن الثمينة',
      theme_color: '#0f172a',
      background_color: '#0f172a',
      display: 'standalone',
      orientation: 'portrait',
      lang: 'ar',
      dir: 'rtl',
      icons: [
        {
          src: 'icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: 'icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}']
    },
    client: {
      installPrompt: true
    },
    devOptions: {
      enabled: process.env.NODE_ENV !== 'production',
      type: 'module'
    }
  },
  app: {
    head: {
      title: 'هاي بوينت جولد',
      meta: [
        { name: 'description', content: 'المنصة العالمية لتحليل وتداول المعادن الثمينة' },
        { name: 'theme-color', content: '#0f172a' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }
      ],
      link: [
        { rel: 'apple-touch-icon', href: '/icons/icon-192x192.png' }
      ]
    }
  }
})