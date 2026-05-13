/**
 * Standalone runner for the extended-tables migration.
 *
 * Usage:
 *   pnpm tsx scripts/wp-migrate/run-extended.ts [options]
 *
 * Required environment variables (.env is loaded automatically):
 *   DATABASE_URL  PostgreSQL connection string (target).
 *   MYSQL_URL     MySQL connection string for the imported WP dump (source).
 *
 * Options (all optional):
 *   --dry-run                 No writes; only logs and counts.
 *   --truncate                Clear many-row destination tables before insert
 *                             (videos, members, founders). Single-row tables
 *                             (about, mutabakat) always upsert.
 *   --only=a,b,c              Run only the listed migrations. Allowed values:
 *                             about, videos, mutabakat, members, founders.
 *   --table-prefix=wpil_      WordPress table prefix.
 *   --media-base-url=https... Base URL for relative WP media paths.
 *   --about-slug=hakkimizda   WP page slug used for the about content.
 *   --members-slug=...        WP page slug for the members listing.
 *   --members-split=li|p|line How to split member names (default: li).
 *   --founders-slug=...       WP page slug for the founders logos.
 *   --mutabakat-title=...     Substring required in PDF post_title
 *                             (default: 'mutabakat', '' for no filter).
 *
 * This runner only handles the extended tables. The `news` migration is run
 * by its companion script in this directory.
 */

import 'dotenv/config';

import mysql from 'mysql2/promise';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

import * as schema from '../../src/lib/db/schema';
import {
  migrateAbout,
  migrateFounders,
  migrateMembers,
  migrateMutabakat,
  migrateVideos,
  type MigrationSummary,
} from './extended-tables';

type Job = 'about' | 'videos' | 'mutabakat' | 'members' | 'founders';
const ALL_JOBS: readonly Job[] = [
  'about',
  'videos',
  'mutabakat',
  'members',
  'founders',
] as const;

interface CliArgs {
  dryRun: boolean;
  truncate: boolean;
  jobs: Set<Job>;
  tablePrefix?: string;
  mediaBaseUrl?: string;
  aboutSlug?: string;
  membersSlug?: string;
  membersSplit?: 'li' | 'p' | 'line';
  foundersSlug?: string;
  mutabakatTitle?: string;
}

function parseArgs(argv: string[]): CliArgs {
  const out: CliArgs = {
    dryRun: false,
    truncate: false,
    jobs: new Set(ALL_JOBS),
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

    const eq = raw.indexOf('=');
    if (!raw.startsWith('--') || eq === -1) continue;

    const key = raw.slice(2, eq);
    const value = raw.slice(eq + 1);

    switch (key) {
      case 'only': {
        const wanted = value
          .split(',')
          .map((v) => v.trim().toLowerCase())
          .filter(Boolean);
        const filtered = new Set<Job>();
        for (const w of wanted) {
          if ((ALL_JOBS as readonly string[]).includes(w)) {
            filtered.add(w as Job);
          } else {
            throw new Error(`Bilinmeyen --only girdisi: '${w}'`);
          }
        }
        if (filtered.size === 0) {
          throw new Error('--only en az bir geçerli iş gerektirir.');
        }
        out.jobs = filtered;
        break;
      }
      case 'table-prefix':
        out.tablePrefix = value;
        break;
      case 'media-base-url':
        out.mediaBaseUrl = value;
        break;
      case 'about-slug':
        out.aboutSlug = value;
        break;
      case 'members-slug':
        out.membersSlug = value;
        break;
      case 'members-split':
        if (value !== 'li' && value !== 'p' && value !== 'line') {
          throw new Error(
            `--members-split: 'li' | 'p' | 'line' beklenir, '${value}' verildi.`
          );
        }
        out.membersSplit = value;
        break;
      case 'founders-slug':
        out.foundersSlug = value;
        break;
      case 'mutabakat-title':
        out.mutabakatTitle = value;
        break;
      default:
        throw new Error(`Bilinmeyen argüman: --${key}`);
    }
  }

  return out;
}

function formatSummary(summaries: MigrationSummary[]): string {
  const lines: string[] = [];
  lines.push('');
  lines.push('Migration özeti');
  lines.push('───────────────');
  for (const s of summaries) {
    lines.push(
      `${s.table.padEnd(10)} insert=${s.inserted} update=${s.updated} skip=${s.skipped}`
    );
    for (const note of s.notes) {
      lines.push(`           · ${note}`);
    }
  }
  return lines.join('\n');
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  const mysqlUrl = process.env.MYSQL_URL;
  const pgUrl = process.env.DATABASE_URL;
  if (!mysqlUrl) throw new Error('MYSQL_URL ortam değişkeni gerekli.');
  if (!pgUrl) throw new Error('DATABASE_URL ortam değişkeni gerekli.');

  const mysqlPool = mysql.createPool({
    uri: mysqlUrl,
    waitForConnections: true,
    connectionLimit: 4,
    namedPlaceholders: false,
  });

  const pgPool = new Pool({ connectionString: pgUrl });
  const db = drizzle(pgPool, { schema });

  console.log(
    `[wp-migrate] dryRun=${args.dryRun} truncate=${args.truncate} jobs=${[...args.jobs].join(',')}`
  );

  const base = {
    mysql: mysqlPool,
    db,
    tablePrefix: args.tablePrefix,
    mediaBaseUrl: args.mediaBaseUrl,
    dryRun: args.dryRun,
    truncate: args.truncate,
  } as const;

  const results: MigrationSummary[] = [];
  try {
    if (args.jobs.has('about')) {
      results.push(
        await migrateAbout({ ...base, pageSlug: args.aboutSlug })
      );
    }
    if (args.jobs.has('videos')) {
      results.push(await migrateVideos(base));
    }
    if (args.jobs.has('mutabakat')) {
      results.push(
        await migrateMutabakat({ ...base, titleContains: args.mutabakatTitle })
      );
    }
    if (args.jobs.has('members')) {
      results.push(
        await migrateMembers({
          ...base,
          pageSlug: args.membersSlug,
          splitBy: args.membersSplit,
        })
      );
    }
    if (args.jobs.has('founders')) {
      results.push(
        await migrateFounders({ ...base, pageSlug: args.foundersSlug })
      );
    }
  } finally {
    await mysqlPool.end();
    await pgPool.end();
  }

  console.log(formatSummary(results));
}

main().catch((err) => {
  console.error('wp-migrate (extended) başarısız:', err);
  process.exitCode = 1;
});
