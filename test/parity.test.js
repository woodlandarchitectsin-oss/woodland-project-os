// Feature parity: the ORIGINAL single file and the new app are given identical data and a frozen clock.
// Top 3, plan, money at risk, payment status, close rules, weekly review, daily report and the screens' text must match.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const { start, openDevice, signIn } = require("./harness");

const { makeData, NOW, ORIGINAL, HAVE } = require("./data");

const EXTRACT = () => {
  const out = {};
  out.top = topOutcomes().map((t) => t.id);
  const p = buildPlan(today());
  out.plan = { blocks: p.blocks.map((b) => [b.s, b.e, b.label, b.kind, b.t ? b.t.id : null]), capacity: p.capacity, demand: p.demand, left: p.left.map((t) => t.id), noEst: p.noEst };
  out.replan = buildPlan(today(), "10:00", "17:00").blocks.map((b) => [b.s, b.e, b.label]);
  out.risk = moneyAtRisk().map((x) => [x.p.id, x.reason, x.amt, x.sev]);
  out.pay = projects(true).map((q) => [q.id, payStatus(q), balance(q), received(q), progress(q), nextDeadline(q), condsOf(q)]);
  out.scores = Object.values(S.tasks).map((t) => [t.id, taskScore(t), recommend(t)]);
  out.owner = ownerLoad().projects.map((q) => q.id).sort().concat(ownerLoad().unassigned.map((t) => t.id).sort());
  out.waitClient = waitingClient().map((w) => [w.kind, w.p && w.p.id, w.t && w.t.id, w.what]);
  out.blocked = blocked().map((b) => [b.p && b.p.id, b.type, b.days, b.who]);
  out.report = dailyReport();
  out.views = {};
  for (const v of ["today", "projects", "tasks", "money", "follow", "meetings", "team", "weekly", "report"]) {
    UI.view = v; render(true);
    const m = document.getElementById("main").cloneNode(true);
    m.querySelectorAll(".syncline").forEach((e) => e.remove());
    m.querySelectorAll('[data-act="setPin"]').forEach((b) => { if (b.previousElementSibling) b.previousElementSibling.remove(); b.remove(); });   // PIN controls are new
    const controls = [...m.querySelectorAll("input,select,textarea")].map((e) => e.value);
    out.views[v] = { text: m.innerText.replace(/\s+/g, " ").trim(), controls };
  }
  // the project sheet of the first few projects (every field edits in place)
  out.sheets = {};
  for (const id of Object.keys(S.projects).slice(0, 6)) {
    UI.open = id; renderSheet();
    const sh = document.querySelector(".sheet").cloneNode(true);
    out.sheets[id] = { text: sh.innerText.replace(/\s+/g, " ").trim(), controls: [...sh.querySelectorAll("input,select,textarea")].map((e) => e.value) };
  }
  UI.open = null; document.getElementById("layer").innerHTML = "";
  // close rules, per project (the in-page check, exposed through the toast)
  out.close = projects(true).map((q) => { document.querySelectorAll(".toast").forEach((t) => t.remove()); const ok = closeOk(q); const t = document.querySelector(".toast"); return [q.id, ok, t ? t.textContent : ""]; });
  return out;
};

async function newOld(browser, data) {
  const ctx = await browser.newContext({ timezoneId: "Asia/Kolkata", viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript((d) => { localStorage.setItem("wpos_v1", JSON.stringify(d)); }, data);
  const page = await ctx.newPage();
  await page.clock.setFixedTime(new Date(NOW));
  await page.goto("file:///" + ORIGINAL.replace(/\\/g, "/"));
  await page.waitForFunction(() => typeof S !== "undefined" && S.loaded);
  return { ctx, page };
}

test("original file vs new app: identical results on identical data (5 data sets)", { skip: !HAVE && "private/ original files not present" }, async (t) => {
  const browser = await chromium.launch();
  try {
    for (const seed of [1, 2, 3, 4, 5]) {
      const data = makeData(seed);
      const old = await newOld(browser, data);
      const a = await old.page.evaluate(EXTRACT);
      const h = await start();
      try {
        h.seed(data);
        const ctx = await browser.newContext({ timezoneId: "Asia/Kolkata", viewport: { width: 1280, height: 900 }, serviceWorkers: "block" });
        const page = await ctx.newPage();
        await page.clock.setFixedTime(new Date(NOW));
        await page.goto(h.url);
        await signIn(page, h, "Ameen");
        await page.waitForFunction(() => S.loaded && Object.keys(S.projects).length > 30);
        await page.evaluate(async (pin) => { await Sync.setMeta({ adminPin: pin }); AUTH.admin = true; render(true); }, h.ADMIN);   // old file == admin of everything
        const b = await page.evaluate(EXTRACT);
        for (const k of ["top", "plan", "replan", "risk", "pay", "scores", "owner", "waitClient", "blocked", "report", "close"]) assert.deepEqual(b[k], a[k], `seed ${seed}: ${k} differs`);
        for (const v of Object.keys(a.views)) { assert.equal(b.views[v].text, a.views[v].text, `seed ${seed}: screen "${v}" text differs`); assert.deepEqual(b.views[v].controls, a.views[v].controls, `seed ${seed}: screen "${v}" controls differ`); }
        for (const id of Object.keys(a.sheets)) { assert.equal(b.sheets[id].text, a.sheets[id].text, `seed ${seed}: sheet ${id} text differs`); assert.deepEqual(b.sheets[id].controls, a.sheets[id].controls, `seed ${seed}: sheet ${id} controls differ`); }
        if (seed === 1) { assert.ok(a.top.length === 3, "scenario should have a full Top 3"); assert.ok(a.plan.blocks.some((x) => x[3] === "fixed"), "protected blocks present"); assert.ok(a.risk.length > 0, "money at risk present"); }
        await ctx.close();
      } finally { await h.stop(); await old.ctx.close(); }
    }
  } finally { await browser.close(); }
});
