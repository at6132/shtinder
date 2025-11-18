const { createServer } = require("http");
const path = require("path");
const next = require("next");

// This is the correct directory where .next is generated
const frontendDir = __dirname;

console.log("📁 Starting Next.js from:", frontendDir);

const port = process.env.PORT || 8080;
const host = "0.0.0.0";

const app = next({
  dev: false,
  dir: frontendDir, // CRITICAL FIX
  hostname: host,
  port,
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, host, () => {
    console.log(`🚀 SHTINDER running at http://${host}:${port}`);
  });
});
