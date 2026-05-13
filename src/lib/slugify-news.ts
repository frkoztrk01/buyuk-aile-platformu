/**
 * URL-safe slug for news/events. Handles Turkish letters; never returns empty.
 */
export function slugifyNewsTitle(title: string): string {
  const lower = title.trim().toLocaleLowerCase('tr-TR');
  const tr: Record<string, string> = {
    ı: 'i',
    ğ: 'g',
    ü: 'u',
    ş: 's',
    ö: 'o',
    ç: 'c',
  };
  let out = '';
  for (const ch of lower) {
    out += tr[ch] ?? ch;
  }
  out = out
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!out) {
    out = `icerik-${Date.now().toString(36)}`;
  }
  return out;
}
