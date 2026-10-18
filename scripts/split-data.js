// Moves makeData & helpers from test/parity.test.js into test/data.js so other tests can share them.
const fs = require("fs");
let s = fs.readFileSync("test/parity.test.js", "utf8");
const a = s.indexOf("function prng(seed)");
const b = s.indexOf("const EXTRACT = ");
const block = s.slice(a, b);
const data = `const fs = require("fs");
const path = require("path");
const STARTER = path.join(__dirname, "..", "private", "starter-projects.json");
const ORIGINAL = path.join(__dirname, "..", "private", "woodland-project-os.original.html");
const NOW = "2026-10-19T09:30:00+05:30";    // a Monday
const HAVE = fs.existsSync(ORIGINAL) && fs.existsSync(STARTER);

${block}
module.exports = { makeData, NOW, ORIGINAL, STARTER, HAVE, addDays };
`;
fs.writeFileSync("test/data.js", data);
s = s.slice(0, a) + s.slice(b);
s = s.replace(/const ORIGINAL = [^\n]*\nconst STARTER = [^\n]*\nconst HAVE = [^\n]*\nconst NOW = [^\n]*\n/, 'const { makeData, NOW, ORIGINAL, HAVE } = require("./data");\n');
fs.writeFileSync("test/parity.test.js", s);
console.log("split");
