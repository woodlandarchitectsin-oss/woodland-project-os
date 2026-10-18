const fs = require("fs");
let s = fs.readFileSync("app/app.js", "utf8");
function rep(a, b) { if (!s.includes(a)) throw new Error("missing: " + a.slice(0, 60)); s = s.replace(a, b); }
rep('value:owner()},{k:"dDue"', 'value:me()},{k:"dDue"');
rep('banner">YOU are the bottleneck — ${ol.projects.length} projects are waiting on you. Delegate drawing and site work today.</div>`;',
    'banner">${me()===owner()?`YOU are the bottleneck — ${ol.projects.length} projects are waiting on you. Delegate drawing and site work today.`:`${esc(owner())} is the bottleneck — ${ol.projects.length} projects are waiting on ${esc(owner())}.`}</div>`;');
rep('`YOU are currently the bottleneck — ${ol.projects.length} projects wait on ${owner()}.`',
    '`${me()===owner()?"YOU are":owner()+" is"} currently the bottleneck — ${ol.projects.length} projects wait on ${owner()}.`');
fs.writeFileSync("app/app.js", s);
console.log("ok");
