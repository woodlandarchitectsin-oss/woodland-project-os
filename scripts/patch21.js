const fs = require("fs");
let t = fs.readFileSync("test/e2e.test.js", "utf8");
const a = "      await waitSynced(A.page);\n      assert.equal(serverData(h).projects[\"WA-001\"].nextActionDeadline, want, \"typed \" + typed);";
if (!t.includes(a)) throw new Error("x");
t = t.replace(a, "      await A.page.waitForFunction((w) => S.projects[\"WA-001\"].nextActionDeadline === w, want);\n" + a);
fs.writeFileSync("test/e2e.test.js", t);
