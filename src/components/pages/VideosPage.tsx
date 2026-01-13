'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { Loader2 } from 'lucide-react';
import { getYouTubeEmbedUrl } from '@/lib/utils/youtube';
import type { Video } from '@/lib/db/schema';

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const videoCardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/videos');
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }
      const data = await response.json();
      setVideos(data);
    } catch (error) {
      console.error('Error fetching videos:', error);
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

    // Animate video cards with stagger - simplified on mobile
    if (videoCardsRef.current.length > 0) {
      const validCards = videoCardsRef.current.filter(Boolean) as HTMLElement[];
      gsap.fromTo(
        validCards,
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
  }, [isLoading, videos]);

  return (
    <div className="relative w-full min-h-screen bg-white pt-24">
      <div className="relative max-w-7xl mx-auto px-5 lg:px-12">
        {/* Page Header */}
        <div ref={headerRef} className="py-12 lg:py-20 text-center border-b border-black/[0.05] lg:border-b-0 pb-6 lg:pb-0" style={{ opacity: 0 }}>
          <h1 className="text-3xl lg:text-4xl xl:text-6xl 2xl:text-7xl font-bold uppercase tracking-tighter text-[#1E3A5F] font-montserrat leading-none mb-4 lg:mb-6">
            VİDEOLAR
          </h1>
          <p className="text-base lg:text-lg leading-relaxed text-[#1E3A5F] font-sans max-w-3xl mx-auto">
            Platformumuzun video içeriklerini buradan izleyebilirsiniz.
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
        ) : videos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-[#1E3A5F] font-sans">
              Henüz video bulunmuyor.
            </p>
          </div>
        ) : (
          <div ref={gridRef} className="pb-12 lg:pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 xl:gap-8">
              {videos.map((video, index) => (
                <div
                  key={video.id}
                  ref={(el) => {
                    videoCardsRef.current[index] = el;
                  }}
                  className="bg-[#F5F5F0] border border-black/10"
                  style={{ opacity: 0 }}
                >
                  {/* Video Title */}
                  <div className="p-3 lg:p-4 border-b border-black/10">
                    <h3 className="text-base lg:text-lg font-black uppercase tracking-tighter text-[#1E3A5F] font-montserrat line-clamp-2 leading-tight">
                      {video.title}
                    </h3>
                  </div>

                  {/* Video Player - Maintain 16:9 aspect ratio */}
                  <div className="aspect-video w-full bg-black">
                    <iframe
                      src={getYouTubeEmbedUrl(video.youtubeUrl)}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={video.title}
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
