// Publishes the contents of app/ to the gh-pages branch (what GitHub Pages serves). Run after `npm test` and `npm run stamp`.
const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const root = path.join(__dirname, "..");
const run = (cwd, ...a) => execFileSync("git", a, { cwd, stdio: ["ignore", "pipe", "inherit"] }).toString().trim();
const remote = run(root, "remote", "get-url", "origin");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wpos-pages-"));
fs.cpSync(path.join(root, "app"), tmp, { recursive: true });
fs.writeFileSync(path.join(tmp, ".nojekyll"), "");
run(tmp, "init", "-q", "-b", "gh-pages");
run(tmp, "add", "-A");
run(tmp, "-c", "user.name=Woodland Project OS", "-c", "user.email=woodlandarchitects.in@gmail.com", "commit", "-q", "-m", "Publish app " + new Date().toISOString() + "\n\nCo-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>");
run(tmp, "push", "-q", "--force", remote, "gh-pages");
fs.rmSync(tmp, { recursive: true, force: true });
console.log("published to gh-pages");
