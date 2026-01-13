'use client';

import { useEffect, useState } from 'react';
import UniversalDetailPage from './UniversalDetailPage';
import { Loader2 } from 'lucide-react';
import type { News } from '@/lib/db/schema';

interface NewsDetailClientProps {
  slug: string;
}

export default function NewsDetailClient({ slug }: NewsDetailClientProps) {
  const [newsItem, setNewsItem] = useState<News | null>(null);
  const [relatedItems, setRelatedItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNewsItem();
  }, [slug]);

  const fetchNewsItem = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch the news item by slug
      const encodedSlug = encodeURIComponent(slug);
      const response = await fetch(`/api/news?slug=${encodedSlug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Haber bulunamadı');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Haber yüklenirken bir hata oluştu');
      }

      const data: News = await response.json();
      setNewsItem(data);

      // Fetch related items (same category, excluding current)
      const relatedResponse = await fetch(`/api/news?category=${data.category}&limit=5`);
      if (relatedResponse.ok) {
        const related: News[] = await relatedResponse.json();
        const filtered = related
          .filter((item) => item.id !== data.id)
          .slice(0, 5)
          .map((item) => ({
            id: item.id,
            title: item.title,
            date: new Date(item.date).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }).toUpperCase(),
            imageURL: item.imageUrl || '/images/banner.jpg',
          }));
        setRelatedItems(filtered);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setError('Haber bulunamadı');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#1E3A5F]" />
          <p className="text-lg text-[#1E3A5F] font-sans">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !newsItem) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-[#1E3A5F] font-sans">{error || 'Haber bulunamadı'}</p>
      </div>
    );
  }

  // Determine type based on category
  const getType = (category: string): 'news' | 'event' | 'announcement' => {
    if (category === 'Etkinlik') return 'event';
    if (category === 'Duyuru') return 'announcement';
    return 'news';
  };

  // Format date
  const formattedDate = new Date(newsItem.date).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).toUpperCase();

  // Format category for display
  const displayCategory = newsItem.category === 'Duyuru' ? 'Duyurular' : 
                          newsItem.category === 'Haber' ? 'Haberler' : 
                          newsItem.category === 'Etkinlik' ? 'Etkinlikler' : newsItem.category;

  return (
    <UniversalDetailPage
      type={getType(newsItem.category)}
      title={newsItem.title}
      date={formattedDate}
      category={displayCategory}
      featuredImage={newsItem.imageUrl || '/images/banner.jpg'}
      content={newsItem.content}
      relatedItems={relatedItems}
    />
  );
}
