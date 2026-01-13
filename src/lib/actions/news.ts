'use server';

import db from '@/lib/db';
import { news } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateSlug } from '@/lib/utils/slug';
import { requireAuth } from '@/lib/auth';

export async function getNews(published?: boolean) {
  await requireAuth();
  
  try {
    if (published !== undefined) {
      const allNews = await db
        .select()
        .from(news)
        .where(eq(news.isPublished, published))
        .orderBy(news.date);
      return { success: true, data: allNews };
    }
    
    const allNews = await db.select().from(news).orderBy(news.date);
    return { success: true, data: allNews };
  } catch (error) {
    console.error('Error fetching news:', error);
    return { success: false, error: 'Failed to fetch news' };
  }
}

export async function getNewsById(id: string) {
  await requireAuth();
  
  try {
    const [newsItem] = await db
      .select()
      .from(news)
      .where(eq(news.id, id))
      .limit(1);
    
    if (!newsItem) {
      return { success: false, error: 'News not found' };
    }
    
    return { success: true, data: newsItem };
  } catch (error) {
    console.error('Error fetching news:', error);
    return { success: false, error: 'Failed to fetch news' };
  }
}

export async function createNews(formData: FormData) {
  await requireAuth();
  
  try {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const category = formData.get('category') as string;
    const imageUrl = formData.get('imageUrl') as string | null;
    const date = formData.get('date') as string;
    const isPublished = formData.get('isPublished') === 'true';
    
    if (!title || !content || !category) {
      return { success: false, error: 'Missing required fields' };
    }
    
    const slug = generateSlug(title);
    
    const [newNews] = await db
      .insert(news)
      .values({
        title,
        slug,
        content,
        imageUrl: imageUrl || null,
        category,
        date: date ? new Date(date) : new Date(),
        isPublished,
      })
      .returning();
    
    return { success: true, data: newNews };
  } catch (error: any) {
    console.error('Error creating news:', error);
    
    if (error.code === '23505') {
      return { success: false, error: 'A news item with this slug already exists' };
    }
    
    return { success: false, error: 'Failed to create news' };
  }
}

export async function updateNews(id: string, formData: FormData) {
  await requireAuth();
  
  try {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const category = formData.get('category') as string;
    const imageUrl = formData.get('imageUrl') as string | null;
    const date = formData.get('date') as string;
    const isPublished = formData.get('isPublished') === 'true';
    
    const slug = title ? generateSlug(title) : undefined;
    
    const [updatedNews] = await db
      .update(news)
      .set({
        ...(title && { title }),
        ...(slug && { slug }),
        ...(content && { content }),
        imageUrl: imageUrl || null,
        ...(category && { category }),
        ...(date && { date: new Date(date) }),
        isPublished,
        updatedAt: new Date(),
      })
      .where(eq(news.id, id))
      .returning();
    
    if (!updatedNews) {
      return { success: false, error: 'News not found' };
    }
    
    return { success: true, data: updatedNews };
  } catch (error: any) {
    console.error('Error updating news:', error);
    
    if (error.code === '23505') {
      return { success: false, error: 'A news item with this slug already exists' };
    }
    
    return { success: false, error: 'Failed to update news' };
  }
}

export async function deleteNews(id: string) {
  await requireAuth();
  
  try {
    const [deletedNews] = await db
      .delete(news)
      .where(eq(news.id, id))
      .returning();
    
    if (!deletedNews) {
      return { success: false, error: 'News not found' };
    }
    
    return { success: true, message: 'News deleted successfully' };
  } catch (error) {
    console.error('Error deleting news:', error);
    return { success: false, error: 'Failed to delete news' };
  }
}
