import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { meetings } from '@/lib/db/schema';
import { withResolvedMeetingFields } from '@/lib/media-url';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidMeetingId(id: string | undefined): boolean {
  return Boolean(id && id !== 'undefined' && UUID_RE.test(id));
}

// GET - Get single meeting
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!isValidMeetingId(id)) {
      return NextResponse.json({ error: 'Geçersiz buluşma kimliği' }, { status: 400 });
    }
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
    
    return NextResponse.json(withResolvedMeetingFields(meeting));
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
    if (!isValidMeetingId(id)) {
      return NextResponse.json({ error: 'Geçersiz buluşma kimliği' }, { status: 400 });
    }
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
    if (!isValidMeetingId(id)) {
      return NextResponse.json({ error: 'Geçersiz buluşma kimliği' }, { status: 400 });
    }
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
