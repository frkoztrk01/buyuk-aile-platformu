import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { manifesto } from '@/lib/db/schema';
import { withResolvedManifestoFields } from '@/lib/media-url';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const [row] = await db.select().from(manifesto).limit(1);
    return NextResponse.json(row ? withResolvedManifestoFields(row) : null);
  } catch (error) {
    console.error('Error fetching manifesto:', error);
    return NextResponse.json({ error: 'Failed to fetch manifesto' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    const { title, pdfUrl } = body;

    if (!title || !pdfUrl) {
      return NextResponse.json(
        { error: 'Title and pdfUrl are required' },
        { status: 400 }
      );
    }

    const [existing] = await db.select().from(manifesto).limit(1);
    let result;

    if (existing) {
      const [updated] = await db
        .update(manifesto)
        .set({ title, pdfUrl, updatedAt: new Date() })
        .returning();
      result = updated;
    } else {
      const [created] = await db.insert(manifesto).values({ title, pdfUrl }).returning();
      result = created;
    }

    return NextResponse.json(result, { status: existing ? 200 : 201 });
  } catch (error) {
    console.error('Error saving manifesto:', error);
    return NextResponse.json({ error: 'Failed to save manifesto' }, { status: 500 });
  }
}
