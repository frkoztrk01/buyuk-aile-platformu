'use client';

import { useRef, useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import type { News } from '@/lib/db/schema';

interface NewsItem extends Omit<News, 'date'> {
  date: string; // Transformed to formatted string
  imageURL?: string;
  excerpt?: string;
}

const categories: ('Tümü' | 'Duyurular' | 'Haberler' | 'Etkinlikler')[] = ['Tümü', 'Duyurular', 'Haberler', 'Etkinlikler'];

function NewsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const [selectedCategory, setSelectedCategory] = useState<'Tümü' | 'Duyurular' | 'Haberler' | 'Etkinlikler'>(
    (categoryParam && categories.includes(categoryParam as any)) ? (categoryParam as any) : 'Tümü'
  );
  const [displayedItems, setDisplayedItems] = useState(6);
  const [allNewsItems, setAllNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const headerRef = useRef<HTMLDivElement>(null);
  const newsCardsRef = useRef<HTMLDivElement>(null);

  // Fetch news from API
  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/news');
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      const data = await response.json();
      
      // Transform data to match component interface
      const transformedData: NewsItem[] = data.map((item: News) => ({
        ...item,
        imageURL: item.imageUrl || '/images/banner.jpg',
        excerpt: item.content ? item.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : undefined,
        date: new Date(item.date).toLocaleDateString('tr-TR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).toUpperCase(),
      }));
      
      setAllNewsItems(transformedData);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update category when URL param changes
  useEffect(() => {
    if (categoryParam && categories.includes(categoryParam as any)) {
      setSelectedCategory(categoryParam as any);
    }
  }, [categoryParam]);

  // Filter news items by category
  const filteredItems = allNewsItems.filter((item) => {
    if (selectedCategory === 'Tümü') return true;
    // Map database categories to UI categories
    const categoryMap: Record<string, string> = {
      'Duyuru': 'Duyurular',
      'Haber': 'Haberler',
      'Etkinlik': 'Etkinlikler',
    };
    return categoryMap[item.category] === selectedCategory || item.category === selectedCategory;
  });

  const visibleItems = filteredItems.slice(0, displayedItems);
  const hasMore = visibleItems.length < filteredItems.length;

  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    const durationMultiplier = isMobile ? 0.8 : 1;
    
    // Animate header
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: isMobile ? 20 : 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8 * durationMultiplier,
          delay: 0.2 * durationMultiplier,
          ease: 'power3.out',
        }
      );
    }

    // Animate news cards with stagger - simplified on mobile
    if (newsCardsRef.current) {
      const cards = newsCardsRef.current.querySelectorAll('.news-card');
      gsap.fromTo(
        cards,
        { opacity: 0, y: isMobile ? 15 : 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6 * durationMultiplier,
          stagger: isMobile ? 0.05 : 0.1,
          delay: 0.4 * durationMultiplier,
          ease: 'power2.out',
        }
      );
    }
  }, [visibleItems]);

  const handleLoadMore = () => {
    setDisplayedItems((prev) => prev + 6);
  };

  return (
    <div className="relative w-full min-h-screen bg-white pt-24 lg:pt-30">
      <div className="relative max-w-7xl mx-auto px-5 lg:px-12 py-12 lg:py-20">
        {/* Page Header */}
        <div ref={headerRef} className="mb-8 lg:mb-12 border-b border-black/[0.05] pb-6 lg:pb-0 lg:border-b-0" style={{ opacity: 0 }}>
          <h1 className="text-3xl lg:text-4xl xl:text-6xl 2xl:text-7xl font-bold uppercase tracking-tighter text-[#1E3A5F] font-montserrat leading-none mb-4 lg:mb-6">
            {selectedCategory === 'Tümü' ? 'HABERLER' : selectedCategory.toUpperCase()}
          </h1>
          <p className="text-base lg:text-lg leading-relaxed text-[#1E3A5F] font-sans max-w-3xl">
            Platformumuzun güncel haberleri, duyuruları ve etkinlikleri.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8 lg:mb-12 flex gap-2 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setDisplayedItems(6); // Reset pagination when filter changes
              }}
              className={`px-4 lg:px-6 py-2 border border-[#1E3A5F] text-xs lg:text-sm uppercase tracking-tight font-semibold font-montserrat transition-none min-h-[44px] ${
                selectedCategory === category
                  ? 'bg-[#1E3A5F] text-white'
                  : 'bg-transparent text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#1E3A5F]" />
              <p className="text-lg text-[#1E3A5F] font-sans">Yükleniyor...</p>
            </div>
          </div>
        ) : (
          <>
            {/* News Cards Grid - Single column on mobile */}
            <div
              ref={newsCardsRef}
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-8"
            >
              {visibleItems.map((item) => (
            <div
              key={item.id}
              className="news-card group relative bg-white border border-black/10 overflow-hidden cursor-pointer"
              style={{ opacity: 0 }}
              onClick={() => router.push(`/haber/${item.slug}`)}
            >
              {/* Image */}
              <div className="relative w-full h-48 lg:h-64 overflow-hidden">
                <img
                  src={item.imageURL}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {/* Category Badge - Overlay */}
                <div className="absolute top-3 lg:top-4 right-3 lg:right-4">
                  <span className="px-2 lg:px-3 py-1 bg-white/90 border border-black/10 text-[10px] lg:text-xs uppercase tracking-widest text-gray-700 font-montserrat">
                    {item.category === 'Duyuru' ? 'Duyurular' : item.category === 'Haber' ? 'Haberler' : item.category === 'Etkinlik' ? 'Etkinlikler' : item.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 lg:p-6">
                {/* Date - Smaller on mobile */}
                <div className="mb-2 lg:mb-3">
                  <span className="text-[10px] lg:text-xs font-bold uppercase tracking-tight text-[#1E3A5F] font-montserrat">
                    {item.date}
                  </span>
                </div>

                {/* Title - Allow wrapping on mobile */}
                <h2 className="text-base lg:text-lg xl:text-xl font-black uppercase tracking-tighter text-[#1E3A5F] font-montserrat leading-tight mb-3 lg:mb-4 group-hover:text-[#336699] transition-colors duration-300">
                  {item.title}
                </h2>

                {/* Excerpt - Hidden on mobile to prioritize title */}
                {item.excerpt && (
                  <p className="hidden lg:block text-sm leading-relaxed text-gray-600 font-sans mb-4 line-clamp-2">
                    {item.excerpt}
                  </p>
                )}

                {/* Arrow Icon */}
                <div className="flex items-center justify-end">
                  <ArrowUpRight
                    className="w-4 h-4 lg:w-5 lg:h-5 text-[#1E3A5F] group-hover:text-[#336699] transition-colors duration-300"
                  />
                </div>
              </div>
            </div>
              ))}
            </div>

            {/* Empty State */}
            {visibleItems.length === 0 && !isLoading && (
              <div className="text-center py-20 col-span-full">
                <p className="text-lg text-[#1E3A5F] font-sans">
                  Seçili kategoriye ait haber bulunamadı.
                </p>
              </div>
            )}

            {/* Load More Button - Full width on mobile */}
            {hasMore && !isLoading && (
              <div className="mt-8 lg:mt-12 text-center">
                <button
                  onClick={handleLoadMore}
                  className="w-full lg:w-auto px-8 py-4 lg:py-4 border-2 border-[#1E3A5F] bg-transparent text-[#1E3A5F] uppercase text-sm font-bold tracking-widest hover:bg-[#1E3A5F] hover:text-white transition-none font-montserrat min-h-[52px]"
                >
                  DAHA FAZLA YÜKLE
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function NewsPage() {
  return (
    <Suspense fallback={
      <div className="relative w-full min-h-screen bg-white pt-24 lg:pt-30">
        <div className="relative max-w-7xl mx-auto px-5 lg:px-12 py-12 lg:py-20">
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#1E3A5F]" />
              <p className="text-lg text-[#1E3A5F] font-sans">Yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <NewsPageContent />
    </Suspense>
  );
}
