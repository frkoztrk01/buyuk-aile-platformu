import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { mutabakat } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth';

// GET - Get mutabakat content (single record)
export async function GET(request: NextRequest) {
  try {
    const [mutabakatContent] = await db
      .select()
      .from(mutabakat)
      .limit(1);
    
    // If no content exists, return empty object
    return NextResponse.json(mutabakatContent || null);
  } catch (error) {
    console.error('Error fetching mutabakat:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mutabakat' },
      { status: 500 }
    );
  }
}

// POST - Create or update mutabakat content (upsert)
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
    
    // Check if mutabakat content exists
    const [existing] = await db
      .select()
      .from(mutabakat)
      .limit(1);
    
    let result;
    
    if (existing) {
      // Update existing
      const [updated] = await db
        .update(mutabakat)
        .set({
          title,
          pdfUrl,
          updatedAt: new Date(),
        })
        .returning();
      result = updated;
    } else {
      // Create new
      const [created] = await db
        .insert(mutabakat)
        .values({
          title,
          pdfUrl,
        })
        .returning();
      result = created;
    }
    
    return NextResponse.json(result, { status: existing ? 200 : 201 });
  } catch (error) {
    console.error('Error saving mutabakat:', error);
    return NextResponse.json(
      { error: 'Failed to save mutabakat' },
      { status: 500 }
    );
  }
}
