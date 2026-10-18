/* =========================================================
   DEFINITIONS
   ========================================================= */
const LIFECYCLE=["ENQUIRY","QUALIFICATION","PROPOSAL / QUOTATION","WON","PRE-DESIGN","CONCEPT DESIGN","DESIGN DEVELOPMENT","CLIENT APPROVAL","WORKING DRAWINGS","TENDER / BOQ","EXECUTION / SITE","COMPLETION","SNAGGING","CLOSED","ON HOLD","LOST / CANCELLED","UNKNOWN — CONFIRM"];
const LC_GROUP={"ENQUIRY":"enq","QUALIFICATION":"enq","PROPOSAL / QUOTATION":"enq","WON":"design","PRE-DESIGN":"design","CONCEPT DESIGN":"design","DESIGN DEVELOPMENT":"design","CLIENT APPROVAL":"design","WORKING DRAWINGS":"design","TENDER / BOQ":"exec","EXECUTION / SITE":"exec","COMPLETION":"snag","SNAGGING":"snag","CLOSED":"closed","ON HOLD":"hold","LOST / CANCELLED":"lost","UNKNOWN — CONFIRM":"unk"};
const TYPES=["Architecture","Interior","Renovation","Landscape","Turnkey","PMC","Civil","Commercial","Residential","Hospitality","Institutional","Feasibility","Other"];
const CONDITIONS=["WAITING FOR CLIENT","CLIENT APPROVAL PENDING","QUOTATION SENT","FEE NOT AGREED","WAITING FOR TEAM","WAITING FOR CONSULTANT","PAYMENT PENDING","SITE ISSUE","SNAGGING PENDING","DOCUMENTS PENDING","HANDOVER PENDING","WARRANTY ISSUE","FINAL PHOTOS PENDING","NEEDS CONFIRMATION"];
const OBLIGATIONS=["PAYMENT PENDING","SNAGGING PENDING","DOCUMENTS PENDING","HANDOVER PENDING","WARRANTY ISSUE","FINAL PHOTOS PENDING"];
const TSTAT=["NOT STARTED","IN PROGRESS","WAITING","BLOCKED","COMPLETED","CANCELLED"];
const PRI=["P0","P1","P2","P3"];
const PRI_LABEL={P0:"P0 Critical",P1:"P1 Important",P2:"P2 Normal",P3:"P3 Low"};
const CATS=["DESIGN","DRAWING","COMMUNICATION","ADMIN","SITE"];
const BLOCKERS=["CLIENT","TEAM","OWNER","SITE","CONSULTANT","PAYMENT","APPROVAL","MATERIAL","DRAWING","UNKNOWN"];
const PAYSTAT=["PAID","PARTIAL","PENDING","OVERDUE","NOT APPLICABLE","UNKNOWN"];
const ESTS=[15,30,45,60,90,120,180,240];
const CONFIRMABLE={client:"Client",location:"Location",types:"Type",scope:"Scope",area:"Area",lifecycle:"Lifecycle",quotedFee:"Quoted fee",agreedFee:"Agreed fee",openingReceived:"Received",targetDate:"Target date",responsible:"Responsible"};
const DEFAULT_SETTINGS={owner:"Ameen",dayStart:"09:00",dayEnd:"18:00",buffer:10,fixed:"13:00-14:00 Lunch + Dhuhr\n16:15-16:35 Asr",dailyControl:30};
const ICON={
 today:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
 projects:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3.5 7.5h6l2 2h9v9.5a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 3.5 19z"/><path d="M3.5 7.5V5.5A1.5 1.5 0 0 1 5 4h4.5l2 2"/></svg>',
 tasks:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 6h11M9 12h11M9 18h11"/><path d="m3.5 6 1.5 1.5L7.5 5M3.5 12l1.5 1.5 2.5-2.5M3.5 18l1.5 1.5 2.5-2.5"/></svg>',
 money:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 5h10M7 9.5h10M9.5 5c3.5 0 4.5 2.2 4.5 4.5S12.5 14 9.5 14H7l7.5 6"/></svg>',
 more:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="5.5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18.5" cy="12" r="1.3"/></svg>',
 follow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/></svg>',
 meetings:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="8" cy="9" r="3"/><circle cx="16.5" cy="9.5" r="2.5"/><path d="M3 19c.6-3 2.6-4.5 5-4.5s4.4 1.5 5 4.5M14 15c2.5-.6 5.5.6 6.5 4"/></svg>',
 team:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-4 3.6-6 7-6s6.2 2 7 6"/></svg>',
 weekly:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19V5M4 19h16M8 15v-4M12 15V8M16 15v-6"/></svg>',
 report:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3.5h8l4 4V20a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 20z"/><path d="M14 3.5V8h4M9 12h6M9 15.5h6"/></svg>',
 data:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><ellipse cx="12" cy="6" rx="7" ry="2.5"/><path d="M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5"/></svg>',
 search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>'
};

/* =========================================================
   STATE + STORE
   ========================================================= */
const S={projects:{},tasks:{},people:{},meetings:{},payments:{},plans:{},settings:{...DEFAULT_SETTINGS},loaded:false};
const COLS=["projects","tasks","people","meetings","payments","plans"];
let MODE="connecting",readOnly=false,CAP={sample:null,downloads:null};

const UI={view:"today",pv:"active",tv:"my",tperson:"",tproject:"",pfil:{lc:"",type:"",person:"",pri:"",pay:""},showFilters:false,sortP:"priority",open:null,cmdOut:null,planOverride:null,gq:"",qaProject:"",qaAssignee:null,secs:{}};
let pendingRender=false,lastView=null;

/* ---- who is using this device ---- */
const AUTH={need:"pin",admin:false,user:"",err:"",people:[],busy:false};
const me=()=>AUTH.user||owner();
const isAdmin=()=>AUTH.admin;
const planKey=()=>me()===owner()?today():today()+"~"+me();
const isTmp=id=>/^tmp_/.test(String(id));
const shown=id=>isTmp(id)?"new":id;
const tempId=()=>"tmp_"+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
let SYNC={txt:"Connecting…",kind:"off"};

function snapshot(){const d={settings:S.settings};COLS.forEach(c=>d[c]=S[c]);return d;}
function loadSnapshot(d){COLS.forEach(c=>{S[c]=(d&&d[c])||{};});S.settings={...DEFAULT_SETTINGS,...clean((d&&d.settings)||{})};}
function clean(o){const r={};Object.keys(o).forEach(k=>{if(o[k]!==null&&o[k]!==undefined&&k!=="updatedBy")r[k]=o[k];});return r;}

/* ---- local change -> queued operation (only the fields that changed) ---- */
const SKIP_DIFF={id:1,history:1,updatedAt:1,updatedBy:1,syncAt:1};
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


/* =========================================================
   HELPERS
   ========================================================= */
const clone=o=>JSON.parse(JSON.stringify(o));
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pad=(n,w)=>String(n).padStart(w,"0");
const today=()=>new Date().toLocaleDateString("en-CA");
const nowISO=()=>new Date().toISOString();
function addDays(iso,n){const d=new Date(iso+"T00:00:00");d.setDate(d.getDate()+n);return d.toLocaleDateString("en-CA");}
function daysBetween(a,b){return Math.round((new Date(b+"T00:00:00")-new Date(a+"T00:00:00"))/864e5);}
function fmtD(iso){if(!iso)return "";const d=new Date(iso.length>10?iso:iso+"T00:00:00");return d.toLocaleDateString("en-GB",{day:"2-digit",month:"short"});}
function fmtDY(iso){if(!iso)return "";const d=new Date(iso.length>10?iso:iso+"T00:00:00");return d.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});}
const INR=new Intl.NumberFormat("en-IN");
function money(n){return n==null||n===""||isNaN(n)?null:"₹"+INR.format(Math.round(Number(n)));}
function hm(m){return pad(Math.floor(m/60),2)+":"+pad(m%60,2);}
function toMin(t){if(!t)return null;const [h,m]=t.split(":").map(Number);return h*60+(m||0);}
function dur(m){if(!m)return "";return m>=60?(Math.floor(m/60)+"h"+(m%60?" "+m%60+"m":"")):m+"m";}
/* ids are assigned by the server; until a change reaches it a record carries a temporary id */
function nextId(){return tempId();}
const owner=()=>S.settings.owner||"Ameen";
function toast(t){const l=document.createElement("div");l.className="toast";l.textContent=t;document.body.appendChild(l);setTimeout(()=>l.remove(),2600+Math.min(String(t).length*45,4500));}
function log(p,t){p.history=[{d:nowISO(),t,by:me()},...(p.history||[])].slice(0,300);}
const personNames=()=>Object.values(S.people).filter(x=>!x.archived).map(x=>x.name);
function getPath(o,k){return k.split(".").reduce((a,x)=>a==null?a:a[x],o);}
function setPath(o,k,v){const ks=k.split(".");let a=o;ks.slice(0,-1).forEach(x=>{if(a[x]==null||typeof a[x]!=="object")a[x]={};a=a[x];});a[ks[ks.length-1]]=v;}

/* =========================================================
   DERIVED LOGIC
   ========================================================= */
const isOpenT=t=>t.status!=="COMPLETED"&&t.status!=="CANCELLED";
const projects=inc=>Object.values(S.projects).filter(p=>inc||!p.archived);
const tasksOf=pid=>Object.values(S.tasks).filter(t=>t.projectId===pid);
const overdue=t=>isOpenT(t)&&t.due&&t.due<today();
function received(p){const pays=Object.values(S.payments).filter(x=>x.projectId===p.id).reduce((a,b)=>a+(Number(b.amount)||0),0);const op=p.openingReceived==null||p.openingReceived===""?null:Number(p.openingReceived);if(op==null&&!pays)return null;return (op||0)+pays;}
function balance(p){if(p.agreedFee==null||p.agreedFee==="")return null;return Number(p.agreedFee)-(received(p)||0);}
function payStatus(p){
  if(p.paymentStatus==="NOT APPLICABLE")return "NOT APPLICABLE";
  const b=balance(p);if(b==null)return "UNKNOWN";if(b<=0)return "PAID";
  if(p.nextPaymentDue&&p.nextPaymentDue<today())return "OVERDUE";
  return (received(p)||0)>0?"PARTIAL":"PENDING";
}
const isActive=p=>["design","exec","snag"].includes(LC_GROUP[p.lifecycle]);
const PRI_W={P0:1000,P1:300,P2:100,P3:30};
function taskScore(t){
  let s=PRI_W[t.priority]||100;const td=today();
  if(t.due){const d=daysBetween(td,t.due);if(d<0)s+=500+(-d)*25;else if(d===0)s+=420;else if(d<=2)s+=200;else if(d<=7)s+=80;}
  const p=S.projects[t.projectId];if(p){s+=(PRI_W[p.priority]||100)/4;if(LC_GROUP[p.lifecycle]==="exec")s+=40;}
  if(t.clientDependency)s+=60;return s;
}
function condsOf(p){
  const c=[...(p.conditions||[])];const ts=tasksOf(p.id);
  const od=ts.filter(overdue).length;if(od)c.push(od+" OVERDUE");
  const ps=payStatus(p);if((ps==="PENDING"||ps==="OVERDUE"||ps==="PARTIAL")&&isActive(p)&&!c.includes("PAYMENT PENDING"))c.push("PAYMENT "+ps);
  if(p.blocker&&p.blocker.type)c.push("BLOCKED · "+p.blocker.type);
  return [...new Set(c)];
}
function condClass(c){if(/OVERDUE|BLOCKED|SITE ISSUE|WARRANTY/.test(c))return "crit";if(/PAYMENT|FEE|CONFIRM/.test(c))return "warn";if(/WAITING|APPROVAL|QUOTATION/.test(c))return "info";return "";}
const condPills=(p,max)=>{const c=condsOf(p);const sh=max?c.slice(0,max):c;return sh.map(x=>`<span class="pill ${condClass(x)}">${esc(x)}</span>`).join("")+(max&&c.length>max?`<span class="pill">+${c.length-max}</span>`:"");};
function progress(p){const ts=tasksOf(p.id).filter(t=>t.status!=="CANCELLED");if(!ts.length)return null;return Math.round(ts.filter(t=>t.status==="COMPLETED").length/ts.length*100);}
function nextDeadline(p){const ds=tasksOf(p.id).filter(isOpenT).map(t=>t.due).filter(Boolean);if(p.nextActionDeadline)ds.push(p.nextActionDeadline);if(p.targetDate)ds.push(p.targetDate);ds.sort();return ds[0]||null;}
function waitingClient(){
  const out=[];
  projects().forEach(p=>{if((p.conditions||[]).some(c=>/WAITING FOR CLIENT|CLIENT APPROVAL|QUOTATION SENT/.test(c))||(p.blocker&&p.blocker.type==="CLIENT"))out.push({kind:"project",p,since:(p.blocker&&p.blocker.since)||p.waitingSince||null,what:(p.blocker&&p.blocker.action)||p.nextAction||(p.conditions||[]).filter(c=>/CLIENT|QUOTATION/.test(c)).join(", ")});});
  Object.values(S.tasks).filter(t=>isOpenT(t)&&t.clientDependency).forEach(t=>out.push({kind:"task",t,p:S.projects[t.projectId],since:t.waitingSince||t.created,what:t.title}));
  return out;
}
const waitingTeam=()=>Object.values(S.tasks).filter(t=>isOpenT(t)&&t.assignee&&t.assignee!==me()&&!t.clientDependency);
function blocked(){
  const out=[];
  projects().forEach(p=>{if(p.blocker&&p.blocker.type)out.push({p,type:p.blocker.type,days:p.blocker.since?daysBetween(p.blocker.since,today()):null,who:p.blocker.who||"",action:p.blocker.action||p.nextAction||""});});
  Object.values(S.tasks).filter(t=>t.status==="BLOCKED"||t.status==="WAITING").forEach(t=>out.push({p:S.projects[t.projectId],t,type:t.clientDependency?"CLIENT":(t.status==="BLOCKED"?(t.blockType||"UNKNOWN"):"TEAM"),days:t.waitingSince?daysBetween(t.waitingSince,today()):null,who:t.clientDependency?"Client":(t.assignee||"UNASSIGNED"),action:t.title}));
  return out;
}
function ownerLoad(){
  const o=owner();const set=new Set();
  Object.values(S.tasks).filter(t=>isOpenT(t)&&t.assignee===o&&t.status!=="WAITING").forEach(t=>set.add(t.projectId));
  projects().forEach(p=>{if(isActive(p)||LC_GROUP[p.lifecycle]==="enq"){if(p.nextActionOwner===o)set.add(p.id);if(p.blocker&&p.blocker.type==="OWNER")set.add(p.id);}});
  return {projects:[...set].map(id=>S.projects[id]).filter(Boolean),unassigned:Object.values(S.tasks).filter(t=>isOpenT(t)&&!t.assignee)};
}
function moneyAtRisk(){
  const out=[];
  projects().forEach(p=>{
    if(!["design","exec","snag"].includes(LC_GROUP[p.lifecycle])||p.paymentStatus==="NOT APPLICABLE")return;
    if(p.agreedFee==null||p.agreedFee===""){out.push({p,reason:"Work progressing with no agreed fee",amt:p.quotedFee?Number(p.quotedFee):null,sev:"crit"});return;}
    const b=balance(p);if(b>0){const share=b/Number(p.agreedFee);if(share>=0.5||payStatus(p)==="OVERDUE")out.push({p,reason:(payStatus(p)==="OVERDUE"?"Payment overdue · ":"")+Math.round(share*100)+"% of fee unpaid",amt:b,sev:payStatus(p)==="OVERDUE"?"crit":"warn"});}
  });
  return out.sort((a,b)=>(b.amt||0)-(a.amt||0));
}
const meetingsOn=d=>Object.values(S.meetings).filter(m=>m.date===d).sort((a,b)=>(a.time||"").localeCompare(b.time||""));
const upcomingMeetings=()=>{const t=today();return Object.values(S.meetings).filter(m=>m.date>=t).sort((a,b)=>(a.date+(a.time||"")).localeCompare(b.date+(b.time||"")));};

/* ---------- Daily time-blocking engine ---------- */
function parseFixed(txt){return String(txt||"").split("\n").map(l=>l.trim()).filter(Boolean).map(l=>{const m=l.match(/^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\s*(.*)$/);return m?{s:toMin(m[1]),e:toMin(m[2]),label:m[3]||"Protected"}:null;}).filter(Boolean);}
function buildPlan(day,startT,endT){
  const st=S.settings;const o=me();
  const s0=toMin(startT||st.dayStart),e0=toMin(endT||st.dayEnd);const buf=Number(st.buffer)||10;
  const busy=parseFixed(st.fixed).map(f=>({...f,kind:"fixed"}));
  meetingsOn(day).forEach(m=>{if(m.time){const s=toMin(m.time);busy.push({s,e:s+(Number(m.duration)||60),label:"Meeting · "+(S.projects[m.projectId]?.name||"General")+(m.purpose?" — "+m.purpose:""),kind:"meeting"});}});
  busy.sort((a,b)=>a.s-b.s);
  const blocks=[];const dc=Number(st.dailyControl)||30;
  blocks.push({s:s0,e:s0+dc,label:"Daily control + urgent communication",kind:"control"});
  let cursor=s0+dc;const free=[];
  busy.filter(b=>b.e>s0&&b.s<e0).forEach(b=>{if(b.s>cursor)free.push({s:cursor,e:b.s});cursor=Math.max(cursor,b.e);});
  if(cursor<e0)free.push({s:cursor,e:e0});
  const eodLen=20;let eod=null;
  if(free.length){const last=free[free.length-1];if(last.e-last.s>=eodLen+30&&last.e===e0){last.e-=eodLen;eod={s:last.e,e:last.e+eodLen,label:"End-of-day review",kind:"control"};}}
  const cand=Object.values(S.tasks).filter(t=>isOpenT(t)&&t.assignee===o&&t.status!=="WAITING"&&t.status!=="BLOCKED"&&(!t.startAfter||t.startAfter<=day)).sort((a,b)=>taskScore(b)-taskScore(a));
  const capacity=free.reduce((a,f)=>a+(f.e-f.s),0);
  const left=[],chosen=[];let used=0;
  cand.forEach(t=>{const m=Number(t.est)||60;if(used+m+buf<=capacity){chosen.push(t);used+=m+buf;}else left.push(t);});
  const catRank={};chosen.forEach(t=>{const c=t.category||"DESIGN";if(!(c in catRank))catRank[c]=Object.keys(catRank).length;});
  chosen.sort((a,b)=>(catRank[a.category||"DESIGN"]-catRank[b.category||"DESIGN"])||(taskScore(b)-taskScore(a)));
  const slots=free.map(f=>({...f,cur:f.s}));const placed=[];
  chosen.forEach(t=>{const m=Number(t.est)||60;const slot=slots.find(sl=>sl.e-sl.cur>=m);if(slot){placed.push({s:slot.cur,e:slot.cur+m,t,label:t.title,kind:"task",cat:t.category||"DESIGN"});slot.cur+=m+buf;}else left.unshift(t);});
  busy.filter(b=>b.e>s0&&b.s<e0).forEach(b=>blocks.push(b));placed.forEach(b=>blocks.push(b));if(eod)blocks.push(eod);
  blocks.sort((a,b)=>a.s-b.s);
  return {blocks,capacity,demand:cand.reduce((a,t)=>a+(Number(t.est)||60),0),placed,left,noEst:cand.filter(t=>!t.est).length,s0,e0};
}
function recommend(t){
  const team=Object.values(S.people).filter(p=>!p.archived&&p.name!==owner());
  if(["DRAWING","SITE","ADMIN"].includes(t.category)&&team.length){const load=n=>Object.values(S.tasks).filter(x=>isOpenT(x)&&x.assignee===n).reduce((a,x)=>a+(Number(x.est)||60),0);const best=[...team].sort((a,b)=>load(a.name)-load(b.name))[0];return "Delegate → "+best.name;}
  if(t.priority==="P3"&&!t.due)return "Drop or park";
  if(t.priority==="P0"||(t.due&&t.due<=today()))return "Do — move a P2 out";
  return "Defer → "+fmtD(addDays(today(),1));
}
function topOutcomes(){
  const o=me();const used=new Set();const out=[];
  Object.values(S.tasks).filter(t=>isOpenT(t)&&t.assignee===o&&t.status!=="WAITING").sort((a,b)=>taskScore(b)-taskScore(a)).forEach(t=>{if(out.length<3&&!used.has(t.projectId)){used.add(t.projectId);out.push(t);}});
  return out;
}

/* =========================================================
   EDITABLE CONTROLS
   ========================================================= */
// in-place field: looks like text, edits on tap, saves on change
function ed(col,id,k,v,o={}){
  const key=`${col}|${id}|${k}`;const fid="e-"+key.replace(/[^A-Za-z0-9]/g,"_");
  const ph=o.ph||"Unknown";const cls="ed "+(o.cls||"");
  if(o.type==="select"){const opts=o.options.map(x=>Array.isArray(x)?x:[x,x]);return `<select id="${fid}" class="${cls} ${v==null||v===""?"empty":""}" data-ed="${key}">${o.blank!==false?`<option value="">${esc(o.blankLabel||"Not set")}</option>`:""}${opts.map(([ov,ol])=>`<option value="${esc(ov)}" ${String(ov)===String(v??"")?"selected":""}>${esc(ol)}</option>`).join("")}</select>`;}
  if(o.type==="textarea")return `<textarea id="${fid}" class="${cls}" data-ed="${key}" rows="${o.rows||2}" placeholder="${esc(ph)}">${esc(v??"")}</textarea>`;
  return `<input id="${fid}" type="${o.type||"text"}" class="${cls}" data-ed="${key}" value="${esc(v??"")}" placeholder="${esc(ph)}" ${o.type==="number"?'inputmode="decimal" step="any"':""} autocomplete="off">`;
}
// fee / payment fields: editable by the admin, read-only for everyone else (the server enforces this too)
function edA(col,id,k,v,o={}){
  if(isAdmin())return ed(col,id,k,v,o);
  const txt=o.type==="number"?(v==null||v===""?"—":INR.format(v)):o.type==="date"?(v?fmtDY(v):"—"):(v||"—");
  return `<div class="ed ro ${o.cls||""}" title="Only the admin can change this">${esc(txt)}</div>`;
}
const peopleOpts=()=>personNames();
function chipSel(col,id,k,v,options,label,cls){const has=v!=null&&v!=="";return `<select class="cs ${has?(cls||""):"unset"}" data-ed="${col}|${id}|${k}" aria-label="${esc(label)}"><option value="">${esc(label)}</option>${options.map(x=>{const [ov,ol]=Array.isArray(x)?x:[x,x];return `<option value="${esc(ov)}" ${String(ov)===String(v??"")?"selected":""}>${esc(ol)}</option>`;}).join("")}</select>`;}
function taskRow(t,opt={}){
  const od=overdue(t);const done=!isOpenT(t);const p=S.projects[t.projectId];
  return `<div class="trow ${done?"done":""}">
    <button class="tick ${t.status==="COMPLETED"?"on":""}" data-act="toggleDone" data-id="${t.id}" aria-label="${done?"Mark not done":"Mark done"}"></button>
    <div class="tmain">
      <input id="tt-${t.id}" class="ed ttl" data-ed="tasks|${t.id}|title" value="${esc(t.title)}" aria-label="Task title">
      <div class="tmeta">
        ${opt.noProject?"":`<span class="tproj" data-act="openP" data-id="${t.projectId}">${esc(p?p.name:"No project")}</span>`}
        ${chipSel("tasks",t.id,"assignee",t.assignee,peopleOpts(),"Assign")}
        <input type="date" class="cs ${od?"crit":t.due?"":"unset"}" data-ed="tasks|${t.id}|due" value="${t.due||""}" aria-label="Due date">
        ${chipSel("tasks",t.id,"priority",t.priority,PRI,"Priority",(t.priority||"").toLowerCase())}
        ${chipSel("tasks",t.id,"est",t.est,ESTS.map(m=>[m,dur(m)]),"Time?")}
        ${chipSel("tasks",t.id,"status",t.status,TSTAT.map(s=>[s,s.charAt(0)+s.slice(1).toLowerCase()]),"Status",t.status==="BLOCKED"?"crit":t.status==="WAITING"?"warn":"")}
        ${t.clientDependency?'<span class="pill info">Client</span>':""}
        ${t.status==="COMPLETED"&&t.completedBy?`<span class="hint">completed · ${esc(t.completedBy)}</span>`:""}
        <button class="btn ghost sm" data-act="editTask" data-id="${t.id}" aria-label="More task details">More</button>
      </div>
    </div></div>`;
}
function quickAdd(pid){
  const ppl=personNames();const asg=UI.qaAssignee==null?me():UI.qaAssignee;
  return `<form class="quick" data-quick="${pid||""}">
    <input type="text" id="qa-${pid||"x"}" placeholder="Add a task and press Enter" autocomplete="off">
    ${pid?"":`<select id="qa-proj" aria-label="Project"><option value="">Project…</option>${projects().filter(p=>!["closed","lost"].includes(LC_GROUP[p.lifecycle])).sort((a,b)=>a.name.localeCompare(b.name)).map(p=>`<option value="${p.id}" ${UI.qaProject===p.id?"selected":""}>${esc(p.name)}</option>`).join("")}</select>`}
    <select id="qa-asg-${pid||"x"}" aria-label="Assign to" style="flex:0 1 160px;width:auto"><option value="">Unassigned</option>${ppl.map(n=>`<option ${n===asg?"selected":""}>${esc(n)}</option>`).join("")}</select>
    <button class="btn pri">Add</button></form>`;
}

/* =========================================================
   RENDER
   ========================================================= */
const TABS=[["today","Today","today"],["projects","Projects","projects"],["tasks","Tasks","tasks"],["money","Money","money"],["more","More","more",1],["follow","Follow-ups","follow",2],["meetings","Meetings","meetings",2],["team","Team","team",2],["weekly","Weekly review","weekly",2],["report","Daily report","report",2],["data","Data & settings","data",2]];
function isTyping(){const a=document.activeElement;if(!a)return false;if(a.tagName==="TEXTAREA")return true;return a.tagName==="INPUT"&&["text","number","search"].includes(a.type)&&!a.dataset.live;}
function render(force){
  if(!force&&isTyping()){pendingRender=true;return;}
  pendingRender=false;
  const ae=document.activeElement;const aid=ae&&ae.id;let sel=null;try{sel=[ae.selectionStart,ae.selectionEnd];}catch(e){}
  const od=Object.values(S.tasks).filter(overdue).length,risk=moneyAtRisk().length;
  const ct={tasks:od?{n:od,hot:1}:null,money:risk?{n:risk,hot:1}:null};
  const moreViews=["more","follow","meetings","team","weekly","report","data"];
  document.getElementById("nav").innerHTML=TABS.map(([k,l,ic,flag])=>{const on=UI.view===k||(flag===1&&moreViews.includes(UI.view));return `<button data-act="view" data-v="${k}" class="${on?"on":""} ${flag===1?"mob":flag===2?"desk":""}">${ICON[ic]}<span>${l}</span>${ct[k]?`<span class="ct ${ct[k].hot?"hot":""}">${ct[k].n}</span>`:""}</button>`;}).join("");
  renderGate();
  const m=document.getElementById("main");const wsx=window.scrollY;
  if(AUTH.need!=="ok"&&!S.loaded){m.innerHTML="";}
  else if(!S.loaded){m.innerHTML=UI.loadErr?'<div class="banner">Couldn\'t reach the server. Check the internet.</div><button class="btn pri" data-act="retry">Try again</button>':'<div class="banner info">Loading project records…</div>';}
  else{const fn={today:vToday,projects:vProjects,tasks:vTasks,money:vMoney,more:vMore,follow:vFollow,meetings:vMeetings,team:vTeam,weekly:vWeekly,report:vReport,data:vData}[UI.view];m.innerHTML=fn();}
  if(UI.view===lastView)window.scrollTo(0,wsx);lastView=UI.view;
  if(UI.open)renderSheet();
  setStatus(SYNC.txt,SYNC.kind);
  if(aid){const n=document.getElementById(aid);if(n&&n!==document.activeElement){n.focus({preventScroll:true});if(sel&&n.setSelectionRange)try{n.setSelectionRange(sel[0],sel[1]);}catch(e){}}}
}
function header(title,sub,actions){
  return `<div class="syncline"><i class="dot syncDot"></i><span class="syncTxt"></span>${isAdmin()?'<span class="adm">admin</span>':""}<span class="who">${esc(AUTH.user)}</span></div>
  <div class="top"><div class="title"><h1>${title}</h1>${sub?`<div class="sub">${sub}</div>`:""}</div>${actions||""}</div>
  <form class="omni" id="omni">${ICON.search}<input type="search" id="gsearch" data-live="1" placeholder="${CAP.sample?"Search, or type a command and press Enter":"Search projects, clients, tasks"}" value="${esc(UI.gq)}" autocomplete="off" aria-label="Search or command">${CAP.sample?'<span class="hint">Enter = ask Claude</span>':""}</form>
  ${cmdOutput()}${UI.gq?globalResults():""}`;
}
function cmdOutput(){
  const o=UI.cmdOut;if(!o)return "";
  let out=`<div class="cmd-out">${o.busy?'<span class="hint">Working on it…</span>':""}${o.text?`<div style="white-space:pre-wrap">${esc(o.text)}</div>`:""}`;
  if(o.actions&&o.actions.length)out+=`<div style="margin-top:8px">${o.actions.map(a=>`<div class="act">• ${esc(describeAction(a))}</div>`).join("")}</div><div class="toolbar" style="margin:10px 0 0"><button class="btn pri sm" data-act="cmdApply">Apply ${o.actions.length} change${o.actions.length>1?"s":""}</button><button class="btn sm" data-act="cmdClose">Discard</button></div>`;
  else if(!o.busy)out+=`<div style="margin-top:8px"><button class="btn sm" data-act="cmdClose">Close</button></div>`;
  return out+"</div>";
}
function globalResults(){
  const q=UI.gq.toLowerCase();const hit=s=>String(s||"").toLowerCase().includes(q);
  const ps=projects(true).filter(p=>[p.id,p.name,p.client,p.location,p.notes,p.scope,p.responsible].some(hit)).slice(0,8);
  const ts=Object.values(S.tasks).filter(t=>[t.title,t.desc,t.notes,t.assignee].some(hit)).slice(0,8);
  const ms=Object.values(S.meetings).filter(m=>[m.purpose,m.participants,(m.decisions||[]).join(" "),m.requests].some(hit)).slice(0,5);
  const n=ps.length+ts.length+ms.length;
  return `<section class="sec" style="margin-bottom:16px"><h3>Results<span class="cnt">${n}</span></h3>
  ${ps.map(p=>`<div class="row clk" data-act="openP" data-id="${p.id}"><span class="pill">${shown(p.id)}</span><div class="grow"><div class="t">${esc(p.name)}</div><div class="s">${esc(p.client||"Client unknown")} · ${esc(p.lifecycle)}</div></div></div>`).join("")}
  ${ts.map(t=>taskRow(t)).join("")}
  ${ms.map(m=>`<div class="row clk" data-act="openP" data-id="${m.projectId}"><span class="pill">Meeting</span><div class="grow"><div class="t">${esc(m.purpose||"Meeting")}</div><div class="s">${fmtDY(m.date)}</div></div></div>`).join("")}
  ${n?"":'<div class="empty">Nothing matches. Press Enter to ask Claude instead.</div>'}</section>`;
}
function isOpenSec(key,def){return key in UI.secs?UI.secs[key]:!!def;}
function sec(title,count,inner,empty,open,hot){
  const key=UI.view+":"+title;
  return `<details class="sec" data-sec="${esc(key)}" ${isOpenSec(key,open)?"open":""}><summary>${title}<span class="cnt ${hot&&count?"hot":""}">${count}</span></summary>${inner||`<div class="empty">${empty||"Nothing here."}</div>`}</details>`;
}

/* ---------------- TODAY ---------------- */
function vToday(){
  const ps=projects();const td=today();const tasks=Object.values(S.tasks);
  const hello=new Date().getHours()<12?"Good morning":new Date().getHours()<17?"Good afternoon":"Good evening";
  if(!ps.length)return header(hello+", "+esc(me()),fmtDY(td))+`<div class="sec body"><h2 style="font-size:19px;margin-bottom:8px">No projects yet</h2><p style="color:var(--muted);margin:0 0 14px">Add your first project. Everything is saved to your account.</p><button class="btn pri" data-act="newProject">+ New project</button></div>`;
  const od=tasks.filter(overdue);const g=k=>ps.filter(p=>LC_GROUP[p.lifecycle]===k).length;
  const ol=ownerLoad();const plan=buildPlan(td,UI.planOverride?.s,UI.planOverride?.e);const top=topOutcomes();
  const must=tasks.filter(t=>isOpenT(t)&&t.assignee===me()&&(t.priority==="P0"||(t.due&&t.due<=td))&&t.status!=="WAITING");
  const wc=waitingClient(),wt=waitingTeam(),risk=moneyAtRisk(),bl=blocked();
  const unassigned=ol.unassigned;
  const site=ps.flatMap(p=>(p.siteIssues||[]).filter(x=>x.status!=="RESOLVED").map(x=>({p,x})));
  const up=tasks.filter(t=>isOpenT(t)&&t.due&&t.due>=td&&t.due<=addDays(td,7)).sort((a,b)=>a.due.localeCompare(b.due));
  const mt=upcomingMeetings().slice(0,6);
  const quick=tasks.filter(t=>isOpenT(t)&&t.assignee===me()&&Number(t.est)>0&&Number(t.est)<=20);
  const k=(n,l,v,cls)=>`<div class="kpi ${cls||""}" data-act="kpi" data-v="${v}"><b>${n}</b><span>${l}</span></div>`;
  let h=header(hello+", "+esc(me()),fmtDY(td),`<button class="btn pri" data-act="newProject">+ Project</button>`);
  if(ol.projects.length>=5)h+=`<div class="banner">${me()===owner()?`YOU are the bottleneck — ${ol.projects.length} projects are waiting on you. Delegate drawing and site work today.`:`${esc(owner())} is the bottleneck — ${ol.projects.length} projects are waiting on ${esc(owner())}.`}</div>`;
  else if(unassigned.length)h+=`<div class="banner warn">${unassigned.length} task${unassigned.length>1?"s have":" has"} no owner. Assign them below — unowned work doesn't get done.</div>`;
  h+=`<div class="kpis">${k(ps.filter(isActive).length,"Active","active")}${k(g("enq"),"Enquiries","enq")}${k(g("design"),"Design","design")}${k(g("exec"),"On site","exec")}${k(g("snag"),"Snagging","snag")}${k(od.length,"Overdue","overdue",od.length?"alert":"")}${k(risk.length,"Money at risk","pay",risk.length?"warn":"")}${k(wc.length,"Waiting client","waitc")}${g("unk")?k(g("unk"),"To confirm","confirm","warn"):""}</div>`;
  h+=`<div class="stack">`;
  h+=`<section class="sec"><h3>Top 3 outcomes today</h3>${top.length?`<div class="top3">${top.map((t,i)=>`<div class="row"><span class="n">${i+1}</span><div class="grow"><div class="t">${esc(t.title)}</div><div class="s clk" data-act="openP" data-id="${t.projectId}">${esc(S.projects[t.projectId]?.name||"")}${t.due?" · due "+fmtD(t.due):""}</div></div><button class="tick" data-act="toggleDone" data-id="${t.id}" aria-label="Mark done"></button></div>`).join("")}</div>`:`<div class="empty">Nothing is assigned to you yet. Assign tasks to ${esc(me())} in “Needs an owner” below and your top 3 appear here.</div>`}</section>`;
  if(unassigned.length)h+=sec("Needs an owner",unassigned.length,unassigned.sort((a,b)=>taskScore(b)-taskScore(a)).map(t=>taskRow(t)).join(""),"",true,true);
  h+=`<details class="sec" data-sec="today:plan" ${isOpenSec("today:plan",plan.placed.length)?"open":""}><summary>Today's plan<span class="cnt">${dur(plan.capacity)} free · ${dur(plan.demand)||"0m"} of work</span></summary>
      <div class="toolbar" style="padding:10px 16px 0;margin:0"><span class="hint">I'm available</span><input type="time" id="planS" value="${hm(plan.s0)}"><span class="hint">to</span><input type="time" id="planE" value="${hm(plan.e0)}"><button class="btn sm" data-act="replan">Replan</button><button class="btn sm" data-act="lockPlan">Lock plan</button></div>
      ${plan.demand>plan.capacity?`<div class="banner warn" style="margin:10px 16px 0">Too much work for today — ${dur(plan.demand-plan.capacity)} over. See what to move below.</div>`:""}
      ${plan.noEst?`<div class="hint" style="padding:6px 16px 0">${plan.noEst} task${plan.noEst>1?"s have":" has"} no time estimate — counted as 1h. Set “Time?” on the task.</div>`:""}
      <div style="margin-top:8px">${plan.blocks.map(b=>`<div class="blk ${b.kind==="fixed"||b.kind==="meeting"?"fixed":""}"><span class="tm">${hm(b.s)}–${hm(b.e)}</span><div><div class="t">${esc(b.label)}</div>${b.t?`<div class="cat">${b.cat} · ${esc(S.projects[b.t.projectId]?.name||"")}</div>`:b.kind==="fixed"?'<div class="cat">PROTECTED</div>':""}</div></div>`).join("")}</div>
      ${plan.left.length?`<div style="border-top:1px solid var(--line)"><div class="hint" style="padding:10px 16px 0">Didn't fit — what to do with it</div>${plan.left.slice(0,8).map(t=>`<div class="row"><div class="grow"><div class="t">${esc(t.title)}</div><div class="s">${esc(S.projects[t.projectId]?.name||"")} · ${t.priority}</div></div><span class="pill ${/Do/.test(recommend(t))?"crit":/Delegate/.test(recommend(t))?"acc":""}">${esc(recommend(t))}</span></div>`).join("")}</div>`:""}
    </details>`;
  h+=sec("Must do today",must.length,must.map(t=>taskRow(t)).join(""),"No P0 or due-today tasks for you.",must.length>0,true);
  h+=sec("Overdue",od.length,od.sort((a,b)=>a.due.localeCompare(b.due)).map(t=>taskRow(t)).join(""),"Nothing overdue.",od.length>0,true);
  h+=sec("Waiting for client",wc.length,wc.map(w=>`<div class="row clk" data-act="openP" data-id="${w.p?.id||""}"><div class="grow"><div class="t">${esc(w.p?.name||"")}</div><div class="s">${esc(w.what||"")}</div></div>${w.since?`<span class="pill info">${daysBetween(w.since.slice(0,10),td)}d</span>`:""}</div>`).join(""),"No client dependencies.");
  h+=sec("Money at risk",risk.length,risk.map(r=>`<div class="row clk" data-act="openP" data-id="${r.p.id}"><div class="grow"><div class="t">${esc(r.p.name)}</div><div class="s">${esc(r.reason)}</div></div><span class="pill ${r.sev}">${r.amt!=null?money(r.amt):"Fee ?"}</span></div>`).join(""),"No unbilled active work.",false,true);
  h+=sec("Waiting for team",wt.length,wt.map(t=>taskRow(t)).join(""),"Nothing assigned to the team.");
  h+=sec("Blocked",bl.length,bl.map(b=>`<div class="row clk" data-act="openP" data-id="${b.p?.id||""}"><span class="pill crit">${esc(b.type)}</span><div class="grow"><div class="t">${esc(b.p?.name||"")}</div><div class="s">${esc(b.action)} · ${esc(b.who)}</div></div>${b.days!=null?`<span class="pill">${b.days}d</span>`:""}</div>`).join(""),"Nothing blocked.",false,true);
  h+=sec("Next 7 days",up.length,up.map(t=>taskRow(t)).join(""),"No dated tasks this week. Set due dates on tasks to see them here.");
  h+=sec("Meetings",mt.length,mt.map(m=>`<div class="row clk" data-act="openP" data-id="${m.projectId}"><span class="mono s" style="width:84px">${fmtD(m.date)} ${esc(m.time||"")}</span><div class="grow"><div class="t">${esc(m.purpose||"Meeting")}</div><div class="s">${esc(S.projects[m.projectId]?.name||"General")}</div></div></div>`).join(""),"No meetings scheduled.");
  if(site.length)h+=sec("Site issues",site.length,site.map(({p,x})=>`<div class="row clk" data-act="openP" data-id="${p.id}"><div class="grow"><div class="t">${esc(x.text)}</div><div class="s">${esc(p.name)}</div></div></div>`).join(""),"",true,true);
  if(quick.length)h+=sec("Quick wins · ≤20 min",quick.length,quick.map(t=>taskRow(t)).join(""));
  return h+"</div>";
}

/* ---------------- PROJECTS ---------------- */
const PVIEWS=[["active","Active"],["enq","Enquiries"],["design","Design"],["exec","On site"],["snag","Snagging"],["waitc","Waiting client"],["pay","Payment due"],["confirm","To confirm"],["mine","Mine"],["hold","On hold"],["all","All"],["closed","Closed / lost"]];
function filterProjects(){
  const f=UI.pfil,v=UI.pv;const g=p=>LC_GROUP[p.lifecycle];
  let ps=projects().filter(p=>{
    if(v==="mine"&&!(p.lead===me()||p.responsible===me()||p.nextActionOwner===me()))return false;
    if(v==="active"&&!isActive(p))return false;
    if(["enq","design","exec","snag","hold"].includes(v)&&g(p)!==v)return false;
    if(v==="waitc"&&!waitingClient().some(w=>w.p&&w.p.id===p.id))return false;
    if(v==="pay"&&!["PENDING","PARTIAL","OVERDUE"].includes(payStatus(p)))return false;
    if(v==="confirm"&&!((p.confirm||[]).length||g(p)==="unk"))return false;
    if(v==="closed"&&!["closed","lost"].includes(g(p)))return false;
    if(!["closed","all"].includes(v)&&["closed","lost"].includes(g(p)))return false;
    if(f.lc&&p.lifecycle!==f.lc)return false;
    if(f.type&&!(p.types||[]).includes(f.type))return false;
    if(f.pri&&p.priority!==f.pri)return false;
    if(f.pay&&payStatus(p)!==f.pay)return false;
    if(f.person&&!(p.lead===f.person||p.responsible===f.person||(p.team||[]).includes(f.person)||tasksOf(p.id).some(t=>t.assignee===f.person&&isOpenT(t))))return false;
    return true;
  });
  const so=UI.sortP;
  ps.sort((a,b)=>so==="priority"?((a.priority||"P9").localeCompare(b.priority||"P9")||a.id.localeCompare(b.id)):so==="name"?a.name.localeCompare(b.name):so==="deadline"?(nextDeadline(a)||"9").localeCompare(nextDeadline(b)||"9"):so==="updated"?(b.updatedAt||"").localeCompare(a.updatedAt||""):a.id.localeCompare(b.id));
  return ps;
}
function vProjects(){
  const ps=filterProjects();const f=UI.pfil;
  const opt=(arr,cur,lab)=>`<option value="">${lab}</option>`+arr.map(x=>`<option ${x===cur?"selected":""}>${esc(x)}</option>`).join("");
  const nf=Object.values(f).filter(Boolean).length;
  let h=header("Projects",`${ps.length} shown · ${projects().length} on record`,`<button class="btn pri" data-act="newProject">+ Project</button>`);
  h+=`<div class="chips">${PVIEWS.map(([k,l])=>`<button class="chip ${UI.pv===k?"on":""}" data-act="pv" data-v="${k}">${l}</button>`).join("")}</div>`;
  h+=`<div class="toolbar"><button class="btn sm" data-act="toggleFilters">${UI.showFilters?"Hide filters":"Filters"}${nf?` (${nf})`:""}</button><select id="sortP" class="cs">${[["priority","Sort: priority"],["deadline","Sort: next deadline"],["updated","Sort: recent activity"],["name","Sort: name"],["id","Sort: ID"]].map(([k,l])=>`<option value="${k}" ${UI.sortP===k?"selected":""}>${l}</option>`).join("")}</select>${nf?'<button class="btn ghost sm" data-act="clearFilters">Clear filters</button>':""}</div>`;
  if(UI.showFilters)h+=`<div class="toolbar"><select id="pf-lc">${opt(LIFECYCLE,f.lc,"Any stage")}</select><select id="pf-type">${opt(TYPES,f.type,"Any type")}</select><select id="pf-person">${opt(personNames(),f.person,"Anyone")}</select><select id="pf-pri">${opt(PRI,f.pri,"Any priority")}</select><select id="pf-pay">${opt(PAYSTAT,f.pay,"Any payment")}</select></div>`;
  if(!ps.length)return h+`<div class="sec"><div class="empty">No projects here.</div></div>`;
  return h+`<div class="cards">${ps.map(projectCard).join("")}</div>`;
}
function projectCard(p){
  const ts=tasksOf(p.id);const open=ts.filter(isOpenT).length,od=ts.filter(overdue).length,pr=progress(p),b=balance(p);
  return `<article class="card" tabindex="0" data-act="openP" data-id="${p.id}">
    <div style="display:flex;justify-content:space-between;gap:8px"><span class="id">${shown(p.id)}</span><span class="pri-dot ${(p.priority||"").toLowerCase()}">${p.priority||""}</span></div>
    <h4>${esc(p.name)}</h4>
    <div class="meta">${p.client?esc(p.client):'<span class="unk">Client unknown</span>'}${p.location?" · "+esc(p.location):""}</div>
    <div class="pills"><span class="pill acc">${esc(p.lifecycle)}</span>${condPills(p,2)}</div>
    <div class="next">${p.nextAction?esc(p.nextAction):'<span class="hint">No next action set — tap to add</span>'}</div>
    <div class="foot"><span>${open} open task${open===1?"":"s"}${od?` · <b class="p0">${od} late</b>`:""}</span><span class="num">${b!=null?(b>0?money(b)+" due":"Paid"):"Fee ?"}</span></div>
    ${pr!=null?`<div class="bar"><i style="width:${pr}%"></i></div>`:""}
  </article>`;
}

/* ---------------- TASKS ---------------- */
const TVIEWS=[["my","Mine"],["today","Due today"],["week","This week"],["overdue","Overdue"],["unassigned","No owner"],["waiting","Waiting"],["open","All open"],["done","Done"]];
function vTasks(){
  const td=today();const v=UI.tv;
  let ts=Object.values(S.tasks).filter(t=>{
    if(v==="my"&&!(t.assignee===me()&&isOpenT(t)))return false;
    if(v==="today"&&!(isOpenT(t)&&t.due&&t.due<=td))return false;
    if(v==="week"&&!(isOpenT(t)&&t.due&&t.due<=addDays(td,7)))return false;
    if(v==="overdue"&&!overdue(t))return false;
    if(v==="unassigned"&&!(isOpenT(t)&&!t.assignee))return false;
    if(v==="waiting"&&!(isOpenT(t)&&(t.status==="WAITING"||t.status==="BLOCKED"||t.clientDependency)))return false;
    if(v==="open"&&!isOpenT(t))return false;
    if(v==="done"&&isOpenT(t))return false;
    if(UI.tperson&&t.assignee!==UI.tperson)return false;
    if(UI.tproject&&t.projectId!==UI.tproject)return false;
    return true;
  }).sort((a,b)=>v==="done"?(b.completed||"").localeCompare(a.completed||""):taskScore(b)-taskScore(a));
  let h=header("Tasks",`${ts.length} shown · most urgent first`);
  h+=`<div class="chips">${TVIEWS.map(([k,l])=>`<button class="chip ${UI.tv===k?"on":""}" data-act="tv" data-v="${k}">${l}</button>`).join("")}</div>`;
  h+=`<div class="toolbar"><select id="tf-person" class="cs"><option value="">Everyone</option>${personNames().map(n=>`<option ${n===UI.tperson?"selected":""}>${esc(n)}</option>`).join("")}</select><select id="tf-project" class="cs"><option value="">All projects</option>${projects().sort((a,b)=>a.name.localeCompare(b.name)).map(p=>`<option value="${p.id}" ${p.id===UI.tproject?"selected":""}>${esc(p.name)}</option>`).join("")}</select></div>`;
  h+=`<section class="sec">${quickAdd()}${ts.length?ts.map(t=>taskRow(t)).join(""):`<div class="empty">${v==="my"?"Nothing assigned to you. Pick “No owner” to assign work.":"No tasks here."}</div>`}</section>`;
  return h;
}

/* ---------------- MONEY ---------------- */
function vMoney(){
  const ps=projects();const risk=moneyAtRisk();
  const withFee=ps.filter(p=>p.agreedFee);const tot=withFee.reduce((a,p)=>a+Number(p.agreedFee),0);const rec=withFee.reduce((a,p)=>a+(received(p)||0),0);
  const noFee=ps.filter(p=>!p.agreedFee&&isActive(p));
  let h=header("Money",`Agreed ${money(tot)} · received ${money(rec)} · balance ${money(tot-rec)}`,isAdmin()?`<button class="btn pri" data-act="newPayment">+ Payment received</button>`:"");
  if(noFee.length)h+=`<div class="banner">${noFee.length} active project${noFee.length>1?"s have":" has"} no agreed fee. Type the fee straight into the table below.</div>`;
  h+=`<div class="stack">`+sec("Money at risk",risk.length,risk.map(r=>`<div class="row clk" data-act="openP" data-id="${r.p.id}"><div class="grow"><div class="t">${esc(r.p.name)}</div><div class="s">${esc(r.lifecycle||r.p.lifecycle)} · ${esc(r.reason)}</div></div><span class="pill ${r.sev}">${r.amt!=null?money(r.amt):"Fee ?"}</span></div>`).join(""),"Nothing at risk.",true,true);
  const list=ps.filter(p=>!["lost"].includes(LC_GROUP[p.lifecycle])).sort((a,b)=>(isActive(b)-isActive(a))||((balance(b)||0)-(balance(a)||0)));
  h+=`<section class="sec"><h3>Fees by project — tap a number to edit</h3><div style="overflow-x:auto"><table><thead><tr><th>Project</th><th>Quoted ₹</th><th>Agreed ₹</th><th>Received before ₹</th><th>Balance</th><th>Next due</th><th>Status</th></tr></thead><tbody>${list.map(p=>{const st=payStatus(p);return `<tr><td style="min-width:170px"><span class="tproj" data-act="openP" data-id="${p.id}">${esc(p.name)}</span><div class="hint">${esc(p.lifecycle)}</div></td><td style="min-width:110px">${edA("projects",p.id,"quotedFee",p.quotedFee,{type:"number",cls:"num"})}</td><td style="min-width:110px">${edA("projects",p.id,"agreedFee",p.agreedFee,{type:"number",cls:"num"})}</td><td style="min-width:110px">${edA("projects",p.id,"openingReceived",p.openingReceived,{type:"number",cls:"num",ph:"—"})}</td><td class="num" style="padding-top:14px">${balance(p)!=null?money(balance(p)):"—"}</td><td style="min-width:130px">${edA("projects",p.id,"nextPaymentDue",p.nextPaymentDue,{type:"date"})}</td><td style="padding-top:14px"><span class="pill ${st==="OVERDUE"?"crit":st==="PAID"?"ok":st==="UNKNOWN"||st==="NOT APPLICABLE"?"":"warn"}">${st}</span></td></tr>`;}).join("")}</tbody></table></div></section>`;
  const pays=Object.values(S.payments).sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  h+=sec("Payments received",pays.length,pays.map(x=>`<div class="row"><span class="mono s" style="width:90px">${fmtDY(x.date)}</span><div class="grow"><div class="t">${esc(S.projects[x.projectId]?.name||x.projectId)}</div><div class="s">${esc(x.milestone||"")} ${esc(x.mode||"")}</div></div><b class="num">${money(x.amount)}</b>${isAdmin()?`<button class="btn ghost sm" data-act="delPayment" data-id="${x.id}" aria-label="Delete payment">✕</button>`:""}</div>`).join(""),"No payments logged yet.",pays.length>0);
  return h+"</div>";
}

/* ---------------- MORE ---------------- */
function vMore(){
  const items=[["follow","Follow-ups",`${waitingClient().length} client dependencies`],["meetings","Meetings & decisions",`${upcomingMeetings().length} upcoming`],["team","Team",`${personNames().length} people`],["weekly","Weekly review","Stuck, at risk, what to stop"],["report","Daily report","Copy today's control sheet"],["data","Data & settings","Backup, import, working hours"]];
  return header("More")+`<section class="sec morelist">${items.map(([k,l,s])=>`<div class="row clk" data-act="view" data-v="${k}">${ICON[k]}<div class="grow"><div class="t">${l}</div><div class="s">${s}</div></div><span class="hint">›</span></div>`).join("")}${adminRow()}</section><p class="hint" style="margin-top:14px"><i class="dot syncDot"></i><span class="syncTxt"></span> · signed in as ${esc(AUTH.user)}</p>`;
}

/* ---------------- FOLLOW-UPS ---------------- */
function vFollow(){
  const wc=waitingClient().sort((a,b)=>(a.since||"9").localeCompare(b.since||"9"));const td=today();
  const payQ=projects().filter(p=>["PENDING","PARTIAL","OVERDUE"].includes(payStatus(p)));
  let h=header("Follow-ups","Oldest first. Tap “Done” after each call.");
  h+=`<div class="stack">`+sec("Client dependencies",wc.length,wc.map(w=>`<div class="row"><div class="grow clk" data-act="openP" data-id="${w.p?.id||""}"><div class="t">${esc(w.p?.name||"")}</div><div class="s">${esc(w.what||"")}${w.p?.clientContact?" · "+esc(w.p.clientContact):""}</div></div>${w.since?`<span class="pill ${daysBetween(w.since.slice(0,10),td)>5?"crit":"info"}">${daysBetween(w.since.slice(0,10),td)}d</span>`:""}<button class="btn sm" data-act="${w.kind==="task"?"followed":"followedP"}" data-id="${w.kind==="task"?w.t.id:w.p.id}">Done</button></div>`).join(""),"No client dependencies.",true)
  +sec("Payment follow-ups",payQ.length,payQ.map(p=>`<div class="row clk" data-act="openP" data-id="${p.id}"><div class="grow"><div class="t">${esc(p.name)}</div><div class="s">${esc(p.paymentMilestone||"Milestone not set")}${p.nextPaymentDue?" · due "+fmtD(p.nextPaymentDue):""}</div></div><span class="pill ${payStatus(p)==="OVERDUE"?"crit":"warn"}">${money(balance(p))}</span></div>`).join(""),"No pending balances on projects with agreed fees.",true)+"</div>";
  return h;
}

/* ---------------- MEETINGS ---------------- */
function vMeetings(){
  const ms=Object.values(S.meetings).sort((a,b)=>(b.date+(b.time||"")).localeCompare(a.date+(a.time||"")));
  return header("Meetings & decisions","Each decision line becomes a task",`<button class="btn pri" data-act="newMeeting">+ Meeting</button>`)+`<section class="sec">${ms.length?ms.map(meetingRow).join(""):'<div class="empty">No meetings recorded yet.</div>'}</section>`;
}
function meetingRow(m){return `<div class="row clk" data-act="editMeeting" data-id="${m.id}"><span class="mono s" style="width:84px">${fmtD(m.date)}<br>${esc(m.time||"")}</span><div class="grow"><div class="t">${esc(S.projects[m.projectId]?.name||"General")} — ${esc(m.purpose||"Meeting")}</div>${(m.decisions||[]).length?`<div class="s">${m.decisions.map(d=>"✓ "+esc(d)).join("<br>")}</div>`:""}</div></div>`;}

/* ---------------- TEAM ---------------- */
function vTeam(){
  const ppl=Object.values(S.people).filter(p=>!p.archived);
  let h=header("Team","Tap a name or role to edit",`<button class="btn pri" data-act="newPerson">+ Member</button>`);
  h+=`<section class="sec" style="margin-bottom:14px"><h3>Workload · next 5 days</h3>${ppl.map(p=>{const ts=Object.values(S.tasks).filter(t=>isOpenT(t)&&t.assignee===p.name);const mins=ts.reduce((a,t)=>a+(Number(t.est)||60),0);const cap=(Number(p.capacity)||6)*300;const pct=Math.round(mins/cap*100);return `<div class="cap"><b>${esc(p.name)}</b><div class="bar"><i class="${pct>100?"over":""}" style="width:${Math.min(100,pct)}%"></i></div><span class="num ${pct>100?"p0":""}">${dur(mins)||"0m"} · ${pct}%</span></div>`;}).join("")||'<div class="empty">No team members yet.</div>'}</section>`;
  h+=`<div class="stack">${ppl.map(p=>{const ts=Object.values(S.tasks).filter(t=>isOpenT(t)&&t.assignee===p.name).sort((a,b)=>taskScore(b)-taskScore(a));
    return `<details class="sec" data-sec="team:${p.id}" ${isOpenSec("team:"+p.id)?"open":""}><summary>${esc(p.name)}<span class="cnt">${ts.length} open</span></summary><div class="fields"><label class="fld"><span>Name</span>${ed("people",p.id,"name",p.name)}</label><label class="fld"><span>Role</span>${ed("people",p.id,"role",p.role)}</label><label class="fld"><span>Focused hours / day</span>${ed("people",p.id,"capacity",p.capacity,{type:"number"})}</label><label class="fld"><span>Contact</span>${ed("people",p.id,"contact",p.contact,{ph:"—"})}</label></div>${ts.map(t=>taskRow(t)).join("")}${isAdmin()?`<div class="toolbar" style="padding:8px 16px;margin:0"><button class="btn ghost sm" data-act="removePerson" data-id="${p.id}">Remove from team</button></div>`:""}</details>`;}).join("")}</div>`;
  return h;
}

/* ---------------- WEEKLY ---------------- */
function vWeekly(){
  const ps=projects();const td=today();const wk=addDays(td,-7);
  const active=ps.filter(isActive);const stuck=blocked();const risk=moneyAtRisk();const od=Object.values(S.tasks).filter(overdue);
  const stale=active.filter(p=>!(p.history||[]).some(h=>h.d.slice(0,10)>=wk&&!/Imported/.test(h.t))&&!tasksOf(p.id).some(t=>(t.updatedAt||"").slice(0,10)>=wk));
  const props=ps.filter(p=>p.lifecycle==="PROPOSAL / QUOTATION").length,lost=ps.filter(p=>LC_GROUP[p.lifecycle]==="lost").length;
  const ol=ownerLoad();const outstanding=ps.reduce((a,p)=>a+Math.max(0,balance(p)||0),0);
  const open=ps.filter(p=>!["closed","lost"].includes(LC_GROUP[p.lifecycle]));
  const stop=[],delg=[],auto=[],attn=[];
  if(open.length>25)stop.push(`${open.length} projects are open. Close, park or drop the ones with no activity and no fee.`);
  if(props>6)stop.push(`${props} proposals have no decision. Give each a 14-day expiry, then chase or close.`);
  ps.filter(p=>LC_GROUP[p.lifecycle]==="unk").length&&stop.push(`${ps.filter(p=>LC_GROUP[p.lifecycle]==="unk").length} projects have no confirmed stage — confirm or close them.`);
  Object.values(S.tasks).filter(t=>isOpenT(t)&&t.assignee===owner()&&["DRAWING","ADMIN","SITE"].includes(t.category)).forEach(t=>delg.push(`${t.title} — ${recommend(t)}`));
  if(Object.values(S.tasks).filter(isOpenT).some(t=>/quotation|estimate|boq/i.test(t.title)))auto.push("Quotations and estimates recur — run them from one estimator template.");
  if(waitingClient().length>3)auto.push("Batch client follow-ups into one 30-minute block from the Follow-ups list.");
  risk.filter(r=>r.sev==="crit").forEach(r=>attn.push(`${r.p.name}: ${r.reason}.`));
  ps.filter(p=>LC_GROUP[p.lifecycle]==="exec").forEach(p=>attn.push(`${p.name} is on site — check payment and site issues personally.`));
  const kp=[["Active",active.length],["Stuck",stuck.length],["No activity 7d",stale.length],["Money at risk",risk.length],["Overdue",od.length],["Outstanding",money(outstanding)],["Proposals open",props],["Lost",lost],["Waiting on you",ol.projects.length]];
  const lst=(a,e)=>a.length?a.slice(0,10).map(x=>`<div class="row"><div class="grow">${esc(x)}</div></div>`).join(""):`<div class="empty">${e}</div>`;
  return header("Weekly review",`Week ending ${fmtDY(td)}`)+`<div class="kpis">${kp.map(([l,n])=>`<div class="kpi"><b>${n}</b><span>${l}</span></div>`).join("")}</div><div class="stack">
    ${sec("Stuck",stuck.length,stuck.map(b=>`<div class="row clk" data-act="openP" data-id="${b.p?.id||""}"><span class="pill crit">${esc(b.type)}</span><div class="grow"><div class="t">${esc(b.p?.name||"")}</div><div class="s">${esc(b.action)} · ${esc(b.who)}</div></div></div>`).join(""),"Nothing stuck.",stuck.length>0)}
    ${sec("No activity in 7 days",stale.length,stale.map(p=>`<div class="row clk" data-act="openP" data-id="${p.id}"><div class="grow"><div class="t">${esc(p.name)}</div><div class="s">${esc(p.lifecycle)}</div></div></div>`).join(""),"Every active project moved.")}
    <section class="sec"><h3>What should I stop doing?</h3>${lst(stop,"Nothing obvious.")}</section>
    <section class="sec"><h3>What should I delegate?</h3>${lst(delg,"No drawing, admin or site tasks on your list.")}</section>
    <section class="sec"><h3>What should I automate?</h3>${lst(auto,"No repeat pattern yet.")}</section>
    <section class="sec"><h3>What needs my personal attention?</h3>${lst(attn,"Nothing critical.")}</section></div>`;
}

/* ---------------- DAILY REPORT ---------------- */
function dailyReport(){
  const td=today();const plan=buildPlan(td);const top=topOutcomes();const tasks=Object.values(S.tasks);
  const od=tasks.filter(overdue);const crit=tasks.filter(t=>isOpenT(t)&&t.priority==="P0");
  const wc=waitingClient(),wt=waitingTeam(),risk=moneyAtRisk(),ol=ownerLoad();
  const payQ=projects().filter(p=>["PENDING","PARTIAL","OVERDUE"].includes(payStatus(p)));
  const site=projects().flatMap(p=>(p.siteIssues||[]).filter(x=>x.status!=="RESOLVED").map(x=>`${p.name}: ${x.text}`));
  const pn=t=>S.projects[t.projectId]?.name||"";const L=a=>a.length?a.join("\n"):"—";const lp=S.plans[planKey()];
  let r=`# WOODLAND DAILY CONTROL\n\nDATE: ${fmtDY(td)}\n\n## 🔥 TOP 3 OUTCOMES\n\n`;
  [0,1,2].forEach(i=>{r+=`${i+1}. ${top[i]?top[i].title+" — "+pn(top[i]):""}\n`;});
  r+=`\n## 🚨 CRITICAL\n\n${L(crit.map(t=>`• ${t.title} — ${pn(t)} (${t.assignee||"UNASSIGNED"})`))}\n`;
  r+=`\n## ⏰ TODAY'S TIME BLOCK\n\n${plan.blocks.map(b=>`${hm(b.s)}–${hm(b.e)}  ${b.label}${b.t?" — "+pn(b.t):""}`).join("\n")}\n`;
  if(plan.demand>plan.capacity)r+=`\n⚠ Over capacity by ${dur(plan.demand-plan.capacity)}. Not scheduled:\n${plan.left.map(t=>`• ${t.title} → ${recommend(t)}`).join("\n")}\n`;
  r+=`\n## 🔴 OVERDUE\n\n${L(od.map(t=>`• ${t.title} — ${pn(t)} — ${daysBetween(t.due,td)}d late (${t.assignee||"UNASSIGNED"})`))}\n`;
  r+=`\n## ⏳ WAITING FOR OTHERS\n\n${L(wt.map(t=>`• ${t.assignee}: ${t.title} — ${pn(t)}`))}\n`;
  r+=`\n## 📞 CLIENT FOLLOW-UP\n\n${L(wc.map(w=>`• ${w.p?.name||""}${w.p?.client?" ("+w.p.client+")":""}: ${w.what||""}`))}\n`;
  r+=`\n## 💰 PAYMENT FOLLOW-UP\n\n${L(payQ.map(p=>`• ${p.name}: ${money(balance(p))} ${payStatus(p)}`).concat(risk.filter(x=>x.p.agreedFee==null||x.p.agreedFee==="").map(x=>`• ${x.p.name}: no agreed fee — confirm fee`)))}\n`;
  r+=`\n## 👥 TEAM DELEGATION\n\n${L(tasks.filter(t=>isOpenT(t)&&(!t.assignee||(t.assignee===owner()&&["DRAWING","SITE","ADMIN"].includes(t.category)))).map(t=>`• ${t.title} — ${pn(t)} → ${t.assignee?recommend(t):"ASSIGN AN OWNER"}`))}\n`;
  r+=`\n## 🏗️ SITE ISSUES\n\n${L(site.map(s=>"• "+s))}\n`;
  r+=`\n## ⚠️ PROJECTS AT RISK\n\n${L(risk.map(x=>`• ${x.p.name}: ${x.reason}`))}\n`;
  r+=`\n## 🧠 OWNER BOTTLENECK\n\n${ol.projects.length>=5?`${me()===owner()?"YOU are":owner()+" is"} currently the bottleneck — ${ol.projects.length} projects wait on ${owner()}.`:`${ol.projects.length} projects wait on ${owner()}.`}${ol.unassigned.length?` ${ol.unassigned.length} tasks have no owner.`:""}\n`;
  const planned=lp?lp.taskIds.map(id=>S.tasks[id]).filter(Boolean):plan.placed.map(b=>b.t);
  r+=`\n## 🌙 END-OF-DAY CHECK\n\nCompleted: ${planned.filter(t=>t.status==="COMPLETED").map(t=>t.title).join("; ")||"—"}\nNot completed: ${planned.filter(isOpenT).map(t=>t.title).join("; ")||"—"}\nCarry forward: \nNew tasks: ${tasks.filter(t=>t.created===td).map(t=>t.title).join("; ")||"—"}\nDecisions needed: ${wc.length?wc.length+" client dependencies open":"—"}\n`;
  return r;
}
function vReport(){
  const td=today();const lp=S.plans[planKey()];const planned=lp?lp.taskIds.map(id=>S.tasks[id]).filter(Boolean):[];
  return header("Daily report","Your daily-control format, from live data",`<button class="btn pri" data-act="copyReport">Copy</button>`)+`<div class="stack">
  <section class="sec"><h3>End-of-day review<span class="cnt">${lp?"plan locked":"no plan locked"}</span></h3>${lp?(planned.map(t=>`<div class="row"><div class="grow"><div class="t" style="${isOpenT(t)?"":"text-decoration:line-through;color:var(--faint)"}">${esc(t.title)}</div><div class="s">${esc(S.projects[t.projectId]?.name||"")}</div></div>${isOpenT(t)?`<div class="toolbar" style="margin:0"><button class="btn sm" data-act="eod" data-o="done" data-id="${t.id}">Done</button><button class="btn sm" data-act="eod" data-o="carry" data-id="${t.id}">Tomorrow</button><button class="btn sm dang" data-act="eod" data-o="drop" data-id="${t.id}">Drop</button></div>`:""}</div>`).join("")||'<div class="empty">The locked plan had no tasks.</div>'):'<div class="empty">Lock today’s plan on the Today screen. At day end each planned task gets a decision here — done, tomorrow or drop. Nothing carries forward by default.</div>'}</section>
  <div class="report" id="reportTxt">${esc(dailyReport())}</div></div>`;
}

/* ---------------- DATA ---------------- */
function vData(){
  const st=S.settings;const n=k=>Object.keys(S[k]).length;
  const arch=projects(true).filter(p=>p.archived);
  return header("Data & settings",`${n("projects")} projects · ${n("tasks")} tasks · ${n("payments")} payments`)+`<div class="stack">
  <section class="sec"><h3>Working day — used for today's plan</h3><div class="fields">
    <label class="fld"><span>Owner (the bottleneck banner follows this person)</span><input class="ed" id="s-owner" value="${esc(st.owner)}" data-set="owner"></label>
    <label class="fld"><span>Gap between tasks (min)</span><input class="ed" type="number" id="s-buffer" value="${esc(st.buffer)}" data-set="buffer"></label>
    <label class="fld"><span>Day starts</span><input class="ed" type="time" id="s-start" value="${esc(st.dayStart)}" data-set="dayStart"></label>
    <label class="fld"><span>Day ends</span><input class="ed" type="time" id="s-end" value="${esc(st.dayEnd)}" data-set="dayEnd"></label>
    <label class="fld full"><span>Protected time — one per line, like “13:00-14:00 Lunch + Dhuhr”</span><textarea class="ed" id="s-fixed" rows="4" data-set="fixed">${esc(st.fixed)}</textarea></label>
  </div></section>
  <section class="sec"><h3>This device</h3><div class="body stack">
    <div class="toolbar" style="margin:0"><span>Signed in as <b>${esc(AUTH.user)}</b></span><button class="btn sm" data-act="changeUser">Not you? Change name</button></div>
    <div class="toolbar" style="margin:0"><span>${isAdmin()?"Admin is unlocked on this device.":"Admin is locked on this device."}</span>${isAdmin()?'<button class="btn sm" data-act="adminLock">Lock admin</button>':'<button class="btn sm" data-act="adminUnlock">Unlock admin</button>'}</div>
  </div></section>
  <section class="sec"><h3>Backup</h3><div class="body stack">
    <div class="toolbar" style="margin:0"><button class="btn pri" data-act="exportJSON">Download full backup</button><button class="btn" data-act="exportCSV">Projects CSV</button><button class="btn" data-act="exportTasksCSV">Tasks CSV</button></div>
    ${isAdmin()?`<label class="hint" style="display:flex;flex-direction:column;gap:6px">Restore from a backup file — matching records are updated, nothing is deleted<input type="file" id="importFile" accept=".json,application/json"></label>`:'<div class="hint">Restoring a backup needs the admin PIN.</div>'}
  </div></section>
  ${isAdmin()?`<section class="sec"><h3>Move data in</h3><div class="body stack">
    <div><button class="btn pri" data-act="legacyUpload">Upload data from this device</button><div class="hint" style="margin-top:6px">Reads the old single-device data kept by the previous Project OS file in this browser and sends it to the shared sheet. You will see the counts first.</div></div>
    <label class="hint" style="display:flex;flex-direction:column;gap:6px">Import starter projects — choose your starter-projects.json file (one time, only when the shared sheet is empty)<input type="file" id="starterFile" accept=".json,application/json"></label>
  </div></section>`:""}
  ${arch.length?`<section class="sec"><h3>Archived projects</h3>${arch.map(p=>`<div class="row"><div class="grow">${esc(p.name)}</div>${isAdmin()?`<button class="btn sm" data-act="unarchive" data-id="${p.id}">Restore</button><button class="btn sm dang" data-act="deleteP" data-id="${p.id}">Delete</button>`:""}</div>`).join("")}</section>`:""}
  </div>`;
}

/* ---------------- PROJECT SHEET (all fields edit in place) ---------------- */
function renderSheet(){
  const p=S.projects[UI.open];const L=document.getElementById("layer");
  if(!p){L.querySelector(".sheet-wrap")?.remove();UI.open=null;return;}
  const ts=tasksOf(p.id).sort((a,b)=>(isOpenT(b)-isOpenT(a))||taskScore(b)-taskScore(a));const openTs=ts.filter(isOpenT),doneTs=ts.filter(t=>!isOpenT(t));
  const mts=Object.values(S.meetings).filter(m=>m.projectId===p.id).sort((a,b)=>b.date.localeCompare(a.date));
  const pays=Object.values(S.payments).filter(x=>x.projectId===p.id).sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  const cf=p.confirm||[];
  const F=(k,label,ctrl,full)=>`<label class="fld ${full?"full":""}"><span>${label}</span>${ctrl}${cf.includes(k)?`<span class="ncf" data-act="clearConfirm" data-id="${p.id}" data-k="${k}" title="Tap when confirmed">NEEDS CONFIRMATION · tap when confirmed</span>`:""}</label>`;
  const b=p.blocker||{};const ppl=peopleOpts();
  const prevSheet=L.querySelector(".sheet");const sx=prevSheet?prevSheet.scrollTop:0;
  const html=`<div class="sheet-wrap" data-act="closeSheet"><div class="sheet" data-stop="1">
    <div class="sheet-top"><span class="mono hint">${shown(p.id)}${p.archived?" · archived":""}</span><button class="btn sm" data-act="closeSheet">Done</button></div>
    ${ed("projects",p.id,"name",p.name,{cls:"pname",ph:"Project name"})}
    <div class="toolbar" style="margin:8px 0 14px;padding-left:6px">${ed("projects",p.id,"lifecycle",p.lifecycle,{type:"select",options:LIFECYCLE,cls:"lcsel",blank:false})}${chipSel("projects",p.id,"priority",p.priority,PRI.map(x=>[x,PRI_LABEL[x]]),"Priority",(p.priority||"").toLowerCase())}</div>
    <div class="stack">
    <section class="sec"><h3>Next action</h3><div class="fields">
      ${F("nextAction","What happens next",ed("projects",p.id,"nextAction",p.nextAction,{ph:"Not set — type the next step"}),1)}
      ${F("nextActionOwner","Who",ed("projects",p.id,"nextActionOwner",p.nextActionOwner,{type:"select",options:[...ppl,"Client"]}))}
      ${F("nextActionDeadline","By when",ed("projects",p.id,"nextActionDeadline",p.nextActionDeadline,{type:"date"}))}
    </div></section>
    <section class="sec"><h3>Status — tap to switch on/off</h3><div class="body stack">
      <div class="togs">${CONDITIONS.map(c=>`<button class="tog ${(p.conditions||[]).includes(c)?"on":""} ${/SITE|WARRANTY/.test(c)?"crit":""}" data-act="togArr" data-id="${p.id}" data-k="conditions" data-v="${esc(c)}">${esc(c.charAt(0)+c.slice(1).toLowerCase())}</button>`).join("")}</div>
      <div class="fields" style="padding:0">
        ${F("blocker.type","Blocked by",ed("projects",p.id,"blocker.type",b.type,{type:"select",options:BLOCKERS,blankLabel:"Not blocked"}))}
        ${b.type?F("blocker.who","Who must act",ed("projects",p.id,"blocker.who",b.who,{ph:"—"}))+F("blocker.action","To unblock",ed("projects",p.id,"blocker.action",b.action,{ph:"—"}),1):""}
      </div>
      ${b.type&&b.since?`<div class="hint">Blocked ${daysBetween(b.since,today())} days</div>`:""}
    </div></section>
    <section class="sec"><h3>Tasks<span class="cnt">${openTs.length} open</span></h3>${quickAdd(p.id)}${openTs.map(t=>taskRow(t,{noProject:1})).join("")||'<div class="empty">No open tasks.</div>'}
      ${doneTs.length?`<details data-sec="sheet:done" ${isOpenSec("sheet:done")?"open":""}><summary class="hint" style="padding:10px 16px;cursor:pointer">${doneTs.length} completed</summary>${doneTs.map(t=>taskRow(t,{noProject:1})).join("")}</details>`:""}</section>
    <section class="sec"><h3>Details</h3><div class="fields">
      ${F("client","Client",ed("projects",p.id,"client",p.client))}
      ${F("clientContact","Client phone / email",ed("projects",p.id,"clientContact",p.clientContact))}
      ${F("location","Location",ed("projects",p.id,"location",p.location),1)}
      ${F("scope","Scope",ed("projects",p.id,"scope",p.scope,{type:"textarea"}),1)}
      ${F("area","Area",ed("projects",p.id,"area",p.area))}
      ${F("leadSource","Lead source",ed("projects",p.id,"leadSource",p.leadSource))}
      ${F("lead","Project lead",ed("projects",p.id,"lead",p.lead,{type:"select",options:ppl}))}
      ${F("responsible","Responsible now",ed("projects",p.id,"responsible",p.responsible,{type:"select",options:ppl}))}
      ${F("enquiryDate","Enquiry date",ed("projects",p.id,"enquiryDate",p.enquiryDate,{type:"date"}))}
      ${F("startDate","Start date",ed("projects",p.id,"startDate",p.startDate,{type:"date"}))}
      ${F("targetDate","Target completion",ed("projects",p.id,"targetDate",p.targetDate,{type:"date"}))}
      <div class="fld full"><span>Type</span><div class="togs" style="padding:4px 7px">${TYPES.map(x=>`<button class="tog ${(p.types||[]).includes(x)?"on":""}" data-act="togArr" data-id="${p.id}" data-k="types" data-v="${x}">${x}</button>`).join("")}</div>${(p.types||[]).length?"":'<span class="unk" style="padding-left:7px">UNKNOWN — CONFIRM</span>'}</div>
      <div class="fld full"><span>Team</span><div class="togs" style="padding:4px 7px">${ppl.map(x=>`<button class="tog ${(p.team||[]).includes(x)?"on":""}" data-act="togArr" data-id="${p.id}" data-k="team" data-v="${esc(x)}">${esc(x)}</button>`).join("")}</div></div>
    </div></section>
    <section class="sec"><h3>Money</h3>
      <div class="money3"><div><span>Quoted ₹</span>${edA("projects",p.id,"quotedFee",p.quotedFee,{type:"number",cls:"num"})}</div><div><span>Agreed ₹</span>${edA("projects",p.id,"agreedFee",p.agreedFee,{type:"number",cls:"num"})}</div><div><span>Received</span><b>${money(received(p))||'<span class="unk">?</span>'}</b></div><div><span>Balance</span><b>${balance(p)!=null?money(balance(p)):'<span class="unk">?</span>'}</b></div></div>
      <div class="fields">
        ${F("openingReceived","Received before this app ₹",edA("projects",p.id,"openingReceived",p.openingReceived,{type:"number",ph:"—"}))}
        ${F("paymentMilestone","Current milestone",edA("projects",p.id,"paymentMilestone",p.paymentMilestone,{ph:"—"}))}
        ${F("nextPaymentDue","Next payment due",edA("projects",p.id,"nextPaymentDue",p.nextPaymentDue,{type:"date"}))}
        <div class="fld"><span>Status</span><div style="padding:6px 7px"><span class="pill ${payStatus(p)==="OVERDUE"?"crit":payStatus(p)==="PAID"?"ok":"warn"}">${payStatus(p)}</span></div></div>
      </div>
      ${pays.map(x=>`<div class="row"><span class="mono s" style="width:90px">${fmtDY(x.date)}</span><div class="grow">${esc(x.milestone||"Payment")}</div><b class="num">${money(x.amount)}</b>${isAdmin()?`<button class="btn ghost sm" data-act="delPayment" data-id="${x.id}" aria-label="Delete payment">✕</button>`:""}</div>`).join("")}
      ${isAdmin()?`<div class="toolbar" style="padding:10px 16px;margin:0"><button class="btn sm" data-act="newPayment" data-pid="${p.id}">+ Payment received</button></div>`:""}</section>
    <section class="sec"><h3>Meetings<span class="cnt">${mts.length}</span></h3>${mts.map(meetingRow).join("")}<div class="toolbar" style="padding:10px 16px;margin:0"><button class="btn sm" data-act="newMeeting" data-pid="${p.id}">+ Meeting</button></div></section>
    <section class="sec"><h3>Site issues</h3>${(p.siteIssues||[]).map((x,i)=>`<div class="row"><span class="pill ${x.status==="RESOLVED"?"ok":"crit"}">${x.status==="RESOLVED"?"Resolved":"Open"}</span><div class="grow"><div>${esc(x.text)}</div><div class="hint">${fmtDY(x.d)}</div></div>${x.status!=="RESOLVED"?`<button class="btn sm" data-act="resolveIssue" data-id="${p.id}" data-i="${i}">Resolve</button>`:""}</div>`).join("")}<form class="quick" data-issue="${p.id}"><input type="text" id="si-${p.id}" placeholder="Log a site issue and press Enter" autocomplete="off"><button class="btn">Log</button></form></section>
    <section class="sec"><h3>Notes & files</h3><div class="fields">
      ${F("notes","Notes",ed("projects",p.id,"notes",p.notes,{type:"textarea",rows:4,ph:"No notes"}),1)}
      ${F("folder","Project folder",ed("projects",p.id,"folder",p.folder,{ph:"—"}),1)}
      ${F("links","Links (one per line)",ed("projects",p.id,"links",p.links,{type:"textarea",ph:"—"}),1)}
    </div>${(p.links||"").split("\n").filter(l=>/^https?:\/\//.test(l.trim())).map(l=>`<div style="padding:0 16px 8px"><a href="${esc(l.trim())}" target="_blank" rel="noopener">Open ${esc(l.trim().replace(/^https?:\/\//,"").slice(0,40))}</a></div>`).join("")}</section>
    <details class="sec" data-sec="sheet:confirm" ${isOpenSec("sheet:confirm")?"open":""}><summary>Needs confirmation<span class="cnt">${cf.length}</span></summary><div class="body"><div class="togs">${Object.entries(CONFIRMABLE).map(([k,l])=>`<button class="tog ${cf.includes(k)?"on":""}" data-act="togArr" data-id="${p.id}" data-k="confirm" data-v="${k}">${l}</button>`).join("")}</div><p class="hint" style="margin:10px 0 0">Highlighted fields show a “needs confirmation” flag until you tap them off.</p></div></details>
    <details class="sec" data-sec="sheet:hist" ${isOpenSec("sheet:hist")?"open":""}><summary>History<span class="cnt">${(p.history||[]).length}</span></summary><form class="quick" data-note="${p.id}"><input type="text" id="nt-${p.id}" placeholder="Add a note to history and press Enter" autocomplete="off"><button class="btn">Add</button></form><div class="hist">${(p.history||[]).map(x=>`<div class="row"><span class="d">${fmtD(x.d)}</span><div class="grow">${esc(x.t)}${x.by?` <span class="hint">· ${esc(x.by)}</span>`:""}</div></div>`).join("")}</div></details>
    ${isAdmin()?`<div class="toolbar">${p.archived?`<button class="btn" data-act="unarchive" data-id="${p.id}">Restore project</button>`:`<button class="btn ghost" data-act="archiveP" data-id="${p.id}">Archive project</button>`}</div>`:""}
    </div></div></div>`;
  const tmp=document.createElement("div");tmp.innerHTML=html;
  const old=L.querySelector(".sheet-wrap");if(old)old.replaceWith(tmp.firstElementChild);else L.prepend(tmp.firstElementChild);
  const sh=L.querySelector(".sheet");if(sh)sh.scrollTop=sx;
}
function closeSheet(){UI.open=null;document.getElementById("layer").querySelector(".sheet-wrap")?.remove();}

/* =========================================================
   WRITES
   ========================================================= */
const FIELD_LABEL={name:"Name",client:"Client",location:"Location",scope:"Scope",area:"Area",lifecycle:"Lifecycle",priority:"Priority",nextAction:"Next action",nextActionOwner:"Next action owner",nextActionDeadline:"Next action deadline",responsible:"Responsible",lead:"Project lead",quotedFee:"Quoted fee",agreedFee:"Agreed fee",openingReceived:"Received before app",nextPaymentDue:"Next payment due",paymentMilestone:"Payment milestone",targetDate:"Target completion",startDate:"Start date","blocker.type":"Blocked by",notes:"Notes"};
function setProject(id,k,v){
  const p=clone(S.projects[id]);if(!p)return;const old=getPath(p,k);
  if(String(old??"")===String(v??""))return;
  if(k==="lifecycle"&&v==="CLOSED"&&!closeOk(p)){render(true);return;}
  if(k==="name"&&!v){toast("A project needs a name");render(true);return;}
  setPath(p,k,v);
  if(k==="blocker.type"){if(v){p.blocker.since=p.blocker.since||today();}else p.blocker=null;}
  const fmt=x=>/fee|received/i.test(FIELD_LABEL[k]||"")?(money(x)||"cleared"):/Date|Deadline|Due|deadline|due/.test(k)?(x?fmtDY(x):"cleared"):(x||"cleared");
  if(k==="lifecycle")log(p,`Lifecycle ${old} → ${v}`);
  else if(k==="notes")log(p,"Notes edited");
  else if(FIELD_LABEL[k])log(p,`${FIELD_LABEL[k]}: ${fmt(v)}`);
  if(p.confirm&&p.confirm.includes(k)&&v!=null&&v!==""&&k!=="lifecycle"){/* keep flag until user taps it off */}
  put("projects",id,p);
}
function setTask(id,k,v){
  const t=clone(S.tasks[id]);if(!t)return;if(String(t[k]??"")===String(v??""))return;
  if(k==="title"&&!v){toast("A task needs a title");render(true);return;}
  if(k==="est")v=v?Number(v):null;
  t[k]=v;
  if(k==="status"){t.completed=v==="COMPLETED"?today():null;t.completedBy=v==="COMPLETED"?me():null;if((v==="WAITING"||v==="BLOCKED")&&!t.waitingSince)t.waitingSince=today();}
  put("tasks",id,t);
  const p=S.projects[t.projectId];
  if(p&&["assignee","due","status","priority"].includes(k)){const pp=clone(p);const lab={assignee:"assigned to "+(v||"nobody"),due:"due "+(v?fmtD(v):"cleared"),priority:"priority "+v,status:String(v).toLowerCase()}[k];log(pp,`${t.title} — ${lab}`);put("projects",pp.id,pp);}
}
function addTask(pid,title,assignee){
  const id=nextId("tasks","T-",4);
  put("tasks",id,{id,projectId:pid,title,assignee:assignee||null,priority:"P2",status:"NOT STARTED",category:"DESIGN",created:today(),due:null,est:null,clientDependency:false});
  const pp=clone(S.projects[pid]);log(pp,`Task added: ${title}${assignee?" → "+assignee:""}`);put("projects",pid,pp);
}
function closeOk(p){
  const open=tasksOf(p.id).filter(isOpenT).length;const obl=(p.conditions||[]).filter(c=>OBLIGATIONS.includes(c));const b=balance(p);
  const issues=[];if(open)issues.push(open+" open tasks");if(obl.length)issues.push(obl.join(", ").toLowerCase());if(b>0)issues.push(money(b)+" unpaid");
  if(issues.length){toast("Can't close yet: "+issues.join(" · ")+". Completed ≠ closed.");return false;}
  return true;
}

/* =========================================================
   MODALS (only for creating things and rare details)
   ========================================================= */
let MODAL=null;
function openModal(title,fields,onSubmit,submitLabel,extra){
  MODAL={fields,onSubmit,extra};
  const f=fields.map(x=>{
    const id="m-"+x.k;const cls=x.full?"full":"";const v=x.value==null?"":x.value;
    if(x.type==="select")return `<label class="${cls}">${x.label}<select id="${id}">${x.options.map(o=>{const [ov,ol]=Array.isArray(o)?o:[o,o];return `<option value="${esc(ov)}" ${String(ov)===String(v)?"selected":""}>${esc(ol)}</option>`;}).join("")}</select></label>`;
    if(x.type==="textarea")return `<label class="${cls||"full"}">${x.label}<textarea id="${id}" rows="${x.rows||3}" placeholder="${esc(x.ph||"")}">${esc(v)}</textarea></label>`;
    if(x.type==="bool")return `<label class="chk ${cls}"><input type="checkbox" id="${id}" ${v?"checked":""}> ${x.label}</label>`;
    return `<label class="${cls}">${x.label}<input type="${x.type||"text"}" id="${id}" value="${esc(v)}" placeholder="${esc(x.ph||"")}" ${x.type==="number"?'inputmode="decimal" step="any"':""} autocomplete="off"></label>`;
  }).join("");
  document.getElementById("layer").insertAdjacentHTML("beforeend",`<div class="modal-wrap" id="modalWrap"><form class="modal" id="modalForm"><h3>${esc(title)}</h3><div class="form">${f}</div><div class="foot">${extra?`<button type="button" class="btn dang" data-act="modalExtra" style="margin-right:auto">${extra.label}</button>`:""}<button type="button" class="btn" data-act="closeModal">Cancel</button><button class="btn pri">${submitLabel||"Save"}</button></div></form></div>`);
  setTimeout(()=>{const first=document.querySelector("#modalForm input,#modalForm select,#modalForm textarea");first&&first.focus();},30);
}
function readModal(){const o={};MODAL.fields.forEach(x=>{const el=document.getElementById("m-"+x.k);if(x.type==="bool")o[x.k]=el.checked;else{let v=el.value.trim();if(x.type==="number")v=v===""?null:Number(v);o[x.k]=v===""?null:v;}});return o;}
function closeModal(){document.getElementById("modalWrap")?.remove();MODAL=null;}
function confirmBox(msg,label,fn){
  document.getElementById("layer").insertAdjacentHTML("beforeend",`<div class="modal-wrap" id="confirmWrap"><div class="modal" style="max-width:420px"><h3>Are you sure?</h3><p style="margin:0">${esc(msg)}</p><div class="foot"><button class="btn" id="cfNo">Cancel</button><button class="btn pri" id="cfYes">${esc(label||"Confirm")}</button></div></div></div>`);
  document.getElementById("cfNo").onclick=()=>document.getElementById("confirmWrap").remove();
  document.getElementById("cfYes").onclick=()=>{document.getElementById("confirmWrap").remove();fn();};
}
function newProject(){
  openModal("New project",[
    {k:"name",label:"Project name",full:1,ph:"e.g. Mr. X Residence, Kottara"},
    {k:"client",label:"Client"},{k:"location",label:"Location"},
    {k:"lifecycle",label:"Stage",type:"select",options:LIFECYCLE,value:"ENQUIRY"},{k:"priority",label:"Priority",type:"select",options:PRI.map(x=>[x,PRI_LABEL[x]]),value:"P2"}
  ],v=>{
    if(!v.name){toast("Give the project a name");return false;}
    const id=nextId("projects","WA-",3);
    const o={id,name:v.name,client:v.client,location:v.location,lifecycle:v.lifecycle,priority:v.priority,types:[],conditions:[],confirm:[],team:[],enquiryDate:today(),created:today(),siteIssues:[]};
    log(o,"Project created · "+o.lifecycle);put("projects",id,o);UI.open=id;renderSheet();
  },"Create & open");
}
function taskDetails(t){
  openModal("Task details",[
    {k:"title",label:"Task",value:t.title,full:1},
    {k:"projectId",label:"Project",type:"select",options:projects().map(p=>[p.id,p.name]),value:t.projectId,full:1},
    {k:"desc",label:"Description",type:"textarea",value:t.desc,rows:2},
    {k:"category",label:"Kind of work",type:"select",options:CATS.map(c=>[c,c.charAt(0)+c.slice(1).toLowerCase()]),value:t.category||"DESIGN"},
    {k:"est",label:"Time needed (minutes)",type:"number",value:t.est},
    {k:"dependency",label:"Waits for (task or event)",value:t.dependency},
    {k:"startAfter",label:"Don't plan before",type:"date",value:t.startAfter},
    {k:"clientDependency",label:"Needs something from the client",type:"bool",value:t.clientDependency,full:1},
    {k:"notes",label:"Notes",type:"textarea",value:t.notes,rows:2}
  ],v=>{
    if(!v.title){toast("A task needs a title");return false;}
    const o={...clone(S.tasks[t.id]),...v};if(v.clientDependency&&!o.waitingSince)o.waitingSince=today();
    put("tasks",t.id,o);
  },"Save",!isAdmin()?null:{label:"Delete",fn:()=>confirmBox(`Delete “${t.title}”? To keep a record, set its status to Cancelled instead.`,"Delete",()=>{remove("tasks",t.id);closeModal();})});
}
function meetingForm(m,pid){
  const isNew=!m;m=m||{date:today(),projectId:pid||UI.open||"",decisions:[]};
  openModal(isNew?"New meeting":"Edit meeting",[
    {k:"projectId",label:"Project",type:"select",options:[["","General"],...projects().map(p=>[p.id,p.name])],value:m.projectId,full:1},
    {k:"date",label:"Date",type:"date",value:m.date},{k:"time",label:"Time",type:"time",value:m.time},
    {k:"purpose",label:"Purpose",value:m.purpose,full:1},
    {k:"participants",label:"Who attended",value:m.participants,full:1},
    {k:"decisions",label:"Decisions — one per line"+(isNew?" (each becomes a task)":""),type:"textarea",value:(m.decisions||[]).join("\n"),rows:4},
    ...(isNew?[{k:"dAssignee",label:"Assign decision tasks to",type:"select",options:[["","Unassigned"],...personNames()],value:me()},{k:"dDue",label:"Due",type:"date",value:addDays(today(),3)}]:[]),
    {k:"requests",label:"Client requests",type:"textarea",value:m.requests,rows:2},
    {k:"payment",label:"Payment discussed",value:m.payment,full:1},
    {k:"duration",label:"Duration (min)",type:"number",value:m.duration||60},{k:"nextMeeting",label:"Next meeting",type:"date",value:m.nextMeeting}
  ],async v=>{
    const id=isNew?nextId("meetings","M-",4):m.id;const decs=(v.decisions||"").split("\n").map(x=>x.trim()).filter(Boolean);
    const o={...(S.meetings[id]||{}),...v,id,decisions:decs};delete o.dAssignee;delete o.dDue;
    await put("meetings",id,o);
    if(isNew&&decs.length&&v.projectId){for(const d of decs){const tid=tempId();await put("tasks",tid,{id:tid,projectId:v.projectId,title:d,assignee:v.dAssignee||null,due:v.dDue||null,priority:"P1",status:"NOT STARTED",category:"DESIGN",created:today(),notes:"From meeting "+fmtDY(v.date)});}}
    if(v.projectId&&S.projects[v.projectId]){const pp=clone(S.projects[v.projectId]);log(pp,`Meeting: ${v.purpose||"meeting"}${decs.length&&isNew?` · ${decs.length} decision${decs.length>1?"s":""} → tasks`:""}`);if(v.nextMeeting)pp.nextMeeting=v.nextMeeting;put("projects",pp.id,pp);}
  },isNew?"Save meeting":"Save",isNew||!isAdmin()?null:{label:"Delete",fn:()=>confirmBox("Delete this meeting record?","Delete",()=>{remove("meetings",m.id);closeModal();})});
}
function paymentForm(pid){
  openModal("Payment received",[
    {k:"projectId",label:"Project",type:"select",options:[["","Choose…"],...projects().map(p=>[p.id,p.name])],value:pid||UI.open||"",full:1},
    {k:"amount",label:"Amount ₹",type:"number"},{k:"date",label:"Date",type:"date",value:today()},
    {k:"milestone",label:"For which stage"},{k:"mode",label:"Mode",type:"select",options:["","Bank transfer","UPI","Cheque","Cash"]}
  ],v=>{
    if(!v.projectId||!v.amount){toast("Choose a project and enter the amount");return false;}
    const id=nextId("payments","PAY-",4);put("payments",id,{...v,id});
    const pp=clone(S.projects[v.projectId]);log(pp,`Payment received ${money(v.amount)}${v.milestone?" · "+v.milestone:""}`);put("projects",pp.id,pp);
  },"Record");
}

/* =========================================================
   AI COMMANDS
   ========================================================= */
function describeAction(a){
  const f=a.fields||{};
  switch(a.op){
    case "create_project":return `Create project “${f.name}”${f.client?" for "+f.client:""}${f.location?" in "+f.location:""} · ${f.lifecycle||"ENQUIRY"}`;
    case "update_project":return `${S.projects[a.id]?.name||a.id}: `+Object.entries(f).map(([k,v])=>`${k} → ${Array.isArray(v)?v.join(", "):v}`).join("; ");
    case "create_task":return `New task “${f.title}” on ${S.projects[f.projectId]?.name||f.projectId} → ${f.assignee||"unassigned"}${f.due?", due "+fmtD(f.due):""}`;
    case "update_task":return `${S.tasks[a.id]?.title||a.id}: `+Object.entries(f).map(([k,v])=>`${k} → ${v}`).join("; ");
    case "add_note":return `Note on ${S.projects[a.projectId]?.name||a.projectId}: ${a.text}`;
    case "add_payment":return `Payment ${money(f.amount)} on ${S.projects[f.projectId]?.name||f.projectId}`;
    case "add_site_issue":return `Site issue on ${S.projects[a.projectId]?.name||a.projectId}: ${a.text}`;
    default:return JSON.stringify(a);
  }
}
async function runCommand(q){
  if(!CAP.sample||!q)return;
  UI.cmdOut={busy:true};render(true);
  const td=today();
  const data={today:td,weekday:new Date().toLocaleDateString("en-GB",{weekday:"long"}),owner:owner(),people:personNames(),settings:{dayStart:S.settings.dayStart,dayEnd:S.settings.dayEnd,fixed:S.settings.fixed},
    lifecycleStages:LIFECYCLE,conditions:CONDITIONS,taskStatuses:TSTAT,categories:CATS,
    projects:projects().map(p=>({id:p.id,name:p.name,client:p.client||null,location:p.location||null,lifecycle:p.lifecycle,conditions:condsOf(p),priority:p.priority,responsible:p.responsible||null,nextAction:p.nextAction||null,agreedFee:p.agreedFee??null,quotedFee:p.quotedFee??null,received:received(p),balance:balance(p),paymentStatus:payStatus(p),blocker:p.blocker||null})),
    openTasks:Object.values(S.tasks).filter(isOpenT).map(t=>({id:t.id,projectId:t.projectId,title:t.title,assignee:t.assignee||null,due:t.due||null,est:t.est||null,priority:t.priority,status:t.status,category:t.category,clientDependency:!!t.clientDependency})),
    meetingsNext7:upcomingMeetings().filter(m=>m.date<=addDays(td,7)).map(m=>({date:m.date,time:m.time,projectId:m.projectId,purpose:m.purpose}))};
  const sys=`You are the operations manager inside WOODLAND ARCHITECTS' Project OS. Interpret the owner's command against the JSON data and reply with ONLY a JSON object:
{"reply": string, "actions": [ ... ]}
Allowed actions:
{"op":"create_project","fields":{name, client?, location?, types?:[...], scope?, lifecycle?, priority?, nextAction?, nextActionOwner?}}
{"op":"update_project","id":"WA-###","fields":{any of: lifecycle, conditions (full array), priority, responsible, nextAction, nextActionOwner, nextActionDeadline, client, location, quotedFee, agreedFee, nextPaymentDue, paymentMilestone}}
{"op":"create_task","fields":{projectId, title, assignee?, due?, est? (minutes), priority?, status?, category?, clientDependency?}}
{"op":"update_task","id":"T-####","fields":{title?, assignee?, due?, priority?, status?, est?, clientDependency?}}
{"op":"add_note","projectId":"WA-###","text":"..."}
{"op":"add_payment","fields":{projectId, amount, date, milestone?}}
{"op":"add_site_issue","projectId":"WA-###","text":"..."}
Rules: Match projects and people by fuzzy name ("Deralakate" = Deralakatte; "Shafi" = Mohammed Shafeeq). Dates YYYY-MM-DD; resolve "tomorrow"/"Friday" from today. NEVER invent client names, amounts, deadlines or responsibilities the command does not state. If the target is ambiguous, ask in reply and return no actions. For questions, answer concisely from the data with no actions; be direct like an operations manager and say so if the owner is the bottleneck. For schedules, give realistic time blocks within the stated hours, protect fixed blocks and meetings, max 6–7 focused hours, and say plainly if work exceeds capacity. "Push non-critical tasks to tomorrow" = update due of open P2/P3 tasks due today or overdue. Reply under 160 words, plain text.`;
  try{
    const res=await CAP.sample.json([{role:"user",content:sys+"\n\nDATA:\n"+JSON.stringify(data)+"\n\nCOMMAND: "+q}],{modelTier:"default",cache:false});
    UI.cmdOut={text:res?.reply||"",actions:Array.isArray(res?.actions)?res.actions.filter(validAction):[]};
  }catch(e){UI.cmdOut={text:e.code==="not_granted"?"Commands need permission to ask Claude. Allow it in this page's permissions.":e.code==="rate_limited"?"Too many commands at once — wait a minute.":"Command failed: "+(e.message||e.code)};}
  render(true);
}
function validAction(a){
  if(!a||!a.op)return false;
  if(a.op==="update_project"||a.op==="add_note"||a.op==="add_site_issue")return !!S.projects[a.id||a.projectId];
  if(a.op==="update_task")return !!S.tasks[a.id];
  if(a.op==="create_task")return !!(a.fields&&a.fields.title&&S.projects[a.fields.projectId]);
  if(a.op==="create_project")return !!(a.fields&&a.fields.name);
  if(a.op==="add_payment")return !!(a.fields&&S.projects[a.fields.projectId]&&Number(a.fields.amount)>0);
  return false;
}
async function applyActions(acts){
  for(const a of acts){
    const f=a.fields||{};
    if(a.op==="create_project"){const id=nextId("projects","WA-",3);const o={id,name:f.name,client:f.client||null,location:f.location||null,types:f.types||[],scope:f.scope||null,lifecycle:LIFECYCLE.includes(f.lifecycle)?f.lifecycle:"ENQUIRY",priority:f.priority||"P2",conditions:[],confirm:[],team:[],nextAction:f.nextAction||null,nextActionOwner:f.nextActionOwner||null,enquiryDate:today(),created:today(),siteIssues:[]};log(o,"Project created via command");await put("projects",id,o);}
    if(a.op==="update_project"){const p=clone(S.projects[a.id]);const prevLc=p.lifecycle;Object.assign(p,f);if(f.lifecycle&&f.lifecycle!==prevLc){if(f.lifecycle==="CLOSED"&&!closeOk(p))continue;log(p,`Lifecycle ${prevLc} → ${f.lifecycle}`);}log(p,"Updated via command: "+Object.keys(f).join(", "));await put("projects",p.id,p);}
    if(a.op==="create_task"){const id=nextId("tasks","T-",4);await put("tasks",id,{id,projectId:f.projectId,title:f.title,assignee:f.assignee||null,due:f.due||null,est:f.est||null,priority:f.priority||"P2",status:f.status||"NOT STARTED",category:f.category||"DESIGN",clientDependency:!!f.clientDependency,created:today()});const p=clone(S.projects[f.projectId]);log(p,`Task added: ${f.title}${f.assignee?" → "+f.assignee:""}`);await put("projects",p.id,p);}
    if(a.op==="update_task"){const t=clone(S.tasks[a.id]);Object.assign(t,f);if(f.status==="COMPLETED")t.completed=today();await put("tasks",t.id,t);const p=S.projects[t.projectId];if(p){const pp=clone(p);log(pp,`${t.title} — `+Object.entries(f).map(([k,v])=>k+" "+v).join(", "));await put("projects",pp.id,pp);}}
    if(a.op==="add_note"){const p=clone(S.projects[a.projectId]);log(p,"Note: "+a.text);await put("projects",p.id,p);}
    if(a.op==="add_site_issue"){const p=clone(S.projects[a.projectId]);p.siteIssues=[...(p.siteIssues||[]),{d:today(),text:a.text,status:"OPEN"}];log(p,"Site issue: "+a.text);await put("projects",p.id,p);}
    if(a.op==="add_payment"){const id=nextId("payments","PAY-",4);await put("payments",id,{id,projectId:f.projectId,amount:Number(f.amount),date:f.date||today(),milestone:f.milestone||""});const p=clone(S.projects[f.projectId]);log(p,"Payment received "+money(f.amount));await put("projects",p.id,p);}
  }
  toast(acts.length+" change"+(acts.length>1?"s":"")+" applied");
}

/* =========================================================
   EXPORT / IMPORT
   ========================================================= */
async function save(filename,data){if(!CAP.downloads){try{const blob=new Blob([data],{type:filename.endsWith(".csv")?"text/csv":"application/json"});const u=URL.createObjectURL(blob);const l=document.createElement("a");l.href=u;l.download=filename;document.body.appendChild(l);l.click();setTimeout(()=>{URL.revokeObjectURL(u);l.remove();},500);toast("Downloaded "+filename);}catch(e){toast("Download failed");}return;}try{await CAP.downloads.save({filename,data});}catch(e){if(e.code!=="declined")toast("Save failed: "+(e.message||e.code));}}
const csv=rows=>rows.map(r=>r.map(c=>{const s=c==null?"":String(c);return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;}).join(",")).join("\n");
const NAMES={projects:"projects",tasks:"tasks",people:"people",meetings:"meetings",payments:"payments",plans:"plans"};
function countsOf(d){const c={};COLS.forEach(k=>{const n=Object.keys((d&&d[k])||{}).length;if(n)c[k]=n;});return c;}
const countText=c=>Object.entries(c).map(([k,n])=>n+" "+(n===1?NAMES[k].replace(/s$/,""):NAMES[k])).join(" · ")||"nothing";
// Send records to the server in small batches, in order, through the outbox (so they survive going offline).
function bulkSend(d,done){
  if(!isAdmin()){toast("Unlock Admin first (Data & settings).");return;}
  const exp=countsOf(d);UI.upload={expected:exp,got:{},done};
  if(d.settings&&Object.keys(d.settings).length)Sync.enqueue({action:"importBulk",data:{settings:d.settings}});
  COLS.forEach(c=>{const ids=Object.keys(d[c]||{});for(let i=0;i<ids.length;i+=40){const part={};ids.slice(i,i+40).forEach(id=>{part[id]=d[c][id];});Sync.enqueue({action:"importBulk",data:{[c]:part}});}});
  toast("Uploading "+countText(exp)+"…");
}
function importDone(counts){
  const u=UI.upload;if(!u)return;
  Object.entries(counts).forEach(([c,v])=>{if(c!=="settings")u.got[c]=(u.got[c]||0)+v.total;});
  const pending=Sync.outbox().filter(o=>o.action==="importBulk").length;
  if(pending)return;
  const ok=Object.keys(u.expected).every(k=>u.got[k]===u.expected[k]);
  UI.upload=null;Sync.resetSync();Sync.pull();
  toast(ok?"Upload complete: "+countText(u.got)+". Counts match.":"Upload finished but counts differ — sent "+countText(u.expected)+", server confirmed "+countText(u.got)+".");
}
async function importFile(file,starter){
  try{const d=JSON.parse(await file.text());const c=countsOf(d);
    if(!Object.keys(c).length){toast("No records in that file");return;}
    const msg=starter?`Import the starter projects (${countText(c)})? Do this only once, into an empty sheet. Records are added; nothing is deleted.`:`Import ${countText(c)}? Records with the same ID are updated; nothing is deleted.`;
    if(starter&&Object.keys(S.projects).length)return confirmBox(`The shared sheet already has ${Object.keys(S.projects).length} projects. Importing the starter projects now could overwrite your edits (same IDs). Import anyway?`,"Import anyway",()=>bulkSend(d));
    confirmBox(msg,"Import",()=>bulkSend(d));
  }catch(e){toast("That file isn't a valid backup");}
}
// Old single-device data (the previous Project OS file keeps it in this browser under wpos_v1)
function readLegacy(){try{const r=localStorage.getItem("wpos_v1");return r?JSON.parse(r):null;}catch(e){return null;}}
function legacyUpload(){
  const d=readLegacy();
  if(!d){toast("No old data is kept in this browser address. In the old file use Download full backup, then choose that file under Restore from a backup file.");return;}
  const c=countsOf(d);
  if(!Object.keys(c).length){toast("The old data in this browser is empty.");return;}
  confirmBox(`Found on this device: ${countText(c)}. Send them to the shared sheet? Records are added or updated by ID; nothing is deleted.`,"Upload",()=>bulkSend(d));
}

/* ---- PIN, name and admin screens ---- */
let gateKey="";
function renderGate(){
  const g=document.getElementById("gate");if(!g)return;
  const key=AUTH.need+"|"+AUTH.err+"|"+(AUTH.people||[]).join(",")+"|"+AUTH.busy;
  if(AUTH.need==="ok"){g.innerHTML="";g.hidden=true;gateKey="";return;}
  g.hidden=false;if(key===gateKey)return;gateKey=key;
  if(AUTH.need==="pin")g.innerHTML=`<form class="gatebox" id="pinForm"><div class="brand2"><b>WOODLAND</b><span>Project OS</span></div><h2>Enter the team PIN</h2><p class="hint">Ask Ameen for the PIN. You only need it once on this phone.</p><input type="password" id="pinInput" inputmode="numeric" autocomplete="off" placeholder="PIN" aria-label="Team PIN" ${AUTH.busy?"disabled":""}>${AUTH.err?`<div class="banner" role="alert">${esc(AUTH.err)}</div>`:""}<button class="btn pri" ${AUTH.busy?"disabled":""}>${AUTH.busy?"Checking…":"Continue"}</button></form>`;
  else g.innerHTML=`<form class="gatebox" id="whoForm"><div class="brand2"><b>WOODLAND</b><span>Project OS</span></div><h2>Who are you?</h2><p class="hint">Tap your name, or type it. Your changes are recorded under this name.</p><div class="togs">${(AUTH.people||[]).map(n=>`<button type="button" class="chip" data-act="pickUser" data-v="${esc(n)}">${esc(n)}</button>`).join("")}</div><input type="text" id="whoInput" autocomplete="off" placeholder="Or type your name" aria-label="Your name"><button class="btn pri">Continue</button></form>`;
  const f=g.querySelector("input");if(f&&!f.disabled)setTimeout(()=>f.focus(),30);
}
async function submitPin(pin){
  pin=String(pin||"").trim();if(!pin)return;
  AUTH.busy=true;AUTH.err="";renderGate();
  try{
    const r=await Sync.api("hello",{},{pin});
    AUTH.busy=false;
    if(r&&r.ok){await Sync.setMeta({teamPin:pin,adminPin:r.admin?pin:""});AUTH.admin=!!r.admin;AUTH.people=(r.people||[]).map(p=>p.name);AUTH.need=Sync.meta().user?"ok":"who";AUTH.err="";render(true);if(AUTH.need==="ok")Sync.start();}
    else{AUTH.err=(r&&r.error)||"That PIN was not accepted.";gateKey="";renderGate();}
  }catch(e){AUTH.busy=false;AUTH.err="Couldn't reach the server. Check the internet.";gateKey="";renderGate();}
}
async function chooseUser(name){
  name=String(name||"").trim().slice(0,60);if(!name){toast("Type your name");return;}
  const match=(AUTH.people||[]).find(n=>n.toLowerCase()===name.toLowerCase());
  AUTH.user=match||name;await Sync.setMeta({user:AUTH.user});
  if(AUTH.need==="who")startAfterGate();else{AUTH.need="ok";render(true);ensureMe();}
}
function adminRow(){return `<div class="row clk" data-act="${isAdmin()?"adminLock":"adminUnlock"}">${ICON.data}<div class="grow"><div class="t">Admin</div><div class="s">${isAdmin()?"Unlocked on this device · tap to lock":"Locked · enter the admin PIN for fees, payments, archive, delete, import"}</div></div><span class="hint">›</span></div>`;}
function adminUnlock(){
  openModal("Unlock admin",[{k:"pin",label:"Admin PIN",type:"password",full:1}],async v=>{
    if(!v.pin){toast("Enter the admin PIN");return false;}
    try{const r=await Sync.api("hello",{},{pin:String(v.pin)});
      if(r&&r.ok&&r.admin){await Sync.setMeta({adminPin:String(v.pin)});AUTH.admin=true;render(true);toast("Admin unlocked on this device");return;}
      toast("That is not the admin PIN.");return false;
    }catch(e){toast("Couldn't reach the server. Check the internet.");return false;}
  },"Unlock");
}
async function adminLock(){await Sync.setMeta({adminPin:""});AUTH.admin=false;render(true);toast("Admin locked");}

/* ---- app updates (service worker) ---- */
function showUpdateBar(reg){
  if(document.getElementById("updbar"))return;
  const b=document.createElement("button");b.id="updbar";b.className="updbar";b.textContent="New version — tap to refresh";
  b.onclick=()=>{if(reg&&reg.waiting)reg.waiting.postMessage("skipWaiting");else location.reload();};
  document.body.appendChild(b);
}
function registerSW(){
  navigator.serviceWorker.register("service-worker.js").then(reg=>{
    if(reg.waiting&&navigator.serviceWorker.controller)showUpdateBar(reg);
    reg.addEventListener("updatefound",()=>{const w=reg.installing;if(w)w.addEventListener("statechange",()=>{if(w.state==="installed"&&navigator.serviceWorker.controller)showUpdateBar(reg);});});
    setInterval(()=>reg.update().catch(()=>{}),30*60*1000);
  }).catch(()=>{});
  let reloaded=false;navigator.serviceWorker.addEventListener("controllerchange",()=>{if(reloaded)return;reloaded=true;location.reload();});
}

/* =========================================================
   EVENTS
   ========================================================= */
document.addEventListener("click",e=>{
  const el=e.target.closest("[data-act]");if(!el)return;
  if(el.dataset.act==="closeSheet"&&e.target.closest("[data-stop]")&&!e.target.closest('button[data-act="closeSheet"]'))return;
  if(el.tagName==="SELECT"||el.tagName==="INPUT")return;
  const a=el.dataset.act,id=el.dataset.id;e.preventDefault();
  switch(a){
    case "view":UI.view=el.dataset.v;closeSheet();render(true);window.scrollTo(0,0);break;
    case "openP":if(id&&S.projects[id]){UI.open=id;renderSheet();}break;
    case "closeSheet":closeSheet();render(true);break;
    case "newProject":newProject();break;
    case "editTask":taskDetails(S.tasks[id]);break;
    case "toggleDone":{const t=S.tasks[id];if(t)setTask(id,"status",t.status==="COMPLETED"?"NOT STARTED":"COMPLETED");break;}
    case "togArr":{const p=clone(S.projects[id]);const k=el.dataset.k,v=el.dataset.v;const arr=p[k]||[];p[k]=arr.includes(v)?arr.filter(x=>x!==v):[...arr,v];if(k==="conditions")log(p,(arr.includes(v)?"Cleared: ":"Set: ")+v.toLowerCase());if(k==="confirm"&&arr.includes(v))log(p,(CONFIRMABLE[v]||v)+" confirmed");put("projects",id,p);break;}
    case "clearConfirm":{const p=clone(S.projects[id]);p.confirm=(p.confirm||[]).filter(x=>x!==el.dataset.k);log(p,(CONFIRMABLE[el.dataset.k]||el.dataset.k)+" confirmed");put("projects",id,p);break;}
    case "newMeeting":meetingForm(null,el.dataset.pid);break;
    case "editMeeting":meetingForm(S.meetings[id]);break;
    case "newPayment":paymentForm(el.dataset.pid);break;
    case "delPayment":confirmBox("Delete this payment entry?","Delete",()=>{const x=S.payments[id];remove("payments",id);const p=S.projects[x?.projectId];if(p){const pp=clone(p);log(pp,"Payment entry removed "+money(x.amount));put("projects",pp.id,pp);}});break;
    case "newPerson":openModal("New team member",[{k:"name",label:"Name"},{k:"role",label:"Role",ph:"Draughtsman, 3D artist, site engineer"},{k:"capacity",label:"Focused hours / day",type:"number",value:6}],v=>{if(!v.name){toast("Enter a name");return false;}const pid=nextId("people","P-",3);put("people",pid,{...v,id:pid});},"Add");break;
    case "removePerson":{const p=S.people[id];confirmBox(`Remove ${p.name} from the team? Their tasks stay assigned until you change them.`,"Remove",()=>put("people",id,{...clone(p),archived:true}));break;}
    case "closeModal":closeModal();break;
    case "modalExtra":MODAL&&MODAL.extra.fn();break;
    case "pv":UI.pv=el.dataset.v;render(true);break;
    case "tv":UI.tv=el.dataset.v;render(true);break;
    case "toggleFilters":UI.showFilters=!UI.showFilters;render(true);break;
    case "clearFilters":UI.pfil={lc:"",type:"",person:"",pri:"",pay:""};render(true);break;
    case "kpi":{const v=el.dataset.v;if(v==="overdue"){UI.view="tasks";UI.tv="overdue";}else if(v==="pay"){UI.view="money";}else{UI.view="projects";UI.pv=v;}render(true);window.scrollTo(0,0);break;}
    case "replan":UI.planOverride={s:document.getElementById("planS").value,e:document.getElementById("planE").value};render(true);break;
    case "lockPlan":{const plan=buildPlan(today(),UI.planOverride?.s,UI.planOverride?.e);put("plans",planKey(),{id:planKey(),taskIds:plan.placed.map(b=>b.t.id),blocks:plan.blocks.map(b=>({s:b.s,e:b.e,label:b.label,taskId:b.t?.id||null}))});toast("Today's plan locked");break;}
    case "eod":{const t=S.tasks[id];const o=el.dataset.o;if(o==="done")setTask(id,"status","COMPLETED");else if(o==="carry")setTask(id,"due",addDays(today(),1));else if(o==="drop")confirmBox(`Drop “${t.title}”? It will be marked Cancelled.`,"Drop",()=>setTask(id,"status","CANCELLED"));break;}
    case "copyReport":navigator.clipboard.writeText(dailyReport()).then(()=>toast("Report copied")).catch(()=>{const r=document.createRange();r.selectNodeContents(document.getElementById("reportTxt"));const s=getSelection();s.removeAllRanges();s.addRange(r);toast("Selected — tap Copy");});break;
    case "archiveP":confirmBox(`Archive ${S.projects[id].name}? It disappears from every list but keeps its history. Restore it from Data & settings.`,"Archive",()=>{const p=clone(S.projects[id]);p.archived=true;log(p,"Archived");put("projects",id,p);closeSheet();});break;
    case "unarchive":{const p=clone(S.projects[id]);p.archived=false;log(p,"Restored");put("projects",id,p);break;}
    case "deleteP":confirmBox(`Permanently delete ${S.projects[id].name} and its ${tasksOf(id).length} tasks? This can't be undone.`,"Delete permanently",()=>{tasksOf(id).forEach(t=>remove("tasks",t.id));remove("projects",id);});break;
    case "resolveIssue":{const p=clone(S.projects[id]);const i=+el.dataset.i;p.siteIssues[i].status="RESOLVED";p.siteIssues[i].resolved=today();if(!p.siteIssues.some(x=>x.status!=="RESOLVED"))p.conditions=(p.conditions||[]).filter(c=>c!=="SITE ISSUE");log(p,"Site issue resolved: "+p.siteIssues[i].text);put("projects",id,p);break;}
    case "followed":{const t=clone(S.tasks[id]);t.waitingSince=today();t.notes=((t.notes||"")+"\nFollowed up "+fmtD(today())).trim();put("tasks",id,t);const p=S.projects[t.projectId];if(p){const pp=clone(p);log(pp,"Followed up: "+t.title);put("projects",pp.id,pp);}toast("Follow-up logged");break;}
    case "followedP":{const p=clone(S.projects[id]);p.waitingSince=today();log(p,"Client followed up");put("projects",id,p);toast("Follow-up logged");break;}
    case "cmdApply":{const acts=UI.cmdOut.actions;UI.cmdOut=null;UI.gq="";applyActions(acts);break;}
    case "retry":UI.loadErr=false;render(true);Sync.tick(true);break;
    case "changeUser":AUTH.need="who";AUTH.people=Object.values(S.people).filter(p=>!p.archived).map(p=>p.name);gateKey="";render(true);break;
    case "pickUser":chooseUser(el.dataset.v);break;
    case "adminUnlock":adminUnlock();break;
    case "adminLock":adminLock();break;
    case "legacyUpload":legacyUpload();break;
    case "cmdClose":UI.cmdOut=null;render(true);break;
    case "exportJSON":{const d={exported:nowISO(),settings:S.settings};COLS.forEach(c=>d[c]=S[c]);save(`woodland-project-os-${today()}.json`,JSON.stringify(d,null,1));break;}
    case "exportCSV":{const f=["id","name","client","location","types","scope","area","lifecycle","conditions","priority","lead","responsible","quotedFee","agreedFee","received","balance","paymentStatus","nextAction","nextActionOwner","nextActionDeadline","targetDate","notes"];save(`woodland-projects-${today()}.csv`,csv([f,...projects(true).map(p=>f.map(k=>k==="received"?received(p):k==="balance"?balance(p):k==="paymentStatus"?payStatus(p):k==="conditions"?condsOf(p).join("; "):Array.isArray(p[k])?p[k].join("; "):p[k]))]));break;}
    case "exportTasksCSV":{const f=["id","projectId","title","assignee","created","due","est","priority","status","category","clientDependency","dependency","completed","notes"];save(`woodland-tasks-${today()}.csv`,csv([f,...Object.values(S.tasks).map(t=>f.map(k=>t[k]))]));break;}
  }
});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){if(document.getElementById("confirmWrap"))document.getElementById("confirmWrap").remove();else if(MODAL)closeModal();else if(UI.open){closeSheet();render(true);}}
  if(e.key==="Enter"&&e.target.classList?.contains("card"))e.target.click();
  if(e.key==="Enter"&&e.target.matches?.("input.ed"))e.target.blur();
});
document.addEventListener("change",e=>{
  const el=e.target;
  if(el.dataset.ed){
    const [col,id,k]=el.dataset.ed.split("|");let v=el.value;
    if(el.type==="number")v=v===""?null:Number(v);else if(typeof v==="string"){v=v.trim();if(v==="")v=null;}
    if(col==="tasks")setTask(id,k,v);
    else if(col==="projects")setProject(id,k,v);
    else if(col==="people"){const p=clone(S.people[id]);const old=p[k];if(k==="name"&&!v){render(true);return;}p[k]=v;if(k==="name"&&old!==v)Object.values(S.tasks).filter(t=>t.assignee===old).forEach(t=>put("tasks",t.id,{...clone(t),assignee:v}));put("people",id,p);}
    return;
  }
  if(el.dataset.set){let v=el.value;if(el.type==="number")v=Number(v)||0;putSettings({[el.dataset.set]:v});toast("Saved");return;}
  const map={"pf-lc":"lc","pf-type":"type","pf-person":"person","pf-pri":"pri","pf-pay":"pay"};
  if(map[el.id]){UI.pfil[map[el.id]]=el.value;render(true);return;}
  if(el.id==="tf-person"){UI.tperson=el.value;render(true);}
  if(el.id==="tf-project"){UI.tproject=el.value;render(true);}
  if(el.id==="sortP"){UI.sortP=el.value;render(true);}
  if(el.id==="qa-proj")UI.qaProject=el.value;
  if(el.id&&el.id.startsWith("qa-asg"))UI.qaAssignee=el.value;
  if(el.id==="importFile"&&el.files[0]){importFile(el.files[0]);el.value="";}
  if(el.id==="starterFile"&&el.files[0]){importFile(el.files[0],true);el.value="";}
});
let qT=null;
document.addEventListener("input",e=>{if(e.target.id==="gsearch"){clearTimeout(qT);const v=e.target.value;qT=setTimeout(()=>{UI.gq=v;if(!v)UI.cmdOut=null;render(true);},250);}});
document.addEventListener("toggle",e=>{const d=e.target;if(d&&d.dataset&&d.dataset.sec)UI.secs[d.dataset.sec]=d.open;},true);
document.addEventListener("focusout",()=>{if(pendingRender)setTimeout(()=>{if(pendingRender&&!isTyping())render();},0);});
document.addEventListener("submit",async e=>{
  e.preventDefault();const f=e.target;
  if(f.id==="modalForm"&&MODAL){const r=await MODAL.onSubmit(readModal());if(r!==false)closeModal();return;}
  if(f.id==="pinForm"){submitPin(document.getElementById("pinInput").value);return;}
  if(f.id==="whoForm"){chooseUser(document.getElementById("whoInput").value);return;}
  if(f.id==="omni"){const q=document.getElementById("gsearch").value.trim();if(q&&CAP.sample)runCommand(q);return;}
  if(f.dataset.quick!==undefined){
    const pid=f.dataset.quick||document.getElementById("qa-proj")?.value;const inp=f.querySelector('input[type="text"]');const title=inp.value.trim();
    if(!title)return;if(!pid){toast("Pick a project first");return;}
    const asg=f.querySelector('select[id^="qa-asg"]').value;UI.qaAssignee=asg;if(!f.dataset.quick)UI.qaProject=pid;
    inp.value="";addTask(pid,title,asg);render(true);document.getElementById(inp.id)?.focus();toast("Task added");return;
  }
  if(f.dataset.issue){const inp=f.querySelector("input");const txt=inp.value.trim();if(!txt)return;const id=f.dataset.issue;const p=clone(S.projects[id]);p.siteIssues=[...(p.siteIssues||[]),{d:today(),text:txt,status:"OPEN"}];if(!(p.conditions||[]).includes("SITE ISSUE"))p.conditions=[...(p.conditions||[]),"SITE ISSUE"];log(p,"Site issue: "+txt);inp.value="";put("projects",id,p);const tid=nextId("tasks","T-",4);put("tasks",tid,{id:tid,projectId:id,title:"Resolve: "+txt,assignee:p.responsible||null,priority:"P0",status:"NOT STARTED",category:"SITE",created:today(),due:today()});render(true);return;}
  if(f.dataset.note){const inp=f.querySelector("input");const txt=inp.value.trim();if(!txt)return;const p=clone(S.projects[f.dataset.note]);log(p,"Note: "+txt);inp.value="";put("projects",p.id,p);render(true);return;}
});
boot();
