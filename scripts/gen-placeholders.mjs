// Bir kerelik yardımcı script: placeholder SVG görselleri üretir.
// Proje çalışma zamanında kullanılmaz, sadece içerik iskeletini doldurmak içindir.
import { mkdirSync, writeFileSync } from "node:fs";

const outDir = new URL("../public/images/placeholders/", import.meta.url);
mkdirSync(outDir, { recursive: true });

const palette = [
  ["#16281E", "#8FBC94"],
  ["#1C3227", "#B7D9BA"],
  ["#0F1F17", "#D4B483"],
  ["#16281E", "#D4B483"],
  ["#1C3227", "#8FBC94"],
];

const dims = {
  reel: { w: 540, h: 960 },
  square: { w: 720, h: 720 },
  wide: { w: 800, h: 500 },
};

function svg({ w, h, bg, fg, label, sub }) {
  const cx = w / 2;
  const cy = h / 2;
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="${w}" y2="${h}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${bg}"/>
      <stop offset="1" stop-color="#0F1F17"/>
    </linearGradient>
    <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect width="${w}" height="${h}" filter="url(#n)" opacity="0.05"/>
  <circle cx="${cx}" cy="${cy - h * 0.06}" r="${Math.min(w, h) * 0.14}" fill="none" stroke="${fg}" stroke-width="2" opacity="0.55"/>
  <text x="${cx}" y="${cy + h * 0.02}" text-anchor="middle" font-family="monospace" font-size="${Math.max(14, w * 0.032)}" fill="${fg}" letter-spacing="2">${label}</text>
  <text x="${cx}" y="${cy + h * 0.08}" text-anchor="middle" font-family="monospace" font-size="${Math.max(11, w * 0.022)}" fill="${fg}" opacity="0.7" letter-spacing="3">PLACEHOLDER</text>
  <text x="${cx}" y="${h - 24}" text-anchor="middle" font-family="monospace" font-size="${Math.max(10, w * 0.018)}" fill="${fg}" opacity="0.5">${sub}</text>
</svg>`;
}

let count = 0;
function write(name, variant, idx, sub) {
  const [bg, fg] = palette[idx % palette.length];
  const { w, h } = dims[variant];
  const content = svg({ w, h, bg, fg, label: name.toUpperCase(), sub });
  writeFileSync(new URL(`${name}.svg`, outDir), content, "utf8");
  count++;
}

// UGC — reel oranı
for (let i = 1; i <= 9; i++) {
  write(`ugc-${String(i).padStart(2, "0")}`, "reel", i, `9:16 · UGC #${i}`);
}

// AI içerikleri — kategori başına birden fazla üretilmiş görsel, kare oran
const aiCategories = [
  { slug: "taki-icerikleri", count: 4 },
  { slug: "portre-calismalari", count: 3 },
  { slug: "mekan-urun-sahneleri", count: 4 },
];
for (const cat of aiCategories) {
  for (let i = 1; i <= cat.count; i++) {
    write(`${cat.slug}-${i}`, "square", i, `1:1 · Görsel #${i}`);
  }
}

// Hero öne çıkan içerik — reel
write("hero-reel", "reel", 0, "9:16 · Öne Çıkan");

// Avatar — kare
write("avatar-square", "square", 2, "1:1 · Avatar");

// Marka logoları — wide
for (let i = 1; i <= 6; i++) {
  write(`brand-logo-${i}`, "wide", i, `Marka Logosu ${i}`);
}

// Vaka çalışması galeri görselleri — kare (iş birliği detay sayfaları için)
for (let i = 1; i <= 6; i++) {
  write(`case-${String(i).padStart(2, "0")}`, "square", i, `Vaka Görseli #${i}`);
}

console.log(`${count} placeholder SVG üretildi -> ${outDir.pathname}`);
