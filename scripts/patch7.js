// Per-person PINs on the server.
const fs = require("fs");
let s = fs.readFileSync("backend/Code.gs", "utf8");
function rep(a, b) { if (!s.includes(a)) throw new Error("missing: " + a.slice(0, 70)); s = s.replace(a, b); }

rep(" * PINs live in Script Properties (TEAM_PIN, ADMIN_PIN) — never in this file.",
    " * ADMIN_PIN lives in Script Properties (never in this file). Each team member has their own PIN, stored only as a salted hash in the People tab.");
rep("cols: ['id', 'name', 'role', 'capacity', 'contact', 'archived'] }", "cols: ['id', 'name', 'role', 'capacity', 'contact', 'archived', 'pinHash'] }");

// doPost
rep("    var role = authenticate_(req.pin);\n    if (role === 'locked') return out_({ ok: false, code: 'BAD_PIN', error: 'Too many wrong PINs. Try again in 10 minutes.' });\n    if (!role) return out_({ ok: false, code: 'BAD_PIN', error: 'Wrong PIN.' });\n    ss_(); // create the sheet on first use, before any write lock is taken\n    var ctx = { role: role, by: String(req.by || '').slice(0, 60) || 'Unknown', now: new Date().toISOString(), history: [] };",
    "    var who = authenticate_(req.pin, req.by);\n    if (who === 'locked') return out_({ ok: false, code: 'BAD_PIN', error: 'Too many wrong attempts. Try again in 10 minutes.' });\n    if (!who) return out_({ ok: false, code: 'BAD_PIN', error: 'Wrong name or PIN.' });\n    ss_(); // create the sheet on first use, before any write lock is taken\n    var ctx = { role: who.role, by: who.name, now: new Date().toISOString(), history: [] };");
rep("case 'save': case 'create': case 'delete': case 'archive': case 'restore': case 'importBulk':", "case 'save': case 'create': case 'delete': case 'archive': case 'restore': case 'importBulk': case 'setPin':");

// setPins + authenticate
const a = s.indexOf("/** Run once from the editor.");
const b = s.indexOf("function rndDigits_");
s = s.slice(0, a) + `/** Run once from the editor. Creates a random ADMIN_PIN only if none exists, and says so in the log. Staff PINs are set inside the app (Team screen). */
function setPins() {
  var props = PropertiesService.getScriptProperties();
  var made = [];
  if (!props.getProperty('ADMIN_PIN')) { props.setProperty('ADMIN_PIN', rndDigits_(6)); made.push('ADMIN_PIN'); }
  Logger.log('Created: ' + (made.join(', ') || 'nothing (ADMIN_PIN already set)') + '. Read or change it in Project Settings > Script Properties.');
}

` + s.slice(b);

const c = s.indexOf("function authenticate_(pin) {");
const d = s.indexOf("/* ---------------- spreadsheet plumbing");
s = s.slice(0, c) + `/** Returns {role, name} or null, or 'locked'. The admin PIN works with any name; everyone else signs in with their own name + PIN. */
function authenticate_(pin, by) {
  var props = PropertiesService.getScriptProperties();
  var admin = props.getProperty('ADMIN_PIN');
  if (!admin) throw fail_('NOT_SET_UP', 'The admin PIN is not set yet. Run setPins() in the Apps Script editor.');
  var cache = CacheService.getScriptCache();
  var name = String(by == null ? '' : by).trim().slice(0, 60);
  var key = 'pf_' + name.toLowerCase().replace(/[^a-z0-9]/g, '');
  var nameFails = Number(cache.get(key) || 0), allFails = Number(cache.get('pinfails') || 0);
  if (nameFails >= 8 || allFails >= 60) return 'locked';
  pin = String(pin == null ? '' : pin);
  if (pin && pin === admin) return { role: 'admin', name: name || 'Admin' };
  var person = pin && name ? findPersonForLogin_(name, pin) : null;
  if (person) return { role: 'team', name: person };
  cache.put(key, String(nameFails + 1), 600);
  cache.put('pinfails', String(allFails + 1), 600);
  return null;
}

function hashPin_(id, pin) {
  var salt = PropertiesService.getScriptProperties().getProperty('PIN_SALT') || '';
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + ':' + id + ':' + pin);
  return bytes.map(function (b) { b = b < 0 ? b + 256 : b; return (b < 16 ? '0' : '') + b.toString(16); }).join('');
}

/** The stored name of the active person whose own PIN this is, else null. */
function findPersonForLogin_(name, pin) {
  if (!PropertiesService.getScriptProperties().getProperty('SHEET_ID') || !PropertiesService.getScriptProperties().getProperty('PIN_SALT')) return null;
  var rows = read_('people').rows;
  for (var i = 0; i < rows.length; i++) {
    var p = rows[i].obj;
    if (p.archived || !p.pinHash || String(p.name).toLowerCase() !== name.toLowerCase()) continue;
    if (p.pinHash === hashPin_(p.id, pin)) return p.name;
  }
  return null;
}

/** What may leave the server: never the hash, only whether a PIN exists. */
function publicRow_(col, obj) {
  if (col !== 'people' || !obj) return obj;
  var o = JSON.parse(JSON.stringify(obj));
  o.hasPin = !!o.pinHash;
  delete o.pinHash;
  return o;
}

` + s.slice(d);

// hello / loadAll / changesSince
rep("  var people = read_('people').rows.map(function (r) { return r.obj; }).filter(function (p) { return !p.archived; }).map(function (p) { return { id: p.id, name: p.name }; });\n  var res = { ok: true, admin: ctx.role === 'admin', people: people, serverTime: ctx.now };",
    "  var res = { ok: true, admin: ctx.role === 'admin', name: ctx.by, serverTime: ctx.now };");
rep("    read_(c).rows.forEach(function (r) { o[r.obj.id] = r.obj; });", "    read_(c).rows.forEach(function (r) { o[r.obj.id] = publicRow_(c, r.obj); });");
rep(".map(function (r) { return r.obj; });\n    if (rows.length) changes[c] = rows;", ".map(function (r) { return publicRow_(c, r.obj); });\n    if (rows.length) changes[c] = rows;");

// write dispatch
rep("  else if (action === 'archive' || action === 'restore')", "  else if (action === 'setPin') res = setPin_(ctx, p);\n  else if (action === 'archive' || action === 'restore')");

// saveOrCreate: people admin-only, ignore hash/hasPin, public row
rep("  if (col === 'payments') needAdmin_(ctx, 'change payments');", "  if (col === 'payments') needAdmin_(ctx, 'change payments');\n  if (col === 'people') needAdmin_(ctx, 'change team members');");
rep("k === 'updatedBy' || k === 'syncAt') return;\n    if (k === 'history') return;", "k === 'updatedBy' || k === 'syncAt') return;\n    if (k === 'history' || k === 'pinHash' || k === 'hasPin') return;");
rep("  writeObj_(col, rd, existing, obj);\n  return { ok: true, id: id, row: obj };", "  writeObj_(col, rd, existing, obj);\n  return { ok: true, id: id, row: publicRow_(col, obj) };");

// importBulk: never take hashes from a file
rep("Object.keys(rec).forEach(function (k) { if (k !== 'updatedBy' && k !== 'syncAt') obj[k] = rec[k]; });", "Object.keys(rec).forEach(function (k) { if (k !== 'updatedBy' && k !== 'syncAt' && k !== 'pinHash' && k !== 'hasPin') obj[k] = rec[k]; });");

// setPin_
s += `
/** Admin sets (or clears, with an empty pin) one person's own PIN. */
function setPin_(ctx, p) {
  needAdmin_(ctx, 'set staff PINs');
  var pin = String(p.data && p.data.pin != null ? p.data.pin : '');
  if (pin && !/^\\d{4,8}$/.test(pin)) throw fail_('BAD_PIN_FORMAT', 'A PIN must be 4 to 8 digits.');
  var rd = read_('people');
  var name = String(p.data && p.data.name || '').toLowerCase();
  var hit = rd.rows.filter(function (r) { return String(r.obj.name).toLowerCase() === name && !r.obj.archived; })[0];
  if (!hit) throw fail_('NOT_FOUND', 'No active team member with that name.');
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty('PIN_SALT')) props.setProperty('PIN_SALT', rndDigits_(8) + rndDigits_(8) + rndDigits_(8));
  var obj = JSON.parse(JSON.stringify(hit.obj));
  if (pin) {
    var clash = rd.rows.some(function (r) { return r.obj.id !== obj.id && r.obj.pinHash && r.obj.pinHash === hashPin_(r.obj.id, pin) && false; });
    obj.pinHash = hashPin_(obj.id, pin);
  } else obj.pinHash = null;
  obj.updatedAt = ctx.now; obj.updatedBy = ctx.by; obj.syncAt = ctx.now;
  writeObj_('people', rd, hit, obj);
  logChange_(ctx, 'people', obj.id, 'pin', null, pin ? '(set)' : '(cleared)');
  return { ok: true, id: obj.id, row: publicRow_('people', obj) };
}
`;
fs.writeFileSync("backend/Code.gs", s);
console.log("ok");
