#!/usr/bin/env node
/**
 * Center Aero — tek komutla yayın.
 *   npm run deploy            → derle + Natro'ya FTPS ile yükle + canlı kontrol
 *   npm run deploy -- --dry-run     → yüklemeden, nelerin gideceğini listele
 *   npm run deploy -- --skip-build  → mevcut out/ klasörünü yükle
 *
 * Bağlantı bilgileri .env.deploy dosyasından okunur (bkz. .env.deploy.example).
 * Bu dosya .gitignore'dadır; şifre asla depoya girmez.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "basic-ftp";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT = join(ROOT, "out");
const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const skipBuild = args.has("--skip-build");

function loadEnv() {
  const file = join(ROOT, ".env.deploy");
  const env = { ...process.env };
  if (existsSync(file)) {
    for (const raw of readFileSync(file, "utf8").split("\n")) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
      if (!(key in process.env)) env[key] = value;
    }
  }
  return env;
}

function listFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) files.push(...listFiles(full));
    else files.push(full);
  }
  return files;
}

function step(msg) {
  console.log(`\n▸ ${msg}`);
}

async function main() {
  const env = loadEnv();

  if (!skipBuild) {
    step("Derleniyor (next build)…");
    const build = spawnSync("npm", ["run", "build"], { cwd: ROOT, stdio: "inherit" });
    if (build.status !== 0) {
      console.error("Derleme başarısız; yayın iptal edildi.");
      process.exit(1);
    }
  }

  if (!existsSync(join(OUT, "index.html"))) {
    console.error("out/index.html bulunamadı. Önce `npm run build` çalıştırın.");
    process.exit(1);
  }

  const files = listFiles(OUT);
  const total = files.reduce((n, f) => n + statSync(f).size, 0);
  step(`Yüklenecek: ${files.length} dosya, ${(total / 1024).toFixed(0)} KB`);

  if (dryRun) {
    for (const f of files) console.log("  " + relative(OUT, f));
    console.log("\n--dry-run: hiçbir şey yüklenmedi.");
    return;
  }

  const host = env.FTP_HOST;
  const user = env.FTP_USER;
  const password = env.FTP_PASSWORD;
  const remoteDir = env.FTP_REMOTE_DIR || "/centeraero.com";
  const secure = (env.FTP_SECURE ?? "true") !== "false";
  const siteUrl = env.SITE_URL || "https://www.centeraero.com/";

  if (!host || !user || !password) {
    console.error(
      "FTP bilgileri eksik. Proje kökünde .env.deploy dosyası oluşturun (örnek: .env.deploy.example).\n" +
        "Bilgiler Natro paneli → Hosting Yönetimi → Web Sitesi → FTP Bilgisi altında.",
    );
    process.exit(1);
  }

  const client = new Client(30_000);
  try {
    step(`${host} adresine bağlanılıyor (${secure ? "FTPS" : "FTP"})…`);
    await client.access({ host, user, password, secure, secureOptions: { rejectUnauthorized: false } });
    await client.ensureDir(remoteDir);

    // Eski derleme parçaları birikmesin: _next önce temizlenir (yalnızca bizim çıktımız).
    step("Eski _next klasörü temizleniyor…");
    try {
      await client.removeDir(`${remoteDir}/_next`);
    } catch {
      /* yoksa sorun değil */
    }

    step(`out/ → ${remoteDir} yükleniyor…`);
    await client.cd(remoteDir);
    client.trackProgress((info) => {
      if (info.type === "upload") process.stdout.write(`\r  ${info.name.padEnd(60).slice(0, 60)} ${(info.bytesOverall / 1024).toFixed(0)} KB`);
    });
    await client.uploadFromDir(OUT);
    client.trackProgress();
    console.log("\n  Yükleme tamamlandı.");
  } finally {
    client.close();
  }

  step(`Canlı kontrol: ${siteUrl}`);
  const localStamp = readFileSync(join(OUT, "index.html"), "utf8").match(/name="build-time" content="([^"]+)"/)?.[1];
  try {
    const res = await fetch(siteUrl, { redirect: "follow", cache: "no-store", headers: { "cache-control": "no-cache" } });
    const html = await res.text();
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "(başlık yok)";
    const liveStamp = html.match(/name="build-time" content="([^"]+)"/)?.[1];
    console.log(`  HTTP ${res.status} — ${title}`);
    if (localStamp && liveStamp === localStamp) console.log(`  Canlı derleme damgası eşleşti (${liveStamp}).`);
    else console.log(`  Uyarı: canlı damga ${liveStamp ?? "yok"}, yerel ${localStamp ?? "yok"} — CDN/önbellek olabilir, birkaç dakika sonra tekrar bakın.`);
  } catch (err) {
    console.log(`  Kontrol yapılamadı: ${err.message}`);
  }

  console.log("\n✔ Yayın tamam.");
}

main().catch((err) => {
  console.error("\n✖ Hata:", err.message);
  process.exit(1);
});
