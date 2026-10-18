const fs = require("fs");
let s = fs.readFileSync("backend/Code.gs", "utf8");
function rep(a, b, all) { if (!s.includes(a)) throw new Error("missing: " + a.slice(0, 70)); s = all ? s.split(a).join(b) : s.replace(a, b); }
rep("var META_COLS = ['updatedAt', 'updatedBy'];", "var META_COLS = ['updatedAt', 'updatedBy', 'syncAt']; // updatedAt = when it was edited (kept on import); syncAt = when the server stored it (drives sync)");
rep("String(r.obj.updatedAt || '') >= since", "String(r.obj.syncAt || r.obj.updatedAt || '') >= since");
rep("if (k === 'id' || k === 'updatedAt' || k === 'updatedBy') return;", "if (k === 'id' || k === 'updatedAt' || k === 'updatedBy' || k === 'syncAt') return;");
rep("obj.updatedAt = ctx.now; obj.updatedBy = ctx.by;\n  writeObj_(col, rd, existing, obj);\n  return { ok: true, id: id, row: obj };", "obj.updatedAt = ctx.now; obj.updatedBy = ctx.by; obj.syncAt = ctx.now;\n  writeObj_(col, rd, existing, obj);\n  return { ok: true, id: id, row: obj };");
rep("obj.updatedAt = ctx.now; obj.updatedBy = ctx.by;\n  writeObj_('projects', rd, hit, obj);", "obj.updatedAt = ctx.now; obj.updatedBy = ctx.by; obj.syncAt = ctx.now;\n  writeObj_('projects', rd, hit, obj);");
rep("      if (obj.history) obj.history = stampHistory_(obj.history, ctx).slice(0, HISTORY_KEEP);\n      obj.updatedAt = ctx.now; obj.updatedBy = ctx.by;",
    "      if (obj.history) obj.history = obj.history.slice(0, HISTORY_KEEP); // old lines keep their own (possibly empty) author\n      obj.updatedAt = rec.updatedAt || ctx.now; obj.updatedBy = ctx.by; obj.syncAt = ctx.now;");
rep("Object.keys(rec).forEach(function (k) { if (k !== 'updatedBy') obj[k] = rec[k]; });", "Object.keys(rec).forEach(function (k) { if (k !== 'updatedBy' && k !== 'syncAt') obj[k] = rec[k]; });");
fs.writeFileSync("backend/Code.gs", s);
let c = fs.readFileSync("app/app.js", "utf8");
c = c.replace("const SKIP_DIFF={id:1,history:1,updatedAt:1,updatedBy:1};", "const SKIP_DIFF={id:1,history:1,updatedAt:1,updatedBy:1,syncAt:1};");
c = c.replace('toast("No old Project OS data found in this browser. Open the old file in this same browser first.")', 'toast("No old data is kept in this browser address. In the old file use Download full backup, then choose that file under Restore from a backup file.")');
fs.writeFileSync("app/app.js", c);
console.log("ok");
