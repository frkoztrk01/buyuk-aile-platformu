import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { messages } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';

// GET - List all messages
export async function GET(request: NextRequest) {
  try {
    const allMessages = await db
      .select()
      .from(messages)
      .orderBy(desc(messages.createdAt));
    
    return NextResponse.json(allMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
