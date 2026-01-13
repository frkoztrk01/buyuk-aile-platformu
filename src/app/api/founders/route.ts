import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { founders } from '@/lib/db/schema';

// GET - List founders (public API)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit');
    
    let allFounders = await db
      .select()
      .from(founders)
      .orderBy(founders.createdAt);
    
    // Apply limit if provided
    if (limit) {
      const limitNum = parseInt(limit, 10);
      allFounders = allFounders.slice(0, limitNum);
    }
    
    return NextResponse.json(allFounders);
  } catch (error) {
    console.error('Error fetching founders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch founders' },
      { status: 500 }
    );
  }
}
