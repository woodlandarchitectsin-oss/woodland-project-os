// Generates the app icons (green square, white "W") as PNG using a headless browser canvas.
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
(async () => {
  const out = path.join(__dirname, "..", "app", "icons");
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const specs = [["icon-192.png", 192, 0.62], ["icon-512.png", 512, 0.62], ["maskable-512.png", 512, 0.46]];
  for (const [name, size, scale] of specs) {
    const b64 = await page.evaluate(([size, scale]) => {
      const c = document.createElement("canvas"); c.width = c.height = size;
      const x = c.getContext("2d");
      x.fillStyle = "#2c5a47"; x.fillRect(0, 0, size, size);
      x.fillStyle = "#ffffff"; x.textAlign = "center"; x.textBaseline = "alphabetic";
      x.font = `700 ${Math.round(size * scale)}px "Segoe UI","Helvetica Neue",Arial,sans-serif`;
      const m = x.measureText("W");
      const h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
      x.fillText("W", size / 2, size / 2 + h / 2 - m.actualBoundingBoxDescent);
      return c.toDataURL("image/png").split(",")[1];
    }, [size, scale]);
    fs.writeFileSync(path.join(out, name), Buffer.from(b64, "base64"));
    console.log("wrote", name);
  }
  await browser.close();
})();
