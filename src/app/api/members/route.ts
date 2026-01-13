import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { members } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET - List members (public API)
export async function GET(request: NextRequest) {
  try {
    const allMembers = await db
      .select()
      .from(members)
      .orderBy(members.name);
    
    return NextResponse.json(allMembers);
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}
