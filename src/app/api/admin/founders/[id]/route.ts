import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { founders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';

// GET - Get single founder
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [founder] = await db
      .select()
      .from(founders)
      .where(eq(founders.id, id))
      .limit(1);
    
    if (!founder) {
      return NextResponse.json(
        { error: 'Founder not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(founder);
  } catch (error) {
    console.error('Error fetching founder:', error);
    return NextResponse.json(
      { error: 'Failed to fetch founder' },
      { status: 500 }
    );
  }
}

// PUT - Update founder
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    
    const { id } = await params;
    const body = await request.json();
    const { logoUrl } = body;
    
    const [updatedFounder] = await db
      .update(founders)
      .set({
        logoUrl,
        updatedAt: new Date(),
      })
      .where(eq(founders.id, id))
      .returning();
    
    if (!updatedFounder) {
      return NextResponse.json(
        { error: 'Founder not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedFounder);
  } catch (error) {
    console.error('Error updating founder:', error);
    return NextResponse.json(
      { error: 'Failed to update founder' },
      { status: 500 }
    );
  }
}

// DELETE - Delete founder
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    
    const { id } = await params;
    const [deletedFounder] = await db
      .delete(founders)
      .where(eq(founders.id, id))
      .returning();
    
    if (!deletedFounder) {
      return NextResponse.json(
        { error: 'Founder not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Founder deleted successfully' });
  } catch (error) {
    console.error('Error deleting founder:', error);
    return NextResponse.json(
      { error: 'Failed to delete founder' },
      { status: 500 }
    );
  }
}
