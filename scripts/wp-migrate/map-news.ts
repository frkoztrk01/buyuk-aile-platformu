/**
 * Map WordPress `post` rows (+ terms + postmeta) to app `news` insert shapes.
 *
 * Category rules (plan):
 * - WP category slug `etkinlikler` (or configured list) → `Etkinlik`
 * - Optional announcement slugs / title regexes → `Duyuru`
 * - Otherwise → `Haber` (includes Haberler and Jet subcategories)
 */

import { slugifyNewsTitle } from '../../src/lib/slugify-news';
import { rewriteWpUploadUrls, type WpUploadUrlRewriteOptions } from './url-rewrite';
import type { WpJsonRow } from './wp-json-export';
import { getTable } from './wp-json-export';
import { resolveMediaUrl } from './wp-media-url';

export type AppNewsCategory = 'Duyuru' | 'Haber' | 'Etkinlik';

export interface MapNewsOptions {
  /** Default `wpil_` */
  tablePrefix?: string;
  /**
   * Category term slugs (case-insensitive) that map to `Etkinlik`.
   * Default: `['etkinlikler']`.
   */
  eventCategorySlugs?: string[];
  /** `post_name` values forced to `Duyuru`. */
  announcementPostSlugs?: string[];
  /** If any regex matches `post_title`, category becomes `Duyuru`. */
  announcementTitleRegex?: RegExp[];
  /** Rewrite `post_content` and featured image URLs. */
  urlRewrite?: WpUploadUrlRewriteOptions;
  /**
   * When resolving `_thumbnail_id` to a URL, base for relative `_wp_attached_file`
   * (same semantics as MySQL migrator `mediaBaseUrl`).
   */
  mediaBaseUrl?: string;
}

export interface MappedNewsRow {
  title: string;
  slug: string;
  content: string;
  imageUrl: string | null;
  category: AppNewsCategory;
  date: Date;
  isPublished: true;
  wpPostId: number;
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

function parseWpDate(raw: string): Date {
  const t = raw.trim();
  const d = new Date(t.replace(' ', 'T'));
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

export interface WpNewsIndexes {
  postsById: Map<number, WpJsonRow>;
  /** term_taxonomy_id → { termId, parentTermId, taxonomy } */
  termTaxonomyByTtid: Map<
    number,
    { termId: number; parentTermId: number; taxonomy: string }
  >;
  /** term_id → slug */
  termSlugById: Map<number, string>;
  /** post ID → category term_ids */
  categoryTermIdsByPostId: Map<number, number[]>;
  /** post ID → _thumbnail_id attachment id */
  thumbnailIdByPostId: Map<number, number>;
  /** attachment ID → best URL string (guid preferred) */
  attachmentUrlById: Map<number, string>;
  /** attachment ID → _wp_attached_file meta */
  attachedFileByAttachmentId: Map<number, string>;
}

function categoryParentTermId(termId: number, indexes: WpNewsIndexes): number | null {
  for (const tt of indexes.termTaxonomyByTtid.values()) {
    if (tt.termId === termId && tt.taxonomy === 'category') {
      const p = tt.parentTermId;
      return p && p !== 0 ? p : null;
    }
  }
  return null;
}

/** All category slugs for a term_id including ancestors (WP `parent` = parent term_id). */
function categorySlugClosure(termId: number, indexes: WpNewsIndexes): Set<string> {
  const slugs = new Set<string>();
  let current: number | null = termId;
  const guard = new Set<number>();
  while (current && !guard.has(current)) {
    guard.add(current);
    const slug = indexes.termSlugById.get(current);
    if (slug) slugs.add(slug);
    current = categoryParentTermId(current, indexes);
  }
  return slugs;
}

export function buildWpNewsIndexes(
  tables: Map<string, WpJsonRow[]>,
  tablePrefix = 'wpil_'
): WpNewsIndexes {
  const posts = getTable(tables, tablePrefix, 'posts');
  const terms = getTable(tables, tablePrefix, 'terms');
  const termTaxonomy = getTable(tables, tablePrefix, 'term_taxonomy');
  const termRelationships = getTable(tables, tablePrefix, 'term_relationships');
  const postmeta = getTable(tables, tablePrefix, 'postmeta');

  const postsById = new Map<number, WpJsonRow>();
  for (const row of posts) {
    const id = int(row, 'ID');
    if (id) postsById.set(id, row);
  }

  const termSlugById = new Map<number, string>();
  for (const row of terms) {
    const tid = int(row, 'term_id');
    if (!tid) continue;
    termSlugById.set(tid, str(row, 'slug').toLowerCase());
  }

  const termTaxonomyByTtid = new Map<
    number,
    { termId: number; parentTermId: number; taxonomy: string }
  >();
  for (const row of termTaxonomy) {
    const ttid = int(row, 'term_taxonomy_id');
    if (!ttid) continue;
    termTaxonomyByTtid.set(ttid, {
      termId: int(row, 'term_id'),
      parentTermId: int(row, 'parent'),
      taxonomy: str(row, 'taxonomy').toLowerCase(),
    });
  }

  const categoryTermIdsByPostId = new Map<number, number[]>();
  for (const row of termRelationships) {
    const objectId = int(row, 'object_id');
    const ttid = int(row, 'term_taxonomy_id');
    if (!objectId || !ttid) continue;
    const tt = termTaxonomyByTtid.get(ttid);
    if (!tt || tt.taxonomy !== 'category') continue;
    const list = categoryTermIdsByPostId.get(objectId) ?? [];
    list.push(tt.termId);
    categoryTermIdsByPostId.set(objectId, list);
  }

  const thumbnailIdByPostId = new Map<number, number>();
  for (const row of postmeta) {
    if (str(row, 'meta_key') !== '_thumbnail_id') continue;
    const pid = int(row, 'post_id');
    const aid = int(row, 'meta_value');
    if (pid && aid) thumbnailIdByPostId.set(pid, aid);
  }

  const attachedFileByAttachmentId = new Map<number, string>();
  for (const row of postmeta) {
    if (str(row, 'meta_key') !== '_wp_attached_file') continue;
    const pid = int(row, 'post_id');
    const path = str(row, 'meta_value');
    if (pid && path) attachedFileByAttachmentId.set(pid, path);
  }

  const attachmentUrlById = new Map<number, string>();
  for (const row of posts) {
    if (str(row, 'post_type') !== 'attachment') continue;
    const id = int(row, 'ID');
    if (!id) continue;
    const guid = str(row, 'guid');
    if (guid) attachmentUrlById.set(id, guid);
  }

  return {
    postsById,
    termTaxonomyByTtid,
    termSlugById,
    categoryTermIdsByPostId,
    thumbnailIdByPostId,
    attachmentUrlById,
    attachedFileByAttachmentId,
  };
}

export function resolveNewsCategory(
  wpPostId: number,
  postName: string,
  postTitle: string,
  indexes: WpNewsIndexes,
  opts: MapNewsOptions
): AppNewsCategory {
  const eventSlugs = (opts.eventCategorySlugs ?? ['etkinlikler']).map((s) =>
    s.trim().toLowerCase()
  ).filter(Boolean);
  const announceSlugs = (opts.announcementPostSlugs ?? []).map((s) =>
    s.trim().toLowerCase()
  );

  const termIds = indexes.categoryTermIdsByPostId.get(wpPostId) ?? [];
  const allSlugs = new Set<string>();
  for (const tid of termIds) {
    for (const s of categorySlugClosure(tid, indexes)) {
      allSlugs.add(s);
    }
  }

  for (const ev of eventSlugs) {
    if (allSlugs.has(ev)) return 'Etkinlik';
  }

  const name = postName.trim().toLowerCase();
  if (name && announceSlugs.includes(name)) return 'Duyuru';

  for (const re of opts.announcementTitleRegex ?? []) {
    if (re.test(postTitle)) return 'Duyuru';
  }

  return 'Haber';
}

function resolveFeaturedImageUrl(
  wpPostId: number,
  indexes: WpNewsIndexes,
  mediaBaseUrl: string | undefined,
  urlRewrite: WpUploadUrlRewriteOptions | undefined
): string | null {
  const aid = indexes.thumbnailIdByPostId.get(wpPostId);
  if (!aid) return null;
  const guid = indexes.attachmentUrlById.get(aid);
  const file = indexes.attachedFileByAttachmentId.get(aid);
  const fromGuid = guid && guid.trim() ? guid.trim() : null;
  const fromFile = file
    ? resolveMediaUrl(file, mediaBaseUrl) ?? (mediaBaseUrl ? null : file)
    : null;
  const raw = fromGuid ?? fromFile;
  if (!raw) return null;
  return urlRewrite ? rewriteWpUploadUrls(raw, urlRewrite) : raw;
}

function uniqueSlug(base: string, used: Set<string>): string {
  let s = base || 'haber';
  let n = 2;
  while (used.has(s)) {
    s = `${base}-${n}`;
    n += 1;
  }
  used.add(s);
  return s;
}

/**
 * Map published WordPress posts to `news` rows.
 */
export function mapPublishedPostsToNews(
  indexes: WpNewsIndexes,
  options: MapNewsOptions = {}
): MappedNewsRow[] {
  const urlRewrite = options.urlRewrite;
  const usedSlugs = new Set<string>();
  const out: MappedNewsRow[] = [];

  for (const row of indexes.postsById.values()) {
    if (str(row, 'post_type') !== 'post') continue;
    if (str(row, 'post_status') !== 'publish') continue;

    const wpPostId = int(row, 'ID');
    if (!wpPostId) continue;

    const title = str(row, 'post_title') || 'Baslıksız';
    let slug = str(row, 'post_name').toLowerCase();
    if (!slug) slug = slugifyNewsTitle(title);
    slug = uniqueSlug(slug, usedSlugs);

    let content = str(row, 'post_content');
    if (urlRewrite) content = rewriteWpUploadUrls(content, urlRewrite);

    const imageUrl = resolveFeaturedImageUrl(
      wpPostId,
      indexes,
      options.mediaBaseUrl,
      urlRewrite
    );

    const category = resolveNewsCategory(
      wpPostId,
      str(row, 'post_name'),
      title,
      indexes,
      options
    );

    const date = parseWpDate(str(row, 'post_date') || str(row, 'post_date_gmt'));

    out.push({
      title: title.slice(0, 2000),
      slug,
      content,
      imageUrl,
      category,
      date,
      isPublished: true,
      wpPostId,
    });
  }

  out.sort((a, b) => b.date.getTime() - a.date.getTime());
  return out;
}

/**
 * Convenience: tables map → indexes → mapped news.
 */
export function mapNewsFromPhpMyAdminTables(
  tables: Map<string, WpJsonRow[]>,
  options: MapNewsOptions = {}
): MappedNewsRow[] {
  const prefix = options.tablePrefix ?? 'wpil_';
  const indexes = buildWpNewsIndexes(tables, prefix);
  return mapPublishedPostsToNews(indexes, options);
}
