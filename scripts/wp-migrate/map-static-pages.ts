/**
 * Derive static-site payloads from WordPress `page` rows (phpMyAdmin JSON tables
 * or any source normalized to {@link WpJsonRow}).
 *
 * `about.content` is Markdown so it matches {@link src/lib/db/schema.ts} `about`
 * and {@link src/lib/utils/markdown.ts}.
 */

import {
  decodeHtmlEntities,
  extractAllImages,
  extractFirstBlockquote,
  extractFirstImage,
  extractMemberNames,
  extractYoutubeIds,
  stripWordpressBlockComments,
  canonicalYoutubeUrl,
} from './html-utils';
import { rewriteWpUploadUrls, type WpUploadUrlRewriteOptions } from './url-rewrite';
import { resolveMediaUrl } from './wp-media-url';
import type { WpJsonRow } from './wp-json-export';
import { getTable } from './wp-json-export';

export interface StaticPageSlugConfig {
  aboutPageSlug?: string;
  membersPageSlug?: string;
  foundersPageSlug?: string;
  mutabakatPageSlug?: string;
  /** Page that embeds YouTube content (e.g. yayınlar). */
  videosPageSlug?: string;
}

export interface MappedAboutInsert {
  heroImageUrl: string | null;
  heroQuote: string | null;
  heroQuoteSource: string | null;
  content: string;
}

export interface StaticPagesMappingResult {
  about: MappedAboutInsert | null;
  members: { names: string[]; pageSlug: string | null };
  founders: { logoUrls: string[]; pageSlug: string | null };
  mutabakat: { title: string; pdfUrl: string | null; pageSlug: string | null };
  videos: Array<{ title: string; youtubeUrl: string }>;
}

export interface MapStaticPagesOptions {
  tablePrefix?: string;
  urlRewrite?: WpUploadUrlRewriteOptions;
  mediaBaseUrl?: string;
  membersSplitBy?: 'li' | 'p' | 'line';
  /**
   * Default slugs when a field in {@link StaticPageSlugConfig} is omitted.
   */
  defaultSlugs?: Partial<StaticPageSlugConfig>;
}

function str(row: WpJsonRow, key: string): string {
  const v = row[key.toLowerCase()];
  return (v ?? '').trim();
}

function int(row: WpJsonRow, key: string): number {
  const v = row[key.toLowerCase()];
  if (v === null || v === '') return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function findPublishedPage(
  tables: Map<string, WpJsonRow[]>,
  tablePrefix: string,
  slug: string | undefined
): WpJsonRow | null {
  if (!slug?.trim()) return null;
  const posts = getTable(tables, tablePrefix, 'posts');
  const wanted = slug.trim().toLowerCase();
  const candidates = posts.filter(
    (r) =>
      str(r, 'post_type') === 'page' &&
      str(r, 'post_status') === 'publish' &&
      str(r, 'post_name').toLowerCase() === wanted
  );
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => int(b, 'ID') - int(a, 'ID'));
  return candidates[0];
}

function applyRewrite(s: string, opts: MapStaticPagesOptions): string {
  if (!opts.urlRewrite) return s;
  return rewriteWpUploadUrls(s, opts.urlRewrite);
}

/**
 * Convert typical WP page HTML to Markdown aligned with `markdownToHtml` capabilities.
 */
export function wpHtmlToMarkdown(html: string): string {
  let h = stripWordpressBlockComments(html);
  h = h.replace(/<style[\s\S]*?<\/style>/gi, '');
  h = h.replace(/<script[\s\S]*?<\/script>/gi, '');
  h = h.replace(/\r\n/g, '\n');

  function inlineToMd(fragment: string): string {
    let s = fragment;
    s = s.replace(/<br\s*\/?>/gi, '\n');
    s = s.replace(
      /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
      '[$2]($1)'
    );
    s = s.replace(/<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, '**$1**');
    s = s.replace(/<(?:em|i)[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, '*$1*');
    s = s.replace(/<[^>]+>/g, '');
    return decodeHtmlEntities(s).replace(/\s+\n/g, '\n').trim();
  }

  const blocks: string[] = [];
  const re =
    '<(h[1-3])[^>]*>([\\s\\S]*?)<\\/\\1>|<p[^>]*>([\\s\\S]*?)<\\/p>|<blockquote[^>]*>([\\s\\S]*?)<\\/blockquote>|<li[^>]*>([\\s\\S]*?)<\\/li>';

  let pos = 0;
  let m: RegExpExecArray | null;
  const globalRe = new RegExp(re, 'gi');
  while ((m = globalRe.exec(h)) !== null) {
    if (m.index > pos) {
      const gap = h.slice(pos, m.index).trim();
      if (gap) blocks.push(inlineToMd(gap));
    }
    if (m[1]) {
      const level = Number(m[1].slice(1));
      const hashes = '#'.repeat(Math.min(3, Math.max(1, level)));
      blocks.push(`${hashes} ${inlineToMd(m[2])}`);
    } else if (m[3] !== undefined) {
      const t = inlineToMd(m[3]);
      if (t) blocks.push(t);
    } else if (m[4] !== undefined) {
      const t = inlineToMd(m[4]);
      if (t) blocks.push(`> ${t.replace(/\n+/g, '\n> ')}`);
    } else if (m[5] !== undefined) {
      const t = inlineToMd(m[5]);
      if (t) blocks.push(`- ${t}`);
    }
    pos = m.index + m[0].length;
  }
  if (pos < h.length) {
    const tail = h.slice(pos).trim();
    if (tail) blocks.push(inlineToMd(tail));
  }

  let out = blocks.join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
  out = out.replace(/\*\*\s*\*\*/g, '');
  return out;
}

export function extractPdfUrlFromHtml(
  html: string,
  opts: MapStaticPagesOptions
): string | null {
  const iframe = html.match(/<iframe[^>]+src=["']([^"']*\.pdf[^"']*)["']/i);
  if (iframe?.[1]) return applyRewrite(iframe[1].trim(), opts);
  const embed = html.match(/<embed[^>]+src=["']([^"']*\.pdf[^"']*)["']/i);
  if (embed?.[1]) return applyRewrite(embed[1].trim(), opts);
  const href = html.match(/href=["']([^"']*\.pdf[^"']*)["']/i);
  if (href?.[1]) return applyRewrite(href[1].trim(), opts);
  return null;
}

export function mapAboutFromPageHtml(
  html: string,
  opts: MapStaticPagesOptions
): MappedAboutInsert {
  const clean = stripWordpressBlockComments(html).trim();
  const heroRaw = extractFirstImage(clean);
  const heroImageUrl = heroRaw
    ? resolveMediaUrl(heroRaw, opts.mediaBaseUrl) ?? applyRewrite(heroRaw, opts)
    : null;
  const heroQuote = extractFirstBlockquote(clean);
  const md = wpHtmlToMarkdown(applyRewrite(clean, opts));
  return {
    heroImageUrl,
    heroQuote,
    heroQuoteSource: null,
    content: md,
  };
}

function mergeSlug(
  cfg: StaticPageSlugConfig,
  key: keyof StaticPageSlugConfig,
  defaults?: Partial<StaticPageSlugConfig>
): string | undefined {
  const v = cfg[key] ?? defaults?.[key];
  return typeof v === 'string' ? v : undefined;
}

/**
 * Build inserts for about, members, founders, mutabakat, videos from WP tables.
 */
export function mapStaticPagesFromWpTables(
  tables: Map<string, WpJsonRow[]>,
  slugs: StaticPageSlugConfig,
  options: MapStaticPagesOptions = {}
): StaticPagesMappingResult {
  const prefix = options.tablePrefix ?? 'wpil_';
  const def = options.defaultSlugs ?? {};
  const splitBy = options.membersSplitBy ?? 'li';

  const aboutSlug = mergeSlug(slugs, 'aboutPageSlug', {
    ...def,
    aboutPageSlug: def.aboutPageSlug ?? 'hakkimizda',
  });
  const membersSlug = mergeSlug(slugs, 'membersPageSlug', def);
  const foundersSlug = mergeSlug(slugs, 'foundersPageSlug', def);
  const mutabakatSlug = mergeSlug(slugs, 'mutabakatPageSlug', def);
  const videosSlug = mergeSlug(slugs, 'videosPageSlug', def);

  const aboutRow = findPublishedPage(tables, prefix, aboutSlug);
  const about = aboutRow
    ? mapAboutFromPageHtml(str(aboutRow, 'post_content'), options)
    : null;

  const membersRow = findPublishedPage(tables, prefix, membersSlug);
  const members = {
    names: membersRow
      ? extractMemberNames(str(membersRow, 'post_content'), splitBy)
      : [],
    pageSlug: membersRow ? (membersSlug ?? null) : null,
  };

  const foundersRow = findPublishedPage(tables, prefix, foundersSlug);
  const rawLogos = foundersRow ? extractAllImages(str(foundersRow, 'post_content')) : [];
  const logoUrls: string[] = [];
  const seen = new Set<string>();
  for (const raw of rawLogos) {
    const resolved =
      resolveMediaUrl(raw, options.mediaBaseUrl) ?? applyRewrite(raw, options);
    if (seen.has(resolved)) continue;
    seen.add(resolved);
    logoUrls.push(resolved);
  }
  const founders = {
    logoUrls,
    pageSlug: foundersRow ? (foundersSlug ?? null) : null,
  };

  const mutRow = findPublishedPage(tables, prefix, mutabakatSlug);
  const mutabakat = {
    title: mutRow
      ? (str(mutRow, 'post_title') || 'Mutabakat Zaptı').slice(0, 500)
      : 'Mutabakat Zaptı',
    pdfUrl: mutRow ? extractPdfUrlFromHtml(str(mutRow, 'post_content'), options) : null,
    pageSlug: mutRow ? (mutabakatSlug ?? null) : null,
  };

  const videosRow = findPublishedPage(tables, prefix, videosSlug);
  const videos: Array<{ title: string; youtubeUrl: string }> = [];
  if (videosRow) {
    const html = str(videosRow, 'post_content');
    const ids = extractYoutubeIds(html);
    const baseTitle = str(videosRow, 'post_title') || 'Video';
    ids.forEach((id, i) => {
      videos.push({
        title: ids.length > 1 ? `${baseTitle} (${i + 1})` : baseTitle.slice(0, 500),
        youtubeUrl: canonicalYoutubeUrl(id),
      });
    });
  }

  return { about, members, founders, mutabakat, videos };
}

/**
 * Unique YouTube links from all published `post` / `page` rows (same idea as
 * {@link migrateVideos} in `extended-tables.ts`).
 */
export function collectYoutubeVideosFromWpTables(
  tables: Map<string, WpJsonRow[]>,
  options: { tablePrefix?: string; postTypes?: string[] } = {}
): Array<{ title: string; youtubeUrl: string; wpPostId: number }> {
  const prefix = options.tablePrefix ?? 'wpil_';
  const posts = getTable(tables, prefix, 'posts');
  const postTypes = new Set(
    (options.postTypes ?? ['post', 'page']).map((t) => t.toLowerCase())
  );
  const found = new Map<string, { title: string; wpPostId: number }>();
  let counter = 0;
  for (const row of posts) {
    if (str(row, 'post_status') !== 'publish') continue;
    if (!postTypes.has(str(row, 'post_type').toLowerCase())) continue;
    const html = str(row, 'post_content');
    if (!html) continue;
    const ids = extractYoutubeIds(html);
    if (ids.length === 0) continue;
    const titleBase = str(row, 'post_title').trim();
    const wpPostId = int(row, 'ID');
    for (const vid of ids) {
      if (found.has(vid)) continue;
      counter += 1;
      found.set(vid, {
        title: (titleBase || `Video ${counter}`).slice(0, 500),
        wpPostId,
      });
    }
  }
  return [...found.entries()].map(([videoId, meta]) => ({
    title: meta.title,
    youtubeUrl: canonicalYoutubeUrl(videoId),
    wpPostId: meta.wpPostId,
  }));
}
