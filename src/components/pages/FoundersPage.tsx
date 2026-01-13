'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { Loader2 } from 'lucide-react';
import type { Founder } from '@/lib/db/schema';

export default function FoundersPage() {
  const [founders, setFounders] = useState<Founder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const logoCardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    fetchFounders();
  }, []);

  const fetchFounders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/founders');
      if (!response.ok) {
        throw new Error('Failed to fetch founders');
      }
      const data = await response.json();
      setFounders(data);
    } catch (error) {
      console.error('Error fetching founders:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

    // Animate logos with stagger
    if (logoCardsRef.current.length > 0) {
      const validCards = logoCardsRef.current.filter(Boolean) as HTMLElement[];
      
      // Use Intersection Observer for scroll-triggered animation
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const card = entry.target as HTMLElement;
              gsap.fromTo(
                card,
                { opacity: 0, scale: 0.9 },
                {
                  opacity: 1,
                  scale: 1,
                  duration: 0.6,
                  ease: 'power2.out',
                }
              );
              observer.unobserve(card);
            }
          });
        },
        { threshold: 0.1 }
      );

      validCards.forEach((card) => {
        observer.observe(card);
      });

      return () => {
        validCards.forEach((card) => {
          observer.unobserve(card);
        });
      };
    }
  }, [founders]);

  const handleLogoHover = (cardElement: HTMLElement, isEntering: boolean) => {
    const logo = cardElement.querySelector('img');
    
    if (isEntering) {
      gsap.to(logo, {
        opacity: 1,
        filter: 'grayscale(0%)',
        duration: 0.3,
        ease: 'power2.out',
      });
      gsap.to(cardElement, {
        backgroundColor: '#F5F5F0',
        duration: 0.3,
        ease: 'power2.out',
      });
    } else {
      gsap.to(logo, {
        opacity: 0.7,
        filter: 'grayscale(100%)',
        duration: 0.3,
        ease: 'power2.out',
      });
      gsap.to(cardElement, {
        backgroundColor: '#FFFFFF',
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-white pt-24 lg:pt-40">
      <div className="relative max-w-7xl mx-auto px-5 lg:px-12">
        {/* Page Header */}
        <div ref={headerRef} className="py-12 lg:py-20 text-center border-b border-black/[0.05] lg:border-b-0 pb-6 lg:pb-0" style={{ opacity: 0 }}>
          <h1 className="text-3xl lg:text-4xl xl:text-6xl 2xl:text-7xl font-bold uppercase tracking-tighter text-[#1E3A5F] font-montserrat leading-none mb-4 lg:mb-6">
            KURUCU KURULUŞLAR
          </h1>
          <p className="text-base lg:text-lg leading-relaxed text-[#1E3A5F] font-sans max-w-3xl mx-auto">
            Platformumuzun temelini atan ve aile değerleri için güç birliği yapan kıymetli kuruluşlarımız.
          </p>
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
            {/* Logo Grid - Responsive: 2 cols mobile, 3 tablet, 4 desktop, 5 xl */}
            <div
              ref={gridRef}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 border-t border-l border-gray-100"
            >
              {founders.map((founder, index) => (
                <div
                  key={founder.id}
                  ref={(el) => {
                    logoCardsRef.current[index] = el;
                  }}
                  className="aspect-square border-b border-r border-gray-100 p-6 lg:p-8 xl:p-12 flex items-center justify-center bg-white hover:bg-[#F5F5F0] transition-none relative group cursor-pointer min-h-[120px] lg:min-h-[auto]"
                  style={{ opacity: 0 }}
                  onMouseEnter={(e) => {
                    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
                      handleLogoHover(e.currentTarget, true);
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
                      handleLogoHover(e.currentTarget, false);
                    }
                  }}
                >
                  {/* Dark blue bottom border on hover */}
                  <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#1E3A5F] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Logo */}
                  <div className="w-full h-full flex items-center justify-center">
                    {founder.logoUrl ? (
                      <img
                        src={founder.logoUrl}
                        alt="Logo"
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <p className="text-xs md:text-sm font-bold uppercase tracking-tight text-[#1E3A5F] text-center px-4 font-montserrat">
                        Logo
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {founders.length === 0 && !isLoading && (
              <div className="text-center py-20">
                <p className="text-lg text-[#1E3A5F] font-sans">
                  Henüz kurucu kuruluş bulunmuyor.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
