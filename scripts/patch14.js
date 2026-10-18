// Date fields: typing a year digit by digit must not save (and reset) the half-typed date.
const fs = require("fs");
let s = fs.readFileSync("app/app.js", "utf8");
function rep(a, b) { if (!s.includes(a)) throw new Error("missing: " + a.slice(0, 70)); s = s.replace(a, b); }
rep('function isTyping(){const a=document.activeElement;if(!a)return false;if(a.tagName==="TEXTAREA")return true;',
    'const partialDate=v=>/^\\d{1,6}-\\d{2}-\\d{2}$/.test(v||"")&&+String(v).split("-")[0]<1900;   // e.g. 0002-02-01 while the year is still being typed\nfunction isTyping(){const a=document.activeElement;if(!a)return false;if(a.tagName==="TEXTAREA")return true;if(a.tagName==="INPUT"&&a.type==="date"&&partialDate(a.value))return true;');
rep('    const [col,id,k]=el.dataset.ed.split("|");let v=el.value;', '    if(el.type==="date"&&partialDate(el.value))return;   // wait until the whole year is typed\n    const [col,id,k]=el.dataset.ed.split("|");let v=el.value;');
fs.writeFileSync("app/app.js", s);
console.log("ok");
