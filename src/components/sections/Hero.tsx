'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function Hero() {
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
          src="/images/banner.jpg"
          alt="Hero Background"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ top: 0 }}
          loading="eager"
          fetchPriority="high"
        />
        
        {/* Dark Blue Overlay */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            background: 'linear-gradient(to bottom right, rgba(51, 102, 153, 0.6), rgba(30, 58, 95, 0.7))',
            top: 0,
          }}
        />
      </div>

      {/* Content Wrapper */}
      <div className="relative z-10 px-5 lg:px-12 min-h-screen lg:h-full py-20 lg:py-0 grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left Side - Main Title */}
        <div className="col-span-1 lg:col-span-7 flex flex-col justify-center min-h-[60vh] lg:h-full pt-0 lg:pt-0 pb-8 lg:pb-0">
          {/* Logo above the title */}
          <div className="mb-4 lg:mb-8">
            <Image
              src="/images/hero-section-logo.svg"
              alt="Logo"
              width={400}
              height={90}
              className="object-contain w-full max-w-xs lg:max-w-md h-auto"
              priority
            />
          </div>

          <h1
            ref={titleRef}
            className="uppercase font-black leading-[0.9] lg:leading-[0.85] tracking-tighter text-white font-montserrat antialiased mb-4 lg:mb-0"
            style={{
              fontSize: 'clamp(1.75rem, 7vw, 5.5rem)',
              opacity: 0,
            }}
          >
            GELECEĞİMİZ İÇİN GÜÇLÜ AİLE
          </h1>

          {/* Action Area - Description & Button */}
          <div className="mt-6 lg:mt-12 max-w-2xl">
            <p
              ref={descriptionRef}
              className="text-white text-sm lg:text-lg xl:text-xl leading-relaxed mb-4 lg:mb-8 font-sans antialiased"
              style={{ opacity: 0 }}
            >
              Güçlü aileler, güçlü toplumların temelidir. Geleceğimizi birlikte inşa ediyoruz.
            </p>

            <a
              ref={buttonRef}
              href="#keşfet"
              className="inline-block border border-white text-white px-6 py-3 lg:px-8 lg:py-4 uppercase font-bold tracking-wider hover:bg-white hover:text-dark transition-none min-h-[44px] flex items-center justify-center"
              style={{ opacity: 0 }}
            >
              <span className="flex items-center gap-2 text-sm lg:text-base">
                 MANİFESTO TAM METİN
                <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
              </span>
            </a>
          </div>
        </div>

        {/* Right Panel - Mission Control (Mobile: Below, Desktop: Right) */}
        <div
          ref={rightPanelRef}
          className="col-span-1 lg:col-span-5 mt-0 lg:mt-0 lg:pt-32 border-t lg:border-t-0 lg:border-l border-white/20 backdrop-blur-md p-5 lg:p-10 flex flex-col relative lg:relative pb-12 lg:pb-0"
          style={{
            opacity: 0,
            backgroundColor: 'rgba(30, 58, 95, 0.4)',
          }}
        >
          <div className="flex-1 flex flex-col justify-start lg:justify-start lg:relative lg:top-0 pt-6 lg:pt-0">
            {/* MİSYON Section */}
            <div className="mb-8 lg:mb-12">
              <h3 className="text-white uppercase tracking-widest text-xs mb-3 lg:mb-4 font-montserrat antialiased">
                MİSYON
              </h3>
              <p className="text-white text-sm lg:text-base leading-relaxed font-sans antialiased">
                Ailelerin güçlenmesi ve toplumsal dayanışmanın artırılması için çalışıyoruz.
              </p>
              <ul className="mt-3 lg:mt-4 space-y-2">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-white mt-2 flex-shrink-0" />
                  <span className="text-white text-xs lg:text-sm antialiased">Aile değerlerini korumak</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-white mt-2 flex-shrink-0" />
                  <span className="text-white text-xs lg:text-sm antialiased">Toplumsal dayanışmayı güçlendirmek</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-white mt-2 flex-shrink-0" />
                  <span className="text-white text-xs lg:text-sm antialiased">Sosyal sorumluluk projeleri geliştirmek</span>
                </li>
              </ul>
            </div>

            {/* VİZYON Section */}
            <div className="mb-8 lg:mb-12">
              <h3 className="text-white uppercase tracking-widest text-xs mb-3 lg:mb-4 font-montserrat antialiased">
                VİZYON
              </h3>
              <p className="text-white text-sm lg:text-base leading-relaxed font-sans antialiased">
                Güçlü ailelerden oluşan, dayanışma içinde bir toplum hayal ediyoruz.
              </p>
              <ul className="mt-3 lg:mt-4 space-y-2">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-white mt-2 flex-shrink-0" />
                  <span className="text-white text-xs lg:text-sm antialiased">Sürdürülebilir toplumsal değişim</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-white mt-2 flex-shrink-0" />
                  <span className="text-white text-xs lg:text-sm antialiased">Geniş kapsamlı etki</span>
                </li>
              </ul>
            </div>

            {/* DEĞERLER Section */}
            <div>
              <h3 className="text-white uppercase tracking-widest text-xs mb-3 lg:mb-4 font-montserrat antialiased">
                DEĞERLER
              </h3>
              <p className="text-white text-sm lg:text-base leading-relaxed font-sans antialiased">
                Saygı, dayanışma ve şeffaflık ilkeleriyle hareket ediyoruz.
              </p>
              <ul className="mt-3 lg:mt-4 space-y-2">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-white mt-2 flex-shrink-0" />
                  <span className="text-white text-xs lg:text-sm antialiased">Şeffaflık</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-white mt-2 flex-shrink-0" />
                  <span className="text-white text-xs lg:text-sm antialiased">Dayanışma</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-white mt-2 flex-shrink-0" />
                  <span className="text-white text-xs lg:text-sm antialiased">Sorumluluk</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
