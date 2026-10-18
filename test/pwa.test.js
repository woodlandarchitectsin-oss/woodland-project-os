const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const { start, signIn } = require("./harness");

let browser;
test.before(async () => { browser = await chromium.launch(); });
test.after(async () => { await browser.close(); });

const pngSize = (f) => { const b = fs.readFileSync(f); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };

test("manifest is valid and its icons exist at the declared sizes", () => {
  const dir = path.join(__dirname, "..", "app");
  const m = JSON.parse(fs.readFileSync(path.join(dir, "manifest.webmanifest"), "utf8"));
  assert.equal(m.name, "Woodland Project OS"); assert.equal(m.short_name, "Project OS");
  assert.equal(m.theme_color, "#2c5a47"); assert.equal(m.background_color, "#f4f5f1");
  assert.equal(m.display, "standalone"); assert.equal(m.start_url, "./");
  const purposes = m.icons.map((i) => i.purpose);
  assert.ok(purposes.includes("any") && purposes.includes("maskable"));
  for (const i of m.icons) { const [w, h] = pngSize(path.join(dir, i.src)); assert.equal(`${w}x${h}`, i.sizes, i.src); }
  assert.ok(m.icons.some((i) => i.sizes === "192x192") && m.icons.some((i) => i.sizes === "512x512"));
});

test("service worker registers, Chrome reports no install problems, and the app opens with no internet", async () => {
  const h = await start();
  try {
    h.seed({ projects: { "WA-001": { id: "WA-001", name: "Offline Villa", lifecycle: "ENQUIRY" } }, people: { "P-001": { id: "P-001", name: "Ameen" } } });
    const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } });
    const page = await ctx.newPage();
    await page.goto(h.url);
    await signIn(page, h, "Ameen");
    await page.waitForFunction(() => S.loaded && Object.keys(S.projects).length === 1);
    const reg = await page.evaluate(async () => { const r = await navigator.serviceWorker.ready; return { scope: r.scope, active: !!r.active }; });
    assert.ok(reg.active); assert.match(reg.scope, /127\.0\.0\.1/);
    // what makes Chrome offer "Install app"
    const cdp = await ctx.newCDPSession(page);
    const inst = await cdp.send("Page.getInstallabilityErrors");
    assert.deepEqual(inst.installabilityErrors, []);
    const mf = await cdp.send("Page.getAppManifest");
    assert.deepEqual(mf.errors, []);
    // a visit with no internet at all
    await page.reload(); await page.waitForFunction(() => navigator.serviceWorker.controller);
    await ctx.setOffline(true); h.state.down = true;
    const off = await ctx.newPage();
    await off.goto(h.url);
    await off.waitForFunction(() => S.loaded && Object.keys(S.projects).length === 1, null, { timeout: 10000 });
    await off.evaluate(() => { UI.view = "projects"; UI.pv = "all"; render(true); });
    assert.match(await off.textContent("#main"), /Offline Villa/);
    assert.equal(await off.locator("#errbar").count(), 0);
    await ctx.close();
  } finally { await h.stop(); }
});

test("a new version shows 'New version — tap to refresh' and the tap switches to it", async () => {
  const h = await start();
  try {
    h.state.swVersion = "v1";
    h.seed({ people: { "P-001": { id: "P-001", name: "Ameen" } } });
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(h.url);
    await signIn(page, h, "Ameen");
    await page.waitForFunction(() => S.loaded);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload(); await page.waitForFunction(() => navigator.serviceWorker.controller);
    assert.equal(await page.locator("#updbar").count(), 0);
    h.state.swVersion = "v2";                                        // "deploy"
    await page.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); await r.update(); });
    await page.waitForSelector("#updbar", { timeout: 10000 });
    assert.equal(await page.textContent("#updbar"), "New version — tap to refresh");
    await Promise.all([page.waitForEvent("load"), page.click("#updbar")]);
    await page.waitForFunction(() => navigator.serviceWorker.controller);
    const keys = await page.evaluate(() => caches.keys());
    assert.ok(keys.includes("wpos-shell-v2") && !keys.includes("wpos-shell-v1"), keys.join());
    await ctx.close();
  } finally { await h.stop(); }
});
