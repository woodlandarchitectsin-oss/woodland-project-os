// Stamps the service worker with a hash of the app files, so a changed app makes phones show "New version — tap to refresh".
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const dir = path.join(__dirname, "..", "app");
const files = ["index.html", "styles.css", "config.js", "sync.js", "app.js", "manifest.webmanifest"];
const h = crypto.createHash("sha1");
files.forEach((f) => h.update(fs.readFileSync(path.join(dir, f))));
const v = h.digest("hex").slice(0, 10);
const sw = path.join(dir, "service-worker.js");
const src = fs.readFileSync(sw, "utf8").replace(/const VERSION = "[^"]*"/, `const VERSION = "${v}"`);
fs.writeFileSync(sw, src);
console.log("service worker version", v);
