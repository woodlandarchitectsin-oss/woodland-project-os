// Fix: tapping Add (or any button) while a screen redraw was waiting made the redraw run on the text box's blur,
// replacing the button before the tap finished. The tap was lost and the typed text wiped.
// The waiting redraw now runs only after the pointer is released.
const fs = require("fs");
const path = require("path");
const f = path.join(__dirname, "..", "app", "app.js");
let s = fs.readFileSync(f, "utf8");

const oldTail = 'if(pendingRender)setTimeout(()=>{if(pendingRender&&!isTyping())render();},0);});';
if (!s.includes(oldTail)) throw new Error("focusout tail not found (already patched?)");
s = s.replace(oldTail, 'if(pendingRender)setTimeout(()=>{if(pendingRender&&!pressing&&!isTyping())render();},0);});');

const anchor = "let pendingRender=false,lastView=null;";
if (!s.includes(anchor)) throw new Error("anchor not found");
s = s.replace(anchor, anchor +
  '\nlet pressing=false;   /* a finger/mouse is down: never redraw under it, or the tap is lost */\n' +
  'document.addEventListener("pointerdown",()=>{pressing=true;},true);\n' +
  '["pointerup","pointercancel"].forEach(ev=>document.addEventListener(ev,()=>{pressing=false;setTimeout(()=>{if(pendingRender&&!pressing&&!isTyping())render();},0);},true));');

fs.writeFileSync(f, s);
console.log("patched app.js");
