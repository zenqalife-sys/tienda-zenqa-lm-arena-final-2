import puppeteer from "puppeteer";
process.env.LD_LIBRARY_PATH = "/home/user/.local/chromelibs/usr/lib/x86_64-linux-gnu:" + (process.env.LD_LIBRARY_PATH || "");
const EXE = "/home/user/.cache/puppeteer/chrome/linux-148.0.7778.97/chrome-linux64/chrome";
import fs from "fs";
const BASE = "http://127.0.0.1:8080/";
fs.mkdirSync("shots", { recursive: true });
const browser = await puppeteer.launch({ executablePath: EXE, args: ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none", "--hide-scrollbars"] });
const targets = process.argv.slice(2);
for (const t of targets) {
  const [file, tag, w = 1440, h = 900] = t.split(":");
  const page = await browser.newPage();
  const problems = [];
  page.on("console", (m) => { if (m.type() === "error") problems.push("console: " + m.text()); });
  page.on("pageerror", (e) => problems.push("pageerror: " + e.message));
  page.on("requestfailed", (r) => problems.push("404/fail: " + r.url().replace(BASE, "")));
  page.on("response", (r) => { if (r.status() >= 400) problems.push("HTTP " + r.status() + " " + r.url().replace(BASE, "")); });
  await page.setViewport({ width: +w, height: +h, deviceScaleFactor: 1 });
  await page.goto(BASE + file, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 500));
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  const n = Math.min(8, Math.ceil(H / h));
  for (let i = 0; i < n; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), i * h);
    await new Promise((r) => setTimeout(r, 900));
    await page.screenshot({ path: `shots/${file.replace(".html", "")}-${tag}-${i}.png` });
  }
  console.log(`${file} ${w}x${h} · altura ${H}px · ${n} capturas${problems.length ? "\n  ! " + [...new Set(problems)].join("\n  ! ") : " · sin errores"}`);
  await page.close();
}
await browser.close();
