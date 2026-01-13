import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { meetings } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';

// GET - List all meetings
export async function GET(request: NextRequest) {
  try {
    const allMeetings = await db
      .select()
      .from(meetings)
      .orderBy(desc(meetings.date));
    
    return NextResponse.json(allMeetings);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
}

// POST - Create new meeting
export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    
    const body = await request.json();
    const { title, date, videoUrl, description, orderIndex } = body;
    
    if (!title || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const [newMeeting] = await db
      .insert(meetings)
      .values({
        title,
        date: new Date(date),
        videoUrl: videoUrl || null,
        description: description || null,
        orderIndex: orderIndex || 0,
      })
      .returning();
    
    return NextResponse.json(newMeeting, { status: 201 });
  } catch (error) {
    console.error('Error creating meeting:', error);
    return NextResponse.json(
      { error: 'Failed to create meeting' },
      { status: 500 }
    );
  }
}
