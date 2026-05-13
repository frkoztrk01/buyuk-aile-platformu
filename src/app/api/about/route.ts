import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { about } from '@/lib/db/schema';
import { withResolvedAboutFields } from '@/lib/media-url';

// GET - Get about content (public API)
export async function GET(request: NextRequest) {
  try {
    const [aboutContent] = await db
      .select()
      .from(about)
      .limit(1);
    
    return NextResponse.json(
      aboutContent ? withResolvedAboutFields(aboutContent) : null
    );
  } catch (error) {
    console.error('Error fetching about:', error);
    return NextResponse.json(
      { error: 'Failed to fetch about' },
      { status: 500 }
    );
  }
}
