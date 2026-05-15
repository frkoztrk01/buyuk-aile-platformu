import db from '@/lib/db';
import { homeHero, type HomeHero } from '@/lib/db/schema';

function isUndefinedTableError(e: unknown): boolean {
  if (!e || typeof e !== 'object') return false;
  const err = e as { code?: string; cause?: { code?: string } };
  return err.code === '42P01' || err.cause?.code === '42P01';
}

/** Tek satır; tablo yoksa veya sorgu başarısızsa null (build / eski DB uyumu). */
export async function getHomeHeroRow(): Promise<HomeHero | null> {
  try {
    const [row] = await db.select().from(homeHero).limit(1);
    return row ?? null;
  } catch (e) {
    if (isUndefinedTableError(e)) return null;
    throw e;
  }
}
