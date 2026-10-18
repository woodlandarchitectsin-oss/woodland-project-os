const fs = require("fs");
let s = fs.readFileSync("app/app.js", "utf8");
let n = 0;
s = s.replace(/(?<![A-Za-z])ed\("projects",p\.id,"(quotedFee|agreedFee|openingReceived|nextPaymentDue|paymentMilestone)"/g, (m, k) => { n++; return `edA("projects",p.id,"${k}"`; });
fs.writeFileSync("app/app.js", s);
console.log("replaced", n);
