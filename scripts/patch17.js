// Date fields: keep the box the person is typing in; save 202x years from the last digit(s); never redraw under their cursor.
const fs = require("fs");
let s = fs.readFileSync("app/app.js", "utf8");
function rep(a, b) { if (!s.includes(a)) throw new Error("missing: " + a.slice(0, 70)); s = s.replace(a, b); }
rep('if(a.tagName==="INPUT"&&a.type==="date"&&partialDate(a.value))return true;', 'if(a.tagName==="INPUT"&&a.type==="date"&&a.dataset.ed)return true;   // never redraw a date box while it has the cursor');
const start = s.indexOf('    if(el.type==="date"){\n      // years are typed');
const end = s.indexOf('    const [col,id,k]=el.dataset.ed.split("|");let v=el.value;');
if (start < 0 || end < 0) throw new Error("block");
s = s.slice(0, start) + `    let dv=null;
    if(el.type==="date"){
      // Chrome reports every keystroke. The year is typed as its last digit(s): 5 -> 2025, 26 -> 2026; half-typed years wait.
      if(el.value===""&&document.activeElement===el&&!el.dataset.blur)return;   // Chrome empties the box while you overwrite a date
      const m=/^(\\d{1,6})-(\\d{2})-(\\d{2})$/.exec(el.value);
      if(m&&+m[1]<100){const y=+m[1];dv=(y<10?2020+y:2000+y)+"-"+m[2]+"-"+m[3];}
      else if(partialDate(el.value))return;
    }
` + s.slice(end);
rep('    const [col,id,k]=el.dataset.ed.split("|");let v=el.value;\n', '    const [col,id,k]=el.dataset.ed.split("|");let v=dv||el.value;\n');
rep('document.addEventListener("focusout",()=>{if(pendingRender)', 'document.addEventListener("focusout",e=>{const t=e.target;if(t&&t.type==="date"&&t.dataset&&t.dataset.ed){if(t.value===""){t.dataset.blur="1";t.dispatchEvent(new Event("change",{bubbles:true}));delete t.dataset.blur;}}if(pendingRender)');
fs.writeFileSync("app/app.js", s);
console.log("ok");
