const fs = require("fs");
let s = fs.readFileSync("app/sync.js", "utf8");
function rep(a, b) { if (!s.includes(a)) throw new Error("missing " + a.slice(0, 50)); s = s.replace(a, b); }
rep("  function flush() {\n    if (flushing || !meta.teamPin) return Promise.resolve();",
    "  function offlineNow() { return typeof navigator !== \"undefined\" && navigator.onLine === false; }\n  function flush() {\n    if (flushing || !meta.teamPin) return Promise.resolve();\n    if (offlineNow()) { online = false; status(); return Promise.resolve(); }");
rep("    if (!meta.teamPin || busy) return Promise.resolve();\n    busy = true;",
    "    if (!meta.teamPin || busy) return Promise.resolve();\n    if (offlineNow()) { online = false; status(); return Promise.resolve(); }\n    busy = true;");
fs.writeFileSync("app/sync.js", s);
console.log("ok");
