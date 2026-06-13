'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { renderContentPlainText } from '@/lib/utils/markdown';
import type { News } from '@/lib/db/schema';

gsap.registerPlugin(ScrollTrigger);

interface NewsItem {
  id: string;
  title: string;
  dateDay: string;
  dateMonthYear: string;
  imageURL: string;
  excerpt: string;
  slug: string;
}

export default function PressCenterSlider() {
  const router = useRouter();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const ctxRef = useRef<gsap.Context | null>(null);

  // Fetch latest published news
  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news?limit=5');
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      const data: News[] = await response.json();
      
      // Transform data to match component interface
      const transformed: NewsItem[] = data.map((item) => {
        const date = new Date(item.date);
        const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
        
        return {
          id: item.id,
          slug: item.slug,
          title: item.title,
          dateDay: date.getDate().toString(),
          dateMonthYear: `${months[date.getMonth()]} ${date.getFullYear()}`,
          imageURL: item.imageUrl || '/images/banner.jpg',
          excerpt: item.content
            ? renderContentPlainText(item.content).substring(0, 120) + '...'
            : '',
        };
      });
      
      setNewsItems(transformed);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    const durationMultiplier = isMobile ? 0.8 : 1;

    // Initialize GSAP context for memory management
    if (sliderRef.current) {
      ctxRef.current = gsap.context(() => {
        // Set initial states for mask layers and white text containers
        cardsRef.current.forEach((card, index) => {
          if (card) {
            const maskLayer = card.querySelector('.mask-layer') as HTMLElement;
            const whiteTextContainer = card.querySelector('.white-text-container') as HTMLElement;
            
            if (maskLayer) {
              gsap.set(maskLayer, {
                yPercent: 100,
              });
            }
            
            if (whiteTextContainer) {
              gsap.set(whiteTextContainer, {
                yPercent: -100,
              });
            }

            // Mobile: Scroll-triggered reveal instead of hover
            if (isMobile && maskLayer && whiteTextContainer) {
              ScrollTrigger.create({
                trigger: card,
                start: 'top center',
                end: 'bottom center',
                onEnter: () => handleCardReveal(index, true),
                onLeave: () => handleCardReveal(index, false),
                onEnterBack: () => handleCardReveal(index, true),
                onLeaveBack: () => handleCardReveal(index, false),
                toggleActions: 'play reverse play reverse',
              });
            }
          }
        });
      }, sliderRef.current);
    }

    // Animate cards on mount
    if (cardsRef.current.length > 0) {
      gsap.fromTo(
        cardsRef.current.filter(Boolean) as HTMLElement[],
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6 * durationMultiplier,
          stagger: 0.1 * durationMultiplier,
          delay: 0.2 * durationMultiplier,
          ease: 'power2.out',
        }
      );
    }

    return () => {
      if (ctxRef.current) {
        ctxRef.current.revert();
      }
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [newsItems]);

  const handleCardReveal = (index: number, isRevealing: boolean) => {
    const card = cardsRef.current[index];
    if (!card) return;

    const maskLayer = card.querySelector('.mask-layer') as HTMLElement;
    const whiteTextContainer = card.querySelector('.white-text-container') as HTMLElement;
    const titleWhite = whiteTextContainer?.querySelector('.title-white') as HTMLElement;
    const excerpt = card.querySelector('.card-excerpt') as HTMLElement;

    if (!maskLayer) return;

    const isMobile = window.innerWidth < 1024;
    const durationMultiplier = isMobile ? 0.8 : 1;

    if (isRevealing) {
      const tl = gsap.timeline();

      tl.to(maskLayer, {
        yPercent: 0,
        duration: 0.6 * durationMultiplier,
        ease: 'expo.out',
      });

      if (whiteTextContainer) {
        tl.to(whiteTextContainer, {
          yPercent: 0,
          duration: 0.6 * durationMultiplier,
          ease: 'expo.out',
        }, 0);
      }

      if (titleWhite) {
        tl.to(titleWhite, {
          y: -10,
          duration: 0.3 * durationMultiplier,
          ease: 'power2.out',
        }, 0.2 * durationMultiplier);
      }

      if (excerpt) {
        tl.fromTo(
          excerpt,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.4 * durationMultiplier,
            ease: 'power2.out',
          },
          0.3 * durationMultiplier
        );
      }
    } else {
      const tl = gsap.timeline();

      if (excerpt) {
        tl.to(excerpt, {
          y: 20,
          opacity: 0,
          duration: 0.2 * durationMultiplier,
          ease: 'power2.in',
        });
      }

      if (titleWhite) {
        tl.to(titleWhite, {
          y: 0,
          duration: 0.3 * durationMultiplier,
          ease: 'power2.out',
        }, 0);
      }

      tl.to(maskLayer, {
        yPercent: 100,
        duration: 0.5 * durationMultiplier,
        ease: 'power4.in',
      }, 0.1 * durationMultiplier);

      if (whiteTextContainer) {
        tl.to(whiteTextContainer, {
          yPercent: -100,
          duration: 0.5 * durationMultiplier,
          ease: 'power4.in',
        }, 0.1 * durationMultiplier);
      }
    }
  };

  const handleCardHover = (index: number, isEntering: boolean) => {
    // Only handle hover on desktop
    if (window.innerWidth < 1024) return;
    handleCardReveal(index, isEntering);
  };

  const scrollSlider = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;

    const isMobile = window.innerWidth < 1024;
    const cardWidth = isMobile ? 280 + 16 : 400 + 32; // card width + margin
    const scrollAmount = cardWidth * (isMobile ? 1 : 2); // scroll 1 card on mobile, 2 on desktop

    const currentScroll = sliderRef.current.scrollLeft;
    const newScroll =
      direction === 'right'
        ? currentScroll + scrollAmount
        : currentScroll - scrollAmount;

    gsap.to(sliderRef.current, {
      scrollLeft: newScroll,
      duration: 0.24, // 20% faster
      ease: 'power2.inOut',
    });
  };

  return (
    <section
      className="relative w-full min-h-screen lg:min-h-screen snap-start snap-always border-t border-black/10"
      style={{ backgroundColor: '#F5F5F0' }}
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-12 py-12 lg:py-20">
        {/* Section Title */}
        <div className="mb-8 lg:mb-12">
          <h2 className="text-[#336699] uppercase font-black tracking-widest text-xl lg:text-2xl xl:text-3xl font-montserrat antialiased">
            BASIN MERKEZİ
          </h2>
        </div>

        {/* Slider Container with Navigation */}
        <div className="relative">
          {/* Navigation Arrows - Hidden on mobile */}
          <button
            onClick={() => scrollSlider('left')}
            className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 bg-[#1E3A5F] flex items-center justify-center hover:bg-[#336699] transition-none min-w-[44px] min-h-[44px]"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={() => scrollSlider('right')}
            className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 bg-[#1E3A5F] flex items-center justify-center hover:bg-[#336699] transition-none min-w-[44px] min-h-[44px]"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          {/* Horizontal Slider - Touch swipe enabled */}
          <div
            ref={sliderRef}
            className="flex overflow-x-auto scrollbar-hide gap-4 lg:gap-8 pb-4"
            style={{
              scrollBehavior: 'smooth',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
            }}
          >
            {newsItems.map((item, index) => (
              <div
                key={item.id}
                ref={(el) => {
                  cardsRef.current[index] = el;
                }}
                className="relative w-[280px] lg:w-[400px] h-[350px] lg:h-[500px] flex-shrink-0 border border-black/10 bg-white overflow-hidden cursor-pointer"
                style={{ 
                  opacity: 0,
                  minWidth: '280px',
                  minHeight: '350px',
                }}
              >
                {/* LAYER 0 - BASE: Blue text on White background */}
                <div className="relative z-0 h-full flex flex-col">
                  {/* Top Half - Primary Title */}
                  <div className="flex-1 p-4 lg:p-8 flex items-start">
                    <h3 className="text-[#1E3A5F] text-lg lg:text-2xl font-bold uppercase leading-tight font-montserrat antialiased">
                      {item.title}
                    </h3>
                  </div>

                  {/* Divider */}
                  <div className="border-b border-black/10" />

                  {/* Bottom Half - Primary Date */}
                  <div className="p-4 lg:p-8">
                    <div className="flex items-baseline gap-2 lg:gap-4">
                      <span className="text-5xl lg:text-7xl font-black text-[#1E3A5F] leading-none font-montserrat antialiased">
                        {item.dateDay}
                      </span>
                      <span className="text-sm lg:text-lg font-normal text-[#1E3A5F] font-montserrat antialiased">
                        {item.dateMonthYear}
                      </span>
                    </div>
                  </div>
                </div>

                {/* LAYER 1 - MASK: The "Paint Brush" container (slides up from bottom) */}
                <div
                  className="mask-layer absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-10"
                >
                  {/* Background Image - Fixed position inside mask with explicit dimensions to prevent layout shift */}
                  <img
                    src={item.imageURL}
                    alt={item.title}
                    width={400}
                    height={500}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading={index < 2 ? 'eager' : 'lazy'}
                    style={{
                      minWidth: '100%',
                      minHeight: '100%',
                      display: 'block',
                    }}
                    onLoad={(e) => {
                      const img = e.currentTarget;
                      img.style.opacity = '1';
                    }}
                    onError={(e) => {
                      const img = e.currentTarget;
                      img.style.display = 'none';
                    }}
                  />

                  {/* Gradient Overlay for text readability */}
                  <div
                    className="absolute inset-0 z-10"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                    }}
                  />

                  {/* White Text Container - Pixel-perfect aligned with base layer */}
                  <div className="white-text-container relative z-20 h-full flex flex-col">
                    {/* Top Half - White Title (exact same padding and layout as base layer) */}
                    <div className="flex-1 p-4 lg:p-8 flex flex-col justify-between">
                      <h3 className="title-white text-white text-lg lg:text-2xl font-bold uppercase leading-tight font-montserrat antialiased">
                        {item.title}
                      </h3>
                      <p className="card-excerpt text-white text-sm lg:text-base leading-relaxed font-sans antialiased" style={{ opacity: 0 }}>
                        {item.excerpt}
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="border-b border-white/20" />

                    {/* Bottom Half - White Date (exact same padding and layout as base layer) */}
                    <div className="p-4 lg:p-8">
                      <div className="flex items-baseline gap-2 lg:gap-4">
                        <span className="text-5xl lg:text-7xl font-black text-white leading-none font-montserrat antialiased">
                          {item.dateDay}
                        </span>
                        <span className="text-sm lg:text-lg font-normal text-white font-montserrat antialiased">
                          {item.dateMonthYear}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* LAYER 2 - TRIGGER: Transparent hover detection layer (topmost) */}
                <div
                  className="absolute inset-0 w-full h-full z-30 cursor-pointer"
                  onMouseEnter={() => handleCardHover(index, true)}
                  onMouseLeave={() => handleCardHover(index, false)}
                  onClick={() => {
                    router.push(`/haber/${item.slug}`);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
