const test = require("node:test");
const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { start, openDevice } = require("./harness");

let browser;
test.before(async () => { browser = await chromium.launch(); });
test.after(async () => { await browser.close(); });

const PROJECT = { "WA-001": { id: "WA-001", name: "Deralakatte Villa", client: "Mr. Rao", lifecycle: "WORKING DRAWINGS", priority: "P1", types: ["Residential"], conditions: [], team: [], confirm: [], history: [] } };
const PEOPLE = { "P-001": { id: "P-001", name: "Ameen", capacity: 6 } };
const sheetRows = (page) => page.evaluate(() => [...document.querySelectorAll("#layer input")].map((x) => x.value).filter((v) => /^Task /.test(v)));

// Regression: with a slow server a redraw is often waiting while the person types. Tapping the Add button used to take focus
// from the text box, which ran the waiting redraw and replaced the button under the finger: the tap was lost and the text wiped.
test("tapping Add (finger down 120 ms) while a redraw is waiting still adds the task", async () => {
  const h = await start();
  try {
    h.seed({ projects: PROJECT, people: PEOPLE });
    const A = await openDevice(browser, h, "Ameen", { admin: true });
    await A.page.evaluate(() => { UI.open = "WA-001"; render(true); });
    await A.page.waitForSelector("#qa-WA-001");
    for (const title of ["Task one", "Task two", "Task three"]) {
      await A.page.click("#qa-WA-001");
      await A.page.type("#qa-WA-001", title);
      await A.page.evaluate(() => render());                       // an acknowledgement from the server arrives while typing
      assert.equal(await A.page.evaluate(() => pendingRender), true);
      const b = await A.page.locator(".sheet .quick .btn.pri").boundingBox();
      await A.page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
      await A.page.mouse.down(); await A.page.waitForTimeout(120); await A.page.mouse.up();
      await A.page.waitForTimeout(300);
      assert.ok((await sheetRows(A.page)).includes(title), title + " is not in the project sheet");
      assert.equal(await A.page.inputValue("#qa-WA-001"), "", "the box should be empty after adding");
    }
    assert.deepEqual((await sheetRows(A.page)).sort(), ["Task one", "Task three", "Task two"]);
    await A.page.waitForFunction(() => Sync.outbox().length === 0, null, { timeout: 20000 });
    const onServer = Object.values(h.gas.call("loadAll", h.ADMIN, "Ameen", {}).data.tasks).map((t) => t.title).sort();
    assert.deepEqual(onServer, ["Task one", "Task three", "Task two"]);       // each exactly once
    assert.deepEqual(A.errors, []);
    await A.ctx.close();
  } finally { await h.stop(); }
});

// A slow server (several seconds per call, like Google's): add three tasks with Enter, one after another.
test("adding several tasks with Enter while earlier ones are still saving: all stay on screen, none duplicated", async () => {
  const h = await start();
  try {
    h.seed({ projects: PROJECT, people: PEOPLE });
    const A = await openDevice(browser, h, "Ameen", { admin: true });
    await A.page.evaluate(() => { UI.open = "WA-001"; render(true); });
    await A.page.waitForSelector("#qa-WA-001");
    h.state.latency = 2000;
    for (const title of ["Task one", "Task two", "Task three"]) {
      await A.page.fill("#qa-WA-001", title);
      await A.page.press("#qa-WA-001", "Enter");
      await A.page.waitForTimeout(500);
    }
    for (let i = 0; i < 8; i++) {
      assert.deepEqual((await sheetRows(A.page)).sort(), ["Task one", "Task three", "Task two"], "rows wrong at step " + i);
      await A.page.waitForTimeout(1500);
    }
    await A.page.waitForFunction(() => Sync.outbox().length === 0, null, { timeout: 60000 });
    const onServer = Object.values(h.gas.call("loadAll", h.ADMIN, "Ameen", {}).data.tasks).map((t) => t.title).sort();
    assert.deepEqual(onServer, ["Task one", "Task three", "Task two"]);
    assert.deepEqual(await sheetRows(A.page).then((r) => r.sort()), onServer);
    assert.deepEqual(A.errors, []);
    await A.ctx.close();
  } finally { await h.stop(); }
});
