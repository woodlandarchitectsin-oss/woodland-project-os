/* Woodland Project OS — sync layer
   Local cache (IndexedDB, falling back to localStorage) + outbox + polling.
   Knows nothing about screens: app.js gives it a handler object. */
(function () {
  "use strict";
  var TIMEOUT_MS = 25000, POLL_MS = 15000, OVERLAP_MS = 15000;
  var PERMANENT_RETRY = { BUSY: 1 };
  var h = null;                       // handlers from app.js
  var kv = null;                      // key-value store
  var meta = { teamPin: "", adminPin: "", user: "" };
  var lastSync = "";                  // stored together with the cached state, so they can never disagree
  var outbox = [];                    // pending operations, oldest first
  var online = true, busy = false, timer = null, started = false, flushing = false;
  var lastNetToast = 0, backoff = 0, retryTimer = null;
  var epoch = 0;                      // bumped on sign-out so a reply still in flight for the old person is ignored

  /* ---------- key-value store: IndexedDB, else localStorage ---------- */
  function openKV() {
    return new Promise(function (resolve) {
      var ls = {
        get: function (k) { return Promise.resolve(lsGet(k)); },
        set: function (k, v) { lsSet(k, v); return Promise.resolve(); }
      };
      try {
        if (!window.indexedDB) return resolve(ls);
        var req = indexedDB.open("wpos", 1);
        req.onupgradeneeded = function () { req.result.createObjectStore("kv"); };
        req.onerror = function () { resolve(ls); };
        req.onblocked = function () { resolve(ls); };
        req.onsuccess = function () {
          var db = req.result;
          resolve({
            get: function (k) {
              return new Promise(function (res) {
                try {
                  var r = db.transaction("kv", "readonly").objectStore("kv").get(k);
                  r.onsuccess = function () { res(r.result === undefined ? null : r.result); };
                  r.onerror = function () { res(lsGet(k)); };
                } catch (e) { res(lsGet(k)); }
              });
            },
            set: function (k, v) {
              return new Promise(function (res) {
                try {
                  var tx = db.transaction("kv", "readwrite");
                  tx.objectStore("kv").put(v, k);
                  tx.oncomplete = function () { res(); };
                  tx.onerror = function () { lsSet(k, v); res(); };
                  tx.onabort = function () { lsSet(k, v); res(); };
                } catch (e) { lsSet(k, v); res(); }
              });
            }
          });
        };
      } catch (e) { resolve(ls); }
    });
  }
  function lsGet(k) { try { var r = localStorage.getItem("wpos_kv_" + k); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem("wpos_kv_" + k, JSON.stringify(v)); } catch (e) { /* storage full or blocked */ } }

  function saveMeta() { return kv.set("meta", meta); }
  function saveOutbox() { return kv.set("outbox", outbox); }
  var snapTimer = null;
  function persistNow() { clearTimeout(snapTimer); try { return kv.set("state", { snap: h.snapshot(), lastSync: lastSync }); } catch (e) { return Promise.resolve(); } }
  function saveState() {
    clearTimeout(snapTimer);
    snapTimer = setTimeout(persistNow, 250);
  }

  /* ---------- network ---------- */
  function api(action, payload, opts) {
    opts = opts || {};
    var body = JSON.stringify({
      action: action,
      pin: opts.pin !== undefined ? opts.pin : (meta.adminPin || meta.teamPin),
      by: opts.by !== undefined ? opts.by : (meta.user || ""),
      payload: payload || {}
    });
    var ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var to = setTimeout(function () { if (ctl) ctl.abort(); }, TIMEOUT_MS);
    var raced = new Promise(function (_, rej) { setTimeout(function () { rej(new Error("timeout")); }, TIMEOUT_MS + 500); });
    var req = fetch(window.WPOS_CONFIG.API_URL, {
      method: "POST", body: body, redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      signal: ctl ? ctl.signal : undefined
    }).then(function (r) {
      if (!r.ok) throw new Error("http " + r.status);
      return r.text();
    }).then(function (t) {
      var j;
      try { j = JSON.parse(t); } catch (e) { throw new Error("bad reply"); }
      return j;
    });
    return Promise.race([req, raced]).then(function (j) { clearTimeout(to); return j; }, function (e) { clearTimeout(to); e.transient = true; throw e; });
  }

  function netFail() {
    online = false;
    var now = Date.now();
    if (now - lastNetToast > 60000) { lastNetToast = now; h.toast("Couldn't reach the server. Check the internet."); }
    status();
    if (h.netDown) h.netDown();
    scheduleRetry();
  }
  function scheduleRetry() {
    clearTimeout(retryTimer);
    backoff = Math.min(backoff ? backoff * 2 : 3000, 60000);
    retryTimer = setTimeout(function () { tick(true); }, backoff);
  }

  function status() {
    var n = outbox.length;
    var navOff = typeof navigator !== "undefined" && navigator.onLine === false;
    var s;
    if (navOff || !online) s = n ? "Offline · " + n + " waiting" : "Offline · saved on this device";
    else if (n) s = "Saving " + n + "…";
    else s = "Live · shared with team";
    h.setStatus(s, navOff || !online ? "off" : n ? "busy" : "live", n);
  }

  /* ---------- outbox ---------- */
  function uid() { return "op_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8); }
  function enqueue(op) {
    op.opId = op.opId || uid();
    op.by = meta.user;
    op.ts = new Date().toISOString();
    outbox.push(op);
    saveOutbox();
    status();
    flush();
    return op;
  }
  function pendingFor(col, id) { return outbox.filter(function (o) { return o.collection === col && o.id === id; }); }

  function remapOps(tmp, real) {
    function walk(v) {
      if (v === tmp) return real;
      if (Array.isArray(v)) return v.map(walk);
      if (v && typeof v === "object") { var o = {}; for (var k in v) o[k] = walk(v[k]); return o; }
      return v;
    }
    outbox = outbox.map(function (o) { var c = walk(o); return c; });
    saveOutbox();
  }

  function offlineNow() { return typeof navigator !== "undefined" && navigator.onLine === false; }
  function flush() {
    if (flushing || !meta.teamPin) return Promise.resolve();
    if (offlineNow()) { online = false; status(); return Promise.resolve(); }
    flushing = true;
    function next() {
      if (!outbox.length) { flushing = false; status(); return Promise.resolve(true); }
      var op = outbox[0];
      status();
      var payload = { collection: op.collection, id: op.id, fields: op.fields, historyAdd: op.historyAdd, opId: op.opId, ts: op.ts, data: op.data };
      return api(op.action, payload).then(function (res) {
        online = true; backoff = 0;
        if (res && res.ok) {
          outbox.shift(); saveOutbox();
          if (op.action === "create" && res.id && res.id !== op.id) h.remap(op.collection, op.id, res.id);
          if (res.row) h.applyRemote(op.collection, res.row);
          if (res.counts) h.importDone && h.importDone(res.counts);
          if (res.settings) h.applySettings(res.settings);
          saveState();
          return next();
        }
        var code = res && res.code;
        if (code === "BAD_PIN") { flushing = false; h.authFailed(); return false; }
        if (PERMANENT_RETRY[code]) { flushing = false; scheduleRetry(); status(); return false; }
        // permanent rejection: drop it, tell the user, restore server truth
        outbox.shift(); saveOutbox();
        h.rejected(op, (res && res.error) || "The server refused this change.", code);
        return refreshRecord(op).then(next);
      }, function () { flushing = false; netFail(); return false; });
    }
    return next().then(function (r) { flushing = false; return r; });
  }

  function refreshRecord(op) {
    return api("loadAll", {}).then(function (res) {
      if (res && res.ok) h.replaceAll(res.data, res.serverTime);
      saveState();
    }, function () { /* ignore; next poll will fix */ });
  }

  /* ---------- polling ---------- */
  function sinceStamp() {
    if (!lastSync) return "";
    return new Date(Date.parse(lastSync) - OVERLAP_MS).toISOString();
  }
  function pull() {
    if (!meta.teamPin || busy) return Promise.resolve();
    if (offlineNow()) { online = false; status(); return Promise.resolve(); }
    busy = true;
    var first = !lastSync, ep = epoch;
    var call = first ? api("loadAll", {}) : api("changesSince", { since: sinceStamp() });
    return call.then(function (res) {
      if (ep !== epoch) return;                 // answer for someone who has since signed out
      busy = false;
      if (!res) return;
      if (!res.ok) { if (res.code === "BAD_PIN") h.authFailed(); else if (res.error) h.toast(res.error); return; }
      online = true; backoff = 0;
      if (first) h.replaceAll(res.data, res.serverTime);
      else h.applyChanges(res.changes || {}, res.deleted || []);
      lastSync = res.serverTime; persistNow(); status();
    }, function () { if (ep !== epoch) return; busy = false; netFail(); });
  }

  function tick(force) {
    if (!force && typeof document !== "undefined" && document.hidden) { if (outbox.length) flush(); return; }   // hidden tab: still send waiting edits, skip reading
    flush().then(function () { return pull(); }).then(status);
  }

  function start() {
    if (started) { tick(true); return; }   // signing in again on the same page: load straight away
    started = true;
    timer = setInterval(function () { tick(false); }, POLL_MS);
    window.addEventListener("online", function () { online = true; backoff = 0; tick(true); });
    window.addEventListener("offline", function () { online = false; status(); });
    window.addEventListener("focus", function () { tick(true); });
    document.addEventListener("visibilitychange", function () { if (!document.hidden) tick(true); });
    tick(true);
  }

  window.Sync = {
    init: function (handlers) {
      h = handlers;
      return openKV().then(function (store) {
        kv = store;
        return Promise.all([kv.get("meta"), kv.get("outbox"), kv.get("state")]);
      }).then(function (r) {
        if (r[0]) for (var k in r[0]) meta[k] = r[0][k];
        outbox = Array.isArray(r[1]) ? r[1] : [];
        if (r[2] && r[2].snap) lastSync = r[2].lastSync || "";
        return { state: r[2] && r[2].snap ? r[2].snap : null, outbox: outbox, meta: meta };
      });
    },
    meta: function () { return meta; },
    setMeta: function (o) { for (var k in o) meta[k] = o[k]; return saveMeta(); },
    api: api,
    enqueue: enqueue,
    pendingFor: pendingFor,
    remapOps: remapOps,
    outbox: function () { return outbox; },
    saveState: saveState,
    start: start,
    tick: tick,
    flush: flush,
    pull: pull,
    status: status,
    signedOut: function () { epoch++; busy = false; flushing = false; lastSync = ""; clearTimeout(retryTimer); backoff = 0; return persistNow(); },
    resetSync: function () { lastSync = ""; return persistNow(); },
    dropOps: function (id) { outbox = outbox.filter(function (o) { return o.id !== id; }); saveOutbox(); status(); }
  };
})();


