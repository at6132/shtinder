const { createServer } = require("http");
const { parse } = require("url");
const path = require("path");
const next = require("next");

// This is the correct directory where .next is generated
const frontendDir = __dirname;

console.log("📁 Starting Next.js from:", frontendDir);
console.log("📝 PORT:", process.env.PORT || "8080");

const port = parseInt(process.env.PORT || "8080", 10);
const host = "0.0.0.0";

const app = next({
  dev: false,
  dir: frontendDir, // CRITICAL FIX
  hostname: host,
  port,
});

const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    console.log("✅ Next.js app prepared successfully");
    
    createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error("❌ Error handling request:", err);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.end("internal server error");
        }
      }
    })
    .listen(port, host, () => {
      console.log(`🚀 SHTINDER running at http://${host}:${port}`);
      console.log(`✅ Server is listening and ready to accept connections`);
    })
    .on("error", (err) => {
      console.error("❌ Server error:", err);
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to prepare Next.js app:", err);
    console.error("❌ Error stack:", err.stack);
    process.exit(1);
  });
