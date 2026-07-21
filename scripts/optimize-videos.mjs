// Ham (telefon kamerasından gelen, büyük) UGC videolarını web için makul bir
// boyuta sıkıştıran bakım scripti. Videolar git deposunda TUTULMAZ — bu script
// sadece yerel bir "ham video → sıkıştırılmış video" dönüşümü yapar; çıktıyı
// siz (ya da ben) manuel olarak Cloudflare R2 bucket'ına yüklersiniz, sonra
// oradan aldığınız public URL'i içerik dosyasındaki `videoUrl` alanına
// yazarsınız.
//
// Kullanım:
//   1) Ham video dosyalarını videos-raw/ klasörüne koyun
//   2) node scripts/optimize-videos.mjs  (veya: npm run compress-videos)
//   3) Sıkıştırılmış dosyalar videos-compressed/ klasöründe oluşur
//   4) Bu dosyaları R2 bucket'ına yükleyip aldığınız linki content dosyasına ekleyin
//
// Gereksinim: sistemde ffmpeg ve ffprobe kurulu olmalı.
import { readdir, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);

const RAW_DIR = fileURLToPath(new URL("../videos-raw/", import.meta.url));
const OUT_DIR = fileURLToPath(new URL("../videos-compressed/", import.meta.url));

const MAX_DIMENSION = 1280; // px, uzun kenar — web için yeterli, dosyayı küçük tutar
const CRF = 27; // düşük = yüksek kalite/büyük dosya, yüksek = daha sıkıştırılmış
const VIDEO_EXTENSIONS = new Set([".mp4", ".mov", ".m4v", ".webm"]);

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

async function getVideoDimensions(filePath) {
  const { stdout } = await run("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height",
    "-of",
    "csv=s=x:p=0",
    filePath,
  ]);
  const [width, height] = stdout.trim().split("x").map(Number);
  return { width, height };
}

async function compressVideo(inputPath, outputPath) {
  const { width, height } = await getVideoDimensions(inputPath);
  const longerEdge = Math.max(width, height);

  const args = ["-y", "-i", inputPath];

  if (longerEdge > MAX_DIMENSION) {
    const scaleFilter =
      width >= height ? `scale=${MAX_DIMENSION}:-2` : `scale=-2:${MAX_DIMENSION}`;
    args.push("-vf", scaleFilter);
  }

  args.push(
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    String(CRF),
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-movflags",
    "+faststart",
    outputPath
  );

  await run("ffmpeg", args);
}

async function main() {
  await ensureDir(RAW_DIR);
  await ensureDir(OUT_DIR);

  const entries = await readdir(RAW_DIR, { withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile() && VIDEO_EXTENSIONS.has(path.extname(e.name).toLowerCase()))
    .map((e) => e.name);

  if (files.length === 0) {
    console.log(`İşlenecek video bulunamadı. Ham videoları şu klasöre koyun:\n${RAW_DIR}`);
    return;
  }

  for (const file of files) {
    const inputPath = path.join(RAW_DIR, file);
    const outputName = `${path.parse(file).name}.mp4`;
    const outputPath = path.join(OUT_DIR, outputName);

    const before = (await stat(inputPath)).size;
    console.log(`→ ${file} sıkıştırılıyor...`);

    try {
      await compressVideo(inputPath, outputPath);
    } catch (err) {
      console.error(`✗ ${file} sıkıştırılamadı:`, err.message);
      continue;
    }

    const after = (await stat(outputPath)).size;
    console.log(
      `✓ ${file} → ${outputName} — ${(before / 1024 / 1024).toFixed(1)}MB → ${(after / 1024 / 1024).toFixed(1)}MB`
    );
  }

  console.log(`\nSıkıştırılmış videolar burada:\n${OUT_DIR}`);
  console.log("Bu dosyaları Cloudflare R2 bucket'ınıza yükleyip aldığınız public linki");
  console.log("ilgili içerik dosyasındaki `videoUrl` alanına ekleyin.");
}

main().catch((err) => {
  console.error("Video sıkıştırma başarısız oldu:", err);
  process.exitCode = 1;
});
