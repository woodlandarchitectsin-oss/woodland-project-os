const fs = require("fs");
let s = fs.readFileSync("app/app.js", "utf8");
const startMarker = '  if(el.dataset.ed){\n    let dv=null;';
const i = s.indexOf(startMarker);
const endMarker = '    return;\n  }\n  if(el.dataset.set)';
const j = s.indexOf(endMarker, i);
if (i < 0 || j < 0) throw new Error("markers");
const body = s.slice(s.indexOf('    const [col,id,k]=el.dataset.ed.split("|");let v=dv||el.value;', i), j);   // original save logic
const newBlock = `  if(el.dataset.ed){
    if(el.type==="date"){
      // Chrome reports every keystroke. The year is typed as its last digit(s): 5 -> 2025, 26 -> 2026; half-typed years wait,
      // and the save happens when typing pauses (or the box is left), so history gets one line, not one per digit.
      if(el.value===""&&document.activeElement===el&&!el.dataset.blur)return;   // Chrome empties the box while you overwrite a date
      const m=/^(\d{1,6})-(\d{2})-(\d{2})$/.exec(el.value);let dv=null;
      if(m&&+m[1]<100){const y=+m[1];dv=(y<10?2020+y:2000+y)+"-"+m[2]+"-"+m[3];}
      else if(partialDate(el.value))return;
      clearTimeout(DT);
      if(el.dataset.blur){DTel=null;commitEd(el,dv);return;}
      DTel=el;DTv=dv;DT=setTimeout(()=>{DTel=null;commitEd(el,dv);},700);return;
    }
    commitEd(el,null);
`;
s = s.slice(0, i) + newBlock + s.slice(j);
const fn = `let DT=null,DTel=null,DTv=null;
function commitEd(el,dv){
${body.replace(/\n    return;\s*$/, "")}
}
`;
const k = s.indexOf('document.addEventListener("change",e=>{');
if (k < 0) throw new Error("change listener");
s = s.slice(0, k) + fn + s.slice(k);
// leaving the box commits straight away
const a = 'document.addEventListener("focusout",e=>{const t=e.target;if(t&&t.type==="date"&&t.dataset&&t.dataset.ed){';
if (!s.includes(a)) throw new Error("focusout");
s = s.replace(a, a + 'if(DTel===t){clearTimeout(DT);DTel=null;commitEd(t,DTv);}');
fs.writeFileSync("app/app.js", s);
console.log("ok");
