import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { meetings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';

// GET - Get single meeting
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [meeting] = await db
      .select()
      .from(meetings)
      .where(eq(meetings.id, id))
      .limit(1);
    
    if (!meeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(meeting);
  } catch (error) {
    console.error('Error fetching meeting:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meeting' },
      { status: 500 }
    );
  }
}

// PUT - Update meeting
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    
    const { id } = await params;
    const body = await request.json();
    const { title, date, videoUrl, description, orderIndex } = body;
    
    const [updatedMeeting] = await db
      .update(meetings)
      .set({
        ...(title && { title }),
        ...(date && { date: new Date(date) }),
        videoUrl: videoUrl !== undefined ? (videoUrl || null) : undefined,
        description: description !== undefined ? (description || null) : undefined,
        ...(orderIndex !== undefined && { orderIndex: parseInt(String(orderIndex), 10) || 0 }),
        updatedAt: new Date(),
      })
      .where(eq(meetings.id, id))
      .returning();
    
    if (!updatedMeeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedMeeting);
  } catch (error) {
    console.error('Error updating meeting:', error);
    return NextResponse.json(
      { error: 'Failed to update meeting' },
      { status: 500 }
    );
  }
}

// DELETE - Delete meeting
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    
    const { id } = await params;
    const [deletedMeeting] = await db
      .delete(meetings)
      .where(eq(meetings.id, id))
      .returning();
    
    if (!deletedMeeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    return NextResponse.json(
      { error: 'Failed to delete meeting' },
      { status: 500 }
    );
  }
}
