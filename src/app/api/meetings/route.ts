import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { meetings } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

// GET - List published meetings (public API)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit');
    
    let allMeetings = await db
      .select()
      .from(meetings)
      .orderBy(desc(meetings.date));
    
    // Apply limit if provided
    if (limit) {
      const limitNum = parseInt(limit, 10);
      allMeetings = allMeetings.slice(0, limitNum);
    }
    
    return NextResponse.json(allMeetings);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
}
