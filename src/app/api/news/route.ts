import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { news } from '@/lib/db/schema';
import { withResolvedNewsFields } from '@/lib/media-url';
import { eq, desc, and } from 'drizzle-orm';

// GET - List published news (public API)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const limit = searchParams.get('limit');
    const slug = searchParams.get('slug');
    
    // Get single news by slug
    if (slug) {
      const [newsItem] = await db
        .select()
        .from(news)
        .where(and(eq(news.slug, slug), eq(news.isPublished, true)))
        .limit(1);
      
      if (!newsItem) {
        return NextResponse.json(
          { error: 'News not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(withResolvedNewsFields(newsItem));
    }
    
    // Get news list
    let allNews;
    
    if (category) {
      allNews = await db
        .select()
        .from(news)
        .where(and(eq(news.isPublished, true), eq(news.category, category)))
        .orderBy(desc(news.date));
    } else {
      allNews = await db
        .select()
        .from(news)
        .where(eq(news.isPublished, true))
        .orderBy(desc(news.date));
    }
    
    // Apply limit if provided
    if (limit) {
      const limitNum = parseInt(limit, 10);
      allNews = allNews.slice(0, limitNum);
    }
    
    return NextResponse.json(allNews.map(withResolvedNewsFields));
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
