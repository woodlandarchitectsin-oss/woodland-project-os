// Screenshots of the OLD file and the NEW app side by side (390 px and 1280 px, light and dark) and a pixel comparison.
// Images go to test/screenshots/ (not committed: they show real client names).
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const { PNG } = require("pngjs");
const pixelmatch = require("pixelmatch");
const { start } = require("./harness");
const { makeData, NOW, ORIGINAL, HAVE } = require("./data");

const OUT = path.join(__dirname, "screenshots");
const SCREENS = [["today", "today"], ["projects", "projects"], ["tasks", "tasks"], ["money", "money"], ["weekly", "weekly"], ["sheet", "sheet"]];
const MAX_DIFF = 0.002;        // 0.2 % of pixels

function show(page, key) {
  return page.evaluate((key) => {
    document.querySelectorAll(".toast").forEach((t) => t.remove());
    if (key === "sheet") { UI.view = "projects"; render(true); UI.open = Object.keys(S.projects).find((id) => S.projects[id].agreedFee && S.projects[id].history && S.projects[id].history.length) || Object.keys(S.projects)[2]; renderSheet(); }
    else { UI.open = null; document.getElementById("layer").innerHTML = ""; UI.view = key; UI.pv = "active"; UI.tv = "my"; render(true); }
    window.scrollTo(0, 0);
    const sh = document.querySelector(".sheet"); if (sh) sh.scrollTop = 0;
  }, key);
}
const shot = (page, key) => (key === "sheet" ? page.locator(".sheet-wrap") : page).screenshot(key === "sheet" ? {} : { fullPage: true });

test("old file vs new app: screenshots match (390 / 1280 px, light / dark)", { skip: !HAVE && "private/ original files not present" }, async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const data = makeData(1);
  const h = await start();
  h.seed(data);
  const report = [];
  try {
    for (const scheme of ["light", "dark"]) for (const width of [390, 1280]) {
      const opts = { timezoneId: "Asia/Kolkata", viewport: { width, height: width === 390 ? 844 : 900 }, colorScheme: scheme };
      const octx = await browser.newContext(opts);
      await octx.addInitScript((d) => { localStorage.setItem("wpos_v1", JSON.stringify(d)); }, data);
      const op = await octx.newPage(); await op.clock.setFixedTime(new Date(NOW));
      await op.goto("file:///" + ORIGINAL.replace(/\\/g, "/")); await op.waitForFunction(() => typeof S !== "undefined" && S.loaded);
      const nctx = await browser.newContext({ ...opts, serviceWorkers: "block" });
      const np = await nctx.newPage(); await np.clock.setFixedTime(new Date(NOW));
      await np.goto(h.url);
      await np.fill("#pinInput", h.TEAM); await np.click("#pinForm button");
      await np.waitForSelector("#whoForm"); await np.fill("#whoInput", "Ameen"); await np.click("#whoForm button:not([type=button])");
      await np.waitForFunction(() => S.loaded && Object.keys(S.projects).length > 30);
      await np.evaluate(async (pin) => { await Sync.setMeta({ adminPin: pin }); AUTH.admin = true; render(true); }, h.ADMIN);
      await np.addStyleTag({ content: ".syncline{display:none!important}" });      // the only intended addition to the layout
      await np.evaluate(() => document.fonts.ready); await op.evaluate(() => document.fonts.ready);
      for (const [key] of SCREENS) {
        await show(op, key); await show(np, key);
        await op.waitForTimeout(150); await np.waitForTimeout(150);
        const a = await shot(op, key), b = await shot(np, key);
        const name = `${scheme}-${width}-${key}`;
        fs.writeFileSync(path.join(OUT, name + "-old.png"), a); fs.writeFileSync(path.join(OUT, name + "-new.png"), b);
        const A = PNG.sync.read(a), B = PNG.sync.read(b);
        if (A.width !== B.width || A.height !== B.height) { report.push(`${name}: SIZE ${A.width}x${A.height} vs ${B.width}x${B.height}`); continue; }
        const diff = new PNG({ width: A.width, height: A.height });
        const n = pixelmatch(A.data, B.data, diff.data, A.width, A.height, { threshold: 0.1 });
        fs.writeFileSync(path.join(OUT, name + "-diff.png"), PNG.sync.write(diff));
        report.push(`${name}: ${n} px differ (${(n / (A.width * A.height) * 100).toFixed(3)} %)`);
        if (n / (A.width * A.height) > MAX_DIFF) report.push("   ^^^ OVER THRESHOLD");
      }
      await octx.close(); await nctx.close();
    }
  } finally { await h.stop(); await browser.close(); }
  console.log(report.join("\n"));
  assert.ok(!report.some((l) => /OVER THRESHOLD|SIZE/.test(l)), "visual differences:\n" + report.join("\n"));
});
