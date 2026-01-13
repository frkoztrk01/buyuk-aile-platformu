import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { news } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';

// GET - List all news
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const published = searchParams.get('published');
    
    let allNews;
    
    if (published === 'true') {
      allNews = await db
        .select()
        .from(news)
        .where(eq(news.isPublished, true))
        .orderBy(desc(news.date));
    } else if (published === 'false') {
      allNews = await db
        .select()
        .from(news)
        .where(eq(news.isPublished, false))
        .orderBy(desc(news.date));
    } else {
      allNews = await db.select().from(news).orderBy(desc(news.date));
    }
    
    return NextResponse.json(allNews);
  } catch (error: any) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

// POST - Create new news
export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);
    
    const body = await request.json();
    const { title, slug, content, imageUrl, category, date, isPublished } = body;
    
    if (!title || !slug || !content || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const [newNews] = await db
      .insert(news)
      .values({
        title,
        slug,
        content,
        imageUrl: imageUrl || null,
        category,
        date: date ? new Date(date) : new Date(),
        isPublished: isPublished ?? false,
      })
      .returning();
    
    return NextResponse.json(newNews, { status: 201 });
  } catch (error: any) {
    console.error('Error creating news:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'A news item with this slug already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create news' },
      { status: 500 }
    );
  }
}
