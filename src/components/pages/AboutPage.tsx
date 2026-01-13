'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { markdownToHtml } from '@/lib/utils/markdown';
import type { About } from '@/lib/db/schema';

export default function AboutPage() {
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [aboutData, setAboutData] = useState<About | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/about');
      if (!response.ok) {
        throw new Error('Failed to fetch about');
      }
      const data = await response.json();
      setAboutData(data);
    } catch (error) {
      console.error('Error fetching about:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Split content into first paragraph and rest
  const getContentParts = (content: string | null) => {
    if (!content) return { firstParagraph: '', rest: '' };
    
    // Split by double newlines to get paragraphs
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim());
    
    if (paragraphs.length === 0) return { firstParagraph: '', rest: '' };
    
    const firstParagraph = paragraphs[0];
    const rest = paragraphs.slice(1).join('\n\n');
    
    return { firstParagraph, rest };
  };

  useEffect(() => {
    if (isLoading) return;
    
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    const durationMultiplier = isMobile ? 0.8 : 1;
    
    // Animate hero section
    if (heroTitleRef.current) {
      gsap.fromTo(
        heroTitleRef.current,
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

    if (heroTextRef.current) {
      gsap.fromTo(
        heroTextRef.current,
        { opacity: 0, y: isMobile ? 15 : 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8 * durationMultiplier,
          delay: 0.4 * durationMultiplier,
          ease: 'power2.out',
        }
      );
    }

    // Animate content paragraphs - simplified on mobile
    if (contentRef.current) {
      const paragraphs = contentRef.current.querySelectorAll('p');
      gsap.fromTo(
        paragraphs,
        { opacity: 0, y: isMobile ? 10 : 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6 * durationMultiplier,
          stagger: isMobile ? 0.05 : 0.1,
          delay: 0.6 * durationMultiplier,
          ease: 'power2.out',
        }
      );
    }

    // Animate sidebar - simplified on mobile
    if (sidebarRef.current) {
      gsap.fromTo(
        sidebarRef.current,
        { opacity: 0, x: isMobile ? 0 : -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6 * durationMultiplier,
          delay: 0.8 * durationMultiplier,
          ease: 'power2.out',
        }
      );
    }
  }, [isLoading, aboutData]);

  if (isLoading) {
    return (
      <div className="relative w-full min-h-screen bg-[#F5F5F0] pt-30 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#1E3A5F]" />
          <p className="text-lg text-[#1E3A5F] font-sans">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-[#F5F5F0] pt-24 lg:pt-30">
      <div className="relative max-w-7xl mx-auto">
        {/* Subtle Vertical Lines - Only on desktop, left and right margins on mobile */}
        <div className="absolute inset-0 pointer-events-none hidden lg:block">
          {/* Left boundary line */}
          <div className="absolute left-0 top-0 bottom-0 w-px border-r border-black/[0.05]" />
          {/* Center separator line (between title and content) */}
          <div className="absolute left-[40%] top-0 bottom-0 w-px border-r border-black/[0.05]" />
        </div>

        {/* Hero Section - Stack on mobile, split on desktop */}
        <div className="relative grid grid-cols-1 lg:grid-cols-10 gap-0 py-12 lg:py-20 px-5 lg:px-12 border-b border-black/[0.05] lg:border-b-0">
          {/* Left Column (40%) - Title and Image - Centered between two lines */}
          <div className="col-span-1 lg:col-span-4 pr-0 lg:pr-12 pb-8 lg:pb-0 flex flex-col items-center justify-center">
            <h1
              ref={heroTitleRef}
              className="text-3xl lg:text-4xl xl:text-7xl font-bold uppercase tracking-tighter text-[#1E3A5F] font-montserrat leading-none mb-6 lg:mb-8 text-center"
              style={{ opacity: 0 }}
            >
              HAKKIMIZDA
            </h1>
            
            {/* Hero Image */}
            {aboutData?.heroImageUrl ? (
              <div className="w-full h-64 lg:h-96 border border-black/10 overflow-hidden">
                <img
                  src={aboutData.heroImageUrl}
                  alt="Aile Fotoğrafı"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
            ) : (
              <div className="w-full h-64 lg:h-96 bg-gray-200 border border-black/10 flex items-center justify-center">
                <span className="text-gray-400 text-sm uppercase tracking-widest">
                  Aile Fotoğrafı
                </span>
              </div>
            )}
          </div>

          {/* Right Column (60%) - Core Text */}
          <div className="col-span-1 lg:col-span-6 pl-0 lg:pl-12">
            <div ref={heroTextRef} style={{ opacity: 0 }}>
              {/* Pull-quote with Serif font */}
              {aboutData?.heroQuote && (
                <div className="mb-6 lg:mb-8">
                  <p className="text-lg lg:text-xl xl:text-2xl leading-relaxed text-[#1E3A5F] font-serif italic mb-3 lg:mb-4">
                    "{aboutData.heroQuote}"
                  </p>
                  {aboutData.heroQuoteSource && (
                    <p className="text-xs lg:text-sm uppercase tracking-widest text-[#1E3A5F] font-montserrat">
                      {aboutData.heroQuoteSource}
                    </p>
                  )}
                </div>
              )}

              {/* First paragraph from markdown content */}
              {aboutData?.content ? (() => {
                const { firstParagraph } = getContentParts(aboutData.content);
                if (firstParagraph) {
                  // Convert markdown to plain text for first paragraph
                  let plainText = firstParagraph
                    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
                    .replace(/\*(.*?)\*/g, '$1') // Remove italic
                    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
                    .trim();
                  
                  // Extract first letter for drop cap effect
                  const firstLetter = plainText.charAt(0);
                  const restOfParagraph = plainText.slice(1);
                  
                  return (
                    <div className="mb-4 lg:mb-6">
                      <p className="text-base lg:text-lg leading-relaxed text-[#1E3A5F] font-sans">
                        <span className="text-3xl lg:text-4xl xl:text-5xl font-serif text-[#1E3A5F] float-left mr-2 leading-none">{firstLetter}</span>
                        {restOfParagraph}
                      </p>
                    </div>
                  );
                }
                return null;
              })() : (
                <p className="text-base lg:text-lg leading-relaxed text-[#1E3A5F] font-sans">
                  İçerik henüz eklenmemiş.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Horizontal Divider - Dark Blue */}
        <div className="border-b border-[#1E3A5F]/20 mx-5 lg:mx-12" />

        {/* Content Body - Stack on mobile */}
        <div className="relative grid grid-cols-1 lg:grid-cols-10 gap-0 py-12 lg:py-20 px-5 lg:px-12">
          {/* Sidebar - Kurumsal Menu - Full width on mobile, sticky on desktop */}
          <div ref={sidebarRef} className="col-span-1 lg:col-span-3 pr-0 lg:pr-12 mb-8 lg:mb-0" style={{ opacity: 0 }}>
            <div className="lg:sticky lg:top-32">
              <h3 className="uppercase text-xs font-bold tracking-widest mb-4 lg:mb-6 text-[#1E3A5F] font-montserrat">
                Kurumsal
              </h3>
              <ul className="space-y-0 border border-black/10">
                {[
                  { label: 'Hakkımızda', href: '/hakkimizda', active: true },
                  { label: 'Mutabakat Zaptı', href: '/mutabakat' },
                  { label: 'Kurucu Kuruluşlar', href: '/kurucu-kuruluslar' },
                  { label: 'Üyeler', href: '/uyeler' },
                ].map((link, index) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`block px-4 lg:px-6 py-3 lg:py-4 text-sm uppercase tracking-wide font-sans transition-none border-b border-black/10 last:border-b-0 min-h-[44px] flex items-center ${
                        link.active
                          ? 'bg-[#1E3A5F] text-white font-bold'
                          : 'text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main Content - Full width on mobile */}
          <div ref={contentRef} className="col-span-1 lg:col-span-7 pl-0 lg:pl-12">
            {aboutData?.content ? (() => {
              const { rest } = getContentParts(aboutData.content);
              if (rest) {
                return (
                  <div 
                    className="text-base lg:text-lg leading-relaxed text-[#1E3A5F] font-sans prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: markdownToHtml(rest) }}
                  />
                );
              }
              return null;
            })() : (
              <p className="text-base lg:text-lg leading-relaxed text-[#1E3A5F] font-sans">
                İçerik henüz eklenmemiş.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
