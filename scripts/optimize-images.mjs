// Gerçek içerik görsellerini (public/images/ altındaki JPG/PNG/WebP dosyalarını)
// otomatik olarak makul bir boyuta küçültüp sıkıştıran bakım scripti.
//
// - Mimariyi bozmaz: dosya adı/uzantısı ve konumu değişmez, sadece dosyanın
//   kendisi güncellenir. content/*.md içindeki görsel yolları etkilenmez.
// - SVG placeholder'lara dokunmaz (sadece raster formatları işler).
// - Bir manifest dosyasında (public/images/.optimize-manifest.json) hangi
//   dosyaların hangi haliyle işlendiğini tutar; bu sayede script tekrar
//   çalıştırıldığında değişmemiş dosyalar tekrar sıkıştırılıp kalite
//   kaybetmez — sadece yeni eklenen/değişen dosyalar işlenir.
//
// Kullanım: node scripts/optimize-images.mjs
import { readdir, stat, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const IMAGES_DIR = fileURLToPath(new URL("../public/images/", import.meta.url));
// Manifest bilinçli olarak public/ DIŞINDA tutulur — aksi halde build'e dahil
// olup canlı sitede yayınlanır.
const MANIFEST_PATH = fileURLToPath(new URL("../.image-optimize-manifest.json", import.meta.url));

const MAX_DIMENSION = 2000; // px, uzun kenar
const SIZE_THRESHOLD_BYTES = 300 * 1024; // bu boyutun altında ve zaten küçükse dokunma
const JPEG_QUALITY = 82;
const WEBP_QUALITY = 82;
const PNG_COMPRESSION_LEVEL = 9;

const RASTER_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

async function loadManifest() {
  try {
    const raw = await readFile(MANIFEST_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function saveManifest(manifest) {
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf8");
}

async function collectRasterFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectRasterFiles(fullPath)));
    } else if (RASTER_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }
  return files;
}

async function optimizeImage(filePath) {
  const buffer = await readFile(filePath);
  const image = sharp(buffer, { failOn: "none" });
  const metadata = await image.metadata();
  const { width, height, format } = metadata;
  if (!width || !height) return null;

  const longerEdge = Math.max(width, height);
  const needsResize = longerEdge > MAX_DIMENSION;

  let pipeline = image;
  if (needsResize) {
    pipeline = pipeline.resize({
      width: width >= height ? MAX_DIMENSION : undefined,
      height: height > width ? MAX_DIMENSION : undefined,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  let output;
  if (format === "jpeg") {
    output = await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
  } else if (format === "png") {
    output = await pipeline.png({ compressionLevel: PNG_COMPRESSION_LEVEL }).toBuffer();
  } else if (format === "webp") {
    output = await pipeline.webp({ quality: WEBP_QUALITY }).toBuffer();
  } else {
    return null; // desteklenmeyen format, dokunma
  }

  return { output, width, height, longerEdge, needsResize };
}

async function main() {
  const manifest = await loadManifest();
  const files = await collectRasterFiles(IMAGES_DIR);

  let processed = 0;
  let skipped = 0;
  let savedBytes = 0;

  for (const filePath of files) {
    const relPath = path.relative(IMAGES_DIR, filePath).replace(/\\/g, "/");
    const fileStat = await stat(filePath);
    const previous = manifest[relPath];

    // Dosya son işlendiğinden beri değişmediyse ve zaten küçükse atla
    const alreadyProcessed =
      previous && previous.mtimeMs === fileStat.mtimeMs && previous.size === fileStat.size;
    const alreadySmallEnough = fileStat.size <= SIZE_THRESHOLD_BYTES;

    if (alreadyProcessed) {
      skipped++;
      continue;
    }
    if (alreadySmallEnough) {
      const meta = await sharp(await readFile(filePath)).metadata();
      if ((meta.width ?? 0) <= MAX_DIMENSION && (meta.height ?? 0) <= MAX_DIMENSION) {
        manifest[relPath] = { mtimeMs: fileStat.mtimeMs, size: fileStat.size };
        skipped++;
        continue;
      }
    }

    const result = await optimizeImage(filePath);
    if (!result) {
      skipped++;
      continue;
    }

    const before = fileStat.size;
    const after = result.output.length;

    // Yeniden kodlama dosyayı büyütüyorsa (nadir ama olabilir) orijinali koru
    if (after >= before && !result.needsResize) {
      manifest[relPath] = { mtimeMs: fileStat.mtimeMs, size: fileStat.size };
      skipped++;
      continue;
    }

    await writeFile(filePath, result.output);
    const newStat = await stat(filePath);
    manifest[relPath] = { mtimeMs: newStat.mtimeMs, size: newStat.size };

    savedBytes += before - after;
    processed++;
    console.log(
      `✓ ${relPath} — ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB` +
        (result.needsResize ? ` (${result.width}×${result.height} → maks ${MAX_DIMENSION}px)` : "")
    );
  }

  await saveManifest(manifest);

  console.log(
    `\n${processed} görsel optimize edildi, ${skipped} görsel zaten uygundu. ` +
      `Toplam kazanç: ${(savedBytes / 1024 / 1024).toFixed(2)}MB`
  );
}

main().catch((err) => {
  console.error("Görsel optimizasyonu başarısız oldu:", err);
  process.exitCode = 1;
});
