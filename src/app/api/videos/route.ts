import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { videos } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

// GET - List videos (public API)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit');
    
    let allVideos = await db
      .select()
      .from(videos)
      .orderBy(desc(videos.createdAt));
    
    // Apply limit if provided
    if (limit) {
      const limitNum = parseInt(limit, 10);
      allVideos = allVideos.slice(0, limitNum);
    }
    
    return NextResponse.json(allVideos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}
