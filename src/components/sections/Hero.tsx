'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ArrowRight } from 'lucide-react';
import type { MergedHomeHero } from '@/lib/home-hero-defaults';

type HeroProps = {
  content: MergedHomeHero;
};

export default function Hero({ content }: HeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Detect mobile for faster animations
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    const durationMultiplier = isMobile ? 0.8 : 1; // 20% faster on mobile

    // Animate title
    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1 * durationMultiplier,
          delay: 0.3 * durationMultiplier,
          ease: 'power3.out',
        }
      );
    }

    // Animate description
    if (descriptionRef.current) {
      gsap.fromTo(
        descriptionRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8 * durationMultiplier,
          delay: 1.2 * durationMultiplier,
          ease: 'power2.out',
        }
      );
    }

    // Animate button
    if (buttonRef.current) {
      gsap.fromTo(
        buttonRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8 * durationMultiplier,
          delay: 1.4 * durationMultiplier,
          ease: 'power2.out',
        }
      );
    }

    // Animate right panel (disable on mobile to prevent layout issues)
    if (rightPanelRef.current && !isMobile) {
      gsap.fromTo(
        rightPanelRef.current,
        { opacity: 0, x: 30 },
        {
          opacity: 1,
          x: 0,
          duration: 1 * durationMultiplier,
          delay: 1.6 * durationMultiplier,
          ease: 'power2.out',
        }
      );
    } else if (rightPanelRef.current && isMobile) {
      // On mobile, just fade in
      gsap.fromTo(
        rightPanelRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.6,
          delay: 0.8,
          ease: 'power2.out',
        }
      );
    }
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative w-full min-h-screen lg:h-screen overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 w-full h-full z-0 min-h-screen lg:h-screen" style={{ top: 0 }}>
        {/* Background Image */}
        <img
          src={content.backgroundImageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ top: 0 }}
          loading="eager"
          fetchPriority="high"
        />
        
        {/* Kapalı tonlu mavi overlay — arka plan fotoğrafı daha az baskın */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom right, rgba(30, 58, 95, 0.82), rgba(18, 36, 62, 0.9))',
            top: 0,
          }}
        />
      </div>

      {/* Content — üst boşluk: Navbar ile aynı (h-16 / lg:h-24), güvenli alan için safe-area */}
      <div className="relative z-10 box-border min-h-screen lg:h-full lg:min-h-0 px-5 lg:px-12 pt-[max(5rem,calc(4rem+env(safe-area-inset-top,0px)))] pb-20 lg:pt-[max(6rem,calc(6rem+env(safe-area-inset-top,0px)))] lg:pb-0 grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-1 gap-0 lg:items-stretch">
        {/* Left Side - Main Title */}
        <div className="col-span-1 lg:col-span-7 flex flex-col justify-center min-h-[60vh] lg:h-full lg:min-h-0 pt-0 lg:pt-0 pb-8 lg:pb-0">
          {/* Logo above the title */}
          <div className="mb-4 lg:mb-8">
            <div className="inline-block w-full max-w-md lg:max-w-lg xl:max-w-2xl overflow-hidden rounded-2xl lg:rounded-3xl align-top [isolation:isolate]">
              <img
                src={content.logoUrl}
                alt=""
                width={480}
                height={108}
                className="block h-auto w-full object-contain border-0 shadow-none ring-0 outline-none focus:outline-none focus-visible:ring-0"
              />
            </div>
          </div>

          <h1
            ref={titleRef}
            className="uppercase font-black leading-[0.9] lg:leading-[0.85] tracking-tighter text-white font-montserrat antialiased mb-4 lg:mb-0"
            style={{
              fontSize: 'clamp(1.75rem, 7vw, 5.5rem)',
              opacity: 0,
            }}
          >
            {content.headline}
          </h1>

          {/* Action Area - Description & Button */}
          <div className="mt-6 lg:mt-12 max-w-2xl">
            <p
              ref={descriptionRef}
              className="text-white text-sm lg:text-lg xl:text-xl leading-relaxed mb-4 lg:mb-8 font-sans antialiased"
              style={{ opacity: 0 }}
            >
              {content.subtext}
            </p>

            <a
              ref={buttonRef}
              href={content.ctaHref}
              className="inline-block border border-white text-white px-6 py-3 lg:px-8 lg:py-4 uppercase font-bold tracking-wider hover:bg-white hover:text-dark transition-none min-h-[44px] flex items-center justify-center"
              style={{ opacity: 0 }}
            >
              <span className="flex items-center gap-2 text-sm lg:text-base">
                {content.ctaLabel}
                <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
              </span>
            </a>
          </div>
        </div>

        {/* Right Panel — misyon/vizyon/değerler: tipografi ve boşluklar viewport ile küçülür; çok uzun metinde ince kaydırma */}
        <div
          ref={rightPanelRef}
          className="col-span-1 lg:col-span-5 mt-0 lg:mt-0 lg:h-full lg:min-h-0 border-t lg:border-t-0 lg:border-l border-white/20 backdrop-blur-md flex flex-col relative lg:relative pb-12 lg:pb-6 pt-5 lg:pt-6 px-5 lg:px-[clamp(1rem,2.2vw,2.5rem)]"
          style={{
            opacity: 0,
            backgroundColor: 'rgba(30, 58, 95, 0.4)',
          }}
        >
          <div className="flex min-h-0 flex-1 flex-col justify-start pt-6 lg:pt-0 lg:overflow-y-auto lg:overscroll-contain [scrollbar-width:thin]">
            {/* MİSYON Section */}
            <div className="mb-6 lg:mb-[clamp(0.75rem,2.2svh,2.5rem)]">
              <h3
                className="text-white uppercase tracking-widest font-montserrat antialiased mb-2 lg:mb-[clamp(0.35rem,1svh,1rem)] text-[clamp(0.5625rem,calc(0.28vw+0.52rem),0.75rem)]"
              >
                {content.missionTitle}
              </h3>
              <p
                className="text-white font-sans antialiased break-words [overflow-wrap:anywhere] text-[clamp(0.625rem,calc(0.45vw+0.48rem),1rem)] leading-[1.35] lg:leading-[1.42]"
              >
                {content.missionBody}
              </p>
              <ul className="mt-2 lg:mt-[clamp(0.35rem,1.2svh,1rem)] space-y-1.5 lg:space-y-[clamp(0.2rem,0.6svh,0.5rem)]">
                {content.missionBullets.map((line, i) => (
                  <li key={`mission-${i}`} className="flex items-start gap-2 lg:gap-3 min-w-0">
                    <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-white mt-[0.35em] flex-shrink-0" />
                    <span className="text-white font-sans antialiased min-w-0 break-words [overflow-wrap:anywhere] text-[clamp(0.5625rem,calc(0.38vw+0.45rem),0.875rem)] leading-snug lg:leading-normal">
                      {line}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* VİZYON Section */}
            <div className="mb-6 lg:mb-[clamp(0.75rem,2.2svh,2.5rem)]">
              <h3
                className="text-white uppercase tracking-widest font-montserrat antialiased mb-2 lg:mb-[clamp(0.35rem,1svh,1rem)] text-[clamp(0.5625rem,calc(0.28vw+0.52rem),0.75rem)]"
              >
                {content.visionTitle}
              </h3>
              <p
                className="text-white font-sans antialiased break-words [overflow-wrap:anywhere] text-[clamp(0.625rem,calc(0.45vw+0.48rem),1rem)] leading-[1.35] lg:leading-[1.42]"
              >
                {content.visionBody}
              </p>
              <ul className="mt-2 lg:mt-[clamp(0.35rem,1.2svh,1rem)] space-y-1.5 lg:space-y-[clamp(0.2rem,0.6svh,0.5rem)]">
                {content.visionBullets.map((line, i) => (
                  <li key={`vision-${i}`} className="flex items-start gap-2 lg:gap-3 min-w-0">
                    <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-white mt-[0.35em] flex-shrink-0" />
                    <span className="text-white font-sans antialiased min-w-0 break-words [overflow-wrap:anywhere] text-[clamp(0.5625rem,calc(0.38vw+0.45rem),0.875rem)] leading-snug lg:leading-normal">
                      {line}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* DEĞERLER Section */}
            <div className="min-h-0">
              <h3
                className="text-white uppercase tracking-widest font-montserrat antialiased mb-2 lg:mb-[clamp(0.35rem,1svh,1rem)] text-[clamp(0.5625rem,calc(0.28vw+0.52rem),0.75rem)]"
              >
                {content.valuesTitle}
              </h3>
              <p
                className="text-white font-sans antialiased break-words [overflow-wrap:anywhere] text-[clamp(0.625rem,calc(0.45vw+0.48rem),1rem)] leading-[1.35] lg:leading-[1.42]"
              >
                {content.valuesBody}
              </p>
              <ul className="mt-2 lg:mt-[clamp(0.35rem,1.2svh,1rem)] space-y-1.5 lg:space-y-[clamp(0.2rem,0.6svh,0.5rem)]">
                {content.valuesBullets.map((line, i) => (
                  <li key={`values-${i}`} className="flex items-start gap-2 lg:gap-3 min-w-0">
                    <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-white mt-[0.35em] flex-shrink-0" />
                    <span className="text-white font-sans antialiased min-w-0 break-words [overflow-wrap:anywhere] text-[clamp(0.5625rem,calc(0.38vw+0.45rem),0.875rem)] leading-snug lg:leading-normal">
                      {line}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
