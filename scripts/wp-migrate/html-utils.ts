/**
 * Shared HTML helpers for WordPress migrations (MySQL runner + JSON mappers).
 */

const YOUTUBE_RE =
  /https?:\/\/(?:www\.|m\.)?(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^"'\s<>]*&)?v=|embed\/|v\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;

export function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&lsquo;|&rsquo;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

export function stripWordpressBlockComments(html: string): string {
  return html.replace(/<!--\s*\/?wp:[^>]*-->/g, '');
}

export function stripHtmlToText(html: string): string {
  return decodeHtmlEntities(
    stripWordpressBlockComments(html)
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<[^>]+>/g, '')
  )
    .replace(/[ \t]+/g, ' ')
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function extractFirstImage(html: string | null | undefined): string | null {
  if (!html) return null;
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

export function extractAllImages(html: string | null | undefined): string[] {
  if (!html) return [];
  const re = /<img[^>]+src=["']([^"']+)["']/gi;
  const out: string[] = [];
  const seen = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const url = match[1];
    if (url && !seen.has(url)) {
      seen.add(url);
      out.push(url);
    }
  }
  return out;
}

export function extractFirstBlockquote(html: string | null | undefined): string | null {
  if (!html) return null;
  const match = html.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i);
  if (!match) return null;
  const text = stripHtmlToText(match[1]);
  return text || null;
}

export function extractYoutubeIds(html: string | null | undefined): string[] {
  if (!html) return [];
  const ids: string[] = [];
  const seen = new Set<string>();
  YOUTUBE_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = YOUTUBE_RE.exec(html)) !== null) {
    const id = match[1];
    if (id && !seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }
  return ids;
}

export function canonicalYoutubeUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function dedupeAndTrim(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of values) {
    const trimmed = raw.replace(/\s+/g, ' ').trim();
    if (!trimmed) continue;
    if (trimmed.length > 500) continue;
    if (seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}

export function extractMemberNames(html: string, splitBy: 'li' | 'p' | 'line'): string[] {
  const clean = stripWordpressBlockComments(html);
  if (splitBy === 'li') {
    const matches = [...clean.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
    if (matches.length > 0) {
      return dedupeAndTrim(matches.map((m) => stripHtmlToText(m[1])));
    }
  }
  if (splitBy === 'p' || splitBy === 'li') {
    const matches = [...clean.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
    if (matches.length > 0) {
      return dedupeAndTrim(matches.map((m) => stripHtmlToText(m[1])));
    }
  }
  return dedupeAndTrim(stripHtmlToText(clean).split(/\r?\n+/));
}
