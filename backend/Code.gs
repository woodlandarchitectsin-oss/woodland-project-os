/**
 * Woodland Project OS — Google Apps Script JSON API.
 * Deploy as Web app: Execute as Me, Who has access: Anyone.
 * All calls are POST with a text/plain JSON body: {action, pin, by, payload}.
 * Data lives in a Google Sheet "Woodland Project OS — data" created on first call.
 * ADMIN_PIN lives in Script Properties (never in this file). Each team member has their own PIN, stored only as a salted hash in the People tab.
 */

var SHEET_TITLE = 'Woodland Project OS — data';
var CELL_LIMIT = 49000;
var HISTORY_KEEP = 300;
var OPS_KEEP = 2000;

var COLLECTIONS = {
  projects: { tab: 'Projects', prefix: 'WA-', width: 3, cols: ['id', 'name', 'client', 'location', 'lifecycle', 'priority', 'types', 'conditions', 'nextAction', 'nextActionOwner', 'nextActionDeadline', 'lead', 'responsible', 'team', 'quotedFee', 'agreedFee', 'openingReceived', 'paymentMilestone', 'nextPaymentDue', 'paymentStatus', 'clientContact', 'scope', 'area', 'leadSource', 'enquiryDate', 'startDate', 'targetDate', 'created', 'blocker', 'siteIssues', 'folder', 'links', 'notes', 'confirm', 'archived', 'waitingSince', 'nextMeeting', 'history'] },
  tasks: { tab: 'Tasks', prefix: 'T-', width: 4, cols: ['id', 'projectId', 'title', 'assignee', 'status', 'priority', 'due', 'est', 'category', 'created', 'completed', 'completedBy', 'clientDependency', 'dependency', 'startAfter', 'waitingSince', 'blockType', 'desc', 'notes'] },
  people: { tab: 'People', prefix: 'P-', width: 3, cols: ['id', 'name', 'role', 'capacity', 'contact', 'archived', 'pinHash'] },
  meetings: { tab: 'Meetings', prefix: 'M-', width: 4, cols: ['id', 'projectId', 'date', 'time', 'purpose', 'participants', 'decisions', 'requests', 'payment', 'duration', 'nextMeeting'] },
  payments: { tab: 'Payments', prefix: 'PAY-', width: 4, cols: ['id', 'projectId', 'date', 'amount', 'milestone', 'mode'] },
  plans: { tab: 'Plans', prefix: '', width: 0, cols: ['id', 'taskIds', 'blocks'] },
  settings: { tab: 'Settings', prefix: '', width: 0, cols: ['id', 'owner', 'dayStart', 'dayEnd', 'buffer', 'fixed', 'dailyControl'] }
};
var META_COLS = ['updatedAt', 'updatedBy', 'syncAt']; // updatedAt = when it was edited (kept on import); syncAt = when the server stored it (drives sync)
var JSON_FIELDS = { types: 1, conditions: 1, team: 1, confirm: 1, history: 1, siteIssues: 1, blocker: 1, decisions: 1, taskIds: 1, blocks: 1 };
var NUM_FIELDS = { quotedFee: 1, agreedFee: 1, openingReceived: 1, est: 1, amount: 1, capacity: 1, duration: 1, buffer: 1, dailyControl: 1 };
var BOOL_FIELDS = { clientDependency: 1, archived: 1 };
var TEXT_COL = /^(id|projectId|created|completed|since|startAfter|waitingSince|nextMeeting|time|old|new|field)$|(date|due|deadline)$/i;
var ADMIN_PROJECT_FIELDS = ['quotedFee', 'agreedFee', 'openingReceived', 'paymentMilestone', 'nextPaymentDue', 'paymentStatus', 'archived'];
var OBLIGATIONS = ['PAYMENT PENDING', 'SNAGGING PENDING', 'DOCUMENTS PENDING', 'HANDOVER PENDING', 'WARRANTY ISSUE', 'FINAL PHOTOS PENDING'];

/* ---------------- entry points ---------------- */

function doPost(e) {
  var t0 = new Date();
  var req;
  try { req = JSON.parse(e.postData.contents); } catch (err) { return out_({ ok: false, code: 'BAD_REQUEST', error: 'Unreadable request.' }); }
  try {
    var who = authenticate_(req.pin, req.by);
    if (who === 'locked') return out_({ ok: false, code: 'BAD_PIN', error: 'Too many wrong attempts. Try again in 10 minutes.' });
    if (!who) return out_({ ok: false, code: 'BAD_PIN', error: 'Wrong name or PIN.' });
    ss_(); // create the sheet on first use, before any write lock is taken
    var ctx = { role: who.role, by: who.name, now: new Date().toISOString(), history: [] };
    var p = req.payload || {};
    var res;
    switch (req.action) {
      case 'hello': res = hello_(ctx); break;
      case 'loadAll': res = loadAll_(ctx); break;
      case 'changesSince': res = changesSince_(ctx, p); break;
      case 'save': case 'create': case 'delete': case 'archive': case 'restore': case 'importBulk': case 'setPin':
        res = withLock_(function () { return write_(req.action, ctx, p); });
        break;
      default: res = { ok: false, code: 'BAD_ACTION', error: 'Unknown action.' };
    }
    return out_(res);
  } catch (err) {
    if (err && err.code) return out_({ ok: false, code: err.code, error: err.message });
    return out_({ ok: false, code: 'SERVER_ERROR', error: 'Server error: ' + (err && err.message ? err.message : err) });
  }
}

function doGet() {
  return out_({ ok: true, name: 'Woodland Project OS API', note: 'Use POST.' });
}

/** Run once from the editor. Creates a random ADMIN_PIN only if none exists, and says so in the log. Staff PINs are set inside the app (Team screen). */
function setPins() {
  var props = PropertiesService.getScriptProperties();
  var made = [];
  if (!props.getProperty('ADMIN_PIN')) { props.setProperty('ADMIN_PIN', rndDigits_(6)); made.push('ADMIN_PIN'); }
  Logger.log('Created: ' + (made.join(', ') || 'nothing (ADMIN_PIN already set)') + '. Read or change it in Project Settings > Script Properties.');
}

function rndDigits_(n) { var s = ''; for (var i = 0; i < n; i++) s += Math.floor(Math.random() * 10); return s; }

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function fail_(code, msg) { var e = new Error(msg); e.code = code; return e; }

function withLock_(fn) {
  var lock = LockService.getScriptLock();
  try { lock.waitLock(20000); } catch (e) { throw fail_('BUSY', 'The server is busy. Retrying.'); }
  try { return fn(); } finally { lock.releaseLock(); }
}

/* ---------------- auth ---------------- */

/** Returns {role, name} or null, or 'locked'. The admin PIN works with any name; everyone else signs in with their own name + PIN. */
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

/* ---------------- spreadsheet plumbing ---------------- */

var _ss = null;
function ss_() {
  if (_ss) return _ss;
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SHEET_ID');
  if (id) { try { _ss = SpreadsheetApp.openById(id); return _ss; } catch (e) { /* fall through and recreate */ } }
  return withLock_(function () {
    var id2 = props.getProperty('SHEET_ID');
    if (id2) { _ss = SpreadsheetApp.openById(id2); return _ss; }
    var s = SpreadsheetApp.create(SHEET_TITLE);
    props.setProperty('SHEET_ID', s.getId());
    _ss = s;
    Object.keys(COLLECTIONS).forEach(function (c) { sheet_(c); });
    sheetByName_('History', ['at', 'by', 'collection', 'id', 'field', 'old', 'new']);
    sheetByName_('Deleted', ['collection', 'id', 'at', 'by']);
    sheetByName_('Ops', ['opId', 'result', 'at']);
    var first = s.getSheetByName('Sheet1');
    if (first && s.getSheets().length > 1) s.deleteSheet(first);
    return s;
  });
}

function sheetByName_(name, cols) {
  var s = ss_();
  var sh = s.getSheetByName(name);
  if (sh) return sh;
  sh = s.insertSheet(name);
  sh.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight('bold');
  sh.setFrozenRows(1);
  cols.forEach(function (c, i) { if (TEXT_COL.test(c) || c === 'at') sh.getRange(1, i + 1, sh.getMaxRows ? sh.getMaxRows() : 1000, 1).setNumberFormat('@'); });
  return sh;
}

function sheet_(col) {
  var def = COLLECTIONS[col];
  return sheetByName_(def.tab, def.cols.concat(META_COLS));
}

/** Read a collection: {sh, headers, rows:[{row, obj}]}. */
function read_(col) {
  var sh = sheet_(col);
  var lastRow = sh.getLastRow(), lastCol = sh.getLastColumn();
  var data = lastRow >= 1 ? sh.getRange(1, 1, lastRow, lastCol).getValues() : [[]];
  var headers = data[0].map(String);
  var rows = [];
  for (var r = 1; r < data.length; r++) {
    if (data[r][0] === '' || data[r][0] == null) continue;
    rows.push({ row: r + 1, obj: decodeRow_(headers, data[r]) });
  }
  return { sh: sh, headers: headers, rows: rows };
}

function decodeRow_(headers, vals) {
  var o = {};
  for (var i = 0; i < headers.length; i++) {
    var k = headers[i]; if (!k) continue;
    var v = vals[i];
    if (v instanceof Date) v = Utilities.formatDate(v, 'UTC', 'yyyy-MM-dd');
    if (v === '' || v == null) { o[k] = null; continue; }
    if (JSON_FIELDS[k]) { try { o[k] = JSON.parse(v); } catch (e) { o[k] = null; } }
    else if (NUM_FIELDS[k]) { var n = Number(v); o[k] = isNaN(n) ? null : n; }
    else if (BOOL_FIELDS[k]) o[k] = (v === true || String(v).toLowerCase() === 'true');
    else o[k] = String(v);
  }
  return o;
}

function encodeCell_(k, v) {
  if (v === undefined || v === null) return '';
  if (JSON_FIELDS[k]) {
    var s = JSON.stringify(v);
    if (s.length > CELL_LIMIT) throw fail_('TOO_LARGE', 'The field "' + k + '" is too large to store.');
    return s;
  }
  if (BOOL_FIELDS[k]) return v ? true : false;
  if (NUM_FIELDS[k]) return Number(v);
  var str = String(v);
  if (str.length > CELL_LIMIT) throw fail_('TOO_LARGE', 'The field "' + k + '" is too large to store.');
  return str;
}

function ensureColumns_(rd, keys) {
  var added = false;
  keys.forEach(function (k) {
    if (rd.headers.indexOf(k) < 0 && /^[A-Za-z][A-Za-z0-9_.]*$/.test(k)) {
      rd.headers.push(k);
      var c = rd.headers.length;
      rd.sh.getRange(1, c, 1, 1).setValues([[k]]).setFontWeight('bold');
      if (TEXT_COL.test(k)) rd.sh.getRange(1, c, 1000, 1).setNumberFormat('@');
      added = true;
    }
  });
  return added;
}

function writeObj_(col, rd, existing, obj) {
  ensureColumns_(rd, Object.keys(obj));
  var rowVals = rd.headers.map(function (h) { return encodeCell_(h, obj[h]); });
  if (existing) {
    rd.sh.getRange(existing.row, 1, 1, rowVals.length).setValues([rowVals]);
    existing.obj = obj;
  } else {
    var rowNo = rd.sh.getLastRow() + 1;
    rd.sh.getRange(rowNo, 1, 1, rowVals.length).setValues([rowVals]);
    rd.rows.push({ row: rowNo, obj: obj });
  }
}

/* ---------------- ids ---------------- */

function numOf_(id) { var m = String(id).match(/(\d+)$/); return m ? parseInt(m[1], 10) : 0; }
function pad_(n, w) { var s = String(n); while (s.length < w) s = '0' + s; return s; }

function nextId_(col, rd) {
  var def = COLLECTIONS[col];
  var props = PropertiesService.getScriptProperties();
  var key = 'counter_' + col;
  var max = Number(props.getProperty(key) || 0);
  rd.rows.forEach(function (r) { var n = numOf_(r.obj.id); if (n > max) max = n; });
  max += 1;
  props.setProperty(key, String(max));
  return def.prefix + pad_(max, def.width);
}
function bumpCounter_(col, id) {
  var key = 'counter_' + col, props = PropertiesService.getScriptProperties();
  var n = numOf_(id);
  if (n > Number(props.getProperty(key) || 0)) props.setProperty(key, String(n));
}

/* ---------------- reads ---------------- */

function hello_(ctx) {
  ss_();
  var res = { ok: true, admin: ctx.role === 'admin', name: ctx.by, serverTime: ctx.now };
  if (ctx.role === 'admin') res.sheetUrl = ss_().getUrl();
  return res;
}

function loadAll_(ctx) {
  var data = {};
  Object.keys(COLLECTIONS).forEach(function (c) {
    if (c === 'settings') return;
    var o = {};
    read_(c).rows.forEach(function (r) { o[r.obj.id] = publicRow_(c, r.obj); });
    data[c] = o;
  });
  var st = read_('settings').rows;
  data.settings = st.length ? st[0].obj : {};
  return { ok: true, serverTime: ctx.now, data: data };
}

function changesSince_(ctx, p) {
  var since = String(p.since || '');
  var props = PropertiesService.getScriptProperties();
  var lastWrite = props.getProperty('lastWrite') || '';
  if (since && lastWrite && lastWrite < since) return { ok: true, serverTime: ctx.now, changes: {}, deleted: [] };
  var changes = {};
  Object.keys(COLLECTIONS).forEach(function (c) {
    var rows = read_(c).rows.filter(function (r) { return !since || String(r.obj.syncAt || r.obj.updatedAt || '') >= since; }).map(function (r) { return publicRow_(c, r.obj); });
    if (rows.length) changes[c] = rows;
  });
  var del = [];
  var dd = read_deleted_();
  dd.forEach(function (d) { if (!since || d.at >= since) del.push({ collection: d.collection, id: d.id }); });
  return { ok: true, serverTime: ctx.now, changes: changes, deleted: del };
}

function read_deleted_() {
  var sh = sheetByName_('Deleted', ['collection', 'id', 'at', 'by']);
  var n = sh.getLastRow();
  if (n < 2) return [];
  return sh.getRange(2, 1, n - 1, 4).getValues().map(function (v) { return { collection: String(v[0]), id: String(v[1]), at: String(v[2]) }; });
}

/* ---------------- writes ---------------- */

function write_(action, ctx, p) {
  // idempotency: a retried operation returns its first result
  var opsSh = sheetByName_('Ops', ['opId', 'result', 'at']);
  if (p.opId) {
    var prev = findOp_(opsSh, p.opId);
    if (prev) return prev;
  }
  var res;
  if (action === 'importBulk') res = importBulk_(ctx, p);
  else if (action === 'delete') res = delete_(ctx, p);
  else if (action === 'setPin') res = setPin_(ctx, p);
  else if (action === 'archive' || action === 'restore') res = archive_(ctx, p, action === 'archive');
  else res = saveOrCreate_(ctx, p, action === 'create');
  flushHistory_(ctx);
  PropertiesService.getScriptProperties().setProperty('lastWrite', new Date().toISOString());
  if (p.opId) recordOp_(opsSh, p.opId, res, ctx.now);
  return res;
}

function findOp_(sh, opId) {
  var n = sh.getLastRow();
  if (n < 2) return null;
  var vals = sh.getRange(2, 1, n - 1, 2).getValues();
  for (var i = vals.length - 1; i >= 0; i--) if (vals[i][0] === opId) { try { return JSON.parse(vals[i][1]); } catch (e) { return null; } }
  return null;
}
function recordOp_(sh, opId, res, at) {
  var small = { ok: res.ok, id: res.id, row: res.row, counts: res.counts };
  var s = JSON.stringify(small);
  if (s.length > 40000) s = JSON.stringify({ ok: res.ok, id: res.id, counts: res.counts });
  sh.getRange(sh.getLastRow() + 1, 1, 1, 3).setValues([[opId, s, at]]);
  var n = sh.getLastRow();
  if (n > OPS_KEEP + 500) sh.deleteRows(2, n - OPS_KEEP - 1);
}

function logChange_(ctx, col, id, field, oldV, newV) {
  var f = function (v) { if (v === null || v === undefined) return ''; var s = typeof v === 'string' ? v : JSON.stringify(v); return s.length > 500 ? s.slice(0, 500) + '…' : s; };
  ctx.history.push([ctx.now, ctx.by, col, id, field, f(oldV), f(newV)]);
}
function flushHistory_(ctx) {
  if (!ctx.history.length) return;
  var sh = sheetByName_('History', ['at', 'by', 'collection', 'id', 'field', 'old', 'new']);
  var start = sh.getLastRow() + 1;
  sh.getRange(start, 1, ctx.history.length, 7).setValues(ctx.history);
  ctx.history = [];
}

function same_(a, b) {
  if ((a === null || a === undefined || a === '') && (b === null || b === undefined || b === '')) return true;
  return JSON.stringify(a) === JSON.stringify(b);
}

function checkCollection_(c) {
  if (!COLLECTIONS[c]) throw fail_('BAD_COLLECTION', 'Unknown collection.');
}
function needAdmin_(ctx, what) {
  if (ctx.role !== 'admin') throw fail_('FORBIDDEN', 'Only the admin can ' + what + '. Unlock Admin on this device (More → Admin).');
}

function stampHistory_(lines, ctx) {
  return (lines || []).map(function (h) { return { d: h.d || ctx.now, t: String(h.t || ''), by: h.by || ctx.by }; });
}

function saveOrCreate_(ctx, p, isCreate) {
  var col = p.collection; checkCollection_(col);
  var rd = read_(col);
  var fields = p.fields || {};
  var id = String(p.id || '');
  var existing = null;
  if (!isCreate || col === 'plans' || col === 'settings') {
    if (col === 'settings') id = 'app';
    existing = rd.rows.filter(function (r) { return r.obj.id === id; })[0] || null;
  }
  if (isCreate && col === 'payments') needAdmin_(ctx, 'record payments');
  if (!isCreate && !existing && col !== 'plans' && col !== 'settings') throw fail_('NOT_FOUND', 'That record no longer exists.');
  if (col === 'payments') needAdmin_(ctx, 'change payments');
  if (col === 'people') needAdmin_(ctx, 'change team members');

  var base = existing ? JSON.parse(JSON.stringify(existing.obj)) : {};
  var changed = [];
  Object.keys(fields).forEach(function (k) {
    if (k === 'id' || k === 'updatedAt' || k === 'updatedBy' || k === 'syncAt') return;
    if (k === 'history' || k === 'pinHash' || k === 'hasPin') return;
    if (!same_(base[k], fields[k])) changed.push(k);
  });

  if (col === 'projects') {
    changed.forEach(function (k) { if (ADMIN_PROJECT_FIELDS.indexOf(k) >= 0) needAdmin_(ctx, k === 'archived' ? 'archive projects' : 'change fees and payment details'); });
    if (changed.indexOf('lifecycle') >= 0 && fields.lifecycle === 'CLOSED') {
      var merged = JSON.parse(JSON.stringify(base)); changed.forEach(function (k) { merged[k] = fields[k]; });
      var reasons = closeProblems_(merged, id);
      if (reasons.length) throw fail_('CLOSE_REFUSED', "Can't close yet: " + reasons.join(' · ') + '. Completed ≠ closed.');
    }
  }

  var obj = base;
  if (isCreate && col !== 'plans' && col !== 'settings') {
    id = nextId_(col, rd);
  } else if (!existing) {
    if (col === 'settings') id = 'app';
    if (!id) throw fail_('BAD_REQUEST', 'Missing id.');
  }
  obj.id = id;
  var brandNew = isCreate && !existing;
  changed.forEach(function (k) {
    if (!brandNew) logChange_(ctx, col, id, k, base[k] === undefined ? null : base[k], fields[k]);
    obj[k] = fields[k];
  });
  if (brandNew) logChange_(ctx, col, id, '(created)', null, obj.name || obj.title || id);
  if (col === 'projects') {
    var add = stampHistory_(p.historyAdd, ctx);
    obj.history = brandNew ? stampHistory_(fields.history, ctx).concat(add) : add.concat(obj.history || []);
    obj.history = obj.history.slice(0, HISTORY_KEEP);
  }
  obj.updatedAt = ctx.now; obj.updatedBy = ctx.by; obj.syncAt = ctx.now;
  writeObj_(col, rd, existing, obj);
  return { ok: true, id: id, row: publicRow_(col, obj) };
}

function closeProblems_(proj, id) {
  var reasons = [];
  var open = read_('tasks').rows.filter(function (r) { return r.obj.projectId === id && r.obj.status !== 'COMPLETED' && r.obj.status !== 'CANCELLED'; }).length;
  if (open) reasons.push(open + ' open tasks');
  var obl = (proj.conditions || []).filter(function (c) { return OBLIGATIONS.indexOf(c) >= 0; });
  if (obl.length) reasons.push(obl.join(', ').toLowerCase());
  if (proj.agreedFee !== null && proj.agreedFee !== undefined && proj.agreedFee !== '') {
    var paid = read_('payments').rows.filter(function (r) { return r.obj.projectId === id; }).reduce(function (a, r) { return a + (Number(r.obj.amount) || 0); }, 0);
    var bal = Number(proj.agreedFee) - ((Number(proj.openingReceived) || 0) + paid);
    if (bal > 0) reasons.push('₹' + Math.round(bal).toLocaleString('en-IN') + ' unpaid');
  }
  return reasons;
}

function delete_(ctx, p) {
  needAdmin_(ctx, 'delete records');
  var col = p.collection; checkCollection_(col);
  var rd = read_(col);
  var hit = rd.rows.filter(function (r) { return r.obj.id === p.id; })[0];
  if (!hit) return { ok: true, id: p.id };
  rd.sh.deleteRow(hit.row);
  var dsh = sheetByName_('Deleted', ['collection', 'id', 'at', 'by']);
  dsh.getRange(dsh.getLastRow() + 1, 1, 1, 4).setValues([[col, p.id, ctx.now, ctx.by]]);
  logChange_(ctx, col, p.id, '(deleted)', hit.obj.name || hit.obj.title || p.id, null);
  return { ok: true, id: p.id };
}

function archive_(ctx, p, flag) {
  needAdmin_(ctx, flag ? 'archive projects' : 'restore projects');
  var rd = read_('projects');
  var hit = rd.rows.filter(function (r) { return r.obj.id === p.id; })[0];
  if (!hit) throw fail_('NOT_FOUND', 'That project no longer exists.');
  var obj = JSON.parse(JSON.stringify(hit.obj));
  logChange_(ctx, 'projects', p.id, 'archived', !!obj.archived, flag);
  obj.archived = flag;
  var lines = p.historyAdd && p.historyAdd.length ? p.historyAdd : [{ t: flag ? 'Archived' : 'Restored' }];
  obj.history = stampHistory_(lines, ctx).concat(obj.history || []).slice(0, HISTORY_KEEP);
  obj.updatedAt = ctx.now; obj.updatedBy = ctx.by; obj.syncAt = ctx.now;
  writeObj_('projects', rd, hit, obj);
  return { ok: true, id: p.id, row: obj };
}

function importBulk_(ctx, p) {
  needAdmin_(ctx, 'import data');
  var data = p.data || {};
  var counts = {};
  Object.keys(COLLECTIONS).forEach(function (col) {
    var incoming = data[col];
    if (!incoming) return;
    var rd = read_(col);
    var byId = {}; rd.rows.forEach(function (r) { byId[r.obj.id] = r; });
    var list = col === 'settings' ? [Object.assign({ id: 'app' }, incoming)] : Object.keys(incoming).map(function (k) { var o = incoming[k]; o.id = o.id || k; return o; });
    var created = 0, updated = 0;
    list.forEach(function (rec) {
      var id = String(rec.id);
      var ex = byId[id] || null;
      var obj = ex ? JSON.parse(JSON.stringify(ex.obj)) : {};
      Object.keys(rec).forEach(function (k) { if (k !== 'updatedBy' && k !== 'syncAt' && k !== 'pinHash' && k !== 'hasPin') obj[k] = rec[k]; });
      obj.id = id;
      if (obj.history) obj.history = obj.history.slice(0, HISTORY_KEEP); // old lines keep their own (possibly empty) author
      obj.updatedAt = rec.updatedAt || ctx.now; obj.updatedBy = ctx.by; obj.syncAt = ctx.now;
      writeObj_(col, rd, ex, obj);
      if (!ex) { byId[id] = rd.rows[rd.rows.length - 1]; created++; } else updated++;
      if (COLLECTIONS[col].prefix) bumpCounter_(col, id);
    });
    counts[col] = { created: created, updated: updated, total: list.length };
    logChange_(ctx, col, '*', '(import)', null, created + ' new, ' + updated + ' updated');
  });
  return { ok: true, counts: counts };
}

/** Admin sets (or clears, with an empty pin) one person's own PIN. */
function setPin_(ctx, p) {
  needAdmin_(ctx, 'set staff PINs');
  var pin = String(p.data && p.data.pin != null ? p.data.pin : '');
  if (pin && !/^\d{4,8}$/.test(pin)) throw fail_('BAD_PIN_FORMAT', 'A PIN must be 4 to 8 digits.');
  var rd = read_('people');
  var name = String(p.data && p.data.name || '').toLowerCase();
  var hit = rd.rows.filter(function (r) { return String(r.obj.name).toLowerCase() === name && !r.obj.archived; })[0];
  if (!hit) throw fail_('NOT_FOUND', 'No active team member with that name.');
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty('PIN_SALT')) props.setProperty('PIN_SALT', rndDigits_(8) + rndDigits_(8) + rndDigits_(8));
  var obj = JSON.parse(JSON.stringify(hit.obj));
  if (pin) {
    obj.pinHash = hashPin_(obj.id, pin);
  } else obj.pinHash = null;
  obj.updatedAt = ctx.now; obj.updatedBy = ctx.by; obj.syncAt = ctx.now;
  writeObj_('people', rd, hit, obj);
  logChange_(ctx, 'people', obj.id, 'pin', null, pin ? '(set)' : '(cleared)');
  return { ok: true, id: obj.id, row: publicRow_('people', obj) };
}
