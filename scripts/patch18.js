const fs = require("fs");
let s = fs.readFileSync("app/app.js", "utf8");
const a = 'delete t.dataset.blur;}}if(pendingRender)';
if (!s.includes(a)) throw new Error("missing");
s = s.replace(a, 'delete t.dataset.blur;}else{const q=t.dataset.ed.split("|");const cur=S[q[0]]&&S[q[0]][q[1]]?getPath(S[q[0]][q[1]],q[2]):null;if(cur&&t.value!==cur)t.value=cur;}}if(pendingRender)');
fs.writeFileSync("app/app.js", s);
