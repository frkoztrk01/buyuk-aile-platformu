'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, MapPin, Play, Loader2 } from 'lucide-react';
import { getYouTubeEmbedUrl } from '@/lib/utils/youtube';
import type { Meeting } from '@/lib/db/schema';

gsap.registerPlugin(ScrollTrigger);

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineSpineRef = useRef<HTMLDivElement>(null);
  const meetingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/meetings');
      if (!response.ok) {
        throw new Error('Failed to fetch meetings');
      }
      const data = await response.json();
      setMeetings(data);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    const ctx = gsap.context(() => {
      // Animate timeline spine fill on scroll - desktop only
      if (timelineSpineRef.current && !isMobile) {
        gsap.to(timelineSpineRef.current, {
          height: '100%',
          scrollTrigger: {
            trigger: timelineRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
          },
        });
      }

      // Animate meeting blocks - simplified on mobile
      if (meetingsRef.current) {
        const meetingBlocks = meetingsRef.current.querySelectorAll('.meeting-block');
        
        meetingBlocks.forEach((block, index) => {
          const isEven = index % 2 === 0;
          const videoElement = block.querySelector('.meeting-video');
          const contentElement = block.querySelector('.meeting-content');

          if (isMobile) {
            // Simple fade-in-up on mobile
            gsap.set([videoElement, contentElement], {
              opacity: 0,
              y: 20,
            });

            gsap.to([videoElement, contentElement], {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: block,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            });
          } else {
            // Desktop: original animation
            gsap.set(videoElement, {
              x: isEven ? -100 : 100,
              opacity: 0,
            });
            gsap.set(contentElement, {
              x: isEven ? 100 : -100,
              opacity: 0,
            });

            gsap.to([videoElement, contentElement], {
              x: 0,
              opacity: 1,
              duration: 1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: block,
                start: 'top 80%',
                end: 'top 50%',
                scrub: 1,
              },
            });
          }
        });
      }

    });

    return () => ctx.revert();
  }, [meetings]);

  return (
    <div className="relative w-full min-h-screen bg-white pt-24 lg:pt-40 pb-12 lg:pb-20">
      {/* Page Header */}
      <div className="relative max-w-7xl mx-auto px-5 lg:px-12 mb-12 lg:mb-20 border-b border-black/[0.05] lg:border-b-0 pb-6 lg:pb-0">
        <div className="grid grid-cols-12 gap-0">
          <div className="col-span-12 lg:col-span-8 lg:col-start-3">
            <h1 className="text-3xl lg:text-4xl xl:text-6xl 2xl:text-7xl font-black uppercase tracking-tighter text-[#1E3A5F] font-montserrat leading-none mb-4 lg:mb-6">
              BULUŞMALAR
            </h1>
            <p className="text-base lg:text-lg xl:text-xl text-[#1E3A5F] font-sans leading-relaxed">
              Platformumuzun tarihçesi ve gerçekleştirdiğimiz büyük buluşmaların kronolojik hikayesi.
            </p>
          </div>
        </div>
      </div>

      {/* Timeline Container */}
      <div ref={timelineRef} className="relative max-w-7xl mx-auto px-5 lg:px-12">
        {/* Timeline Spine - Left on mobile, center on desktop */}
        <div className="absolute left-0 lg:left-1/2 top-0 bottom-0 w-px bg-gray-200 lg:-translate-x-1/2">
          <div
            ref={timelineSpineRef}
            className="absolute top-0 left-0 w-full bg-[#1E3A5F] origin-top"
            style={{ height: '0%' }}
          />
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
            {/* Meetings List */}
            <div ref={meetingsRef} className="relative space-y-0">
              {meetings.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-lg text-[#1E3A5F] font-sans">
                    Henüz buluşma bulunmuyor.
                  </p>
                </div>
              ) : (
                meetings.map((meeting, index) => {
                  const isEven = index % 2 === 0;
                  const meetingNumber = String(index + 1).padStart(2, '0');
                  const formattedDate = new Date(meeting.date).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  });

                  return (
                    <div
                      key={meeting.id}
                      className="meeting-block relative py-12 lg:py-32 border-b border-black/10 last:border-b-0 pl-8 lg:pl-0"
                    >
                      {/* Background Index Number */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-[120px] lg:text-[200px] xl:text-[300px] font-black text-gray-50 select-none font-montserrat">
                          {meetingNumber}
                        </span>
                      </div>

                      {/* Content Grid - All aligned to right of timeline on mobile */}
                      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
                        {/* Video/Image Area - Always on right side on mobile */}
                        <div
                          className={`meeting-video ${isEven ? 'lg:order-1' : 'lg:order-2'} order-2`}
                        >
                          {meeting.videoUrl ? (
                            <div className="relative w-full aspect-video border border-[#1E3A5F] bg-black overflow-hidden">
                              <iframe
                                src={getYouTubeEmbedUrl(meeting.videoUrl)}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title={meeting.title}
                              />
                            </div>
                          ) : (
                            <div className="relative w-full aspect-video border border-[#1E3A5F] bg-gray-100 flex items-center justify-center">
                              <Play className="w-12 h-12 lg:w-16 lg:h-16 text-[#1E3A5F] opacity-30" />
                            </div>
                          )}
                        </div>

                        {/* Content Area - Always on right side on mobile */}
                        <div
                          className={`meeting-content ${isEven ? 'lg:order-2' : 'lg:order-1'} order-1`}
                        >
                          <div className="space-y-4 lg:space-y-6">
                            {/* Title */}
                            <h2 className="text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-black uppercase tracking-tighter text-[#1E3A5F] font-montserrat leading-tight">
                              {meeting.title}
                            </h2>

                            {/* Date */}
                            <div className="flex items-center gap-2 lg:gap-3">
                              <Calendar className="w-4 h-4 lg:w-5 lg:h-5 text-[#1E3A5F] flex-shrink-0" />
                              <span className="text-sm lg:text-base xl:text-lg font-bold uppercase tracking-tight text-[#1E3A5F] font-montserrat">
                                {formattedDate}
                              </span>
                            </div>

                            {/* Description */}
                            {meeting.description && (
                              <p className="text-base lg:text-lg leading-relaxed text-[#1E3A5F] font-sans">
                                {meeting.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

    </div>
  );
}
