const fs = require("fs");
let h = fs.readFileSync("docs/HANDOVER.md", "utf8");
const a = h.indexOf("## 1.");
const b = h.indexOf("## 2.");
h = h.slice(0, a) + `## 1. The link and the PINs
App link: **https://woodlandarchitectsin-oss.github.io/woodland-project-os/** (one link for everyone)

- **You (owner):** sign in with your name (Ameen) and the **admin PIN**. That PIN is in https://script.google.com/home/projects/1ZuOnpMGuprI7aYxZj0iq4DiaXGbW8TWkvE7gJCJjNilCCPYhNv84LDbJ/settings under Script Properties, \`ADMIN_PIN\` (signed in as woodlandarchitects.in@gmail.com). It also unlocks fees, payments, archive, delete and import. You can change it there any time. (\`TEAM_PIN\` in that list is no longer used.)
- **Each staff member has their own PIN.** After signing in, open More, Team, **+ Member** (name, role, their PIN). For existing people use **Set PIN** on their card. Staff sign in with their name + their PIN, once per phone.
- **Remove someone's access:** Team, their card, **Set PIN** and leave it empty (login off), or **Remove from team**. Others are not affected.
- The server stores PINs only as a scrambled hash; nobody, including you, can read a staff PIN back. To change one, set a new one.
- After 8 wrong tries for one name, that name is locked for 10 minutes.

` + h.slice(b);
h = h.replace(/> Chrome menu \(three dots\)[^\n]*\n[^\n]*\n/, "> Chrome menu (three dots), \"Add to Home screen\".\n> First time: type your name and the personal PIN Ameen gave you. Tick tasks done as you finish them. It works without signal and syncs when you are back online.\n");
h = h.replace("Team PIN: (Ameen will send it separately).\n", "");
fs.writeFileSync("docs/HANDOVER.md", h);
let c = fs.readFileSync("CLAUDE.md", "utf8");
c = c.replace("- PINs live only in Apps Script > Project Settings > Script Properties (`TEAM_PIN`, `ADMIN_PIN`). Never write them in code, tests, docs or Git.", "- `ADMIN_PIN` lives only in Apps Script > Project Settings > Script Properties. Staff have personal PINs (set by the admin in the Team screen, stored as salted hashes in the People tab; `PIN_SALT` is in Script Properties). `TEAM_PIN` is obsolete. Never write PINs in code, tests, docs or Git.");
c = c.replace("- Server enforces: fees/payment fields/archive/delete/import = admin PIN only;", "- Sign-in = name + own PIN (server derives the author from it, ignoring the name the app sends); admin PIN works with any name. Server enforces: fees/payment fields/archive/delete/import/people changes/PINs = admin only;");
fs.writeFileSync("CLAUDE.md", c);
console.log("ok");
