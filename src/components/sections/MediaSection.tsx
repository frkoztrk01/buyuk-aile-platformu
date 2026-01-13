'use client';

import { useRef, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';

interface MediaBlock {
  index: string;
  title: string;
  description: string;
  href: string;
}

const mediaBlocks: MediaBlock[] = [
  { 
    index: '01', 
    title: 'HABERLER', 
    description: 'Büyük Aile Platformu bünyesinde gerçekleştirilen haberler ve gelişmelere aşağıdaki link üzerinden erişebilirsiniz.',
    href: '/haberler' 
  },
  { 
    index: '02', 
    title: 'ETKİNLİKLER', 
    description: 'Büyük Aile Platformu bünyesinde gerçekleştirilen etkinliklere aşağıdaki link üzerinden erişebilirsiniz.',
    href: '/haberler?category=Etkinlikler' 
  },
  { 
    index: '03', 
    title: 'DUYURULAR', 
    description: 'Büyük Aile Platformu bünyesinde yapılan duyurulara aşağıdaki link üzerinden erişebilirsiniz.',
    href: '/haberler?category=Duyurular' 
  },
  { 
    index: '04', 
    title: 'VİDEOLAR', 
    description: 'Büyük Aile Platformu bünyesinde paylaşılan videolara aşağıdaki link üzerinden erişebilirsiniz.',
    href: '/videolar' 
  },
];

export default function MediaSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const blocksRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Animate blocks on mount
    if (blocksRef.current.length > 0) {
      gsap.fromTo(
        blocksRef.current.filter(Boolean) as HTMLElement[],
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          delay: 0.2,
          ease: 'power2.out',
        }
      );
    }
  }, []);

  const handleBlockHover = (index: number, isEntering: boolean) => {
    const block = blocksRef.current[index];
    if (!block) return;

    const arrowIcon = block.querySelector('.arrow-icon');
    const bgOverlay = block.querySelector('.bg-overlay');

    const titleElement = block.querySelector('.block-title');
    const descriptionElement = block.querySelector('.block-description');
    const indexElement = block.querySelector('.block-index');
    const arrowSquare = block.querySelector('.arrow-square');

    if (isEntering) {
      // Instant background fill (white instead of dark blue)
      if (bgOverlay) {
        gsap.to(bgOverlay, {
          opacity: 1,
          duration: 0,
        });
      }

      // Change text colors to blue
      if (titleElement) {
        gsap.to(titleElement, {
          color: '#1E3A5F',
          duration: 0,
        });
      }
      if (descriptionElement) {
        gsap.to(descriptionElement, {
          color: '#1E3A5F',
          duration: 0,
        });
      }
      if (indexElement) {
        gsap.to(indexElement, {
          color: '#1E3A5F',
          opacity: 0.3,
          duration: 0,
        });
      }
      if (arrowIcon) {
        gsap.to(arrowIcon, {
          color: '#1E3A5F',
          duration: 0,
        });
      }
      if (arrowSquare) {
        gsap.to(arrowSquare, {
          borderColor: '#1E3A5F',
          duration: 0,
        });
      }

      // Arrow nudge animation
      if (arrowIcon) {
        gsap.to(arrowIcon, {
          x: 4,
          duration: 0.2,
          ease: 'power2.out',
        });
      }
    } else {
      // Remove background
      if (bgOverlay) {
        gsap.to(bgOverlay, {
          opacity: 0,
          duration: 0,
        });
      }

      // Reset text colors to white
      if (titleElement) {
        gsap.to(titleElement, {
          color: '#ffffff',
          duration: 0,
        });
      }
      if (descriptionElement) {
        gsap.to(descriptionElement, {
          color: '#ffffff',
          duration: 0,
        });
      }
      if (indexElement) {
        gsap.to(indexElement, {
          color: 'rgba(255, 255, 255, 0.3)',
          opacity: 1,
          duration: 0,
        });
      }
      if (arrowIcon) {
        gsap.to(arrowIcon, {
          color: '#ffffff',
          duration: 0,
        });
      }
      if (arrowSquare) {
        gsap.to(arrowSquare, {
          borderColor: 'rgba(255, 255, 255, 0.2)',
          duration: 0,
        });
      }

      // Reset arrow
      if (arrowIcon) {
        gsap.to(arrowIcon, {
          x: 0,
          duration: 0.2,
          ease: 'power2.out',
        });
      }
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen lg:h-screen overflow-auto lg:overflow-hidden snap-start snap-always"
      style={{ backgroundColor: '#1E3A5F' }}
    >
      {/* Section Header - MEDYA MERKEZİ */}
      <div className="sticky lg:absolute top-0 left-0 w-full z-10 border-b border-white/20 bg-[#1E3A5F]">
        <div className="max-w-7xl mx-auto px-5 lg:px-12">
          <div className="py-3 lg:py-4">
            <h2 className="text-white uppercase tracking-widest text-xs font-montserrat antialiased">
              MEDYA MERKEZİ
            </h2>
          </div>
        </div>
      </div>

      {/* 2x2 Grid Container - Mobile: Single column, Desktop: 2x2 */}
      <div className="min-h-[calc(100vh-64px)] lg:h-full pt-0 lg:pt-16 grid grid-cols-1 lg:grid-cols-2 gap-0">
        {mediaBlocks.map((block, index) => {
          // Determine border classes based on position in grid
          // Mobile: single column, Desktop: 2x2
          const isFirstRow = index < 2;
          const isFirstCol = index % 2 === 0;
          const borderClasses = [
            isFirstCol ? 'lg:border-r' : '',
            isFirstRow ? 'border-b' : '',
          ].filter(Boolean).join(' ');

          return (
            <div
              key={block.href}
              ref={(el) => {
                blocksRef.current[index] = el;
              }}
              className={`relative border-white/20 ${borderClasses}`}
              style={{ opacity: 0 }}
              onMouseEnter={() => handleBlockHover(index, true)}
              onMouseLeave={() => handleBlockHover(index, false)}
            >
            {/* Background Overlay (White on hover) */}
            <div
              className="bg-overlay absolute inset-0"
              style={{
                backgroundColor: '#ffffff',
                opacity: 0,
                transition: 'none',
              }}
            />

            {/* Content */}
            <a
              href={block.href}
              className="relative z-10 min-h-[300px] lg:h-full w-full flex flex-col justify-between p-6 lg:p-8 xl:p-12 group"
            >
              {/* Top-Left: Index Number */}
              <div className="block-index text-white/30 font-light text-4xl lg:text-6xl xl:text-8xl leading-none font-montserrat antialiased mb-4 lg:mb-0">
                {block.index}
              </div>

              {/* Center: Title and Description */}
              <div className="flex-1 flex flex-col justify-center py-4 lg:py-0">
                <h3 className="block-title text-white uppercase font-black tracking-widest text-lg lg:text-2xl xl:text-3xl font-montserrat antialiased mb-3 lg:mb-4">
                  {block.title}
                </h3>
                <p className="block-description text-white text-xs lg:text-sm xl:text-base leading-relaxed font-sans antialiased max-w-md">
                  {block.description}
                </p>
              </div>

              {/* Bottom-Right: Arrow Icon in Square */}
              <div className="flex justify-end mt-4 lg:mt-4">
                <div className="arrow-square border border-white/20 p-2 lg:p-3 transition-none min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <ArrowRight
                    className="arrow-icon w-5 h-5 lg:w-6 lg:h-6 text-white"
                    style={{ transform: 'translateX(0)' }}
                  />
                </div>
              </div>
            </a>
          </div>
          );
        })}
      </div>
    </section>
  );
}
