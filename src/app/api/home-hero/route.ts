import { NextResponse } from 'next/server';
import { withResolvedHomeHeroFields } from '@/lib/media-url';
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
