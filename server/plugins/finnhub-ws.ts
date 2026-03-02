// Finnhub WebSocket disabled - free tier is too unreliable
// (connects for ~5s then disconnects, causing endless 429 reconnection loops)
// All price data now comes from Yahoo Finance via REST APIs

export default defineNitroPlugin((_nitro) => {
  // No-op: WebSocket disabled to prevent log spam
})
