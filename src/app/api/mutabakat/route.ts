import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { mutabakat } from '@/lib/db/schema';
import { withResolvedMutabakatFields } from '@/lib/media-url';

// GET - Get mutabakat content (public API)
export async function GET(request: NextRequest) {
  try {
    const [mutabakatContent] = await db
      .select()
      .from(mutabakat)
      .limit(1);
    
    return NextResponse.json(
      mutabakatContent ? withResolvedMutabakatFields(mutabakatContent) : null
    );
  } catch (error) {
    console.error('Error fetching mutabakat:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mutabakat' },
      { status: 500 }
    );
  }
}
