// Local test rig: static server for app/, plus a mock of the Apps Script API that runs the REAL backend/Code.gs.
const http = require("http");
const fs = require("fs");
const path = require("path");
const { createGas } = require("./gas-mock");

const TEAM = "1234", ADMIN = "987654";
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".webmanifest": "application/manifest+json", ".png": "image/png" };

function listen(server) { return new Promise((res) => server.listen(0, "127.0.0.1", () => res(server.address().port))); }

async function start(opts = {}) {
  const gas = createGas({ props: { TEAM_PIN: TEAM, ADMIN_PIN: ADMIN } });
  const state = { down: false, latency: 0, calls: [], hold: null };
  const api = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    if (req.method === "OPTIONS") { state.preflight = (state.preflight || 0) + 1; res.writeHead(204); return res.end(); }
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", async () => {
      if (state.down) return req.socket.destroy();
      if (state.hold) await state.hold;
      if (state.latency) await new Promise((r) => setTimeout(r, state.latency));
      let out;
      try { const j = JSON.parse(body); state.calls.push({ action: j.action, by: j.by, ct: req.headers["content-type"] }); } catch (e) { /* ignore */ }
      out = gas.callRaw ? gas.sandbox.doPost({ postData: { contents: body } }).getContent() : "{}";
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(out);
    });
  });
  const apiPort = await listen(api);
  const appRoot = path.join(__dirname, "..", "app");
  const web = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p === "/") p = "/index.html";
    if (p === "/config.js") { res.writeHead(200, { "Content-Type": "text/javascript" }); return res.end(`window.WPOS_CONFIG={API_URL:"http://127.0.0.1:${apiPort}/exec"};`); }
    if (p === "/service-worker.js" && state.swVersion) {   // lets a test pretend a new version was deployed
      const src = fs.readFileSync(path.join(appRoot, p), "utf8").replace(/const VERSION = "[^"]*"/, `const VERSION = "${state.swVersion}"`);
      res.writeHead(200, { "Content-Type": "text/javascript", "Cache-Control": "no-cache" }); return res.end(src);
    }
    const f = path.join(appRoot, p);
    if (!f.startsWith(appRoot) || !fs.existsSync(f)) { res.writeHead(404); return res.end("nope"); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream", "Cache-Control": "no-cache" });
    fs.createReadStream(f).pipe(res);
  });
  const webPort = await listen(web);
  return {
    gas, state, TEAM, ADMIN,
    url: `http://127.0.0.1:${webPort}/`,
    apiUrl: `http://127.0.0.1:${apiPort}/exec`,
    seed(data) { return gas.call("importBulk", ADMIN, "Ameen", { data }); },
    async stop() { api.closeAllConnections(); web.closeAllConnections(); api.close(); web.close(); }
  };
}

/** Opens a fresh "device" (isolated storage) and signs in through the real PIN + name screens. */
async function openDevice(browser, h, name, { admin = false, viewport } = {}) {
  const ctx = await browser.newContext({ viewport: viewport || { width: 1280, height: 900 }, serviceWorkers: "block" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(h.url);
  await page.fill("#pinInput", h.TEAM);
  await page.click("#pinForm button");
  await page.waitForSelector("#whoForm");
  await page.fill("#whoInput", name);
  await page.click("#whoForm button:not([type=button])");
  await page.waitForFunction(() => document.getElementById("gate").hidden === true);
  await page.waitForFunction(() => S.loaded === true);
  if (admin) {
    await page.evaluate(async (pin) => { await Sync.setMeta({ adminPin: pin }); AUTH.admin = true; render(true); }, h.ADMIN);
  }
  return { ctx, page, errors, name };
}

module.exports = { start, openDevice, TEAM, ADMIN };


