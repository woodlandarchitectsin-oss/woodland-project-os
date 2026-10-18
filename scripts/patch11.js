const fs = require("fs");
let s = fs.readFileSync("test/e2e.test.js", "utf8");
const a = s.indexOf('test("PIN screen, who-are-you');
const b = s.indexOf('test("two devices: Ameen assigns');
const first = `test("sign-in with name + own PIN: wrong PIN, someone else's name, then in; no red error; staff can't edit the team", async () => {
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
    await page.waitForFunction(() => S.loaded && Object.keys(S.projects).length === 1);
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

`;
s = s.slice(0, a) + first + s.slice(b);
s = s.replace('await Sync.setMeta({ teamPin: pin, user: "Ameen" }); AUTH.need = "ok"; render(true); Sync.start();', 'await Sync.setMeta({ teamPin: pin, user: "Ameen" }); AUTH.need = "ok"; render(true); Sync.start();');
fs.writeFileSync("test/e2e.test.js", s);
