const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

// Railway sets PORT automatically, default to 3000 for local dev
const port = parseInt(process.env.PORT || '3000', 10)
const hostname = '0.0.0.0' // Bind to all interfaces (required for Railway)

// Next.js must run in production mode on Railway
const dev = false // Always production on Railway

console.log(`🚀 Starting Next.js server...`)
console.log(`📝 Port: ${port}`)
console.log(`🌐 Hostname: ${hostname}`)
console.log(`🔧 Mode: production`)
console.log(`📦 NODE_ENV: ${process.env.NODE_ENV || 'production'}`)

const app = next({ 
  dev: false, // Force production mode
  conf: undefined // Use default Next.js config
})

const handle = app.getRequestHandler()

app.prepare().then(() => {
  console.log(`✅ Next.js app prepared successfully`)
  
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('❌ Error handling request:', req.url, err)
      if (!res.headersSent) {
        res.statusCode = 500
        res.end('internal server error')
      }
    }
  })

  server.on('error', (err) => {
    console.error('❌ Server error:', err)
    process.exit(1)
  })

  server.listen(port, hostname, () => {
    console.log(`✅ Next.js server ready on http://${hostname}:${port}`)
    console.log(`✅ Server is listening and ready to accept connections`)
    console.log(`✅ Health check: http://${hostname}:${port}/`)
  })

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...')
    server.close(() => {
      console.log('✅ Server closed')
      process.exit(0)
    })
  })

  process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully...')
    server.close(() => {
      console.log('✅ Server closed')
      process.exit(0)
    })
  })
}).catch((err) => {
  console.error('❌ Failed to prepare Next.js app:', err)
  process.exit(1)
})

