const fs = require("fs");
const path = require("path");
const STARTER = path.join(__dirname, "..", "private", "starter-projects.json");
const ORIGINAL = path.join(__dirname, "..", "private", "woodland-project-os.original.html");
const NOW = "2026-10-19T09:30:00+05:30";    // a Monday
const HAVE = fs.existsSync(ORIGINAL) && fs.existsSync(STARTER);

function prng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const addDays = (iso, n) => { const d = new Date(iso + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

/** Starter projects + people, plus a deterministic spread of tasks, fees, payments, blockers and meetings. */
function makeData(seed) {
  const r = prng(seed), pick = (a) => a[Math.floor(r() * a.length)];
  const d = JSON.parse(fs.readFileSync(STARTER, "utf8"));
  const today = "2026-10-19";
  d.people = d.people || {};
  if (!Object.values(d.people).some((p) => p.name === "Ameen")) d.people["P-900"] = { id: "P-900", name: "Ameen", role: "Principal", capacity: 6 };
  const names = Object.values(d.people).map((p) => p.name);
  const ids = Object.keys(d.projects);
  const LC = ["ENQUIRY", "PROPOSAL / QUOTATION", "CONCEPT DESIGN", "WORKING DRAWINGS", "EXECUTION / SITE", "SNAGGING", "ON HOLD", "CLOSED", "WON"];
  ids.forEach((id) => {
    const p = d.projects[id];
    if (r() < 0.6) p.lifecycle = pick(LC);
    if (r() < 0.7) { p.agreedFee = pick([150000, 300000, 450000, 800000]); p.openingReceived = pick([0, 50000, 150000, 300000, null]); }
    if (r() < 0.4) p.quotedFee = pick([200000, 500000]);
    if (r() < 0.4) p.nextPaymentDue = addDays(today, Math.floor(r() * 30) - 15);
    if (r() < 0.25) p.blocker = { type: pick(["CLIENT", "OWNER", "SITE", "PAYMENT"]), since: addDays(today, -Math.floor(r() * 20)), who: pick(names), action: "Chase" };
    if (r() < 0.3) p.conditions = [pick(["WAITING FOR CLIENT", "QUOTATION SENT", "PAYMENT PENDING", "SITE ISSUE", "HANDOVER PENDING"])];
    if (r() < 0.2) p.nextActionOwner = pick(["Ameen", "Ameen", "Client"].concat(names));
    if (r() < 0.2) p.siteIssues = [{ d: addDays(today, -3), text: "Leak at parapet", status: r() < 0.5 ? "OPEN" : "RESOLVED" }];
    if (r() < 0.3) p.priority = pick(["P0", "P1", "P2", "P3"]);
  });
  d.tasks = d.tasks || {};
  for (let i = 0; i < 45; i++) {
    const id = "T-" + String(1000 + i);
    d.tasks[id] = { id, projectId: pick(ids), title: "Task " + i + " " + pick(["quotation", "drawing", "site visit", "3D view", "BOQ", "call client"]), assignee: r() < 0.8 ? pick(["Ameen", "Ameen"].concat(names)) : null, priority: pick(["P0", "P1", "P2", "P2", "P3"]), status: pick(["NOT STARTED", "NOT STARTED", "IN PROGRESS", "WAITING", "BLOCKED", "COMPLETED", "CANCELLED"]), category: pick(["DESIGN", "DRAWING", "COMMUNICATION", "ADMIN", "SITE"]), created: addDays(today, -Math.floor(r() * 10)), due: r() < 0.7 ? addDays(today, Math.floor(r() * 16) - 6) : null, est: r() < 0.8 ? pick([15, 20, 30, 45, 60, 90, 120, 180]) : null, clientDependency: r() < 0.15, startAfter: r() < 0.1 ? addDays(today, 2) : null, updatedAt: addDays(today, -Math.floor(r() * 12)) + "T08:00:00.000Z" };
  }
  d.payments = {};
  for (let i = 0; i < 12; i++) { const id = "PAY-" + String(1 + i).padStart(4, "0"); d.payments[id] = { id, projectId: pick(ids), amount: pick([25000, 50000, 120000]), date: addDays(today, -Math.floor(r() * 40)), milestone: "Stage " + i }; }
  d.meetings = {
    "M-0001": { id: "M-0001", projectId: ids[0], date: today, time: "11:00", purpose: "Design review", duration: 60, decisions: ["Freeze elevation"] },
    "M-0002": { id: "M-0002", projectId: ids[1], date: addDays(today, 2), time: "10:30", purpose: "Site visit", duration: 90, decisions: [] }
  };
  d.settings = {};
  return d;
}


module.exports = { makeData, NOW, ORIGINAL, STARTER, HAVE, addDays };
