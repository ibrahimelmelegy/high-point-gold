import { getAllRealtimePrices, getConnectionStatus } from '../utils/realtimeStore'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  // SSE mode: stream real-time updates
  if (query.stream === 'true') {
    setResponseHeader(event, 'Content-Type', 'text/event-stream')
    setResponseHeader(event, 'Cache-Control', 'no-cache')
    setResponseHeader(event, 'Connection', 'keep-alive')
    setResponseHeader(event, 'Access-Control-Allow-Origin', '*')

    const { subscribe } = await import('../utils/realtimeStore')
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        // Send initial data
        const initial = { type: 'init', prices: getAllRealtimePrices(), status: getConnectionStatus() }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(initial)}\n\n`))

        // Subscribe to updates
        const unsubscribe = subscribe((update) => {
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'update', ...update })}\n\n`))
          } catch {
            unsubscribe()
          }
        })

        // Send heartbeat every 15 seconds
        const heartbeat = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(`: heartbeat\n\n`))
          } catch {
            clearInterval(heartbeat)
            unsubscribe()
          }
        }, 15000)

        // Cleanup when client disconnects
        event.node.req.on('close', () => {
          unsubscribe()
          clearInterval(heartbeat)
          try { controller.close() } catch {}
        })
      }
    })

    return sendStream(event, stream)
  }

  // Regular mode: return current snapshot
  return {
    success: true,
    prices: getAllRealtimePrices(),
    status: getConnectionStatus(),
    timestamp: new Date().toISOString()
  }
})
