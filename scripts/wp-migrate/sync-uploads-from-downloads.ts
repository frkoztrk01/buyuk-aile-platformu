/**
 * Downloads (veya başka bir kaynak) içindeki WordPress `uploads` ağacını
 * `public/uploads/` altına kopyalar (rsync).
 *
 *   pnpm wp:sync-uploads
 *
 * Kaynak yolu:
 *   WP_DOWNLOADS_UPLOADS=/path/to/folder   (varsayılan: ~/Downloads/2022 (1))
 */

import 'dotenv/config';

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function defaultSourceDir(): string {
  const fromEnv = process.env.WP_DOWNLOADS_UPLOADS?.trim();
  if (fromEnv) return path.resolve(fromEnv);
  const home = process.env.HOME ?? process.env.USERPROFILE ?? '';
  return path.join(home, 'Downloads', '2022 (1)');
}

function main(): void {
  const src = defaultSourceDir();
  const dest = path.join(process.cwd(), 'public', 'uploads');

  if (!fs.existsSync(src)) {
    console.error(`[wp:sync-uploads] Kaynak klasör yok: ${src}`);
    console.error('WP_DOWNLOADS_UPLOADS ile doğru yolu verin.');
    process.exitCode = 1;
    return;
  }

  fs.mkdirSync(dest, { recursive: true });
  const srcTrail = src.endsWith('/') ? src : `${src}/`;
  const destTrail = dest.endsWith('/') ? dest : `${dest}/`;
  const r = spawnSync(
    'rsync',
    ['-a', '--exclude', '.DS_Store', srcTrail, destTrail],
    { stdio: 'inherit' }
  );
  if (r.error) throw r.error;
  if (r.status !== 0) {
    process.exitCode = r.status ?? 1;
    return;
  }
  console.log(`[wp:sync-uploads] Tamam: ${srcTrail} → ${destTrail}`);
}

main();
