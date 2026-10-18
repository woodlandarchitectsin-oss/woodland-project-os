const fs = require("fs");
let s = fs.readFileSync("test/parity.test.js", "utf8");
s = s.replace('out.views[v] = { text: m.innerText, controls };', 'out.views[v] = { text: m.innerText.replace(/\\s+/g, " ").trim(), controls };');
s = s.replace('out.sheets[id] = { text: sh.innerText, controls:', 'out.sheets[id] = { text: sh.innerText.replace(/\\s+/g, " ").trim(), controls:');
fs.writeFileSync("test/parity.test.js", s);
