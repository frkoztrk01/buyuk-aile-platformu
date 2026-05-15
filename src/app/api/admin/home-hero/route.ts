import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { homeHero } from '@/lib/db/schema';
import { withResolvedHomeHeroFields } from '@/lib/media-url';
import { requireAuth } from '@/lib/auth';
import { getHomeHeroRow } from '@/lib/queries/home-hero';

export async function GET() {
  try {
    const row = await getHomeHeroRow();
    return NextResponse.json(row ? withResolvedHomeHeroFields(row) : null);
  } catch (error) {
    console.error('Error fetching home hero:', error);
    return NextResponse.json({ error: 'Failed to fetch home hero' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();

    const {
      backgroundImageUrl,
      logoUrl,
      headline,
      subtext,
      ctaLabel,
      ctaHref,
      missionTitle,
      missionBody,
      missionBullets,
      visionTitle,
      visionBody,
      visionBullets,
      valuesTitle,
      valuesBody,
      valuesBullets,
    } = body;

    const [existing] = await db.select().from(homeHero).limit(1);

    const payload = {
      backgroundImageUrl: backgroundImageUrl ?? null,
      logoUrl: logoUrl ?? null,
      headline: headline ?? null,
      subtext: subtext ?? null,
      ctaLabel: ctaLabel ?? null,
      ctaHref: ctaHref ?? null,
      missionTitle: missionTitle ?? null,
      missionBody: missionBody ?? null,
      missionBullets: missionBullets ?? null,
      visionTitle: visionTitle ?? null,
      visionBody: visionBody ?? null,
      visionBullets: visionBullets ?? null,
      valuesTitle: valuesTitle ?? null,
      valuesBody: valuesBody ?? null,
      valuesBullets: valuesBullets ?? null,
      updatedAt: new Date(),
    };

    let result;
    if (existing) {
      const [updated] = await db.update(homeHero).set(payload).returning();
      result = updated;
    } else {
      const [created] = await db.insert(homeHero).values(payload).returning();
      result = created;
    }

    return NextResponse.json(result, { status: existing ? 200 : 201 });
  } catch (error) {
    console.error('Error saving home hero:', error);
    return NextResponse.json({ error: 'Failed to save home hero' }, { status: 500 });
  }
}
