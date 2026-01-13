import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { about } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth';

// GET - Get about content (single record)
export async function GET(request: NextRequest) {
  try {
    const [aboutContent] = await db
      .select()
      .from(about)
      .limit(1);
    
    // If no content exists, return empty object
    return NextResponse.json(aboutContent || null);
  } catch (error) {
    console.error('Error fetching about:', error);
    return NextResponse.json(
      { error: 'Failed to fetch about' },
      { status: 500 }
    );
  }
}

// POST - Create or update about content (upsert)
export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    
    const body = await request.json();
    const { heroImageUrl, heroQuote, heroQuoteSource, content } = body;
    
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }
    
    // Check if about content exists
    const [existing] = await db
      .select()
      .from(about)
      .limit(1);
    
    let result;
    
    if (existing) {
      // Update existing
      const [updated] = await db
        .update(about)
        .set({
          heroImageUrl: heroImageUrl || null,
          heroQuote: heroQuote || null,
          heroQuoteSource: heroQuoteSource || null,
          content,
          updatedAt: new Date(),
        })
        .returning();
      result = updated;
    } else {
      // Create new
      const [created] = await db
        .insert(about)
        .values({
          heroImageUrl: heroImageUrl || null,
          heroQuote: heroQuote || null,
          heroQuoteSource: heroQuoteSource || null,
          content,
        })
        .returning();
      result = created;
    }
    
    return NextResponse.json(result, { status: existing ? 200 : 201 });
  } catch (error) {
    console.error('Error saving about:', error);
    return NextResponse.json(
      { error: 'Failed to save about' },
      { status: 500 }
    );
  }
}
