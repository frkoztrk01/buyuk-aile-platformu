/**
 * WordPress → PostgreSQL: extended tables migration.
 *
 * Covers `about`, `videos`, `mutabakat`, `members`, and `founders` content.
 * The `news` migration lives elsewhere (companion script in this directory).
 *
 * Each `migrate*` function is independent and safe to call in any order. They
 * all share a {@link MigrationSummary} return type so the orchestrator can
 * aggregate results uniformly.
 *
 * Idempotency strategy
 * --------------------
 * - `about` / `mutabakat`: single-row tables, upsert (UPDATE if present, else INSERT).
 * - `videos`: dedupe within the run by canonical YouTube URL, then skip
 *   URLs that already exist in PostgreSQL.
 * - `members` / `founders`: many-row tables without a natural unique key.
 *   Re-running stacks duplicates unless `truncate` is true. We also
 *   defensively skip values already present in PostgreSQL.
 *
 * Security
 * --------
 * MySQL identifiers cannot be parameterised. `tablePrefix` is therefore
 * validated against a strict allow-list before interpolation.
 */

import type { Pool as MysqlPool, RowDataPacket } from 'mysql2/promise';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, sql } from 'drizzle-orm';

import * as schema from '../../src/lib/db/schema';
import {
  extractAllImages,
  extractFirstBlockquote,
  extractFirstImage,
  extractMemberNames,
  extractYoutubeIds,
  stripWordpressBlockComments,
  canonicalYoutubeUrl,
} from './html-utils';
import { resolveMediaUrl } from './wp-media-url';

export type Db = NodePgDatabase<typeof schema>;

/** Shared options for every extended-table migration. */
export interface ExtendedMigrationBase {
  mysql: MysqlPool;
  db: Db;
  /** WordPress table prefix (default `wpil_`). Must match `^[a-z0-9_]+$`. */
  tablePrefix?: string;
  /**
   * Base URL for relative WordPress media paths (no trailing slash).
   * E.g. `https://www.buyukaileplatformu.org`. When omitted, relative
   * `_wp_attached_file` values are skipped.
   */
  mediaBaseUrl?: string;
  /** When true, no writes happen; only logs and counts. */
  dryRun?: boolean;
  /**
   * When true, the destination table is cleared before insert. Ignored for
   * single-row tables (`about`, `mutabakat`), which always upsert.
   */
  truncate?: boolean;
  logger?: (msg: string) => void;
}

export interface AboutMigrationOptions extends ExtendedMigrationBase {
  /** WordPress page slug (post_name). Default: `hakkimizda`. */
  pageSlug?: string;
}

export interface VideosMigrationOptions extends ExtendedMigrationBase {
  /** WP post_types to scan for YouTube URLs. Default: `['post', 'page']`. */
  postTypes?: string[];
}

export interface MutabakatMigrationOptions extends ExtendedMigrationBase {
  /**
   * Case-insensitive substring required in `post_title` for an attachment
   * to qualify. Default: `mutabakat`. Pass an empty string to accept any
   * PDF attachment.
   */
  titleContains?: string;
}

export interface MembersMigrationOptions extends ExtendedMigrationBase {
  /**
   * WordPress page slug (post_name) that contains member names. When
   * omitted, the migration is skipped entirely.
   */
  pageSlug?: string;
  /**
   * How to split the page content into individual member rows.
   * - `li`: one row per `<li>` (preferred, default).
   * - `p`: one row per `<p>`.
   * - `line`: one row per non-empty stripped line.
   */
  splitBy?: 'li' | 'p' | 'line';
}

export interface FoundersMigrationOptions extends ExtendedMigrationBase {
  /**
   * WordPress page slug (post_name) whose `<img>` tags should be imported
   * as founder logos. When omitted, the migration is skipped.
   */
  pageSlug?: string;
}

export interface MigrationSummary {
  table: string;
  inserted: number;
  updated: number;
  skipped: number;
  notes: string[];
}

const DEFAULT_PREFIX = 'wpil_';
const TABLE_PREFIX_RE = /^[a-z0-9_]+$/;

function ensurePrefix(prefix: string | undefined): string {
  const value = prefix ?? DEFAULT_PREFIX;
  if (!TABLE_PREFIX_RE.test(value)) {
    throw new Error(
      `Refusing to interpolate unsafe MySQL table prefix: ${JSON.stringify(value)}`
    );
  }
  return value;
}

function defaultLogger(msg: string): void {
  console.log(msg);
}

function makeSummary(table: string): MigrationSummary {
  return { table, inserted: 0, updated: 0, skipped: 0, notes: [] };
}

interface WpPostRow extends RowDataPacket {
  ID: number;
  post_title: string | null;
  post_content: string | null;
  post_name: string | null;
  post_status: string | null;
  post_type: string | null;
  post_mime_type: string | null;
  guid: string | null;
}

/* ---------------------------------------------------------------------- */
/* about                                                                  */
/* ---------------------------------------------------------------------- */

export async function migrateAbout(
  opts: AboutMigrationOptions
): Promise<MigrationSummary> {
  const summary = makeSummary('about');
  const log = opts.logger ?? defaultLogger;
  const prefix = ensurePrefix(opts.tablePrefix);
  const slug = (opts.pageSlug ?? 'hakkimizda').trim();

  if (!slug) {
    summary.notes.push('pageSlug bos; about taşıma atlandı.');
    summary.skipped = 1;
    return summary;
  }

  const [rows] = await opts.mysql.execute<WpPostRow[]>(
    `SELECT ID, post_title, post_content, post_name, post_status, post_type
       FROM \`${prefix}posts\`
      WHERE post_type = 'page'
        AND post_name = ?
        AND post_status IN ('publish', 'private', 'inherit')
      ORDER BY (post_status = 'publish') DESC, post_modified DESC
      LIMIT 1`,
    [slug]
  );

  if (rows.length === 0) {
    summary.notes.push(`WP'de '${slug}' slug'lı yayında about sayfası yok.`);
    summary.skipped = 1;
    return summary;
  }

  const page = rows[0];
  const rawContent = page.post_content ?? '';
  const content = stripWordpressBlockComments(rawContent).trim();

  if (!content) {
    summary.notes.push(`WP about sayfası ('${slug}') içeriği boş; atlandı.`);
    summary.skipped = 1;
    return summary;
  }

  const heroImageRaw = extractFirstImage(content);
  const heroImageUrl = heroImageRaw
    ? resolveMediaUrl(heroImageRaw, opts.mediaBaseUrl) ?? heroImageRaw
    : null;
  const heroQuote = extractFirstBlockquote(content);

  log(
    `[about] '${slug}' bulundu (ID=${page.ID}, ${content.length} chars). ` +
      `heroImage=${heroImageUrl ? 'var' : 'yok'}, heroQuote=${heroQuote ? 'var' : 'yok'}.`
  );

  if (opts.dryRun) {
    summary.notes.push('dry-run: yazma atlandı');
    summary.skipped = 1;
    return summary;
  }

  const [existing] = await opts.db.select().from(schema.about).limit(1);

  if (existing) {
    await opts.db
      .update(schema.about)
      .set({
        heroImageUrl,
        heroQuote,
        content,
        updatedAt: new Date(),
      })
      .where(eq(schema.about.id, existing.id));
    summary.updated = 1;
    return summary;
  }

  await opts.db.insert(schema.about).values({
    heroImageUrl,
    heroQuote,
    heroQuoteSource: null,
    content,
  });
  summary.inserted = 1;
  return summary;
}

/* ---------------------------------------------------------------------- */
/* videos                                                                 */
/* ---------------------------------------------------------------------- */

interface PostContentRow extends RowDataPacket {
  ID: number;
  post_title: string | null;
  post_content: string | null;
}

export async function migrateVideos(
  opts: VideosMigrationOptions
): Promise<MigrationSummary> {
  const summary = makeSummary('videos');
  const log = opts.logger ?? defaultLogger;
  const prefix = ensurePrefix(opts.tablePrefix);
  const postTypes = opts.postTypes && opts.postTypes.length > 0
    ? opts.postTypes
    : ['post', 'page'];

  const placeholders = postTypes.map(() => '?').join(', ');
  const [rows] = await opts.mysql.execute<PostContentRow[]>(
    `SELECT ID, post_title, post_content
       FROM \`${prefix}posts\`
      WHERE post_status = 'publish'
        AND post_type IN (${placeholders})
        AND post_content IS NOT NULL
        AND post_content <> ''
      ORDER BY post_date DESC`,
    postTypes
  );

  // videoId -> { title, postId }
  const found = new Map<string, { title: string; postId: number }>();
  let counter = 0;
  for (const row of rows) {
    const ids = extractYoutubeIds(row.post_content);
    for (const id of ids) {
      if (found.has(id)) continue;
      counter += 1;
      const title =
        (row.post_title && row.post_title.trim()) || `Video ${counter}`;
      found.set(id, { title, postId: row.ID });
    }
  }

  log(
    `[videos] ${rows.length} yayın taraması: ${found.size} benzersiz YouTube videosu.`
  );

  if (found.size === 0) {
    summary.notes.push('YouTube videosu bulunamadı.');
    return summary;
  }

  if (opts.dryRun) {
    summary.notes.push(`dry-run: ${found.size} video bekliyor.`);
    summary.skipped = found.size;
    return summary;
  }

  if (opts.truncate) {
    await opts.db.execute(sql`TRUNCATE TABLE ${schema.videos} RESTART IDENTITY`);
    log('[videos] hedef tablo temizlendi (--truncate)');
  }

  const existing = await opts.db
    .select({ youtubeUrl: schema.videos.youtubeUrl })
    .from(schema.videos);
  const existingUrls = new Set(existing.map((row) => row.youtubeUrl));

  const inserts: Array<{ title: string; youtubeUrl: string }> = [];
  for (const [videoId, meta] of found) {
    const url = canonicalYoutubeUrl(videoId);
    if (existingUrls.has(url)) {
      summary.skipped += 1;
      continue;
    }
    inserts.push({ title: meta.title.slice(0, 500), youtubeUrl: url });
  }

  if (inserts.length > 0) {
    await opts.db.insert(schema.videos).values(inserts);
    summary.inserted = inserts.length;
  }
  return summary;
}

/* ---------------------------------------------------------------------- */
/* mutabakat                                                              */
/* ---------------------------------------------------------------------- */

interface PdfAttachmentRow extends RowDataPacket {
  ID: number;
  post_title: string | null;
  guid: string | null;
  attached_file: string | null;
}

export async function migrateMutabakat(
  opts: MutabakatMigrationOptions
): Promise<MigrationSummary> {
  const summary = makeSummary('mutabakat');
  const log = opts.logger ?? defaultLogger;
  const prefix = ensurePrefix(opts.tablePrefix);
  const titleFilter = (opts.titleContains ?? 'mutabakat').trim();

  const titleClause = titleFilter ? 'AND p.post_title LIKE ?' : '';
  const titleArg = titleFilter ? [`%${titleFilter}%`] : [];

  const [rows] = await opts.mysql.execute<PdfAttachmentRow[]>(
    `SELECT p.ID, p.post_title, p.guid,
            (SELECT pm.meta_value
               FROM \`${prefix}postmeta\` pm
              WHERE pm.post_id = p.ID
                AND pm.meta_key = '_wp_attached_file'
              LIMIT 1) AS attached_file
       FROM \`${prefix}posts\` p
      WHERE p.post_type = 'attachment'
        AND p.post_mime_type = 'application/pdf'
        ${titleClause}
      ORDER BY p.post_date DESC`,
    titleArg
  );

  if (rows.length === 0) {
    summary.notes.push(
      titleFilter
        ? `'${titleFilter}' içeren PDF bulunamadı.`
        : 'PDF eklentisi bulunamadı.'
    );
    summary.skipped = 1;
    return summary;
  }

  const candidate = rows.find((row) => {
    const url = resolveMediaUrl(row.guid, opts.mediaBaseUrl)
      ?? resolveMediaUrl(row.attached_file, opts.mediaBaseUrl);
    return Boolean(url);
  }) ?? rows[0];

  const pdfUrl =
    resolveMediaUrl(candidate.guid, opts.mediaBaseUrl) ??
    resolveMediaUrl(candidate.attached_file, opts.mediaBaseUrl);

  if (!pdfUrl) {
    summary.notes.push(
      'PDF URL üretilemedi (mediaBaseUrl gerekebilir). Atlandı.'
    );
    summary.skipped = 1;
    return summary;
  }

  const title = (candidate.post_title?.trim() || 'Mutabakat Zaptı').slice(
    0,
    500
  );

  log(
    `[mutabakat] ${rows.length} PDF aday; seçilen: '${title}' (ID=${candidate.ID})`
  );

  if (opts.dryRun) {
    summary.notes.push('dry-run: yazma atlandı');
    summary.skipped = 1;
    return summary;
  }

  const [existing] = await opts.db.select().from(schema.mutabakat).limit(1);
  if (existing) {
    await opts.db
      .update(schema.mutabakat)
      .set({ title, pdfUrl, updatedAt: new Date() })
      .where(eq(schema.mutabakat.id, existing.id));
    summary.updated = 1;
  } else {
    await opts.db.insert(schema.mutabakat).values({ title, pdfUrl });
    summary.inserted = 1;
  }
  return summary;
}

/* ---------------------------------------------------------------------- */
/* members                                                                */
/* ---------------------------------------------------------------------- */

export async function migrateMembers(
  opts: MembersMigrationOptions
): Promise<MigrationSummary> {
  const summary = makeSummary('members');
  const log = opts.logger ?? defaultLogger;
  const prefix = ensurePrefix(opts.tablePrefix);
  const slug = (opts.pageSlug ?? '').trim();

  if (!slug) {
    summary.notes.push('pageSlug verilmedi; members taşıma atlandı.');
    summary.skipped = 1;
    return summary;
  }

  const [rows] = await opts.mysql.execute<WpPostRow[]>(
    `SELECT ID, post_title, post_content, post_name, post_status, post_type
       FROM \`${prefix}posts\`
      WHERE post_type IN ('page', 'post')
        AND post_name = ?
        AND post_status = 'publish'
      LIMIT 1`,
    [slug]
  );

  if (rows.length === 0) {
    summary.notes.push(`WP'de '${slug}' slug'lı yayında üyeler sayfası yok.`);
    summary.skipped = 1;
    return summary;
  }

  const html = rows[0].post_content ?? '';
  const splitBy = opts.splitBy ?? 'li';
  const names = extractMemberNames(html, splitBy);

  log(`[members] '${slug}' içinden ${names.length} üye adı (splitBy=${splitBy}).`);

  if (names.length === 0) {
    summary.notes.push('İçerikten üye adı çıkarılamadı.');
    return summary;
  }

  if (opts.dryRun) {
    summary.notes.push(`dry-run: ${names.length} üye bekliyor.`);
    summary.skipped = names.length;
    return summary;
  }

  if (opts.truncate) {
    await opts.db.execute(sql`TRUNCATE TABLE ${schema.members} RESTART IDENTITY`);
    log('[members] hedef tablo temizlendi (--truncate)');
  }

  const existing = await opts.db
    .select({ name: schema.members.name })
    .from(schema.members);
  const existingNames = new Set(existing.map((m) => m.name));

  const toInsert = names
    .filter((name) => !existingNames.has(name))
    .map((name) => ({ name }));

  summary.skipped += names.length - toInsert.length;

  if (toInsert.length > 0) {
    await opts.db.insert(schema.members).values(toInsert);
    summary.inserted = toInsert.length;
  }
  return summary;
}

/* ---------------------------------------------------------------------- */
/* founders                                                               */
/* ---------------------------------------------------------------------- */

export async function migrateFounders(
  opts: FoundersMigrationOptions
): Promise<MigrationSummary> {
  const summary = makeSummary('founders');
  const log = opts.logger ?? defaultLogger;
  const prefix = ensurePrefix(opts.tablePrefix);
  const slug = (opts.pageSlug ?? '').trim();

  if (!slug) {
    summary.notes.push('pageSlug verilmedi; founders taşıma atlandı.');
    summary.skipped = 1;
    return summary;
  }

  const [rows] = await opts.mysql.execute<WpPostRow[]>(
    `SELECT ID, post_title, post_content, post_name, post_status, post_type
       FROM \`${prefix}posts\`
      WHERE post_type IN ('page', 'post')
        AND post_name = ?
        AND post_status = 'publish'
      LIMIT 1`,
    [slug]
  );

  if (rows.length === 0) {
    summary.notes.push(`WP'de '${slug}' slug'lı yayında kurucular sayfası yok.`);
    summary.skipped = 1;
    return summary;
  }

  const html = rows[0].post_content ?? '';
  const rawLogos = extractAllImages(html);
  const logos: string[] = [];
  const seen = new Set<string>();
  for (const raw of rawLogos) {
    const resolved = resolveMediaUrl(raw, opts.mediaBaseUrl) ?? raw;
    if (seen.has(resolved)) continue;
    seen.add(resolved);
    logos.push(resolved);
  }

  log(`[founders] '${slug}' içinden ${logos.length} logo URL.`);

  if (logos.length === 0) {
    summary.notes.push('Sayfa içinde <img> bulunamadı.');
    return summary;
  }

  if (opts.dryRun) {
    summary.notes.push(`dry-run: ${logos.length} logo bekliyor.`);
    summary.skipped = logos.length;
    return summary;
  }

  if (opts.truncate) {
    await opts.db.execute(sql`TRUNCATE TABLE ${schema.founders} RESTART IDENTITY`);
    log('[founders] hedef tablo temizlendi (--truncate)');
  }

  const existing = await opts.db
    .select({ logoUrl: schema.founders.logoUrl })
    .from(schema.founders);
  const existingLogos = new Set(existing.map((f) => f.logoUrl));

  const toInsert = logos
    .filter((url) => !existingLogos.has(url))
    .map((logoUrl) => ({ logoUrl }));

  summary.skipped += logos.length - toInsert.length;

  if (toInsert.length > 0) {
    await opts.db.insert(schema.founders).values(toInsert);
    summary.inserted = toInsert.length;
  }
  return summary;
}

/* ---------------------------------------------------------------------- */
/* exports for testing                                                    */
/* ---------------------------------------------------------------------- */

/** Internal helpers exported for unit tests / external reuse. */
export const __test__ = {
  extractYoutubeIds,
  resolveMediaUrl,
  extractFirstImage,
  extractAllImages,
  extractFirstBlockquote,
  extractMemberNames,
  ensurePrefix,
  canonicalYoutubeUrl,
};
