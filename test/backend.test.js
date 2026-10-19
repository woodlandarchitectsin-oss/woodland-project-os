const test = require("node:test");
const assert = require("node:assert/strict");
const { createGas } = require("./gas-mock");

const T = "1111", A = "999999";
// every test name below is a team member whose own PIN is T; A is the admin PIN (works with any name)
const NAMES = ["Ameen", "Shafeeq", "Mazin", "A", "x"];
const mk = () => {
  const g = createGas({ props: { ADMIN_PIN: A } });
  NAMES.forEach((n) => { g.call("create", A, "Ameen", { collection: "people", id: "t", fields: { name: n } }); g.call("setPin", A, "Ameen", { data: { name: n, pin: T } }); });
  return g;
};

test("wrong PIN or wrong name is refused; admin PIN unset reports setup", () => {
  const g = mk();
  assert.equal(g.call("hello", "0000", "Shafeeq", {}).code, "BAD_PIN");
  assert.equal(g.call("hello", T, "Nobody", {}).code, "BAD_PIN");   // right PIN, but not that person's
  assert.equal(g.call("hello", T, "", {}).code, "BAD_PIN");
  assert.ok(g.call("hello", T, "shafeeq", {}).ok);                    // name is not case-sensitive
  const g2 = createGas({});
  assert.equal(g2.call("hello", "1", "x", {}).code, "NOT_SET_UP");
});

test("setPins creates a random admin PIN only when missing", () => {
  const g = createGas({});
  g.sandbox.setPins();
  assert.match(g.store.props.ADMIN_PIN, /^\d{6}$/);
  const before = g.store.props.ADMIN_PIN;
  g.sandbox.setPins();
  assert.equal(g.store.props.ADMIN_PIN, before);
});

test("first call creates the sheet with all tabs, frozen headers, text-formatted id/date columns", () => {
  const g = mk();
  const r = g.call("hello", T, "Ameen", {});
  assert.ok(r.ok);
  const ss = g.spreadsheet();
  assert.equal(ss.title, "Woodland Project OS — data");
  const names = ss.getSheets().map((s) => s.name).sort();
  assert.deepEqual(names, ["Deleted", "History", "Meetings", "Ops", "Payments", "People", "Plans", "Projects", "Settings", "Tasks"]);
  const p = g.sheet("Projects");
  assert.equal(p.frozen, 1);
  assert.equal(p.formats[0], "@"); // id
  const hdr = p.rows[0];
  assert.equal(p.formats[hdr.indexOf("enquiryDate")], "@");
  assert.equal(p.formats[hdr.indexOf("nextPaymentDue")], "@");
});

test("server assigns sequential ids, two creates never collide, ids not reused after delete", () => {
  const g = mk();
  const a = g.call("create", T, "Ameen", { collection: "projects", id: "tmp1", fields: { name: "A", lifecycle: "ENQUIRY" }, opId: "o1" });
  const b = g.call("create", T, "Shafeeq", { collection: "projects", id: "tmp2", fields: { name: "B", lifecycle: "ENQUIRY" }, opId: "o2" });
  assert.equal(a.id, "WA-001"); assert.equal(b.id, "WA-002");
  assert.equal(g.call("delete", A, "Ameen", { collection: "projects", id: "WA-002" }).ok, true);
  const c = g.call("create", T, "Mazin", { collection: "projects", id: "tmp3", fields: { name: "C" }, opId: "o3" });
  assert.equal(c.id, "WA-003");
  const all = g.call("loadAll", T, "x", {}).data.projects;
  assert.deepEqual(Object.keys(all).sort(), ["WA-001", "WA-003"]);
});

test("retried operation (same opId) is applied once", () => {
  const g = mk();
  const p = { collection: "tasks", id: "t", fields: { title: "X", projectId: "WA-001" }, opId: "dup" };
  const a = g.call("create", T, "Ameen", p), b = g.call("create", T, "Ameen", p);
  assert.equal(a.id, b.id);
  assert.equal(Object.keys(g.call("loadAll", T, "x", {}).data.tasks).length, 1);
});

test("field-level merge: different fields of one project both survive", () => {
  const g = mk();
  const c = g.call("create", T, "Ameen", { collection: "projects", id: "t", fields: { name: "P", client: "C", lifecycle: "ENQUIRY" }, opId: "c" });
  g.call("save", T, "Ameen", { collection: "projects", id: c.id, fields: { nextAction: "Call client" }, opId: "s1" });
  g.call("save", T, "Mazin", { collection: "projects", id: c.id, fields: { location: "Kankanady" }, historyAdd: [{ d: "2026-10-18T05:00:00Z", t: "Location: Kankanady" }], opId: "s2" });
  const p = g.call("loadAll", T, "x", {}).data.projects[c.id];
  assert.equal(p.nextAction, "Call client"); assert.equal(p.location, "Kankanady"); assert.equal(p.client, "C");
  assert.equal(p.history[0].by, "Mazin");
});

test("history tab records who, when, old and new", () => {
  const g = mk();
  const c = g.call("create", T, "Ameen", { collection: "projects", id: "t", fields: { name: "P", priority: "P2" }, opId: "c" });
  g.call("save", T, "Shafeeq", { collection: "projects", id: c.id, fields: { priority: "P0" }, opId: "s" });
  const rows = g.sheet("History").rows;
  const last = rows[rows.length - 1];
  assert.equal(last[1], "Shafeeq"); assert.equal(last[4], "priority"); assert.equal(last[5], "P2"); assert.equal(last[6], "P0");
});

test("team cannot change fees, payments, archive or delete; admin can", () => {
  const g = mk();
  const c = g.call("create", T, "Ameen", { collection: "projects", id: "t", fields: { name: "P" }, opId: "c" });
  for (const f of [{ agreedFee: 500000 }, { quotedFee: 1 }, { openingReceived: 1 }, { nextPaymentDue: "2026-11-01" }]) {
    const r = g.call("save", T, "Shafeeq", { collection: "projects", id: c.id, fields: f });
    assert.equal(r.code, "FORBIDDEN", JSON.stringify(f));
  }
  assert.equal(g.call("create", T, "Shafeeq", { collection: "payments", id: "t", fields: { projectId: c.id, amount: 10 } }).code, "FORBIDDEN");
  assert.equal(g.call("archive", T, "Shafeeq", { id: c.id }).code, "FORBIDDEN");
  assert.equal(g.call("delete", T, "Shafeeq", { collection: "projects", id: c.id }).code, "FORBIDDEN");
  assert.equal(g.call("importBulk", T, "Shafeeq", { data: {} }).code, "FORBIDDEN");
  assert.ok(g.call("save", A, "Ameen", { collection: "projects", id: c.id, fields: { agreedFee: 500000 } }).ok);
  assert.ok(g.call("archive", A, "Ameen", { id: c.id }).row.archived);
  assert.ok(g.call("restore", A, "Ameen", { id: c.id }).ok);
  assert.equal(g.call("loadAll", T, "x", {}).data.projects[c.id].agreedFee, 500000);
});

test("team may set a fee field to the value it already has (no-op is not a change)", () => {
  const g = mk();
  const c = g.call("create", A, "Ameen", { collection: "projects", id: "t", fields: { name: "P", agreedFee: 100 } });
  assert.ok(g.call("save", T, "Mazin", { collection: "projects", id: c.id, fields: { agreedFee: 100, client: "Z" } }).ok);
});

test("CLOSED refused with open tasks, obligations or unpaid balance; allowed when clean", () => {
  const g = mk();
  const c = g.call("create", A, "Ameen", { collection: "projects", id: "t", fields: { name: "P", lifecycle: "COMPLETION", agreedFee: 100000, openingReceived: 40000, conditions: ["HANDOVER PENDING"] } });
  const t = g.call("create", T, "Ameen", { collection: "tasks", id: "t", fields: { projectId: c.id, title: "Snag list", status: "NOT STARTED" } });
  let r = g.call("save", T, "Ameen", { collection: "projects", id: c.id, fields: { lifecycle: "CLOSED" } });
  assert.equal(r.code, "CLOSE_REFUSED");
  assert.match(r.error, /1 open tasks/); assert.match(r.error, /handover pending/); assert.match(r.error, /60,000 unpaid/);
  g.call("save", T, "Shafeeq", { collection: "tasks", id: t.id, fields: { status: "COMPLETED", completedBy: "Shafeeq", completed: "2026-10-18" } });
  g.call("save", T, "Ameen", { collection: "projects", id: c.id, fields: { conditions: [] } });
  g.call("create", A, "Ameen", { collection: "payments", id: "t", fields: { projectId: c.id, amount: 60000, date: "2026-10-18" } });
  r = g.call("save", T, "Ameen", { collection: "projects", id: c.id, fields: { lifecycle: "CLOSED" } });
  assert.ok(r.ok, JSON.stringify(r));
});

test("changesSince returns only newer rows plus deletions; applying twice is harmless", () => {
  const g = mk();
  const a = g.call("create", T, "A", { collection: "tasks", id: "t", fields: { title: "one" } });
  const wait = (ms) => { const e = Date.now() + ms; while (Date.now() < e); };
  wait(5);
  const mid = g.call("hello", T, "A", {}).serverTime;
  wait(5);
  const b = g.call("create", T, "A", { collection: "tasks", id: "t", fields: { title: "two" } });
  const r1 = g.call("changesSince", T, "A", { since: mid });
  assert.deepEqual(r1.changes.tasks.map((x) => x.id), [b.id]);
  const r2 = g.call("changesSince", T, "A", { since: "" });
  assert.equal(r2.changes.tasks.length, 2);
  g.call("delete", A, "A", { collection: "tasks", id: a.id });
  const r3 = g.call("changesSince", T, "A", { since: mid });
  assert.deepEqual(r3.deleted, [{ collection: "tasks", id: a.id }]);
});

test("importBulk merges by id, never deletes, bumps counters, reports counts", () => {
  const g = mk();
  const data = { projects: { "WA-001": { id: "WA-001", name: "Old A", types: ["Interior"], enquiryDate: "2026-01-02", history: [{ d: "2026-01-02T00:00:00Z", t: "Imported" }] }, "WA-007": { id: "WA-007", name: "Seven" } }, tasks: { "T-0001": { id: "T-0001", projectId: "WA-001", title: "Quote", est: 30, clientDependency: true } }, people: { "P-001": { id: "P-001", name: "Shafeeq", capacity: 6 } }, settings: { owner: "Ameen", buffer: 10 } };
  const r = g.call("importBulk", A, "Ameen", { data });
  assert.equal(r.counts.projects.created, 2); assert.equal(r.counts.tasks.created, 1);
  const r2 = g.call("importBulk", A, "Ameen", { data });
  assert.equal(r2.counts.projects.updated, 2); assert.equal(r2.counts.projects.created, 0);
  const all = g.call("loadAll", T, "x", {}).data;
  assert.equal(all.projects["WA-001"].enquiryDate, "2026-01-02"); // not turned into a Date
  assert.deepEqual(all.projects["WA-001"].types, ["Interior"]);
  assert.equal(all.tasks["T-0001"].clientDependency, true);
  assert.equal(all.tasks["T-0001"].est, 30);
  assert.equal(all.settings.owner, "Ameen");
  const n = g.call("create", T, "A", { collection: "projects", id: "t", fields: { name: "New" } });
  assert.equal(n.id, "WA-008");
});

test("a cell over 49,000 characters is refused, not truncated", () => {
  const g = mk();
  const r = g.call("create", T, "A", { collection: "projects", id: "t", fields: { name: "P", notes: "x".repeat(49500) } });
  assert.equal(r.code, "TOO_LARGE");
});

test("repeated wrong PINs for one name lock that name out, not the others", () => {
  const g = mk();
  for (let i = 0; i < 8; i++) g.call("hello", "bad" + i, "Mazin", {});
  assert.equal(g.call("hello", T, "Mazin", {}).code, "BAD_PIN");
  assert.ok(g.call("hello", T, "Shafeeq", {}).ok);
});

test("each person has their own PIN: it only works with their own name; the hash never leaves the server", () => {
  const g = mk();
  g.call("setPin", A, "Ameen", { data: { name: "Shafeeq", pin: "4821" } });
  assert.ok(g.call("hello", "4821", "Shafeeq", {}).ok);
  assert.equal(g.call("hello", "4821", "Mazin", {}).code, "BAD_PIN");   // Shafeeq's PIN is no use as Mazin
  assert.equal(g.call("hello", T, "Shafeeq", {}).code, "BAD_PIN");      // his old PIN stopped working
  const r = g.call("hello", "4821", "Shafeeq", {});
  assert.equal(r.admin, false); assert.equal(r.name, "Shafeeq");
  const people = g.call("loadAll", "4821", "Shafeeq", {}).data.people;
  const sh = Object.values(people).find((p) => p.name === "Shafeeq");
  assert.equal(sh.hasPin, true); assert.ok(!("pinHash" in sh));
  assert.ok(!JSON.stringify(g.call("changesSince", "4821", "Shafeeq", { since: "" })).includes("pinHash"));
  const sheetHasPlainPin = g.sheet("People").rows.some((row) => row.some((c) => String(c) === "4821"));
  assert.equal(sheetHasPlainPin, false);                                // stored hashed only
});

test("the server records the real person, not whatever name the app sends", () => {
  const g = mk();
  const c = g.call("create", "1111", "Mazin", { collection: "tasks", id: "t", fields: { title: "X" } });
  const row = g.sheet("History").rows.pop();
  assert.equal(row[1], "Mazin");
  assert.equal(g.call("loadAll", T, "mazin", {}).data.tasks[c.id].updatedBy, "Mazin");   // canonical spelling
});

test("only the admin can set, change or clear PINs, and add or remove people", () => {
  const g = mk();
  assert.equal(g.call("setPin", T, "Mazin", { data: { name: "Shafeeq", pin: "5555" } }).code, "FORBIDDEN");
  assert.equal(g.call("create", T, "Mazin", { collection: "people", id: "t", fields: { name: "Intruder" } }).code, "FORBIDDEN");
  assert.equal(g.call("save", T, "Mazin", { collection: "people", id: "P-001", fields: { role: "boss" } }).code, "FORBIDDEN");
  assert.equal(g.call("setPin", A, "Ameen", { data: { name: "Shafeeq", pin: "12" } }).code, "BAD_PIN_FORMAT");
  assert.equal(g.call("setPin", A, "Ameen", { data: { name: "Nobody", pin: "1234" } }).code, "NOT_FOUND");
  assert.ok(g.call("setPin", A, "Ameen", { data: { name: "Shafeeq", pin: "" } }).ok);          // clear = no access
  assert.equal(g.call("hello", T, "Shafeeq", {}).code, "BAD_PIN");
});

test("removing a person (archive) switches off their login", () => {
  const g = mk();
  const ppl = g.call("loadAll", A, "Ameen", {}).data.people;
  const id = Object.values(ppl).find((p) => p.name === "Mazin").id;
  assert.ok(g.call("save", A, "Ameen", { collection: "people", id, fields: { archived: true } }).ok);
  assert.equal(g.call("hello", T, "Mazin", {}).code, "BAD_PIN");
});

test("a PIN can't be smuggled in through save, create or import", () => {
  const g = mk();
  g.call("save", A, "Ameen", { collection: "people", id: "P-001", fields: { pinHash: "abc", hasPin: false } });
  g.call("importBulk", A, "Ameen", { data: { people: { "P-001": { id: "P-001", name: "Ameen", pinHash: "evil" } } } });
  assert.ok(g.call("hello", T, "Ameen", {}).ok);   // still the real PIN
});

test("garbage request does not crash", () => {
  const g = mk();
  assert.equal(g.callRaw("not json").code, "BAD_REQUEST");
  assert.equal(g.call("nope", T, "x", {}).code, "BAD_ACTION");
});

test("import: records whose id starts with NEW get the next free numbers, nothing existing is touched", () => {
  const g = mk();
  g.call("importBulk", A, "Ameen", { data: { projects: { "WA-001": { id: "WA-001", name: "Existing", client: "Keep me" }, "WA-002": { id: "WA-002", name: "Existing 2" } } } });
  const r = g.call("importBulk", A, "Ameen", { data: { projects: { "NEW-1": { name: "Fresh A" }, "NEW-2": { name: "Fresh B", types: ["Interior"] } } } });
  assert.equal(r.counts.projects.created, 2); assert.equal(r.counts.projects.updated, 0);
  const all = g.call("loadAll", A, "Ameen", {}).data.projects;
  assert.deepEqual(Object.keys(all).sort(), ["WA-001", "WA-002", "WA-003", "WA-004"]);
  assert.equal(all["WA-001"].client, "Keep me"); assert.equal(all["WA-003"].name, "Fresh A"); assert.deepEqual(all["WA-004"].types, ["Interior"]);
  assert.equal(g.call("create", A, "Ameen", { collection: "projects", id: "t", fields: { name: "Next" } }).id, "WA-005");
});

test("registry feed: needs the link key, lists only non-archived projects, never leaks money or notes", () => {
  const g = mk();
  const reg = (key) => JSON.parse(g.sandbox.doPost({ postData: { contents: JSON.stringify({ action: "registry", key }) } }).getContent());
  assert.equal(reg("x").code, "NOT_SET_UP");
  g.sandbox.setLinkKey();
  const key = g.store.props.LINK_KEY;
  assert.match(key, /^[0-9a-f]{64}$/);
  g.sandbox.setLinkKey();
  assert.equal(g.store.props.LINK_KEY, key);               // never replaced once set
  assert.equal(reg("").code, "BAD_KEY");
  assert.equal(reg("wrong").code, "BAD_KEY");
  assert.equal(reg(A).code, "BAD_KEY");                     // the admin PIN is not a link key
  const mkp = (f) => g.call("create", A, "Ameen", { collection: "projects", id: "t", fields: f });
  const a = mkp({ name: "Site job", client: "C1", location: "Kadri", lifecycle: "EXECUTION / SITE", startDate: "2026-09-01", targetDate: "2026-12-20", agreedFee: 500000, notes: "secret note" });
  mkp({ name: "Enquiry only", lifecycle: "ENQUIRY" });
  mkp({ name: "Design job", lifecycle: "CONCEPT DESIGN" });
  const gone = mkp({ name: "Archived job", lifecycle: "EXECUTION / SITE" });
  g.call("archive", A, "Ameen", { collection: "projects", id: gone.id });
  const r = reg(key);
  assert.ok(r.ok);
  assert.deepEqual(r.projects.map((p) => p.name).sort(), ["Design job", "Enquiry only", "Site job"]);
  const site = r.projects.find((p) => p.name === "Site job");
  assert.deepEqual(site, { id: site.id, name: "Site job", client: "C1", location: "Kadri", lifecycle: "EXECUTION / SITE", group: "exec", active: true, startDate: "2026-09-01", targetDate: "2026-12-20" });
  assert.equal(r.projects.find((p) => p.name === "Enquiry only").active, false);
  assert.equal(r.projects.find((p) => p.name === "Design job").active, true);
  assert.ok(!JSON.stringify(r).includes("secret note") && !JSON.stringify(r).includes("500000"));
});
