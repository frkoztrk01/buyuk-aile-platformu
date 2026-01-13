'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import type { Founder } from '@/lib/db/schema';

export default function FoundersSlider() {
  const [founders, setFounders] = useState<Founder[]>([]);
  const sliderRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetchFounders();
  }, []);

  const fetchFounders = async () => {
    try {
      const response = await fetch('/api/founders?limit=20');
      if (!response.ok) {
        throw new Error('Failed to fetch founders');
      }
      const data = await response.json();
      setFounders(data);
    } catch (error) {
      console.error('Error fetching founders:', error);
    }
  };

  // Duplicate founders array for seamless loop
  const duplicatedFounders = founders.length > 0 ? [...founders, ...founders, ...founders] : [];

  useEffect(() => {
    if (!trackRef.current || founders.length === 0) return;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    // Calculate total width of one set of founders
    const founderWidth = isMobile ? 120 : 200; // Smaller on mobile
    const totalWidth = founders.length * founderWidth;

    // Disable animation on mobile for better performance, enable touch swipe instead
    if (!isMobile) {
      // Create infinite scroll animation (desktop only)
      animationRef.current = gsap.to(trackRef.current, {
        x: -totalWidth,
        duration: 50,
        ease: 'none',
        repeat: -1,
      });
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [founders]);

  const handleMouseEnter = () => {
    if (animationRef.current) {
      animationRef.current.pause();
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (animationRef.current) {
      animationRef.current.resume();
      setIsPaused(false);
    }
  };

  const handleLogoHover = (logoElement: HTMLElement, isEntering: boolean) => {
    if (isEntering) {
      gsap.to(logoElement, {
        scale: 1.1,
        filter: 'grayscale(0%)',
        duration: 0.3,
        ease: 'power2.out',
      });
    } else {
      gsap.to(logoElement, {
        scale: 1,
        filter: 'grayscale(100%)',
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  };

  return (
    <section
      className="relative w-full h-[350px] bg-white border-t border-b border-black/10 overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Slider Container */}
      <div
        ref={sliderRef}
        className="relative h-full flex items-center overflow-hidden"
      >
        {/* Track with duplicated logos */}
        <div
          ref={trackRef}
          className="flex items-center gap-16 h-full"
          style={{
            willChange: 'transform',
          }}
        >
          {duplicatedFounders.length === 0 ? (
            <div className="flex items-center justify-center w-full h-full">
              <p className="text-sm text-gray-400 font-sans">Yükleniyor...</p>
            </div>
          ) : (
            duplicatedFounders.map((founder, index) => (
              <div
                key={`${founder.id}-${index}`}
                className="flex-shrink-0 flex items-center justify-center h-full px-4 lg:px-8 cursor-pointer w-[120px] lg:w-[200px]"
                onMouseEnter={(e) => {
                  if (window.innerWidth >= 1024) {
                    handleLogoHover(e.currentTarget, true);
                  }
                }}
                onMouseLeave={(e) => {
                  if (window.innerWidth >= 1024) {
                    handleLogoHover(e.currentTarget, false);
                  }
                }}
                onClick={() => {
                  // Website URL feature can be added to schema if needed
                  // if (founder.websiteUrl) {
                  //   window.open(founder.websiteUrl, '_blank', 'noopener,noreferrer');
                  // }
                }}
              >
                {/* Founder Logo */}
                <div className="relative w-full h-16 lg:h-24 flex items-center justify-center">
                  {founder.logoUrl ? (
                    <img
                      src={founder.logoUrl}
                      alt="Logo"
                      className="max-w-full max-h-full object-contain opacity-70 lg:hover:opacity-100 transition-opacity duration-300"
                      loading={index < 5 ? 'eager' : 'lazy'}
                    />
                  ) : (
                    <p className="text-xs font-bold uppercase tracking-tight text-[#1E3A5F] text-center px-2 line-clamp-2 font-montserrat opacity-70">
                      Logo
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pause Indicator (optional, for debugging) */}
      {isPaused && (
        <div className="absolute top-2 right-2 z-30 text-xs text-gray-400 opacity-50">
          Paused
        </div>
      )}
    </section>
  );
}
