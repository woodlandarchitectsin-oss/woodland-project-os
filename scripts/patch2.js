const fs = require("fs");
const L = fs.readFileSync("app/app.js", "utf8").split("\n");
function idx(prefix) { const i = L.findIndex((l) => l.startsWith(prefix)); if (i < 0) throw new Error("not found: " + prefix); return i; }
// 1. replace resetSeed case with new cases
L[idx('    case "resetSeed"')] =
  '    case "retry":UI.loadErr=false;render(true);Sync.tick(true);break;\n' +
  '    case "changeUser":AUTH.need="who";AUTH.people=Object.values(S.people).filter(p=>!p.archived).map(p=>p.name);gateKey="";render(true);break;\n' +
  '    case "pickUser":chooseUser(el.dataset.v);break;\n' +
  '    case "adminUnlock":adminUnlock();break;\n' +
  '    case "adminLock":adminLock();break;\n' +
  '    case "legacyUpload":legacyUpload();break;';
// 2. change handler: starter file
L[idx('  if(el.id==="importFile"&&el.files[0])importFile(el.files[0]);')] =
  '  if(el.id==="importFile"&&el.files[0]){importFile(el.files[0]);el.value="";}\n  if(el.id==="starterFile"&&el.files[0]){importFile(el.files[0],true);el.value="";}';
// 3. submit handlers for gate forms
L[idx('  if(f.id==="omni")')] =
  '  if(f.id==="pinForm"){submitPin(document.getElementById("pinInput").value);return;}\n' +
  '  if(f.id==="whoForm"){chooseUser(document.getElementById("whoInput").value);return;}\n' + L[idx('  if(f.id==="omni")')];
fs.writeFileSync("app/app.js", L.join("\n"));
console.log("ok");
