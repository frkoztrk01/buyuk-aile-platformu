import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { videos } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth';
import { desc } from 'drizzle-orm';

// GET - List all videos
export async function GET(request: NextRequest) {
  try {
    const allVideos = await db
      .select()
      .from(videos)
      .orderBy(desc(videos.createdAt));
    
    return NextResponse.json(allVideos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

// POST - Create new video
export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    
    const body = await request.json();
    const { title, youtubeUrl } = body;
    
    if (!title || !youtubeUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const [newVideo] = await db
      .insert(videos)
      .values({
        title,
        youtubeUrl,
      })
      .returning();
    
    return NextResponse.json(newVideo, { status: 201 });
  } catch (error) {
    console.error('Error creating video:', error);
    return NextResponse.json(
      { error: 'Failed to create video' },
      { status: 500 }
    );
  }
}
