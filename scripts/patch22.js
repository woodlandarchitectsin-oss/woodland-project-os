const fs = require("fs");
let s = fs.readFileSync("backend/Code.gs", "utf8");
const a = "      var id = String(rec.id);\n      var ex = byId[id] || null;";
if (!s.includes(a)) throw new Error("x");
s = s.replace(a, "      var id = String(rec.id);\n      if (/^NEW/i.test(id) && COLLECTIONS[col].prefix) id = nextId_(col, rd);   // \"NEW-1\" in a file means: give it the next free number\n      var ex = byId[id] || null;");
fs.writeFileSync("backend/Code.gs", s);
let t = fs.readFileSync("test/backend.test.js", "utf8");
t += `
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
`;
fs.writeFileSync("test/backend.test.js", t);
