// config/site.ts içindeki başlıklarda *bu şekilde* işaretlenen kısımları
// <em> ile italik/vurgulu render etmek için basit bir yardımcı.
export function renderEmphasis(input: string): string {
  return input.replace(/\*(.+?)\*/g, "<em>$1</em>");
}
