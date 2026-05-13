/**
 * Veritabanındaki eski WordPress medya URL'lerini site içi `/uploads/...` yoluna çevirir.
 * `public/uploads` ile birlikte kullanıldığında görseller aynı origin'den servis edilir.
 *
 *   pnpm wp:fix-media-urls
 *
 * Gerekli: DATABASE_URL (.env)
 *
 * --dry-run  Sadece kaç satır etkileneceğini tahmin eder (yazmaz).
 */

import 'dotenv/config';

import { Pool } from 'pg';

const REPLACEMENTS: readonly [string, string][] = [
  [
    'https://www.buyukaileplatformu.org/wp-content/uploads/',
    '/uploads/',
  ],
  [
    'http://www.buyukaileplatformu.org/wp-content/uploads/',
    '/uploads/',
  ],
  [
    'https://buyukaileplatformu.org/wp-content/uploads/',
    '/uploads/',
  ],
  [
    'http://buyukaileplatformu.org/wp-content/uploads/',
    '/uploads/',
  ],
  ['//www.buyukaileplatformu.org/wp-content/uploads/', '/uploads/'],
  ['//buyukaileplatformu.org/wp-content/uploads/', '/uploads/'],
];

interface UpdateSpec {
  table: string;
  columns: string[];
}

const SPECS: UpdateSpec[] = [
  { table: 'news', columns: ['content', 'image_url'] },
  { table: 'about', columns: ['content', 'hero_image_url', 'hero_quote', 'hero_quote_source'] },
  { table: 'founders', columns: ['logo_url'] },
  { table: 'mutabakat', columns: ['pdf_url'] },
  { table: 'meetings', columns: ['description', 'video_url'] },
  { table: 'members', columns: ['name'] },
];

const IDENT = /^[a-z_]+$/i;

function assertIdent(name: string): string {
  if (!IDENT.test(name)) {
    throw new Error(`Güvenli olmayan tanımlayıcı: ${JSON.stringify(name)}`);
  }
  return name;
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('[wp:fix-media-urls] DATABASE_URL gerekli.');
    process.exitCode = 1;
    return;
  }

  const pool = new Pool({ connectionString: url });

  try {
    for (const [from, to] of REPLACEMENTS) {
      console.log(`\n[wp:fix-media-urls] ${from.slice(0, 50)}… → ${to}`);
      for (const spec of SPECS) {
        const table = assertIdent(spec.table);
        for (const col of spec.columns) {
          assertIdent(col);
          const countSql = `SELECT COUNT(*)::int AS c FROM "${table}" WHERE "${col}" IS NOT NULL AND "${col}" LIKE $1`;
          const { rows } = await pool.query<{ c: number }>(countSql, [`%${from}%`]);
          const n = rows[0]?.c ?? 0;
          if (n === 0) continue;
          console.log(`  ${table}.${col}: ${n} satır`);
          if (!dryRun) {
            const upd = `UPDATE "${table}" SET "${col}" = REPLACE("${col}", $1, $2) WHERE "${col}" LIKE $3`;
            await pool.query(upd, [from, to, `%${from}%`]);
          }
        }
      }
    }
    if (dryRun) {
      console.log('\n[wp:fix-media-urls] dry-run: veritabanı güncellenmedi.');
    } else {
      console.log('\n[wp:fix-media-urls] Tamam.');
    }
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error('[wp:fix-media-urls]', e);
  process.exitCode = 1;
});
