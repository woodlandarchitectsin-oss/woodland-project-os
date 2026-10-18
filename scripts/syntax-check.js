// Syntax-checks every script that ships (Code.gs is not a .js file, so node --check can't read it).
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const root = path.join(__dirname, "..");
const files = ["app/app.js", "app/sync.js", "app/config.js", "app/service-worker.js", "backend/Code.gs"];
let bad = 0;
for (const f of files) {
  try { new vm.Script(fs.readFileSync(path.join(root, f), "utf8"), { filename: f }); console.log("ok   ", f); }
  catch (e) { bad++; console.log("FAIL ", f, "-", e.message); }
}
const html = fs.readFileSync(path.join(root, "app/index.html"), "utf8");
const first = html.indexOf("<script");
if (!/Something went wrong/.test(html.slice(first, html.indexOf("</script>", first)))) { bad++; console.log("FAIL  the on-screen error reporter must be the first <script>"); }
else console.log("ok    error reporter is the first <script>");
for (const f of ["app/app.js", "app/sync.js"]) {
  const t = fs.readFileSync(path.join(root, f), "utf8");
  if (/\b(alert|confirm|prompt)\s*\(/.test(t.replace(/confirmBox|[A-Za-z_.]confirm\s*\(/g, ""))) { bad++; console.log("FAIL ", f, "uses alert/confirm/prompt"); }
}
process.exit(bad ? 1 : 0);
