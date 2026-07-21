import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// ---------------------------------------------------------------------------
// İçerik koleksiyonları — her koleksiyon ileride Decap CMS'te birebir aynı
// alan adları ve tipleriyle bir "collection" tanımına dönüştürülecek şekilde
// tasarlandı. Kayıtlar src/content/<koleksiyon>/*.md dosyalarıdır.
// ---------------------------------------------------------------------------

const gridSize = z.enum(["small", "medium", "large"]);

const ugcCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/ugc" }),
  schema: z.object({
    title: z.string(),
    brand: z.string(),
    description: z.string(),
    instagramUrl: z.string().url(),
    thumbnail: z.string(),
    // Kendi barındırdığımız (R2 vb.) video dosyasının linki — doluysa detay
    // sayfasında Instagram embed'i yerine native video player kullanılır.
    videoUrl: z.string().url().optional(),
    size: gridSize,
  }),
});

// AI içerikleri tekil görsel değil, kategori (örn. "Takı İçerikleri") olarak
// tutulur — her kategori kendi üretilen görsellerinden oluşan bir koleksiyona
// sahiptir. images[0] kapak/öne çıkan görsel olarak kullanılır.
const aiContentCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/ai-content" }),
  schema: z.object({
    title: z.string(),
    promptSummary: z.string(),
    images: z.array(z.string()).min(1),
    size: gridSize,
  }),
});

const collabsCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/collabs" }),
  schema: z.object({
    brand: z.string(),
    year: z.number(),
    logo: z.string(),
    summary: z.string(),
    gallery: z.array(z.string()).default([]),
    instagramPosts: z.array(z.string().url()).default([]),
  }),
});

export const collections = {
  ugc: ugcCollection,
  "ai-content": aiContentCollection,
  collabs: collabsCollection,
};
