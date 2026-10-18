// Front end: name + personal PIN sign-in, Team screen PIN controls.
const fs = require("fs");
let sy = fs.readFileSync("app/sync.js", "utf8");
function repS(a, b) { if (!sy.includes(a)) throw new Error("sync missing: " + a.slice(0, 60)); sy = sy.replace(a, b); }
repS('by: meta.user || "",', 'by: opts.by !== undefined ? opts.by : (meta.user || ""),');
repS('var payload = { collection: op.collection, id: op.id, fields: op.fields, historyAdd: op.historyAdd, opId: op.opId, ts: op.ts, data: op.data };', 'var payload = { collection: op.collection, id: op.id, fields: op.fields, historyAdd: op.historyAdd, opId: op.opId, ts: op.ts, data: op.data };');
fs.writeFileSync("app/sync.js", sy);

let s = fs.readFileSync("app/app.js", "utf8");
function rep(a, b) { if (!s.includes(a)) throw new Error("app missing: " + a.slice(0, 70)); s = s.replace(a, b); }
rep("const SKIP_DIFF={id:1,history:1,updatedAt:1,updatedBy:1,syncAt:1};", "const SKIP_DIFF={id:1,history:1,updatedAt:1,updatedBy:1,syncAt:1,hasPin:1,pinHash:1};");
rep('const AUTH={need:"pin",admin:false,user:"",err:"",people:[],busy:false};', 'const AUTH={need:"login",admin:false,user:"",err:"",busy:false};');
// ensureMe: only the admin can add a person (the server enforces it too)
rep('if(!AUTH.user||!S.loaded||AUTH.need!=="ok")return;', 'if(!AUTH.user||!S.loaded||AUTH.need!=="ok"||!isAdmin())return;');
rep('AUTH.need="pin";AUTH.err="The PIN was not accepted. Ask Ameen for the current PIN.";render(true);}', 'AUTH.need="login";AUTH.err="Your PIN was not accepted. Ask Ameen for your PIN.";render(true);}');
rep('Sync.setMeta({teamPin:"",adminPin:""});AUTH.admin=false;', 'Sync.setMeta({teamPin:"",adminPin:""});AUTH.admin=false;gateKey="";');
rep('AUTH.need=!m.teamPin?"pin":!m.user?"who":"ok";', 'AUTH.need=(!m.teamPin&&!m.adminPin)||!m.user?"login":"ok";');
// gate screen
const a = s.indexOf("let gateKey=\"\";");
const b = s.indexOf("function adminRow()");
s = s.slice(0, a) + `let gateKey="";
function renderGate(){
  const g=document.getElementById("gate");if(!g)return;
  const key=AUTH.need+"|"+AUTH.err+"|"+AUTH.busy;
  if(AUTH.need==="ok"){g.innerHTML="";g.hidden=true;gateKey="";return;}
  g.hidden=false;if(key===gateKey)return;gateKey=key;
  const last=(Sync.meta&&Sync.meta().user)||"";
  g.innerHTML=\`<form class="gatebox" id="loginForm"><div class="brand2"><b>WOODLAND</b><span>Project OS</span></div><h2>Sign in</h2><p class="hint">Type your name and your own PIN. Ask Ameen if you don't have one. You only do this once on this phone.</p><input type="text" id="nameInput" autocomplete="off" autocapitalize="words" placeholder="Your name" aria-label="Your name" value="\${esc(last)}" \${AUTH.busy?"disabled":""}><input type="password" id="pinInput" inputmode="numeric" autocomplete="off" placeholder="Your PIN" aria-label="Your PIN" \${AUTH.busy?"disabled":""}>\${AUTH.err?\`<div class="banner" role="alert">\${esc(AUTH.err)}</div>\`:""}<button class="btn pri" \${AUTH.busy?"disabled":""}>\${AUTH.busy?"Checking…":"Sign in"}</button></form>\`;
  const f=g.querySelector(last?"#pinInput":"#nameInput");if(f&&!f.disabled)setTimeout(()=>f.focus(),30);
}
async function submitLogin(name,pin){
  name=String(name||"").trim();pin=String(pin||"").trim();
  if(!name||!pin){AUTH.err="Type your name and your PIN.";gateKey="";renderGate();return;}
  if(!window.WPOS_CONFIG||!window.WPOS_CONFIG.API_URL){AUTH.err="This app is not connected to its server yet.";gateKey="";renderGate();return;}
  AUTH.busy=true;AUTH.err="";renderGate();
  try{
    const r=await Sync.api("hello",{},{pin,by:name});
    AUTH.busy=false;
    if(r&&r.ok){
      await Sync.setMeta({teamPin:pin,adminPin:r.admin?pin:"",user:r.name||name});
      AUTH.user=r.name||name;AUTH.admin=!!r.admin;AUTH.need="ok";AUTH.err="";
      render(true);Sync.start();
    }else{AUTH.err=(r&&r.error)||"That name and PIN were not accepted.";gateKey="";renderGate();}
  }catch(e){AUTH.busy=false;AUTH.err="Couldn't reach the server. Check the internet.";gateKey="";renderGate();}
}
async function signOut(){
  if(Sync.outbox().length){toast("Wait until your changes are saved ("+Sync.outbox().length+" waiting), then sign out.");return;}
  await Sync.setMeta({teamPin:"",adminPin:"",user:""});await Sync.resetSync();
  COLS.forEach(c=>{S[c]={};});S.loaded=false;Sync.saveState();
  AUTH.user="";AUTH.admin=false;AUTH.need="login";AUTH.err="";gateKey="";render(true);
}
` + s.slice(b);
// events
rep('    case "changeUser":AUTH.need="who";AUTH.people=Object.values(S.people).filter(p=>!p.archived).map(p=>p.name);gateKey="";render(true);break;\n    case "pickUser":chooseUser(el.dataset.v);break;\n', '    case "changeUser":signOut();break;\n    case "setPin":setPinFor(id);break;\n');
rep('  if(f.id==="pinForm"){submitPin(document.getElementById("pinInput").value);return;}\n  if(f.id==="whoForm"){chooseUser(document.getElementById("whoInput").value);return;}\n', '  if(f.id==="loginForm"){submitLogin(document.getElementById("nameInput").value,document.getElementById("pinInput").value);return;}\n');
rep('<button class="btn sm" data-act="changeUser">Not you? Change name</button>', '<button class="btn sm" data-act="changeUser">Sign out</button>');
// PIN helpers
rep("function adminRow()", `// Admin: give a person their own PIN (or clear it to switch their login off)
function setPinFor(id){
  const p=S.people[id];if(!p)return;
  openModal("PIN for "+p.name,[{k:"pin",label:"New PIN (4 to 8 digits). Leave empty to switch this person's login off.",type:"password",full:1}],v=>{
    const pin=v.pin==null?"":String(v.pin);
    if(pin&&!/^\\d{4,8}$/.test(pin)){toast("A PIN must be 4 to 8 digits.");return false;}
    Sync.enqueue({action:"setPin",data:{name:p.name,pin}});toast(pin?"PIN saved for "+p.name:"Login switched off for "+p.name);
  },"Save PIN");
}
function adminRow()`);
// Team screen: read-only for staff, PIN controls for admin
rep('<label class="fld"><span>Name</span>${ed("people",p.id,"name",p.name)}</label><label class="fld"><span>Role</span>${ed("people",p.id,"role",p.role)}</label><label class="fld"><span>Focused hours / day</span>${ed("people",p.id,"capacity",p.capacity,{type:"number"})}</label><label class="fld"><span>Contact</span>${ed("people",p.id,"contact",p.contact,{ph:"—"})}</label></div>',
    '<label class="fld"><span>Name</span>${edA("people",p.id,"name",p.name)}</label><label class="fld"><span>Role</span>${edA("people",p.id,"role",p.role)}</label><label class="fld"><span>Focused hours / day</span>${edA("people",p.id,"capacity",p.capacity,{type:"number"})}</label><label class="fld"><span>Contact</span>${edA("people",p.id,"contact",p.contact,{ph:"—"})}</label></div>');
rep('${isAdmin()?`<div class="toolbar" style="padding:8px 16px;margin:0"><button class="btn ghost sm" data-act="removePerson" data-id="${p.id}">Remove from team</button></div>`:""}',
    '${isAdmin()?`<div class="toolbar" style="padding:8px 16px;margin:0"><span class="hint">${p.hasPin?"Has their own PIN":"No PIN yet — cannot sign in"}</span><button class="btn sm" data-act="setPin" data-id="${p.id}">${p.hasPin?"Change PIN":"Set PIN"}</button><button class="btn ghost sm" data-act="removePerson" data-id="${p.id}">Remove from team</button></div>`:""}');
rep('"Team","Tap a name or role to edit",`<button class="btn pri" data-act="newPerson">+ Member</button>`)', '"Team",isAdmin()?"Tap a name or role to edit":"Your team",isAdmin()?`<button class="btn pri" data-act="newPerson">+ Member</button>`:"")');
// New member modal: includes the PIN
rep('case "newPerson":openModal("New team member",[{k:"name",label:"Name"},{k:"role",label:"Role",ph:"Draughtsman, 3D artist, site engineer"},{k:"capacity",label:"Focused hours / day",type:"number",value:6}],v=>{if(!v.name){toast("Enter a name");return false;}const pid=nextId("people","P-",3);put("people",pid,{...v,id:pid});},"Add");break;',
    'case "newPerson":openModal("New team member",[{k:"name",label:"Name"},{k:"role",label:"Role",ph:"Draughtsman, 3D artist, site engineer"},{k:"capacity",label:"Focused hours / day",type:"number",value:6},{k:"pin",label:"Their own PIN (4 to 8 digits)",type:"password"}],v=>{if(!v.name){toast("Enter a name");return false;}const pin=v.pin==null?"":String(v.pin);if(pin&&!/^\\d{4,8}$/.test(pin)){toast("A PIN must be 4 to 8 digits.");return false;}if(Object.values(S.people).some(x=>!x.archived&&String(x.name).toLowerCase()===v.name.toLowerCase())){toast(v.name+" is already on the team.");return false;}const pid=nextId("people","P-",3);const o={...v,id:pid};delete o.pin;put("people",pid,o);if(pin)Sync.enqueue({action:"setPin",data:{name:v.name,pin}});toast(pin?v.name+" added with their own PIN":v.name+" added. Set a PIN so they can sign in.");},"Add");break;');
fs.writeFileSync("app/app.js", s);
console.log("ok");
