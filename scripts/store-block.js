/* ---- who is using this device ---- */
const AUTH={need:"pin",admin:false,user:"",err:"",people:[],busy:false};
const me=()=>AUTH.user||owner();
const isAdmin=()=>AUTH.admin;
const isTmp=id=>/^tmp_/.test(String(id));
const shown=id=>isTmp(id)?"new":id;
const tempId=()=>"tmp_"+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
let SYNC={txt:"Connecting…",kind:"off"};

function snapshot(){const d={settings:S.settings};COLS.forEach(c=>d[c]=S[c]);return d;}
function loadSnapshot(d){COLS.forEach(c=>{S[c]=(d&&d[c])||{};});S.settings={...DEFAULT_SETTINGS,...clean((d&&d.settings)||{})};}
function clean(o){const r={};Object.keys(o).forEach(k=>{if(o[k]!==null&&o[k]!==undefined&&k!=="updatedBy")r[k]=o[k];});return r;}

/* ---- local change -> queued operation (only the fields that changed) ---- */
const SKIP_DIFF={id:1,history:1,updatedAt:1,updatedBy:1};
const emptyV=v=>v===null||v===undefined||v==="";
function diffFields(old,obj){
  const f={};
  Object.keys(obj).forEach(k=>{if(SKIP_DIFF[k])return;const a=old?old[k]:undefined,b=obj[k];if(emptyV(a)&&emptyV(b))return;if(JSON.stringify(a)!==JSON.stringify(b))f[k]=b===undefined?null:b;});
  if(old)Object.keys(old).forEach(k=>{if(!SKIP_DIFF[k]&&!(k in obj)&&!emptyV(old[k]))f[k]=null;});
  return f;
}
function newHistory(old,obj){const have=new Set(((old&&old.history)||[]).map(h=>h.d+"|"+h.t));return (obj.history||[]).filter(h=>!have.has(h.d+"|"+h.t));}

async function put(col,id,obj){
  const old=S[col][id];obj.updatedAt=nowISO();if(!obj.id)obj.id=id;
  S[col][id]=obj;
  if(!old){const f={...obj};delete f.id;delete f.updatedAt;Sync.enqueue({action:"create",collection:col,id,fields:f});}
  else{const f=diffFields(old,obj),h=newHistory(old,obj);if(Object.keys(f).length||h.length)Sync.enqueue({action:"save",collection:col,id,fields:f,historyAdd:h});}
  Sync.saveState();render();
}
async function remove(col,id){
  delete S[col][id];
  if(isTmp(id))Sync.dropOps(id);else Sync.enqueue({action:"delete",collection:col,id});
  Sync.saveState();render(true);
}
async function putSettings(o){S.settings={...S.settings,...o};Sync.enqueue({action:"save",collection:"settings",id:"app",fields:o});Sync.saveState();render(true);}

/* ---- remote data arriving (safe to apply twice) ---- */
function mergeHist(base,add){const have=new Set((base||[]).map(h=>h.d+"|"+h.t));return [...add.filter(h=>!have.has(h.d+"|"+h.t)),...(base||[])];}
function overlay(col,base){
  Sync.pendingFor(col,base.id).forEach(op=>{if(op.fields)Object.assign(base,op.fields);if(op.historyAdd&&op.historyAdd.length&&col==="projects")base.history=mergeHist(base.history,op.historyAdd);});
  return base;
}
function applyRemote(col,row){
  if(col==="settings"){applySettings(row);return;}
  if(!S[col])return;
  S[col][row.id]=overlay(col,clean(row));
}
function applySettings(row){const r=clean(row);delete r.id;delete r.updatedAt;S.settings={...DEFAULT_SETTINGS,...r};}
function applyPending(oldS){
  Sync.outbox().forEach(op=>{
    const c=op.collection;if(c==="settings"||!S[c])return;
    if(op.action==="create"&&!S[c][op.id]){const src=oldS&&oldS[c]&&oldS[c][op.id];S[c][op.id]=src||{id:op.id,...(op.fields||{})};}
    else if(op.action==="delete")delete S[c][op.id];
    else if(op.action==="save"&&S[c][op.id]&&op.fields){Object.assign(S[c][op.id],op.fields);if(op.historyAdd&&op.historyAdd.length&&c==="projects")S[c][op.id].history=mergeHist(S[c][op.id].history,op.historyAdd);}
  });
  Sync.outbox().filter(op=>op.collection==="settings"&&op.fields).forEach(op=>{S.settings={...S.settings,...op.fields};});
}
function replaceAll(data,serverTime){
  const oldS={};COLS.forEach(c=>oldS[c]=S[c]);
  COLS.forEach(c=>{const o={};Object.values((data&&data[c])||{}).forEach(r=>{o[r.id]=clean(r);});S[c]=o;});
  S.settings={...DEFAULT_SETTINGS,...clean((data&&data.settings)||{})};delete S.settings.id;delete S.settings.updatedAt;
  applyPending(oldS);
  S.loaded=true;UI.loadErr=false;ensureMe();render();
}
function applyChanges(changes,deleted){
  Object.keys(changes).forEach(c=>changes[c].forEach(r=>applyRemote(c,r)));
  deleted.forEach(d=>{if(S[d.collection]&&S[d.collection][d.id]&&!Sync.pendingFor(d.collection,d.id).some(o=>o.action==="create"))delete S[d.collection][d.id];});
  ensureMe();render();
}
function remap(col,tmp,real){
  const o=S[col][tmp];Sync.remapOps(tmp,real);
  if(o){delete S[col][tmp];o.id=real;S[col][real]=o;}
  if(col==="projects"){["tasks","meetings","payments"].forEach(c=>Object.values(S[c]).forEach(r=>{if(r.projectId===tmp)r.projectId=real;}));if(UI.open===tmp)UI.open=real;if(UI.qaProject===tmp)UI.qaProject=real;if(UI.tproject===tmp)UI.tproject=real;}
  if(col==="tasks")Object.values(S.plans).forEach(p=>{if(p.taskIds)p.taskIds=p.taskIds.map(x=>x===tmp?real:x);});
  Sync.saveState();render();
}
function ensureMe(){
  if(!AUTH.user||!S.loaded||AUTH.need!=="ok")return;
  const n=AUTH.user.toLowerCase();
  if(!Object.values(S.people).some(p=>String(p.name).toLowerCase()===n)&&!Sync.outbox().some(o=>o.collection==="people"&&o.action==="create"&&o.fields&&String(o.fields.name).toLowerCase()===n))put("people",tempId(),{name:AUTH.user,role:"",capacity:6});
}
function setStatus(txt,kind){
  SYNC={txt,kind};
  document.querySelectorAll(".syncTxt").forEach(e=>{e.textContent=txt;});
  document.querySelectorAll(".syncDot").forEach(e=>{e.className="dot syncDot "+(kind==="live"?"on":kind==="busy"?"loc":"");});
}
function rejected(op,msg){
  toast(msg);
  if(op.action==="create"&&S[op.collection])delete S[op.collection][op.id];
}
function authFailed(){Sync.setMeta({teamPin:"",adminPin:""});AUTH.admin=false;AUTH.need="pin";AUTH.err="The PIN was not accepted. Ask Ameen for the current PIN.";render(true);}
function netDown(){if(!S.loaded){UI.loadErr=true;render(true);}}
const HANDLERS={snapshot,applyRemote,applySettings,replaceAll,applyChanges,remap,setStatus,rejected,authFailed,netDown,toast:t=>toast(t),importDone:c=>importDone(c)};

/* ---- start-up: cache first, then network ---- */
async function boot(){
  render(true);
  let init;
  try{init=await Sync.init(HANDLERS);}catch(e){init={state:null,meta:{}};}
  const m=init.meta||{};
  if(init.state){loadSnapshot(init.state);applyPending(null);S.loaded=true;}
  AUTH.user=m.user||"";AUTH.admin=!!m.adminPin;
  AUTH.need=!m.teamPin?"pin":!m.user?"who":"ok";
  MODE="shared";
  render(true);
  if(AUTH.need==="ok")Sync.start();
  if("serviceWorker" in navigator)registerSW();
}
function startAfterGate(){AUTH.need="ok";render(true);Sync.start();}
