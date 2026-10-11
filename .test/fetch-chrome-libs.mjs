/* Descarga las .so que faltan para que Chrome arranque en un sandbox sin root ni apt.
   Importante: el pool de deb.debian.org es "unstable"; se filjan los paquetes de trixie
   (llevan "deb13" en el nombre) porque los de sid piden un GLIBC más nuevo que el del sandbox.
   Uso: node .test/fetch-chrome-libs.mjs  (~1 min, idempotente) */
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const DEST = "/home/user/.local/chromelibs";
const POOL = "https://deb.debian.org/debian/pool/main";
const want = [
  ["n/nspr", "libnspr4"],
  ["n/nss", "libnss3"],
  ["libx/libxdamage", "libxdamage1"],
  ["libx/libxfixes", "libxfixes3"],
  ["a/alsa-lib", "libasound2t64", "libasound2"],
  ["a/atk1.0", "libatk1.0-0t64", "libatk1.0-0"],
  ["a/at-spi2-atk", "libatk-bridge2.0-0t64", "libatk-bridge2.0-0"],
  ["a/at-spi2-core", "libatspi2.0-0t64", "libatspi2.0-0"],
  ["c/cups", "libcups2t64", "libcups2"],
  ["libx/libxkbcommon", "libxkbcommon0"],
  ["a/avahi", "libavahi-client3"],
  ["a/avahi", "libavahi-common3"],
  ["d/dbus", "libdbus-1-3"],
  ["p/pango1.0", "libpango-1.0-0"],
  ["c/cairo", "libcairo2"],
  ["g/glib2.0", "libglib2.0-0t64", "libglib2.0-0"],
  ["m/mesa", "libglx-mesa0"],
  ["libi/libice", "libice6"],
  ["libsm/libsm", "libsm6"],
  ["libx/libxrender", "libxrender1"],
  ["libx/libxext", "libxext6"],
  ["libd/libdrm", "libdrm2"],
  ["libg/libglvnd", "libglvnd0"],
];
const get = (u) => { try { return execFileSync("curl", ["-s", "-m", "40", u], { encoding: "utf8", maxBuffer: 1 << 26 }); } catch { return ""; } };
fs.mkdirSync(DEST + "/usr/lib/x86_64-linux-gnu", { recursive: true });
for (const [dir, ...pkgs] of want) {
  const html = get(`${POOL}/${dir}/`);
  const names = [...new Set(html.match(/href="[^"]*\.deb"/g) || [])].map((x) => x.slice(6, -1));
  let ok = false;
  for (const pkg of pkgs) {
    if (ok) break;
    const cand = names.filter((n) => new RegExp(`^${pkg.replace(/[.+]/g, "\\$&")}_[^"]*_amd64\\.deb$`).test(n) && !/-dev|-dbg|plugin|-tools|-bin/.test(n));
    const trixie = cand.filter((n) => /deb13/.test(n));
    const pool = (trixie.length ? trixie : cand).sort();
    const pick = pool.pop();
    if (!pick) { console.log("·", pkg, "-> sin .deb en", dir); continue; }
    const out = `/tmp/${pick}`;
    if (!fs.existsSync(out) || fs.statSync(out).size < 1000) fs.writeFileSync(out, execFileSync("curl", ["-s", "-m", "120", `${POOL}/${dir}/${pick}`], { maxBuffer: 1 << 28 }));
    try { execFileSync("dpkg-deb", ["-x", out, DEST], { stdio: "ignore" }); console.log("✓", pick); ok = true; }
    catch { console.log("✗", pick); }
  }
}
const dir = DEST + "/usr/lib/x86_64-linux-gnu";
console.log("libs disponibles:", fs.readdirSync(dir).filter((x) => x.includes(".so")).length);
