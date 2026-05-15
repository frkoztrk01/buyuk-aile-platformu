/**
 * Basın açıklamasına göre güncellenmiş HOME_HERO_DEFAULTS metnini veritabanına yazar
 * (home_hero tek satır upsert). Yerelde: npx tsx scripts/seed-home-hero-basin.ts
 */
import 'dotenv/config';
import db from '../src/lib/db';
import { homeHero } from '../src/lib/db/schema';
import { HOME_HERO_DEFAULTS, bulletsToMultiline } from '../src/lib/home-hero-defaults';

async function main() {
  const d = HOME_HERO_DEFAULTS;
  const row = {
    backgroundImageUrl: null as string | null,
    logoUrl: null as string | null,
    headline: d.headline,
    subtext: d.subtext,
    ctaLabel: d.ctaLabel,
    ctaHref: d.ctaHref,
    missionTitle: d.missionTitle,
    missionBody: d.missionBody,
    missionBullets: bulletsToMultiline(d.missionBullets),
    visionTitle: d.visionTitle,
    visionBody: d.visionBody,
    visionBullets: bulletsToMultiline(d.visionBullets),
    valuesTitle: d.valuesTitle,
    valuesBody: d.valuesBody,
    valuesBullets: bulletsToMultiline(d.valuesBullets),
    updatedAt: new Date(),
  };

  const [existing] = await db.select().from(homeHero).limit(1);
  if (existing) {
    await db.update(homeHero).set(row);
    console.log('home_hero güncellendi (id:', existing.id, ')');
  } else {
    await db.insert(homeHero).values(row);
    console.log('home_hero oluşturuldu');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
