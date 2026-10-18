// Turns private/register.xlsx into a backup-format file the app can restore (Data & settings > Restore from a backup file).
// Records are numbered NEW-n so the server gives them the next free WA- numbers. Nothing is invented: unknown things are flagged "needs confirmation".
const X = require("xlsx");
const fs = require("fs");
const path = require("path");
const wb = X.readFile(path.join(__dirname, "..", "private", "register.xlsx"));
const rows = X.utils.sheet_to_json(wb.Sheets["Register"], { header: 1, defval: "" });
const TYPE = { A: ["Architecture"], I: ["Interior"], R: ["Renovation"], C: ["Civil"], AC: ["Architecture", "Civil"], AI: ["Architecture", "Interior"] };
const now = new Date().toISOString();
const projects = {};
let n = 0;
for (const r of rows.slice(4)) {
  const [no, name, loc, code, , status, notes] = r;
  if (!name) continue;
  const types = TYPE[String(code).trim()] || [];
  const confirm = ["client", "lifecycle"];
  if (!types.length) confirm.push("types");
  if (!String(loc).trim()) confirm.push("location");
  n++;
  projects["NEW-" + n] = {
    name: String(name).trim(),
    location: String(loc).trim() || null,
    types,
    lifecycle: "UNKNOWN — CONFIRM",
    priority: "P2",
    conditions: [], team: [], siteIssues: [], confirm,
    notes: [String(notes).trim(), "Register no. " + no + (String(status).trim() ? " · status: " + String(status).trim() : "")].filter(Boolean).join("\n"),
    history: [{ d: now, t: "Added from Woodland Project Register (no. " + no + ")", by: "Register import" }]
  };
}
const out = { exported: now, projects };
fs.writeFileSync(path.join(__dirname, "..", "private", "register-import.json"), JSON.stringify(out, null, 1));
console.log(n, "projects written");
