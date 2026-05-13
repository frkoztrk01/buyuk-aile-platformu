'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ArrowUpRight, Calendar, MapPin, Clock, Download, Facebook, Twitter, Instagram } from 'lucide-react';
import Link from 'next/link';
import { SOCIAL_LINKS } from '@/lib/site-social';

interface DetailPageProps {
  type: 'news' | 'event' | 'announcement';
  title: string;
  date: string;
  category: string;
  featuredImage: string;
  content: string;
  location?: string;
  eventDate?: string;
  eventTime?: string;
  calendarLink?: string;
  pdfUrl?: string;
  relatedItems?: Array<{
    id: string;
    title: string;
    date: string;
    imageURL?: string;
  }>;
}

export default function UniversalDetailPage({
  type,
  title,
  date,
  category,
  featuredImage,
  content,
  location,
  eventDate,
  eventTime,
  calendarLink,
  pdfUrl,
  relatedItems = [],
}: DetailPageProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    const durationMultiplier = isMobile ? 0.8 : 1;
    
    // Animate header (breadcrumb)
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

    // Animate date line (always visible, just fade in)
    if (dateRef.current) {
      gsap.fromTo(
        dateRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.6 * durationMultiplier,
          delay: 0.3 * durationMultiplier,
          ease: 'power2.out',
        }
      );
    }

    // Animate featured image
    if (imageRef.current) {
      gsap.fromTo(
        imageRef.current,
        { opacity: 0, scale: 1.05 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          delay: 0.4,
          ease: 'power2.out',
        }
      );
    }

    // Animate content paragraphs - simplified on mobile
    if (contentRef.current) {
      const paragraphs = contentRef.current.querySelectorAll('p, h2, h3, ul');
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
        { opacity: 0, x: isMobile ? 0 : 20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6 * durationMultiplier,
          delay: 0.8 * durationMultiplier,
          ease: 'power2.out',
        }
      );
    }
  }, []);

  const getBreadcrumbPath = () => {
    if (type === 'event') return 'MEDYA / ETKİNLİKLER';
    if (type === 'announcement') return 'MEDYA / DUYURULAR';
    return 'MEDYA / HABERLER';
  };

  return (
    <div className="relative w-full min-h-screen bg-white pt-24 lg:pt-30 pb-12 lg:pb-20">
      <div className="relative max-w-7xl mx-auto px-5 lg:px-12">
        {/* 12-Column Grid */}
        <div className="grid grid-cols-12 gap-0">
          {/* Main Content Area (Cols 1-8) */}
          <div className="col-span-12 lg:col-span-8 pr-0 lg:pr-12">
            {/* Breadcrumbs */}
            <div ref={headerRef} className="mb-4 lg:mb-6" style={{ opacity: 0 }}>
              <Link
                href={type === 'event' ? '/haberler?category=Etkinlikler' : type === 'announcement' ? '/haberler?category=Duyurular' : '/haberler'}
                className="text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat hover:underline"
              >
                {getBreadcrumbPath()}
              </Link>
            </div>

            {/* Date & Category Line - Always visible, above title */}
            <div ref={dateRef} className="mb-4 lg:mb-6 pb-3 lg:pb-4 border-b border-black/10">
              <div className="flex items-center gap-3 lg:gap-4 flex-wrap">
                {date && (
                  <>
                    <span className="text-xs lg:text-sm font-bold uppercase tracking-tight text-[#1E3A5F] font-montserrat">
                      {date}
                    </span>
                    <span className="text-gray-400 hidden sm:inline">•</span>
                  </>
                )}
                <span className="px-2 lg:px-3 py-1 border border-gray-300 text-[10px] lg:text-xs uppercase tracking-widest text-gray-600 font-montserrat">
                  {category}
                </span>
              </div>
            </div>

            {/* Title */}
            <div ref={headerRef} className="mb-6 lg:mb-8" style={{ opacity: 0 }}>
              <h1 className="text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-black uppercase tracking-tighter text-[#1E3A5F] font-montserrat leading-none">
                {title}
              </h1>
            </div>

            {/* Featured Image */}
            <div
              ref={imageRef}
              className="mb-8 lg:mb-12 w-full"
              style={{ opacity: 0 }}
            >
              <img
                src={featuredImage}
                alt={title}
                className="w-full h-auto object-cover border border-black/10"
                width={1200}
                height={600}
                loading="eager"
              />
            </div>

            {/* Content Body */}
            <div ref={contentRef} className="prose prose-lg max-w-none">
              <div
                className="text-base lg:text-lg leading-relaxed text-[#1E3A5F] font-sans space-y-4 lg:space-y-6"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          </div>

          {/* Sidebar (Cols 9-12) */}
          <div className="col-span-12 lg:col-span-4 lg:pl-8 lg:border-l border-black/10 mt-8 lg:mt-0">
            <div ref={sidebarRef} className="lg:sticky lg:top-32 space-y-6 lg:space-y-8" style={{ opacity: 0 }}>
              {/* Share Buttons */}
              <div>
                <h3 className="text-xs uppercase tracking-widest font-bold text-[#1E3A5F] font-montserrat mb-4">
                  PAYLAŞ
                </h3>
                <div className="flex gap-2">
                  {[
                    { icon: Facebook, href: SOCIAL_LINKS.facebook, label: 'Facebook' },
                    { icon: Twitter, href: SOCIAL_LINKS.twitter, label: 'X (Twitter)' },
                    { icon: Instagram, href: SOCIAL_LINKS.instagram, label: 'Instagram' },
                  ].map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 border border-[#1E3A5F] flex items-center justify-center hover:bg-[#1E3A5F] hover:border-[#1E3A5F] transition-none group"
                        aria-label={social.label}
                      >
                        <Icon className="w-5 h-5 text-[#1E3A5F] group-hover:text-white transition-none" />
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Event Details (if event) */}
              {type === 'event' && (location || eventDate || eventTime) && (
                <div className="border border-black/10 p-6">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-[#1E3A5F] font-montserrat mb-4">
                    ETKİNLİK DETAYLARI
                  </h3>
                  <div className="space-y-4">
                    {eventDate && (
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-[#1E3A5F] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-[#1E3A5F] font-sans">Tarih</p>
                          <p className="text-sm text-gray-600 font-sans">{eventDate}</p>
                        </div>
                      </div>
                    )}
                    {eventTime && (
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-[#1E3A5F] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-[#1E3A5F] font-sans">Saat</p>
                          <p className="text-sm text-gray-600 font-sans">{eventTime}</p>
                        </div>
                      </div>
                    )}
                    {location && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-[#1E3A5F] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-[#1E3A5F] font-sans">Konum</p>
                          <p className="text-sm text-gray-600 font-sans">{location}</p>
                        </div>
                      </div>
                    )}
                    {calendarLink && (
                      <a
                        href={calendarLink}
                        className="block w-full px-4 py-2 border border-[#1E3A5F] bg-transparent text-[#1E3A5F] uppercase text-xs font-bold tracking-widest hover:bg-[#1E3A5F] hover:text-white transition-none font-montserrat text-center"
                      >
                        TAKVİME EKLE
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* PDF Download (if announcement) */}
              {type === 'announcement' && pdfUrl && (
                <div>
                  <a
                    href={pdfUrl}
                    download
                    className="flex items-center justify-center gap-3 w-full px-6 py-4 border-2 border-[#1E3A5F] bg-transparent text-[#1E3A5F] uppercase text-sm font-bold tracking-widest hover:bg-[#1E3A5F] hover:text-white transition-none font-montserrat"
                  >
                    <Download className="w-5 h-5" />
                    DOSYA İNDİR
                  </a>
                </div>
              )}

              {/* Related Items */}
              {relatedItems.length > 0 && (
                <div>
                  <h3 className="text-xs uppercase tracking-widest font-bold text-[#1E3A5F] font-montserrat mb-4">
                    {type === 'event' ? 'YAKLAŞAN ETKİNLİKLER' : 'DİĞER HABERLER'}
                  </h3>
                  <div className="space-y-0 border border-black/10">
                    {relatedItems.slice(0, 5).map((item, index) => (
                      <Link
                        key={item.id}
                        href={`/haber/${item.id}`}
                        className="block p-4 border-b border-black/10 last:border-b-0 hover:bg-[#F5F5F0] transition-none group"
                      >
                        <div className="flex items-start gap-4">
                          {item.imageURL && (
                            <div className="flex-shrink-0 w-20 h-20 overflow-hidden border border-black/10">
                              <img
                                src={item.imageURL}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold uppercase tracking-tight text-[#1E3A5F] font-montserrat mb-1">
                              {item.date}
                            </p>
                            <h4 className="text-sm font-bold uppercase tracking-tight text-[#1E3A5F] font-montserrat leading-tight group-hover:text-[#336699] transition-colors duration-300 line-clamp-2">
                              {item.title}
                            </h4>
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-[#1E3A5F] group-hover:text-[#336699] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
