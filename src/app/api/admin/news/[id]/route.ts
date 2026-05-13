import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { news } from '@/lib/db/schema';
import { withResolvedNewsFields } from '@/lib/media-url';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import { slugifyNewsTitle } from '@/lib/slugify-news';
import { postgresErrorCode, rootErrorMessage } from '@/lib/db-errors';

const MAX_IMAGE_URL_CHARS = 2_000_000;

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
    
    return NextResponse.json(withResolvedNewsFields(newsItem));
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

    const slugResolved = slugifyNewsTitle(String(title ?? ''));

    let dateValue: Date | undefined;
    if (date !== undefined && date !== null && String(date).length > 0) {
      const parsed = new Date(String(date));
      if (Number.isNaN(parsed.getTime())) {
        return NextResponse.json({ error: 'Geçersiz tarih' }, { status: 400 });
      }
      dateValue = parsed;
    }

    const [updatedNews] = await db
      .update(news)
      .set({
        title: String(title),
        slug: slugResolved,
        content: String(content),
        imageUrl: imageStr || null,
        category: String(category),
        ...(dateValue !== undefined ? { date: dateValue } : {}),
        isPublished: Boolean(isPublished),
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

    const pgCode = postgresErrorCode(error);
    if (pgCode === '23505') {
      return NextResponse.json(
        { error: 'Bu slug zaten kullanılıyor; başlığı değiştirerek tekrar deneyin.' },
        { status: 409 }
      );
    }
    
    const detail = rootErrorMessage(error);
    return NextResponse.json(
      { error: detail || 'Failed to update news' },
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
