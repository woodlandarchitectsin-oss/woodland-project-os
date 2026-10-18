const fs = require("fs");
let s = fs.readFileSync("app/app.js", "utf8");
const a = '    if(el.type==="date"&&partialDate(el.value))return;   // wait until the whole year is typed\n';
if (!s.includes(a)) throw new Error("missing");
s = s.replace(a, `    if(el.type==="date"){
      // years are typed as the last digit(s) of 202x: 5 -> 2025, 26 -> 2026; longer half-typed years wait until finished
      const m=/^(\d{1,6})-(\d{2})-(\d{2})$/.exec(el.value);
      if(m&&+m[1]<100){const y=+m[1];el.value=(y<10?2020+y:2000+y)+"-"+m[2]+"-"+m[3];}
      else if(partialDate(el.value))return;
    }
`);
fs.writeFileSync("app/app.js", s);
let t = fs.readFileSync("test/e2e.test.js", "utf8");
const i = t.indexOf('test("typing a date by keyboard');
t = t.slice(0, i) + `test("typing a date: the year only needs its last digit(s): 5 -> 2025, 26 -> 2026, 2026 -> 2026", async () => {
  const h = await start();
  try {
    h.seed({ projects: PROJECT, people: PEOPLE });
    const A = await openDevice(browser, h, "Ameen");
    await A.page.evaluate(() => { UI.open = "WA-001"; renderSheet(); });
    const sel = '.sheet input[data-ed="projects|WA-001|nextActionDeadline"]';
    for (const [typed, want] of [["5", "2025-02-01"], ["26", "2026-02-01"], ["2027", "2027-02-01"], ["3", "2023-02-01"]]) {
      await A.page.click(sel, { position: { x: 12, y: 10 } });          // the day part of dd-mm-yyyy
      await A.page.keyboard.type("0102" + typed, { delay: 80 });
      await A.page.keyboard.press("Tab");
      await waitSynced(A.page);
      assert.equal(serverData(h).projects["WA-001"].nextActionDeadline, want, "typed " + typed);
      assert.equal(await A.page.inputValue(sel), want);
    }
    const dates = h.gas.sheet("History").rows.filter((r) => r[4] === "nextActionDeadline").map((r) => r[6]);
    assert.ok(dates.every((d) => /^20(2\d)-/.test(d)), dates.join());       // never 0002 or 0005
    await A.ctx.close();
  } finally { await h.stop(); }
});
`;
fs.writeFileSync("test/e2e.test.js", t);
