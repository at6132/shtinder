/**
 * Fully working Next.js custom server for Railway
 * Forces correct port + host
 */

const { createServer } = require("http");
const next = require("next");

const port = process.env.PORT || 8080;
const host = "0.0.0.0";

const app = next({
  dev: false,
  hostname: host,
  port,
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, host, () => {
    console.log(`🚀 SHTINDER running on http://${host}:${port}`);
  });
});

