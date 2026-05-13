import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { news } from '@/lib/db/schema';
import { withResolvedNewsFields } from '@/lib/media-url';
import { eq, desc, and, ne, type SQL } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import { slugifyNewsTitle } from '@/lib/slugify-news';
import { postgresErrorCode, rootErrorMessage } from '@/lib/db-errors';

const MAX_IMAGE_URL_CHARS = 2_000_000;

// GET - List all news (optional: published, category, excludeCategory)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const published = searchParams.get('published');
    const category = searchParams.get('category');
    const excludeCategory = searchParams.get('excludeCategory');

    const conditions: SQL[] = [];

    if (published === 'true') {
      conditions.push(eq(news.isPublished, true));
    } else if (published === 'false') {
      conditions.push(eq(news.isPublished, false));
    }

    if (category) {
      conditions.push(eq(news.category, category));
    }
    if (excludeCategory) {
      conditions.push(ne(news.category, excludeCategory));
    }

    let allNews;
    if (conditions.length === 0) {
      allNews = await db.select().from(news).orderBy(desc(news.date));
    } else if (conditions.length === 1) {
      allNews = await db
        .select()
        .from(news)
        .where(conditions[0])
        .orderBy(desc(news.date));
    } else {
      allNews = await db
        .select()
        .from(news)
        .where(and(...conditions))
        .orderBy(desc(news.date));
    }

    return NextResponse.json(allNews.map(withResolvedNewsFields));
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

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Geçersiz istek gövdesi (JSON çok büyük veya hatalı olabilir)' },
        { status: 400 }
      );
    }

    const { title, content, imageUrl, category, date, isPublished } = body;

    const slugResolved = slugifyNewsTitle(String(title ?? ''));

    if (!title || !content || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const imageStr = typeof imageUrl === 'string' ? imageUrl : '';
    if (imageStr.length > MAX_IMAGE_URL_CHARS) {
      return NextResponse.json(
        {
          error:
            'Görsel verisi çok büyük. Lütfen daha küçük bir görsel kullanın veya önce dosya yükleyerek URL ile kaydedin.',
        },
        { status: 413 }
      );
    }

    const parsedDate = date ? new Date(String(date)) : new Date();
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: 'Geçersiz tarih' }, { status: 400 });
    }

    const [newNews] = await db
      .insert(news)
      .values({
        title: String(title),
        slug: slugResolved,
        content: String(content),
        imageUrl: imageStr || null,
        category: String(category),
        date: parsedDate,
        isPublished: Boolean(isPublished),
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

    const pgCode = postgresErrorCode(error);
    if (pgCode === '23505') {
      return NextResponse.json(
        { error: 'Bu slug zaten kullanılıyor; başlığı değiştirerek tekrar deneyin.' },
        { status: 409 }
      );
    }

    const detail = rootErrorMessage(error);
    return NextResponse.json(
      {
        error: detail || 'Failed to create news',
      },
      { status: 500 }
    );
  }
}
