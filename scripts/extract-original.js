// One-off: split the original single file into styles.css, seed (kept outside the app) and the raw script.
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const lines = fs.readFileSync(path.join(root, "woodland-project-os.html"), "utf8").split(/\r?\n/);
// style block: lines 13-257 (1-based), between <style> at 12 and </style> at 258
const css = lines.slice(12, 257).join("\n");
fs.writeFileSync(path.join(root, "app", "styles.css"), css + "\n");
// seed: line 272
const seedLine = lines[271];
const json = seedLine.slice(seedLine.indexOf("{"), seedLine.lastIndexOf("}") + 1);
fs.writeFileSync(path.join(root, "app", "seed.json"), JSON.stringify(JSON.parse(json)));
// raw app script: lines 274-1170
fs.writeFileSync(path.join(root, "scripts", "original-app.js"), lines.slice(273, 1170).join("\n") + "\n");
console.log("css", css.length, "seed", json.length);
