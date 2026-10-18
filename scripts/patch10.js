// Update tests for name + personal PIN sign-in.
const fs = require("fs");
function edit(file, fn) { const s = fs.readFileSync(file, "utf8"); const o = fn(s); fs.writeFileSync(file, o); }

edit("test/harness.js", (s) => {
  s = s.replace('const gas = createGas({ props: { TEAM_PIN: TEAM, ADMIN_PIN: ADMIN } });', 'const gas = createGas({ props: { ADMIN_PIN: ADMIN } });');
  s = s.replace('const TEAM = "1234", ADMIN = "987654";', 'const STAFF = "2468", ADMIN = "987654";   // STAFF is the personal PIN every test person gets\nconst TEAM = STAFF;');
  s = s.replace("    gas, state, TEAM, ADMIN,", `    gas, state, TEAM: STAFF, STAFF, ADMIN,
    /** make sure this person exists and has a personal PIN (done as the admin, like Ameen does in the Team screen) */
    ensureStaff(name) {
      const people = gas.call("loadAll", ADMIN, "Ameen", {}).data.people;
      if (!Object.values(people).some((p) => p.name.toLowerCase() === name.toLowerCase())) gas.call("create", ADMIN, "Ameen", { collection: "people", id: "t", fields: { name, capacity: 6 } });
      gas.call("setPin", ADMIN, "Ameen", { data: { name, pin: STAFF } });
    },`);
  s = s.replace(/  await page\.goto\(h\.url\);\n  await page\.fill\("#pinInput", h\.TEAM\);[\s\S]*?await page\.click\("#whoForm button:not\(\[type=button\]\)"\);\n/, '  await page.goto(h.url);\n  await signIn(page, h, name);\n');
  s = s.replace("/** Opens a fresh", `/** Fills in the real sign-in screen with this person's name and personal PIN. */
async function signIn(page, h, name) {
  h.ensureStaff(name);
  await page.waitForSelector("#loginForm");
  await page.fill("#nameInput", name);
  await page.fill("#pinInput", h.STAFF);
  await page.click("#loginForm button");
}

/** Opens a fresh`);
  s = s.replace("module.exports = { start, openDevice, TEAM, ADMIN };", "module.exports = { start, openDevice, signIn, TEAM, STAFF, ADMIN };");
  return s;
});

for (const f of ["test/e2e.test.js", "test/parity.test.js", "test/visual.test.js", "test/pwa.test.js"]) {
  edit(f, (s) => {
    s = s.replace(/await (\w+)\.fill\("#pinInput", h\.TEAM\); await \1\.click\("#pinForm button"\);\s*await \1\.waitForSelector\("#whoForm"\);\s*await \1\.fill\("#whoInput", "([^"]+)"\); await \1\.click\("#whoForm button:not\(\[type=button\]\)"\);/g, 'await signIn($1, h, "$2");');
    s = s.replace(/h\.TEAM, "x"/g, 'h.ADMIN, "Ameen"');
    s = s.replace(/require\("\.\/harness"\)/, (m) => m);
    s = s.replace(/const \{ start, openDevice \} = require\("\.\/harness"\);/, 'const { start, openDevice, signIn } = require("./harness");');
    s = s.replace(/const \{ start \} = require\("\.\/harness"\);/, 'const { start, signIn } = require("./harness");');
    return s;
  });
}
console.log("ok");
