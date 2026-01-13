'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import Link from 'next/link';
import { Loader2, FileText } from 'lucide-react';
import type { Mutabakat } from '@/lib/db/schema';

export default function MutabakatPage() {
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [mutabakatData, setMutabakatData] = useState<Mutabakat | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMutabakat();
  }, []);

  const fetchMutabakat = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/mutabakat');
      if (!response.ok) {
        throw new Error('Failed to fetch mutabakat');
      }
      const data = await response.json();
      setMutabakatData(data);
    } catch (error) {
      console.error('Error fetching mutabakat:', error);
    } finally {
      setIsLoading(false);
    }
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

    // Animate content - simplified on mobile
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: isMobile ? 10 : 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6 * durationMultiplier,
          delay: 0.4 * durationMultiplier,
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
          delay: 0.6 * durationMultiplier,
          ease: 'power2.out',
        }
      );
    }
  }, [isLoading, mutabakatData]);

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
        {/* Subtle Vertical Lines - Only on desktop */}
        <div className="absolute inset-0 pointer-events-none hidden lg:block">
          <div className="absolute left-0 top-0 bottom-0 w-px border-r border-black/[0.05]" />
          <div className="absolute left-[40%] top-0 bottom-0 w-px border-r border-black/[0.05]" />
        </div>

        {/* Hero Section */}
        <div className="relative grid grid-cols-1 lg:grid-cols-10 gap-0 py-12 lg:py-20 px-5 lg:px-12 border-b border-black/[0.05] lg:border-b-0">
          <div className="col-span-1 lg:col-span-10">
            <h1
              ref={heroTitleRef}
              className="text-3xl lg:text-4xl xl:text-6xl 2xl:text-7xl font-bold uppercase tracking-tighter text-[#1E3A5F] font-montserrat leading-none mb-6 lg:mb-8 text-center"
              style={{ opacity: 0 }}
            >
              {mutabakatData?.title || 'MUTABAKAT ZAPTI'}
            </h1>
          </div>
        </div>

        {/* Horizontal Divider */}
        <div className="border-b border-[#1E3A5F]/20 mx-5 lg:mx-12" />

        {/* Content Body - Stack on mobile */}
        <div className="relative grid grid-cols-1 lg:grid-cols-10 gap-0 py-12 lg:py-20 px-5 lg:px-12">
          {/* Sidebar - Kurumsal Menu - Full width on mobile */}
          <div ref={sidebarRef} className="col-span-1 lg:col-span-3 pr-0 lg:pr-12 mb-8 lg:mb-0" style={{ opacity: 0 }}>
            <div className="lg:sticky lg:top-32">
              <h3 className="uppercase text-xs font-bold tracking-widest mb-4 lg:mb-6 text-[#1E3A5F] font-montserrat">
                Kurumsal
              </h3>
              <ul className="space-y-0 border border-black/10">
                {[
                  { label: 'Hakkımızda', href: '/hakkimizda' },
                  { label: 'Mutabakat Zaptı', href: '/mutabakat', active: true },
                  { label: 'Kurucu Kuruluşlar', href: '/kurucu-kuruluslar' },
                  { label: 'Üyeler', href: '/uyeler' },
                ].map((link) => (
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
          <div ref={contentRef} className="col-span-1 lg:col-span-7 pl-0 lg:pl-12" style={{ opacity: 0 }}>
            {mutabakatData?.pdfUrl ? (
              <div className="space-y-4">
                <div className="border border-black/10" style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}>
                  <iframe
                    src={mutabakatData.pdfUrl}
                    className="w-full h-full"
                    title="Mutabakat Zaptı PDF"
                    style={{ border: 'none' }}
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 font-sans">
                  <FileText className="w-4 h-4" />
                  <span>PDF dosyası yükleniyor...</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 border border-black/10 bg-gray-50">
                <FileText className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-base lg:text-lg leading-relaxed text-[#1E3A5F] font-sans">
                  PDF dosyası henüz eklenmemiş.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
