/**
 * `public/uploads` içinde yalnızca PostgreSQL içeriğinde geçen dosyaları bırakır;
 * referansı olmayan görselleri siler (boş klasörleri de temizler).
 *
 *   pnpm wp:prune-uploads -- --dry-run   # silinecekleri listele
 *   pnpm wp:prune-uploads               # gerçekten sil
 *
 * Gerekli: DATABASE_URL (.env)
 *
 * Taranır: news, about, founders, mutabakat, meetings, members metin alanları
 * içindeki `/uploads/...` ve `/wp-content/uploads/...` yolları.
 */

import 'dotenv/config';

import fs from 'node:fs/promises';
import path from 'node:path';
import { Pool } from 'pg';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

function normalizeUploadRelativePath(raw: string): string {
  return raw
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .split('&')[0]
    .split('?')[0]
    .split('#')[0]
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\/+/, '');
}

/** İçerikten göreli dosya yolu (örn. 2023/06/foo.jpg) çıkarır. */
function collectPathsFromBlob(text: string | null | undefined, into: Set<string>): void {
  if (!text) return;
  const patterns = [
    /\/uploads\/([^"'\\\s<>?#&]+)/gi,
    /\/wp-content\/uploads\/([^"'\\\s<>?#&]+)/gi,
    /https?:\/\/[^"'\\\s<>]+\/wp-content\/uploads\/([^"'\\\s<>?#&]+)/gi,
    /https?:\/\/[^"'\\\s<>]+\/uploads\/([^"'\\\s<>?#&]+)/gi,
  ];
  for (const re of patterns) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const p = normalizeUploadRelativePath(m[1]);
      if (!p || p.includes('..')) continue;
      let decoded = p;
      try {
        decoded = decodeURIComponent(p);
      } catch {
        /* leave */
      }
      into.add(decoded);
    }
  }
}

async function loadReferencedPaths(pool: Pool): Promise<Set<string>> {
  const need = new Set<string>();

  const news = await pool.query<{ content: string; image_url: string | null }>(
    `SELECT content, image_url FROM news`
  );
  for (const row of news.rows) {
    collectPathsFromBlob(row.content, need);
    collectPathsFromBlob(row.image_url, need);
  }

  const about = await pool.query<{
    content: string;
    hero_image_url: string | null;
    hero_quote: string | null;
    hero_quote_source: string | null;
  }>(
    `SELECT content, hero_image_url, hero_quote, hero_quote_source FROM about`
  );
  for (const row of about.rows) {
    collectPathsFromBlob(row.content, need);
    collectPathsFromBlob(row.hero_image_url, need);
    collectPathsFromBlob(row.hero_quote, need);
    collectPathsFromBlob(row.hero_quote_source, need);
  }

  const founders = await pool.query<{ logo_url: string }>(
    `SELECT logo_url FROM founders`
  );
  for (const row of founders.rows) {
    collectPathsFromBlob(row.logo_url, need);
  }

  const mutabakat = await pool.query<{ pdf_url: string | null }>(
    `SELECT pdf_url FROM mutabakat`
  );
  for (const row of mutabakat.rows) {
    collectPathsFromBlob(row.pdf_url, need);
  }

  const meetings = await pool.query<{
    video_url: string | null;
    description: string | null;
  }>(`SELECT video_url, description FROM meetings`);
  for (const row of meetings.rows) {
    collectPathsFromBlob(row.video_url, need);
    collectPathsFromBlob(row.description, need);
  }

  const members = await pool.query<{ name: string }>(
    `SELECT name FROM members`
  );
  for (const row of members.rows) {
    collectPathsFromBlob(row.name, need);
  }

  return need;
}

async function listAllFilesUnderUploads(): Promise<string[]> {
  const out: string[] = [];
  async function walk(dir: string): Promise<void> {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        await walk(full);
      } else if (e.isFile()) {
        const rel = path.relative(UPLOADS_DIR, full).split(path.sep).join('/');
        out.push(rel);
      }
    }
  }
  await walk(UPLOADS_DIR);
  return out;
}

async function removeEmptyDirs(root: string): Promise<void> {
  async function postOrder(dir: string): Promise<void> {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (e.isDirectory()) {
        await postOrder(path.join(dir, e.name));
      }
    }
    const left = await fs.readdir(dir);
    if (left.length === 0 && path.resolve(dir) !== path.resolve(root)) {
      await fs.rmdir(dir);
    }
  }
  await postOrder(root);
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('[wp:prune-uploads] DATABASE_URL gerekli.');
    process.exitCode = 1;
    return;
  }

  let stat;
  try {
    stat = await fs.stat(UPLOADS_DIR);
  } catch {
    console.error('[wp:prune-uploads] Klasör yok:', UPLOADS_DIR);
    process.exitCode = 1;
    return;
  }
  if (!stat.isDirectory()) {
    console.error('[wp:prune-uploads] uploads bir klasör değil.');
    process.exitCode = 1;
    return;
  }

  const pool = new Pool({ connectionString: url });
  try {
    const needed = await loadReferencedPaths(pool);
    const allFiles = await listAllFilesUnderUploads();
    const allSet = new Set(allFiles);
    const toDelete = allFiles.filter((f) => !needed.has(f));

    const neededNotOnDisk = [...needed].filter((f) => !allSet.has(f));

    console.log(
      `[wp:prune-uploads] DB’de referans: ${needed.size} dosya yolu, diskte: ${allFiles.length} dosya.`
    );
    console.log(
      `[wp:prune-uploads] Silinecek (referanssız): ${toDelete.length} dosya.`
    );
    if (neededNotOnDisk.length > 0) {
      console.log(
        `[wp:prune-uploads] Uyarı: DB’de var ama diskte yok (ilk 20): ${neededNotOnDisk
          .slice(0, 20)
          .join(', ')}${neededNotOnDisk.length > 20 ? '…' : ''}`
      );
    }

    if (dryRun) {
      for (const f of toDelete.slice(0, 500)) {
        console.log(`  [dry-run] silinirdi: ${f}`);
      }
      if (toDelete.length > 500) {
        console.log(`  … ve ${toDelete.length - 500} dosya daha`);
      }
      console.log('[wp:prune-uploads] dry-run: silme yapılmadı.');
      return;
    }

    let bytes = 0;
    for (const rel of toDelete) {
      const full = path.join(UPLOADS_DIR, rel);
      try {
        const s = await fs.stat(full);
        bytes += s.size;
        await fs.unlink(full);
      } catch {
        /* yok veya silinemedi */
      }
    }
    await removeEmptyDirs(UPLOADS_DIR);
    console.log(
      `[wp:prune-uploads] Silindi: ${toDelete.length} dosya (~${(bytes / 1024 / 1024).toFixed(1)} MiB kazanç).`
    );
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error('[wp:prune-uploads]', e);
  process.exitCode = 1;
});
