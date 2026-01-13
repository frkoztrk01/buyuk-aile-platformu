'use client';

import { useRef, useEffect, useState } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { gsap } from 'gsap';
import { getYouTubeEmbedUrl } from '@/lib/utils/youtube';
import type { Video } from '@/lib/db/schema';

export default function VideoSection() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const mainVideoRef = useRef<HTMLDivElement>(null);
  const videoListRef = useRef<HTMLDivElement>(null);
  const listItemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/videos?limit=5');
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }
      const data: Video[] = await response.json();
      setVideos(data);
      if (data.length > 0) {
        setSelectedVideo(data[0]);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    const durationMultiplier = isMobile ? 0.8 : 1;

    // Animate main video from left (disable heavy animation on mobile)
    if (mainVideoRef.current) {
      if (isMobile) {
        // Simple fade on mobile
        gsap.fromTo(
          mainVideoRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.6,
            delay: 0.2,
            ease: 'power2.out',
          }
        );
      } else {
        gsap.fromTo(
          mainVideoRef.current,
          { opacity: 0, x: -100 },
          {
            opacity: 1,
            x: 0,
            duration: 1 * durationMultiplier,
            delay: 0.2 * durationMultiplier,
            ease: 'power3.out',
          }
        );
      }
    }

    // Animate video list from right with stagger
    if (listItemsRef.current.length > 0) {
      gsap.fromTo(
        listItemsRef.current.filter(Boolean) as HTMLElement[],
        { opacity: 0, x: isMobile ? 0 : 50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6 * durationMultiplier,
          stagger: 0.1 * durationMultiplier,
          delay: 0.5 * durationMultiplier,
          ease: 'power2.out',
        }
      );
    }
  }, [videos, selectedVideo]);

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    
    // Animate main video update
    if (mainVideoRef.current) {
      gsap.to(mainVideoRef.current, {
        opacity: 0.7,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
      });
    }
  };

  const handleVideoCardHover = (index: number, isEntering: boolean) => {
    const card = listItemsRef.current[index];
    if (!card) return;

    const bgOverlay = card.querySelector('.card-bg-overlay');
    const titleElement = card.querySelector('.card-title');
    const durationElement = card.querySelector('.card-duration');

    if (isEntering) {
      // Instant background fill
      if (bgOverlay) {
        gsap.to(bgOverlay, {
          opacity: 1,
          duration: 0,
        });
      }
      // Change text to white
      if (titleElement) {
        gsap.to(titleElement, {
          color: '#ffffff',
          duration: 0,
        });
      }
      if (durationElement) {
        gsap.to(durationElement, {
          color: '#ffffff',
          duration: 0,
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
      // Reset text colors
      if (titleElement) {
        gsap.to(titleElement, {
          color: '#1E3A5F',
          duration: 0,
        });
      }
      if (durationElement) {
        gsap.to(durationElement, {
          color: '#666666',
          duration: 0,
        });
      }
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen lg:h-screen overflow-hidden snap-start snap-always"
      style={{ backgroundColor: '#F5F5F0' }}
    >
      <div className="px-5 lg:px-20 py-12 lg:py-32 min-h-full">
        {/* Section Title - Top Left */}
        <div className="absolute top-4 left-5 lg:top-8 lg:left-20 z-10">
          <h2 className="text-[#1E3A5F] uppercase tracking-widest text-xs font-montserrat antialiased">
            VİDEO LİSTESİ
          </h2>
        </div>

        {/* Main Grid: Mobile: Stack, Desktop: Left (65%) and Right (35%) */}
        <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-0 min-h-full lg:h-full mt-12 lg:mt-0">
          {/* Left Side - Featured Video */}
          <div className="lg:pr-8 mb-6 lg:mb-0">
            <div
              ref={mainVideoRef}
              className="h-full flex flex-col"
              style={{ opacity: 0 }}
            >
              {/* Video Player */}
              {selectedVideo ? (
                <>
                  {selectedVideo.youtubeUrl ? (
                    <div className="relative w-full bg-black border border-[#336699]">
                      <iframe
                        src={getYouTubeEmbedUrl(selectedVideo.youtubeUrl)}
                        className="w-full aspect-video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={selectedVideo.title}
                      />
                    </div>
                  ) : (
                    <div
                      className="relative w-full bg-[#1E3A5F] border border-[#336699]"
                      style={{ aspectRatio: '16/9', paddingBottom: '56.25%' }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-[#336699] p-4 lg:p-6">
                          <Play className="w-8 h-8 lg:w-12 lg:h-12 text-white fill-white" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Video Info Below Player */}
                  <div className="mt-4 lg:mt-6">
                    <h3 className="text-[#1E3A5F] font-bold text-xl lg:text-2xl xl:text-3xl mb-3 font-montserrat antialiased">
                      {selectedVideo.title}
                    </h3>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[300px]">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-[#1E3A5F]" />
                    <p className="text-sm text-gray-600 font-sans">Yükleniyor...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Video List */}
          <div
            ref={videoListRef}
            className="lg:border-l lg:border-t-0 border-t border-[#336699]/20 pt-6 lg:pt-0 lg:pl-8 lg:overflow-y-auto lg:max-h-[calc(100vh-8rem)]"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-[#1E3A5F]" />
                  <p className="text-sm text-gray-600 font-sans">Yükleniyor...</p>
                </div>
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-gray-500 font-sans">Henüz video bulunmuyor.</p>
              </div>
            ) : (
              <div className="space-y-0">
                {videos.map((video, index) => {
                  const videoIdMatch = video.youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
                  const thumbnailUrl = videoIdMatch
                    ? `https://img.youtube.com/vi/${videoIdMatch[1]}/mqdefault.jpg`
                    : null;

                  return (
                    <div
                      key={video.id}
                      ref={(el) => {
                        listItemsRef.current[index] = el;
                      }}
                      className={`relative border-b border-[#336699]/20 last:border-b-0 cursor-pointer ${
                        selectedVideo?.id === video.id ? 'bg-[#336699]/10' : ''
                      }`}
                      style={{ opacity: 0 }}
                      onClick={() => handleVideoClick(video)}
                      onMouseEnter={() => handleVideoCardHover(index, true)}
                      onMouseLeave={() => handleVideoCardHover(index, false)}
                    >
                      {/* Background Overlay (Blue on hover) */}
                      <div
                        className="card-bg-overlay absolute inset-0"
                        style={{
                          backgroundColor: '#336699',
                          opacity: 0,
                          transition: 'none',
                        }}
                      />

                      {/* Video Card Content */}
                      <div className="relative z-10 flex items-center gap-3 lg:gap-4 p-4 lg:p-6 min-h-[44px]">
                        {/* Thumbnail - YouTube thumbnail or Play Icon */}
                        <div className="flex-shrink-0">
                          {thumbnailUrl ? (
                            <div className="w-20 h-14 lg:w-24 lg:h-16 bg-black border border-[#336699] relative overflow-hidden">
                              <img
                                src={thumbnailUrl}
                                alt={video.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <Play className="w-5 h-5 lg:w-6 lg:h-6 text-white fill-white" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-20 h-14 lg:w-24 lg:h-16 bg-[#336699] flex items-center justify-center border border-[#336699]">
                              <Play className="w-5 h-5 lg:w-6 lg:h-6 text-white fill-white" />
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <div className="flex-1 min-w-0">
                          <h4 className="card-title text-[#1E3A5F] font-semibold text-xs lg:text-sm mb-1 font-montserrat antialiased line-clamp-2">
                            {video.title}
                          </h4>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
