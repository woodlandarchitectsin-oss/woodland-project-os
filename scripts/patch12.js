const fs = require("fs");
let s = fs.readFileSync("test/parity.test.js", "utf8");
const a = '    m.querySelectorAll(".syncline").forEach((e) => e.remove());';
if (!s.includes(a)) throw new Error("missing");
s = s.replace(a, a + '\n    m.querySelectorAll(\'[data-act="setPin"]\').forEach((b) => { if (b.previousElementSibling) b.previousElementSibling.remove(); b.remove(); });   // PIN controls are new');
fs.writeFileSync("test/parity.test.js", s);
