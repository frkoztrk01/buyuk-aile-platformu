import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { messages } from '@/lib/db/schema';

// POST - Create new message (public API for contact form)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, subject, message: messageText } = body;
    
    if (!fullName || !email || !subject || !messageText) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const [newMessage] = await db
      .insert(messages)
      .values({
        fullName,
        email,
        subject,
        message: messageText,
      })
      .returning();
    
    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
