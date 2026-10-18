const fs = require("fs");
let s = fs.readFileSync("test/e2e.test.js", "utf8");
s += `
test("typing a date by keyboard (year digit by digit) saves only the finished date, never 0002", async () => {
  const h = await start();
  try {
    h.seed({ projects: PROJECT, people: PEOPLE });
    const A = await openDevice(browser, h, "Ameen");
    await A.page.evaluate(() => { UI.open = "WA-001"; renderSheet(); });
    const sel = '.sheet input[data-ed="projects|WA-001|nextActionDeadline"]';
    await A.page.click(sel + "", { position: { x: 12, y: 10 } });     // the day part of dd-mm-yyyy
    await A.page.keyboard.type("01022026", { delay: 80 });
    await A.page.keyboard.press("Tab");
    await waitSynced(A.page);
    assert.equal(serverData(h).projects["WA-001"].nextActionDeadline, "2026-02-01");
    const dates = h.gas.sheet("History").rows.filter((r) => r[4] === "nextActionDeadline").map((r) => r[6]);
    assert.deepEqual(dates, ["2026-02-01"]);                                  // the half-typed 0002-02-01 was never sent
    assert.equal(await A.page.inputValue(sel), "2026-02-01");
    await A.ctx.close();
  } finally { await h.stop(); }
});
`;
fs.writeFileSync("test/e2e.test.js", s);
