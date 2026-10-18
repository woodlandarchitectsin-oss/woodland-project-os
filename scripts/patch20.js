const fs = require("fs");
let t = fs.readFileSync("test/e2e.test.js", "utf8");
const i = t.indexOf('    console.log("DATES"');
const j = t.indexOf("\n", i);
if (i < 0) throw new Error("x");
t = t.slice(0, i) + '    assert.deepEqual(dates, ["2025-02-01", "2026-02-01", "2027-02-01", "2023-02-01"]);       // one history line per date, never 0002 / 2022 on the way' + t.slice(j);
fs.writeFileSync("test/e2e.test.js", t);
