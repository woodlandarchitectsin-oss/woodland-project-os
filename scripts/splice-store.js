// One-off: replace the old storage layer (lines 43-66) of app.js with scripts/store-block.js
const fs = require("fs");
const L = fs.readFileSync("app/app.js", "utf8").split("\n");
const blk = fs.readFileSync("scripts/store-block.js", "utf8").split("\n");
if (!L[42].startsWith("function loadLocal") || !L[65].startsWith("async function putSettings")) throw new Error("unexpected layout");
L.splice(42, 24, ...blk);
L[37] = 'let MODE="connecting",readOnly=false,CAP={sample:null,downloads:null};';
L[38] = "";
fs.writeFileSync("app/app.js", L.join("\n"));
console.log("spliced");
