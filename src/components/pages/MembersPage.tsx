'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import type { Member } from '@/lib/db/schema';

export default function MembersPage() {
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const membersRef = useRef<HTMLDivElement>(null);

  // Fetch members from API
  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/members');
      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }
      const data = await response.json();
      // Sort alphabetically
      const sorted = data.sort((a: Member, b: Member) => 
        a.name.localeCompare(b.name, 'tr')
      );
      setAllMembers(sorted);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Filter members based on search and selected letter
  const filteredMembers = allMembers.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLetter = selectedLetter
      ? member.name.toUpperCase().startsWith(selectedLetter)
      : true;
    return matchesSearch && matchesLetter;
  });

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

    // Animate members list - simplified on mobile
    if (membersRef.current) {
      const members = membersRef.current.querySelectorAll('.member-item');
      gsap.fromTo(
        members,
        { opacity: 0, y: isMobile ? 5 : 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4 * durationMultiplier,
          stagger: isMobile ? 0.01 : 0.02,
          delay: 0.4 * durationMultiplier,
          ease: 'power2.out',
        }
      );
    }
  }, [filteredMembers]);

  const handleLetterClick = (letter: string) => {
    if (selectedLetter === letter) {
      setSelectedLetter(null);
    } else {
      setSelectedLetter(letter);
      setSearchQuery(''); // Clear search when filtering by letter
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-[#F5F5F0] pt-24 lg:pt-30">
      <div className="relative max-w-7xl mx-auto px-5 lg:px-12 py-12 lg:py-20">
        {/* Page Header */}
        <div ref={headerRef} className="mb-8 lg:mb-12 border-b border-black/[0.05] pb-6 lg:pb-0 lg:border-b-0" style={{ opacity: 0 }}>
          <h1 className="text-3xl lg:text-4xl xl:text-6xl 2xl:text-7xl font-bold uppercase tracking-tighter text-[#1E3A5F] font-montserrat leading-none mb-4 lg:mb-6">
            ÜYELERİMİZ
          </h1>
          <p className="text-base lg:text-lg leading-relaxed text-[#1E3A5F] font-sans max-w-3xl">
            Büyük Aile Platformu'na destek veren tüm sivil toplum kuruluşlarımızın alfabetik listesi.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 lg:mb-8">
          <input
            type="text"
            placeholder="Kuruluş adı ile ara..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedLetter(null); // Clear letter filter when searching
            }}
            className="w-full lg:max-w-md px-4 py-3 lg:py-2 border border-[#1E3A5F] bg-white text-[#1E3A5F] font-sans text-sm uppercase tracking-tight focus:outline-none focus:border-[#336699] transition-none min-h-[44px]"
          />
        </div>

        {/* Alphabet Filter Bar */}
        <div className="mb-8 lg:mb-12 flex flex-wrap gap-2">
          {alphabet.map((letter) => {
            const isActive = selectedLetter === letter;
            const hasMembers = allMembers.some((member) =>
              member.name.toUpperCase().startsWith(letter)
            );

            return (
              <button
                key={letter}
                onClick={() => handleLetterClick(letter)}
                disabled={!hasMembers}
                className={`px-2 lg:px-3 py-2 lg:py-1 border border-[#1E3A5F] text-xs lg:text-sm uppercase tracking-tight font-semibold font-montserrat transition-none min-w-[36px] min-h-[36px] lg:min-h-[auto] ${
                  isActive
                    ? 'bg-[#1E3A5F] text-white'
                    : hasMembers
                    ? 'bg-transparent text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white'
                    : 'bg-transparent text-gray-300 border-gray-300 cursor-not-allowed'
                }`}
              >
                {letter}
              </button>
            );
          })}
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
        {/* Members List - Single column on mobile, 3 columns on desktop */}
        <div
          ref={membersRef}
          className="grid grid-cols-1 lg:grid-cols-3 gap-0"
        >
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="member-item group border-b border-black/[0.05] p-4 lg:p-6 bg-[#F5F5F0] hover:bg-white transition-none cursor-pointer relative min-h-[60px] lg:min-h-[auto]"
              style={{ opacity: 0 }}
            >
              <div className="flex items-center justify-between">
                    <div 
                      className="text-sm lg:text-base font-semibold uppercase tracking-tight text-[#1E3A5F] group-hover:text-[#336699] transition-none font-montserrat flex-1"
                      dangerouslySetInnerHTML={{ 
                        __html: member.name.replace(/\n/g, '<br />') 
                      }}
                    />
                <ArrowUpRight
                      className="w-4 h-4 text-[#1E3A5F] group-hover:text-[#336699] opacity-0 lg:opacity-0 lg:group-hover:opacity-100 transition-none flex-shrink-0 ml-4"
                />
              </div>
            </div>
          ))}
        {/* Empty State */}
            {filteredMembers.length === 0 && !isLoading && (
              <div className="text-center py-20 col-span-full">
            <p className="text-base lg:text-lg text-[#1E3A5F] font-sans">
              Arama kriterlerinize uygun üye bulunamadı.
            </p>
          </div>
            )}
          </div>
          </>
        )}
      </div>
    </div>
  );
}
