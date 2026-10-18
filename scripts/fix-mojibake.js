// Repairs text that was double-encoded (UTF-8 read as Windows-1252). Usage: node fix-mojibake.js file...
const fs = require("fs");
const map = { "â€”": "—", "Â·": "·", "â€¦": "…", "â‰ ": "≠", "â‚¹": "₹" };
for (const f of process.argv.slice(2)) {
  let s = fs.readFileSync(f, "utf8").replace(/^﻿/, "");
  let n = 0;
  for (const [bad, good] of Object.entries(map)) { const parts = s.split(bad); n += parts.length - 1; s = parts.join(good); }
  fs.writeFileSync(f, s);
  console.log(f, "fixed", n);
}
