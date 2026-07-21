// ---------------------------------------------------------------------------
// KİŞİYE ÖZEL VERİ KATMANI
// ---------------------------------------------------------------------------
// Bu dosya, sitenin şablon (template) olarak yeniden kullanılabilmesi için
// TÜM kişiye özel bilgilerin tutulduğu tek yerdir. Yeni bir içerik üreticisi
// için siteyi özelleştirirken component/sayfa kodlarına DOKUNMADAN sadece
// bu dosyayı (ve src/content/* verilerini) değiştirmek yeterli olmalıdır.
//
// [PLACEHOLDER] etiketli alanlar örnek/yer tutucu veridir, gerçek içerikle
// değiştirilmelidir.
// ---------------------------------------------------------------------------

export const person = {
  name: "Dilara Demirci", // [PLACEHOLDER]
  role: "UGC İçerik Üreticisi & AI Sanatçısı", // [PLACEHOLDER]
  location: "İstanbul, Türkiye", // [PLACEHOLDER]
  email: "ugcdilara1@gmail.com",
  avatar: "/images/real/avatar.webp",
};

export const seo = {
  title: `${person.name} — ${person.role}`,
  description:
    "Markalar için özgün UGC videoları ve AI görselleri üreten içerik yaratıcısı Dilara Demirci'nin portfolyosu.", // [PLACEHOLDER]
  siteUrl: "https://dilarademirci.example.com", // [PLACEHOLDER]
};

export const hero = {
  eyebrow: "UGC & AI İçerik Üreticisi", // [PLACEHOLDER]
  title: "Markanız için hikaye anlatan içerikler *üretiyorum*.", // [PLACEHOLDER] — * ile çevrili kısım italik/vurgu render edilir
  shortBio:
    "Instagram ve TikTok için samimi UGC videoları, AI ile üretilmiş görsel kampanyalar ve markalarla uzun soluklu iş birlikleri.", // [PLACEHOLDER]
  ctaLabel: "İş Birliği Teklif Et", // [PLACEHOLDER]
  ctaHref: "/iletisim",
};

export const about = {
  shortBio:
    "İstanbul merkezli, markalarla organik ve dönüşüm odaklı içerikler üreten bir UGC yaratıcısı ve AI görsel sanatçısıyım.", // [PLACEHOLDER]
  longBio: [
    "Merhaba, ben Dilara! Üç yıldır UGC (kullanıcı üretimi içerik) formatında markalar için kısa video içerikler üretiyorum. Amacım; reklam gibi hissettirmeyen, gerçek ve samimi anlar yaratmak.", // [PLACEHOLDER]
    "Son bir yıldır bu üretim sürecime AI görsel araçlarını da dahil ettim — kampanya görselleri, moodboard'lar ve sosyal medya için özgün AI sanat çalışmaları üretiyorum.", // [PLACEHOLDER]
    "Kozmetik, moda, ev yaşam ve teknoloji kategorilerinde onlarca markayla çalıştım. Her iş birliğinde markanın sesini koruyarak, izleyiciyle gerçek bir bağ kuran içerikler tasarlıyorum.", // [PLACEHOLDER]
  ],
  skills: [
    "UGC Video Prodüksiyonu",
    "Senaryo & Hook Yazımı",
    "AI Görsel Üretimi (Midjourney, Runway)",
    "Kurgu & Renk Düzenleme",
    "Marka İş Birliği Yönetimi",
    "Sosyal Medya İçerik Stratejisi",
  ], // [PLACEHOLDER]
};

export type SocialLink = {
  label: string;
  href: string;
  handle: string;
};

export const socialLinks: SocialLink[] = [
  { label: "Instagram", href: "https://www.instagram.com/diloscreations/", handle: "@diloscreations" },
  { label: "TikTok", href: "https://www.tiktok.com/@dilarai.digital", handle: "@dilarai.digital" },
  { label: "E-posta", href: "mailto:ugcdilara1@gmail.com", handle: "ugcdilara1@gmail.com" },
];

export const nav = [
  { label: "Anasayfa", href: "/" },
  { label: "Hakkımda", href: "/hakkimda" },
  { label: "UGC İçerikleri", href: "/ugc" },
  { label: "AI İçerikleri", href: "/ai-icerikleri" },
  { label: "İş Birlikleri", href: "/is-birlikleri" },
  { label: "İletişim", href: "/iletisim" },
];

export const contact = {
  intro:
    "Bir iş birliği fikrini konuşmak, teklif iletmek ya da sadece merhaba demek için aşağıdaki kanallardan bana ulaşabilirsiniz.", // [PLACEHOLDER]
};
