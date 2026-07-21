// Sıkıştırılmış bir video dosyasını Vercel Blob'a yükler ve herkese açık
// linkini yazdırır. `.env` dosyasındaki BLOB_READ_WRITE_TOKEN gerekir
// (bu dosya git'e dahil edilmez).
//
// Kullanım: node scripts/upload-video.mjs videos-compressed/dosya-adi.mp4
import { readFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

const filePath = process.argv[2];

if (!filePath) {
  console.error("Kullanım: node scripts/upload-video.mjs <dosya-yolu>");
  process.exit(1);
}

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error("BLOB_READ_WRITE_TOKEN tanımlı değil. .env dosyasını kontrol edin.");
  process.exit(1);
}

const fileName = path.basename(filePath);
const buffer = await readFile(filePath);

const blob = await put(fileName, buffer, {
  access: "public",
  addRandomSuffix: false,
  token: process.env.BLOB_READ_WRITE_TOKEN,
});

console.log(`✓ Yüklendi: ${fileName}`);
console.log(`Public URL: ${blob.url}`);
