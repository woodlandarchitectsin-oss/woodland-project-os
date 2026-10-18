const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const { start, openDevice, signIn } = require("./harness");

let browser;
test.before(async () => { browser = await chromium.launch(); });
test.after(async () => { await browser.close(); });

const waitSynced = (page) => page.waitForFunction(() => Sync.outbox().length === 0 && /Live/.test(document.querySelector(".syncTxt")?.textContent || ""), null, { timeout: 20000 });
const PROJECT = { "WA-001": { id: "WA-001", name: "Deralakatte Villa", client: "Mr. Rao", lifecycle: "WORKING DRAWINGS", priority: "P1", types: ["Residential"], conditions: [], team: [], confirm: [], siteIssues: [], agreedFee: 200000, openingReceived: 50000 } };
const PEOPLE = { "P-001": { id: "P-001", name: "Ameen", capacity: 6 }, "P-002": { id: "P-002", name: "Shafeeq", capacity: 6 }, "P-003": { id: "P-003", name: "Mazin", capacity: 6 } };
const serverData = (h) => h.gas.call("loadAll", h.ADMIN, "Ameen", {}).data;

test("sign-in with name + own PIN: wrong PIN, someone else's name, then in; no red error; staff can't edit the team", async () => {
  const h = await start();
  try {
    h.seed({ projects: PROJECT, people: { "P-001": { id: "P-001", name: "Shafeeq", capacity: 6 }, "P-002": { id: "P-002", name: "Mazin", capacity: 6 } } });
    h.gas.call("setPin", h.ADMIN, "Ameen", { data: { name: "Shafeeq", pin: "4821" } });
    h.gas.call("setPin", h.ADMIN, "Ameen", { data: { name: "Mazin", pin: "7305" } });
    const ctx = await browser.newContext({ serviceWorkers: "block" });
    const page = await ctx.newPage();
    const errors = []; page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(h.url);
    await page.waitForSelector("#loginForm");
    assert.equal(await page.locator("#errbar").count(), 0);
    const tryLogin = async (name, pin) => { await page.fill("#nameInput", name); await page.fill("#pinInput", pin); await page.click("#loginForm button"); await page.waitForSelector("#loginForm .banner"); };
    await tryLogin("Shafeeq", "0000");
    assert.match(await page.textContent("#loginForm .banner"), /Wrong name or PIN/);
    await tryLogin("Shafeeq", "7305");                         // Mazin's PIN does not work for Shafeeq
    await tryLogin("Nobody", "4821");
    await page.fill("#nameInput", "shafeeq"); await page.fill("#pinInput", "4821"); await page.click("#loginForm button");
    try { await page.waitForFunction(() => S.loaded && Object.keys(S.projects).length === 1, null, { timeout: 8000 }); } catch (e) { console.log("DIAG", JSON.stringify(await page.evaluate(() => ({ loaded: S.loaded, n: Object.keys(S.projects).length, need: AUTH.need, err: AUTH.err, busy: AUTH.busy, out: Sync.outbox().length, name: (document.getElementById("nameInput")||{}).value }))), JSON.stringify(h.state.calls)); throw e; }
    assert.equal(await page.evaluate(() => AUTH.user), "Shafeeq");            // stored with the proper spelling
    assert.equal(await page.evaluate(() => AUTH.admin), false);
    assert.match(await page.textContent("#main"), /Deralakatte Villa/);
    assert.deepEqual(errors, []);
    // Team screen for staff: read-only, no PIN or add buttons
    await page.evaluate(() => { UI.view = "team"; render(true); });
    assert.equal(await page.locator('[data-act="newPerson"], [data-act="setPin"]').count(), 0);
    assert.equal(await page.locator('#main input[data-ed^="people|"]').count(), 0);
    // sign out clears this phone; the next person signs in with their own PIN
    await page.evaluate(() => { UI.view = "data"; render(true); });
    await page.click('[data-act="changeUser"]');
    await page.waitForSelector("#loginForm");
    assert.equal(await page.evaluate(() => Object.keys(S.projects).length), 0);
    await page.fill("#nameInput", "Mazin"); await page.fill("#pinInput", "7305"); await page.click("#loginForm button");
    await page.waitForFunction(() => S.loaded && AUTH.user === "Mazin");
    await ctx.close();
  } finally { await h.stop(); }
});

test("admin adds a team member with their own PIN from the Team screen; that person can sign in, and removal switches it off", async () => {
  const h = await start();
  try {
    h.seed({ projects: PROJECT, people: PEOPLE });
    const ctx = await browser.newContext({ serviceWorkers: "block" });
    const page = await ctx.newPage();
    await page.goto(h.url);
    await page.waitForSelector("#loginForm");
    await page.fill("#nameInput", "Ameen"); await page.fill("#pinInput", h.ADMIN); await page.click("#loginForm button");   // the owner signs in with the admin PIN
    await page.waitForFunction(() => S.loaded && AUTH.admin === true);
    await page.evaluate(() => { UI.view = "team"; render(true); });
    await page.click('[data-act="newPerson"]');
    await page.fill("#m-name", "Fahad"); await page.fill("#m-role", "3D artist"); await page.fill("#m-pin", "9137");
    await page.click("#modalForm button.pri");
    await waitSynced(page);
    const people = serverData(h).people;
    const fahad = Object.values(people).find((p) => p.name === "Fahad");
    assert.ok(fahad && fahad.hasPin && !("pinHash" in fahad));
    assert.ok(h.gas.call("hello", "9137", "Fahad", {}).ok);                                  // own PIN works...
    assert.equal(h.gas.call("hello", "9137", "Shafeeq", {}).code, "BAD_PIN");                // ...for him only
    await page.evaluate(() => { const p = Object.values(S.people).find((x) => x.name === "Fahad"); removePerson = null; confirmBox = (m, l, fn) => fn(); document.querySelector('[data-act="removePerson"][data-id="' + p.id + '"]').click(); });
    await waitSynced(page);
    assert.equal(h.gas.call("hello", "9137", "Fahad", {}).code, "BAD_PIN");
    await ctx.close();
  } finally { await h.stop(); }
});

test("two devices: Ameen assigns Shafeeq a task, Shafeeq ticks it done, Ameen sees 'completed · Shafeeq' within 20 s", async () => {
  const h = await start();
  try {
    h.seed({ projects: PROJECT, people: PEOPLE });
    const A = await openDevice(browser, h, "Ameen"), S2 = await openDevice(browser, h, "Shafeeq", { viewport: { width: 390, height: 800 } });
    // Ameen: Tasks screen quick-add, assigned to Shafeeq
    await A.page.click('[data-act="view"][data-v="tasks"]');
    await A.page.fill("#qa-x", "Issue GFC drawings");
    await A.page.selectOption("#qa-proj", "WA-001");
    await A.page.selectOption("#qa-asg-x", "Shafeeq");
    await A.page.press("#qa-x", "Enter");
    await waitSynced(A.page);
    // Shafeeq's phone picks it up by itself (real 15 s poll) and it is his Top 3
    await S2.page.waitForFunction(() => Object.values(S.tasks).some((t) => t.title === "Issue GFC drawings"), null, { timeout: 22000 });
    await S2.page.waitForSelector(".top3 .tick");
    assert.match(await S2.page.textContent(".top3"), /Issue GFC drawings/);
    const t0 = Date.now();
    await S2.page.click(".top3 .tick");                         // one tap
    await waitSynced(S2.page);
    // Ameen watches the Done list
    await A.page.evaluate(() => { document.activeElement.blur(); UI.tv = "done"; render(true); });
    await A.page.waitForFunction(() => /completed · Shafeeq/.test(document.getElementById("main").textContent), null, { timeout: 22000 });
    const secs = (Date.now() - t0) / 1000;
    assert.ok(secs < 20, "took " + secs + "s");
    const tasks = Object.values(serverData(h).tasks);
    assert.equal(tasks[0].completedBy, "Shafeeq"); assert.equal(tasks[0].status, "COMPLETED"); assert.equal(tasks[0].assignee, "Shafeeq");
    assert.deepEqual(A.errors.concat(S2.errors), []);
    await A.ctx.close(); await S2.ctx.close();
  } finally { await h.stop(); }
});

test("two people create a project at the same instant: two IDs, nothing overwritten", async () => {
  const h = await start();
  try {
    h.seed({ people: PEOPLE });
    const A = await openDevice(browser, h, "Ameen"), B = await openDevice(browser, h, "Mazin");
    const create = (p, name) => p.evaluate((name) => { newProject(); document.getElementById("m-name").value = name; document.getElementById("modalForm").requestSubmit(); }, name);
    await Promise.all([create(A.page, "Alpha House"), create(B.page, "Beta Studio")]);
    await waitSynced(A.page); await waitSynced(B.page);
    const ps = Object.values(serverData(h).projects);
    assert.deepEqual(ps.map((p) => p.name).sort(), ["Alpha House", "Beta Studio"]);
    assert.equal(new Set(ps.map((p) => p.id)).size, 2);
    assert.ok(ps.every((p) => /^WA-00[12]$/.test(p.id)));
    for (const d of [A, B]) { await d.page.evaluate(() => Sync.pull()); await d.page.waitForFunction(() => Object.keys(S.projects).length === 2 && !Object.keys(S.projects).some(isTmp)); }
    await A.ctx.close(); await B.ctx.close();
  } finally { await h.stop(); }
});

test("two people edit different fields of one project: both survive, history shows who", async () => {
  const h = await start();
  try {
    h.seed({ projects: PROJECT, people: PEOPLE });
    const A = await openDevice(browser, h, "Ameen"), B = await openDevice(browser, h, "Mazin");
    await Promise.all([
      A.page.evaluate(() => setProject("WA-001", "nextAction", "Call Mr. Rao about elevation")),
      B.page.evaluate(() => setProject("WA-001", "location", "Kankanady, Mangaluru"))
    ]);
    await waitSynced(A.page); await waitSynced(B.page);
    const p = serverData(h).projects["WA-001"];
    assert.equal(p.nextAction, "Call Mr. Rao about elevation"); assert.equal(p.location, "Kankanady, Mangaluru"); assert.equal(p.client, "Mr. Rao");
    for (const d of [A, B]) { await d.page.evaluate(() => Sync.pull()); const got = await d.page.evaluate(() => [S.projects["WA-001"].nextAction, S.projects["WA-001"].location]); assert.deepEqual(got, ["Call Mr. Rao about elevation", "Kankanady, Mangaluru"]); }
    const hist = p.history.map((x) => x.by + ":" + x.t);
    assert.ok(hist.includes("Ameen:Next action: Call Mr. Rao about elevation"), hist.join("|"));
    assert.ok(hist.includes("Mazin:Location: Kankanady, Mangaluru"), hist.join("|"));
    // the history list on screen names the person
    await A.page.evaluate(() => { UI.open = "WA-001"; renderSheet(); document.querySelector('[data-sec="sheet:hist"]').open = true; });
    assert.match(await A.page.textContent('[data-sec="sheet:hist"]'), /· Mazin/);
    await A.ctx.close(); await B.ctx.close();
  } finally { await h.stop(); }
});

test("offline: 3 edits queue, app closed and reopened offline, uploaded in order when online", async () => {
  const h = await start();
  try {
    h.seed({ projects: PROJECT, people: PEOPLE });
    const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } });   // service worker allowed
    let page = await ctx.newPage();
    await page.goto(h.url);
    await signIn(page, h, "Shafeeq");
    await page.waitForFunction(() => S.loaded);
    await waitSynced(page);
    await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
    await page.waitForFunction(() => !!navigator.serviceWorker.controller || true);
    await page.reload();                                            // now controlled by the worker
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
    await page.waitForFunction(() => S.loaded);
    await ctx.setOffline(true);
    h.state.down = true;      // belt and braces: requests routed through the service worker can slip past Playwright's offline switch
    await page.waitForFunction(() => navigator.onLine === false);
    await page.evaluate(() => { setProject("WA-001", "nextAction", "first"); setProject("WA-001", "location", "Mangaluru"); setProject("WA-001", "nextAction", "third"); });
    await page.waitForFunction(() => /Offline · 3 waiting/.test(document.querySelector(".syncTxt").textContent));
    await page.close();
    page = await ctx.newPage();                                      // reopen with no internet
    await page.goto(h.url);
    await page.waitForFunction(() => S.loaded && Object.keys(S.projects).length === 1, null, { timeout: 10000 });
    assert.match(await page.textContent("#main"), /Deralakatte Villa/);        // readable from the local cache
    assert.equal(await page.evaluate(() => Sync.outbox().length), 3);
    assert.equal(await page.evaluate(() => S.projects["WA-001"].nextAction), "third");    // edits not lost on reload
    assert.match(await page.textContent(".syncTxt"), /Offline · 3 waiting/);
    assert.equal(serverData(h).projects["WA-001"].nextAction, null);
    h.state.down = false;
    await ctx.setOffline(false);
    await page.waitForFunction(() => Sync.outbox().length === 0, null, { timeout: 25000 });
    const p = serverData(h).projects["WA-001"];
    assert.equal(p.nextAction, "third"); assert.equal(p.location, "Mangaluru");
    const order = h.gas.sheet("History").rows.filter((r) => r[3] === "WA-001" && (r[4] === "nextAction" || r[4] === "location")).map((r) => r[4] + "=" + r[6]);
    assert.deepEqual(order, ["nextAction=first", "location=Mangaluru", "nextAction=third"]);
    await ctx.close();
  } finally { await h.stop(); }
});

test("closing a project with an open task or unpaid balance is refused with a reason", async () => {
  const h = await start();
  try {
    h.seed({ projects: PROJECT, people: PEOPLE, tasks: { "T-0001": { id: "T-0001", projectId: "WA-001", title: "Snag list", status: "NOT STARTED", priority: "P2", category: "SITE" } } });
    const A = await openDevice(browser, h, "Ameen");
    // normal path: app explains straight away
    await A.page.evaluate(() => setProject("WA-001", "lifecycle", "CLOSED"));
    assert.match(await A.page.textContent(".toast"), /Can't close yet: 1 open tasks · ₹1,50,000 unpaid/);
    assert.equal(serverData(h).projects["WA-001"].lifecycle, "WORKING DRAWINGS");
    // a device that skips the check (old cached version) is still refused by the server
    await A.page.evaluate(() => Sync.enqueue({ action: "save", collection: "projects", id: "WA-001", fields: { lifecycle: "CLOSED" } }));
    await A.page.waitForFunction(() => Sync.outbox().length === 0);
    assert.match(await A.page.evaluate(() => [...document.querySelectorAll(".toast")].map((t) => t.textContent).join("|")), /Completed ≠ closed/);
    assert.equal(serverData(h).projects["WA-001"].lifecycle, "WORKING DRAWINGS");
    await A.page.waitForFunction(() => S.projects["WA-001"].lifecycle === "WORKING DRAWINGS");
    await A.ctx.close();
  } finally { await h.stop(); }
});

test("staff without the admin PIN cannot change a fee; admin can; both leave history", async () => {
  const h = await start();
  try {
    h.seed({ projects: PROJECT, people: PEOPLE });
    const staff = await openDevice(browser, h, "Shafeeq");
    await staff.page.evaluate(() => { UI.view = "money"; render(true); });
    assert.ok(await staff.page.locator("#main .ed.ro").count() > 0);                 // fees are read-only
    assert.equal(await staff.page.locator('#main input[data-ed="projects|WA-001|agreedFee"]').count(), 0);
    assert.equal(await staff.page.locator('[data-act="newPayment"]').count(), 0);
    await staff.page.evaluate(() => setProject("WA-001", "agreedFee", 1));           // bypass the screen: the server must still refuse
    await staff.page.waitForFunction(() => Sync.outbox().length === 0);
    assert.match(await staff.page.evaluate(() => [...document.querySelectorAll(".toast")].map((t) => t.textContent).join("|")), /Only the admin can change fees and payment details/);
    assert.equal(serverData(h).projects["WA-001"].agreedFee, 200000);
    await staff.page.waitForFunction(() => S.projects["WA-001"].agreedFee === 200000);   // screen goes back to the true value
    // admin unlocks through the real screen
    await staff.page.evaluate(() => { UI.view = "more"; render(true); });
    await staff.page.click('[data-act="adminUnlock"]');
    await staff.page.fill("#m-pin", "000000"); await staff.page.click("#modalForm button.pri");
    await staff.page.waitForFunction(() => /not the admin PIN/.test(document.body.textContent));
    await staff.page.fill("#m-pin", h.ADMIN); await staff.page.click("#modalForm button.pri");
    await staff.page.waitForFunction(() => AUTH.admin === true);
    await staff.page.evaluate(() => { UI.view = "money"; render(true); });
    await staff.page.fill('#main input[data-ed="projects|WA-001|agreedFee"]', "250000");
    await staff.page.press('#main input[data-ed="projects|WA-001|agreedFee"]', "Enter");
    await waitSynced(staff.page);
    const p = serverData(h).projects["WA-001"];
    assert.equal(p.agreedFee, 250000);
    assert.ok(p.history.some((x) => x.by === "Shafeeq" && /Agreed fee: ₹2,50,000/.test(x.t)));
    const row = h.gas.sheet("History").rows.filter((r) => r[4] === "agreedFee").pop();
    assert.deepEqual([row[1], row[5], row[6]], ["Shafeeq", "200000", "250000"]);
    await staff.ctx.close();
  } finally { await h.stop(); }
});

test("old wpos_v1 data uploads from the device with counts matching; starter import needs admin", async () => {
  const h = await start();
  try {
    const starter = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "private", "starter-projects.json"), "utf8"));
    const counts = { projects: Object.keys(starter.projects).length, tasks: Object.keys(starter.tasks).length, people: Object.keys(starter.people).length };
    const ctx = await browser.newContext({ serviceWorkers: "block" });
    await ctx.addInitScript((d) => { if (!localStorage.getItem("wpos_v1")) localStorage.setItem("wpos_v1", JSON.stringify(d)); }, starter);
    const page = await ctx.newPage();
    await page.goto(h.url);
    await signIn(page, h, "Ameen");
    await page.waitForFunction(() => S.loaded);
    assert.equal(await page.evaluate(() => Object.keys(S.projects).length), 0);        // the starter data did NOT auto-load
    await page.evaluate(() => { UI.view = "data"; render(true); });
    assert.equal(await page.locator('[data-act="legacyUpload"]').count(), 0);          // team members don't see it
    await page.evaluate(async (pin) => { await Sync.setMeta({ adminPin: pin }); AUTH.admin = true; render(true); }, h.ADMIN);
    await page.click('[data-act="legacyUpload"]');
    assert.match(await page.textContent("#confirmWrap"), /39 projects · 16 tasks · 6 people/);   // counts shown before sending
    await page.click("#cfYes");
    await page.waitForFunction(() => /Counts match/.test(document.body.textContent), null, { timeout: 20000 });
    const d = serverData(h);
    assert.equal(Object.keys(d.projects).length, counts.projects); assert.equal(Object.keys(d.tasks).length, counts.tasks); assert.equal(Object.keys(d.people).length, counts.people);
    assert.equal(d.projects["WA-001"].name, starter.projects["WA-001"].name);
    await page.waitForFunction((n) => Object.keys(S.projects).length === n, counts.projects);
    // restoring the same file again is a merge, not a duplicate
    h.gas.call("importBulk", h.ADMIN, "Ameen", { data: starter });
    assert.equal(Object.keys(serverData(h).projects).length, counts.projects);
    await ctx.close();
  } finally { await h.stop(); }
});

test("unreachable server: readable from cache, friendly message, no endless Loading", async () => {
  const h = await start();
  try {
    h.seed({ projects: PROJECT, people: PEOPLE });
    const A = await openDevice(browser, h, "Ameen");
    await waitSynced(A.page);
    h.state.down = true;
    await A.page.evaluate(() => { setProject("WA-001", "nextAction", "x"); Sync.tick(true); });
    await A.page.waitForFunction(() => /Couldn't reach the server/.test(document.body.textContent), null, { timeout: 10000 });
    assert.match(await A.page.textContent(".syncTxt"), /Offline · 1 waiting/);
    assert.match(await A.page.textContent("#main"), /Deralakatte Villa/);
    h.state.down = false;
    await A.page.evaluate(() => Sync.tick(true));
    await A.page.waitForFunction(() => Sync.outbox().length === 0, null, { timeout: 15000 });
    // first-ever open with the server down: message + retry button instead of "Loading…" forever
    h.state.down = true;
    const ctx = await browser.newContext({ serviceWorkers: "block" }); const page = await ctx.newPage();
    await page.goto(h.url);
    await page.evaluate(async (pin) => { await Sync.setMeta({ teamPin: pin, user: "Ameen" }); AUTH.need = "ok"; render(true); Sync.start(); }, h.TEAM);
    await page.waitForSelector('#main [data-act="retry"]', { timeout: 40000 });
    assert.match(await page.textContent("#main"), /Couldn't reach the server\. Check the internet\./);
    await A.ctx.close(); await ctx.close();
  } finally { await h.stop(); }
});

test("typing a date: the year only needs its last digit(s): 5 -> 2025, 26 -> 2026, 2026 -> 2026", async () => {
  const h = await start();
  try {
    h.seed({ projects: PROJECT, people: PEOPLE });
    const A = await openDevice(browser, h, "Ameen");
    await A.page.evaluate(() => { UI.open = "WA-001"; renderSheet(); });
    const sel = '.sheet input[data-ed="projects|WA-001|nextActionDeadline"]';
    for (const [typed, want] of [["5", "2025-02-01"], ["26", "2026-02-01"], ["2027", "2027-02-01"], ["3", "2023-02-01"]]) {
      await A.page.click(sel, { position: { x: 12, y: 10 } });          // the day part of dd-mm-yyyy
      await A.page.keyboard.type("0102" + typed, { delay: 80 });
      await A.page.keyboard.press("Tab"); await A.page.keyboard.press("Tab");   // past the calendar icon, out of the box
      await A.page.waitForFunction((w) => S.projects["WA-001"].nextActionDeadline === w, want);
      await waitSynced(A.page);
      assert.equal(serverData(h).projects["WA-001"].nextActionDeadline, want, "typed " + typed);
      await A.page.waitForFunction(([s, w]) => document.querySelector(s).value === w, [sel, want]);   // after leaving the box it shows the saved date
    }
    const dates = h.gas.sheet("History").rows.filter((r) => r[4] === "nextActionDeadline").map((r) => r[6]);
    assert.deepEqual(dates, ["2025-02-01", "2026-02-01", "2027-02-01", "2023-02-01"]);       // one history line per date, never 0002 / 2022 on the way
    await A.ctx.close();
  } finally { await h.stop(); }
});
