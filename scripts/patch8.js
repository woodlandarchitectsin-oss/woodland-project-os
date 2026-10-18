const fs = require("fs");
let s = fs.readFileSync("test/backend.test.js", "utf8");
function rep(a, b) { if (!s.includes(a)) throw new Error("missing: " + a.slice(0, 70)); s = s.replace(a, b); }
rep('const T = "1111", A = "999999";\nconst mk = () => createGas({ props: { TEAM_PIN: T, ADMIN_PIN: A } });',
`const T = "1111", A = "999999";
// every test name below is a team member whose own PIN is T; A is the admin PIN (works with any name)
const NAMES = ["Ameen", "Shafeeq", "Mazin", "A", "x"];
const mk = () => {
  const g = createGas({ props: { ADMIN_PIN: A } });
  NAMES.forEach((n) => { g.call("create", A, "Ameen", { collection: "people", id: "t", fields: { name: n } }); g.call("setPin", A, "Ameen", { data: { name: n, pin: T } }); });
  return g;
};`);
rep(`test("wrong or missing PIN is refused; pins unset reports setup", () => {
  const g = mk();
  assert.equal(g.call("hello", "0000", "x", {}).code, "BAD_PIN");
  const g2 = createGas({});
  assert.equal(g2.call("hello", "1", "x", {}).code, "NOT_SET_UP");
});`,
`test("wrong PIN or wrong name is refused; admin PIN unset reports setup", () => {
  const g = mk();
  assert.equal(g.call("hello", "0000", "Shafeeq", {}).code, "BAD_PIN");
  assert.equal(g.call("hello", T, "Nobody", {}).code, "BAD_PIN");   // right PIN, but not that person's
  assert.equal(g.call("hello", T, "", {}).code, "BAD_PIN");
  assert.ok(g.call("hello", T, "shafeeq", {}).ok);                    // name is not case-sensitive
  const g2 = createGas({});
  assert.equal(g2.call("hello", "1", "x", {}).code, "NOT_SET_UP");
});`);
rep(`test("setPins creates random pins only when missing", () => {
  const g = createGas({});
  g.sandbox.setPins();
  assert.match(g.store.props.TEAM_PIN, /^\\d{4}$/);
  assert.match(g.store.props.ADMIN_PIN, /^\\d{6}$/);
  const before = g.store.props.TEAM_PIN;
  g.sandbox.setPins();
  assert.equal(g.store.props.TEAM_PIN, before);
});`,
`test("setPins creates a random admin PIN only when missing", () => {
  const g = createGas({});
  g.sandbox.setPins();
  assert.match(g.store.props.ADMIN_PIN, /^\\d{6}$/);
  const before = g.store.props.ADMIN_PIN;
  g.sandbox.setPins();
  assert.equal(g.store.props.ADMIN_PIN, before);
});`);
rep(`test("repeated wrong PINs lock out guessing", () => {
  const g = mk();
  for (let i = 0; i < 12; i++) g.call("hello", "bad" + i, "x", {});
  assert.equal(g.call("hello", T, "x", {}).code, "BAD_PIN");
});`,
`test("repeated wrong PINs for one name lock that name out, not the others", () => {
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
});`);
fs.writeFileSync("test/backend.test.js", s);
console.log("ok");
