const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

// Railway sets PORT automatically, default to 3000 for local dev
const port = parseInt(process.env.PORT || '3000', 10)
const hostname = '0.0.0.0' // Bind to all interfaces (required for Railway)

// Next.js should run in production mode on Railway
const dev = process.env.NODE_ENV === 'development'

console.log(`Starting Next.js server...`)
console.log(`- Port: ${port}`)
console.log(`- Hostname: ${hostname}`)
console.log(`- Mode: ${dev ? 'development' : 'production'}`)
console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'not set'}`)

const app = next({ 
  dev,
  hostname,
  port,
  // Explicitly set production mode
  conf: {
    // Ensure we're using production optimizations
  }
})

const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  server.listen(port, hostname, (err) => {
    if (err) {
      console.error('Failed to start server:', err)
      process.exit(1)
    }
    console.log(`✅ Next.js server ready on http://${hostname}:${port}`)
    console.log(`✅ Server is listening and ready to accept connections`)
  })

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...')
    server.close(() => {
      console.log('Server closed')
      process.exit(0)
    })
  })
}).catch((err) => {
  console.error('Failed to prepare Next.js app:', err)
  process.exit(1)
})

