import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { manifesto } from '@/lib/db/schema';
import { withResolvedManifestoFields } from '@/lib/media-url';

export async function GET() {
  try {
    const [row] = await db.select().from(manifesto).limit(1);
    return NextResponse.json(row ? withResolvedManifestoFields(row) : null);
  } catch (error) {
    console.error('Error fetching manifesto:', error);
    return NextResponse.json({ error: 'Failed to fetch manifesto' }, { status: 500 });
  }
}
