import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { news } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';

// GET - Get single news item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [newsItem] = await db
      .select()
      .from(news)
      .where(eq(news.id, id))
      .limit(1);
    
    if (!newsItem) {
      return NextResponse.json(
        { error: 'News not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(newsItem);
  } catch (error: any) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

// PUT - Update news item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(request);
    
    const { id } = await params;
    const body = await request.json();
    const { title, slug, content, imageUrl, category, date, isPublished } = body;
    
    const [updatedNews] = await db
      .update(news)
      .set({
        title,
        slug,
        content,
        imageUrl: imageUrl || null,
        category,
        date: date ? new Date(date) : undefined,
        isPublished,
        updatedAt: new Date(),
      })
      .where(eq(news.id, id))
      .returning();
    
    if (!updatedNews) {
      return NextResponse.json(
        { error: 'News not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedNews);
  } catch (error: any) {
    console.error('Error updating news:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'A news item with this slug already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update news' },
      { status: 500 }
    );
  }
}

// DELETE - Delete news item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(request);
    
    const { id } = await params;
    const [deletedNews] = await db
      .delete(news)
      .where(eq(news.id, id))
      .returning();
    
    if (!deletedNews) {
      return NextResponse.json(
        { error: 'News not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'News deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting news:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete news' },
      { status: 500 }
    );
  }
}
