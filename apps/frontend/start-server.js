// Alternative start script for Next.js (Option B)
// Use this if standalone mode doesn't work
// Change package.json start to: "node start-server.js"

const { createServer } = require('http');
const next = require('next');

const port = parseInt(process.env.PORT || '8080', 10);
const hostname = '0.0.0.0';

console.log(`🚀 Starting Next.js server...`);
console.log(`📝 PORT: ${port}`);
console.log(`🌐 HOST: ${hostname}`);

const app = next({
  dev: false,
  hostname,
  port
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, hostname, () => {
    console.log(`✅ Ready on http://${hostname}:${port}`);
  });
}).catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

