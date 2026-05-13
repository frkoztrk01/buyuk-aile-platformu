import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { founders } from '@/lib/db/schema';
import { withResolvedFounderFields } from '@/lib/media-url';
import { requireAuth } from '@/lib/auth';

// GET - List all founders
export async function GET(request: NextRequest) {
  try {
    const allFounders = await db
      .select()
      .from(founders)
      .orderBy(founders.createdAt);
    
    return NextResponse.json(allFounders.map(withResolvedFounderFields));
  } catch (error) {
    console.error('Error fetching founders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch founders' },
      { status: 500 }
    );
  }
}

// POST - Create new founder
export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    
    const body = await request.json();
    const { logoUrl } = body;
    
    if (!logoUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const [newFounder] = await db
      .insert(founders)
      .values({
        logoUrl,
      })
      .returning();
    
    return NextResponse.json(newFounder, { status: 201 });
  } catch (error) {
    console.error('Error creating founder:', error);
    return NextResponse.json(
      { error: 'Failed to create founder' },
      { status: 500 }
    );
  }
}
