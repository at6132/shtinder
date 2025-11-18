/**
 * Fully working Next.js custom server for Railway
 * Forces correct port + host
 */

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const port = parseInt(process.env.PORT || "8080", 10);
const host = "0.0.0.0";

const app = next({
  dev: false,
  hostname: host,
  port,
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
  console.log("✅ Next.js app prepared");
  
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end("internal server error");
      }
    }
  }).listen(port, host, () => {
    console.log(`🚀 SHTINDER running on http://${host}:${port}`);
    console.log(`📁 Serving from: ${process.cwd()}`);
  });
}).catch((err) => {
  console.error("❌ Failed to prepare Next.js app:", err);
  process.exit(1);
});

