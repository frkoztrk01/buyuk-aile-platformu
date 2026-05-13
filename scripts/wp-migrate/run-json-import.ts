/**
 * WordPress phpMyAdmin JSON export → PostgreSQL (Drizzle).
 *
 * Usage:
 *   pnpm wp:import-json -- /path/to/localhost.json
 *   pnpm wp:import-json -- --file=/path/to/export.json
 *
 * Env:
 *   DATABASE_URL      (required) PostgreSQL
 *   WP_EXPORT_JSON    default file path if CLI path omitted
 *
 * Options:
 *   --dry-run                 No DB writes
 *   --truncate                TRUNCATE news, videos, members, founders before insert
 *   --table-prefix=wpil_
 *   --media-base-url=https://www.buyukaileplatformu.org   (thumbnail / relative media)
 *   --rewrite-hosts=host1,host2   (default: old site hosts)
 *   --media-public-base=/uploads  (rewrite target for /wp-content/uploads/)
 *   --no-url-rewrite            Skip host/path rewrite in HTML & URLs
 *   --about-slug=hakkimizda
 *   --members-slug=...
 *   --founders-slug=...
 *   --mutabakat-slug=...
 *   --members-split=li|p|line
 *   --announcement-slugs=slug1,slug2   (→ Duyuru category)
 *   --only=news,static,videos
 *
 * Large exports: requires enough Node heap for JSON.parse (or filter export in phpMyAdmin).
 */

import 'dotenv/config';

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, sql } from 'drizzle-orm';

import * as schema from '../../src/lib/db/schema';
import { mapNewsFromPhpMyAdminTables, type MapNewsOptions } from './map-news';
import {
  collectYoutubeVideosFromWpTables,
  mapStaticPagesFromWpTables,
} from './map-static-pages';
import { parsePhpMyAdminJsonExport } from './wp-json-export';
import type { WpUploadUrlRewriteOptions } from './url-rewrite';

type Job = 'news' | 'static' | 'videos';

const DEFAULT_REWRITE_HOSTS = [
  'www.buyukaileplatformu.org',
  'buyukaileplatformu.org',
];

interface CliArgs {
  filePath: string | null;
  dryRun: boolean;
  truncate: boolean;
  jobs: Set<Job>;
  tablePrefix: string;
  mediaBaseUrl?: string;
  urlRewrite: WpUploadUrlRewriteOptions | null;
  membersSplit: 'li' | 'p' | 'line';
  aboutSlug?: string;
  membersSlug?: string;
  foundersSlug?: string;
  mutabakatSlug?: string;
  announcementSlugs: string[];
}

function splitComma(v: string): string[] {
  return v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseArgs(argv: string[]): CliArgs {
  const out: CliArgs = {
    filePath: process.env.WP_EXPORT_JSON?.trim() || null,
    dryRun: false,
    truncate: false,
    jobs: new Set<Job>(['news', 'static', 'videos']),
    tablePrefix: 'wpil_',
    mediaBaseUrl: undefined,
    urlRewrite: {
      sourceHosts: [...DEFAULT_REWRITE_HOSTS],
      mediaPublicBase: '/uploads',
    },
    membersSplit: 'li',
    announcementSlugs: [],
  };

  for (const raw of argv) {
    if (raw === '--dry-run') {
      out.dryRun = true;
      continue;
    }
    if (raw === '--truncate') {
      out.truncate = true;
      continue;
    }
    if (raw === '--no-url-rewrite') {
      out.urlRewrite = null;
      continue;
    }
    if (!raw.startsWith('--') && !raw.startsWith('-')) {
      if (!out.filePath) out.filePath = raw;
      continue;
    }

    const eqIdx = raw.indexOf('=');
    if (raw.startsWith('--') && eqIdx === -1) continue;
    if (!raw.startsWith('--')) continue;

    const key = raw.slice(2, eqIdx);
    const value = raw.slice(eqIdx + 1);

    switch (key) {
      case 'file':
        out.filePath = value;
        break;
      case 'table-prefix':
        out.tablePrefix = value;
        break;
      case 'media-base-url':
        out.mediaBaseUrl = value;
        break;
      case 'rewrite-hosts':
        out.urlRewrite = {
          sourceHosts: splitComma(value),
          mediaPublicBase: out.urlRewrite?.mediaPublicBase ?? '/uploads',
        };
        break;
      case 'media-public-base':
        out.urlRewrite = {
          sourceHosts: out.urlRewrite?.sourceHosts ?? [...DEFAULT_REWRITE_HOSTS],
          mediaPublicBase: value,
        };
        break;
      case 'about-slug':
        out.aboutSlug = value;
        break;
      case 'members-slug':
        out.membersSlug = value;
        break;
      case 'founders-slug':
        out.foundersSlug = value;
        break;
      case 'mutabakat-slug':
        out.mutabakatSlug = value;
        break;
      case 'members-split':
        if (value !== 'li' && value !== 'p' && value !== 'line') {
          throw new Error(`--members-split: li | p | line beklenir, '${value}' verildi.`);
        }
        out.membersSplit = value;
        break;
      case 'announcement-slugs':
        out.announcementSlugs = splitComma(value);
        break;
      case 'only': {
        const wanted = splitComma(value).map((s) => s.toLowerCase());
        const next = new Set<Job>();
        for (const w of wanted) {
          if (w === 'news' || w === 'static' || w === 'videos') next.add(w);
          else throw new Error(`Bilinmeyen --only değeri: '${w}'`);
        }
        if (next.size === 0) throw new Error('--only en az bir iş gerektirir.');
        out.jobs = next;
        break;
      }
      default:
        throw new Error(`Bilinmeyen argüman: --${key}`);
    }
  }

  return out;
}

const CHUNK = 80;

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const filePath = args.filePath ? resolve(args.filePath) : null;
  if (!filePath) {
    throw new Error(
      'JSON dosya yolu gerekli: ilk argüman, --file=... veya WP_EXPORT_JSON ortam değişkeni.'
    );
  }

  const pgUrl = process.env.DATABASE_URL;
  if (!pgUrl) throw new Error('DATABASE_URL ortam değişkeni gerekli.');

  console.log(`[wp:import-json] dosya=${filePath}`);
  const rawJson = JSON.parse(readFileSync(filePath, 'utf8')) as unknown;
  const tables = parsePhpMyAdminJsonExport(rawJson);

  const mapNewsOpts: MapNewsOptions = {
    tablePrefix: args.tablePrefix,
    announcementPostSlugs: args.announcementSlugs,
    mediaBaseUrl: args.mediaBaseUrl,
    urlRewrite: args.urlRewrite ?? undefined,
  };

  const staticOpts = {
    tablePrefix: args.tablePrefix,
    urlRewrite: args.urlRewrite ?? undefined,
    mediaBaseUrl: args.mediaBaseUrl,
    membersSplitBy: args.membersSplit,
  } as const;

  const newsRows = args.jobs.has('news')
    ? mapNewsFromPhpMyAdminTables(tables, mapNewsOpts)
    : [];
  const staticPayload = args.jobs.has('static')
    ? mapStaticPagesFromWpTables(
        tables,
        {
          aboutPageSlug: args.aboutSlug,
          membersPageSlug: args.membersSlug,
          foundersPageSlug: args.foundersSlug,
          mutabakatPageSlug: args.mutabakatSlug,
        },
        staticOpts
      )
    : null;
  const videoRows = args.jobs.has('videos')
    ? collectYoutubeVideosFromWpTables(tables, { tablePrefix: args.tablePrefix })
    : [];

  console.log(
    `[wp:import-json] haber=${newsRows.length} statik=${staticPayload ? 'evet' : 'hayır'} video=${videoRows.length} dryRun=${args.dryRun} truncate=${args.truncate}`
  );

  if (args.dryRun) {
    console.log('[wp:import-json] dry-run: veritabanına yazılmadı.');
    return;
  }

  const pool = new Pool({ connectionString: pgUrl });
  const db = drizzle(pool, { schema });

  try {
    if (args.truncate) {
      if (args.jobs.has('videos')) {
        await db.execute(sql`TRUNCATE TABLE ${schema.videos} RESTART IDENTITY`);
      }
      if (args.jobs.has('static')) {
        await db.execute(sql`TRUNCATE TABLE ${schema.founders} RESTART IDENTITY`);
        await db.execute(sql`TRUNCATE TABLE ${schema.members} RESTART IDENTITY`);
      }
      if (args.jobs.has('news')) {
        await db.execute(sql`TRUNCATE TABLE ${schema.news} RESTART IDENTITY`);
      }
      console.log('[wp:import-json] truncate tamam.');
    }

    if (args.jobs.has('news') && newsRows.length > 0) {
      const upsertSet = {
        title: sql`excluded.title`,
        content: sql`excluded.content`,
        imageUrl: sql`excluded.image_url`,
        category: sql`excluded.category`,
        date: sql`excluded.date`,
        isPublished: sql`excluded.is_published`,
        updatedAt: new Date(),
      } as const;

      for (let i = 0; i < newsRows.length; i += CHUNK) {
        const chunk = newsRows.slice(i, i + CHUNK).map((r) => ({
          title: r.title,
          slug: r.slug,
          content: r.content,
          imageUrl: r.imageUrl,
          category: r.category,
          date: r.date,
          isPublished: r.isPublished,
        }));
        if (args.truncate) {
          await db.insert(schema.news).values(chunk);
        } else {
          await db
            .insert(schema.news)
            .values(chunk)
            .onConflictDoUpdate({
              target: schema.news.slug,
              set: upsertSet,
            });
        }
      }
      console.log(`[wp:import-json] news yazıldı: ${newsRows.length}`);
    }

    if (args.jobs.has('static') && staticPayload) {
      const { about, members, founders, mutabakat } = staticPayload;

      if (about) {
        const content = about.content.trim()
          ? about.content
          : '_İçerik boş veya dönüştürülemedi._';
        const [existingAbout] = await db.select().from(schema.about).limit(1);
        if (existingAbout) {
          await db
            .update(schema.about)
            .set({
              heroImageUrl: about.heroImageUrl,
              heroQuote: about.heroQuote,
              heroQuoteSource: about.heroQuoteSource,
              content,
              updatedAt: new Date(),
            })
            .where(eq(schema.about.id, existingAbout.id));
        } else {
          await db.insert(schema.about).values({
            heroImageUrl: about.heroImageUrl,
            heroQuote: about.heroQuote,
            heroQuoteSource: about.heroQuoteSource,
            content,
          });
        }
        console.log('[wp:import-json] about güncellendi/eklendi.');
      } else {
        console.log('[wp:import-json] about: kaynak sayfa bulunamadı, atlandı.');
      }

      if (members.names.length > 0) {
        const existing = await db
          .select({ name: schema.members.name })
          .from(schema.members);
        const seen = new Set(existing.map((m) => m.name));
        const toInsert = members.names
          .filter((n) => !seen.has(n))
          .map((name) => ({ name }));
        if (toInsert.length > 0) {
          await db.insert(schema.members).values(toInsert);
        }
        console.log(
          `[wp:import-json] members: +${toInsert.length} (atlanan zaten var: ${members.names.length - toInsert.length})`
        );
      } else {
        console.log('[wp:import-json] members: veri yok.');
      }

      if (founders.logoUrls.length > 0) {
        const existing = await db
          .select({ logoUrl: schema.founders.logoUrl })
          .from(schema.founders);
        const seen = new Set(existing.map((f) => f.logoUrl));
        const toInsert = founders.logoUrls
          .filter((u) => !seen.has(u))
          .map((logoUrl) => ({ logoUrl }));
        if (toInsert.length > 0) {
          await db.insert(schema.founders).values(toInsert);
        }
        console.log(
          `[wp:import-json] founders: +${toInsert.length} (atlanan: ${founders.logoUrls.length - toInsert.length})`
        );
      } else {
        console.log('[wp:import-json] founders: veri yok.');
      }

      const mut = mutabakat;
      if (mut.pageSlug || mut.pdfUrl) {
        const [existingMut] = await db.select().from(schema.mutabakat).limit(1);
        if (existingMut) {
          await db
            .update(schema.mutabakat)
            .set({
              title: mut.title,
              pdfUrl: mut.pdfUrl,
              updatedAt: new Date(),
            })
            .where(eq(schema.mutabakat.id, existingMut.id));
        } else {
          await db.insert(schema.mutabakat).values({
            title: mut.title,
            pdfUrl: mut.pdfUrl,
          });
        }
        console.log(
          `[wp:import-json] mutabakat upsert (pdfUrl=${mut.pdfUrl ? 'var' : 'yok'}).`
        );
      } else {
        console.log('[wp:import-json] mutabakat: WP sayfası yok; veritabanına dokunulmadı.');
      }
    }

    if (args.jobs.has('videos') && videoRows.length > 0) {
      const existing = await db
        .select({ youtubeUrl: schema.videos.youtubeUrl })
        .from(schema.videos);
      const seen = new Set(existing.map((v) => v.youtubeUrl));
      const toInsert = videoRows
        .filter((v) => !seen.has(v.youtubeUrl))
        .map((v) => ({ title: v.title, youtubeUrl: v.youtubeUrl }));
      if (toInsert.length > 0) {
        await db.insert(schema.videos).values(toInsert);
      }
      console.log(
        `[wp:import-json] videos: +${toInsert.length} (benzersiz toplam ${videoRows.length})`
      );
    }
  } finally {
    await pool.end();
  }

  console.log('[wp:import-json] bitti.');
}

main().catch((err) => {
  console.error('[wp:import-json] hata:', err);
  process.exitCode = 1;
});
