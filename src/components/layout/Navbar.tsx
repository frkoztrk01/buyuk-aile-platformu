'use client';

import { useEffect, useRef, useState, useContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Facebook, Twitter, Instagram, Youtube, ChevronDown } from 'lucide-react';
import { gsap } from 'gsap';
import Image from 'next/image';
import NavButton from '../ui/NavButton';
import MegaMenu from '../ui/MegaMenu';
import Link from 'next/link';
import LanguageSelector from '@/components/LanguageSelector';
import { GoogleTranslateContext, type TranslateLang } from '@/components/GoogleTranslateProvider';
import { SOCIAL_LINKS } from '@/lib/site-social';

interface NavLink {
  label: string;
  href: string;
  hasMegaMenu?: boolean;
  megaMenuColumns?: Array<{
    title: string;
    items: Array<{ label: string; href: string }>;
  }>;
}

const LANGS: { value: TranslateLang; label: string }[] = [
  { value: "tr", label: "TR" },
  { value: "en", label: "EN" },
  { value: "ar", label: "AR" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const translateCtx = useContext(GoogleTranslateContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMedyaMenuOpen, setIsMedyaMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileLangOpen, setIsMobileLangOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuItemsRef = useRef<(HTMLLIElement | null)[]>([]);
  const lastScrollY = useRef(0);
  const kurumsalButtonRef = useRef<HTMLLIElement>(null);
  const medyaButtonRef = useRef<HTMLLIElement>(null);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const medyaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if we're on a page that should always have blue background
  // All pages except homepage should have blue background
  const shouldAlwaysBeBlue = pathname !== '/';

  const navLinks: NavLink[] = [
    { 
      label: 'Anasayfa', 
      href: '/' 
    },
    { 
      label: 'Kurumsal', 
      href: '#kurumsal',
      hasMegaMenu: true,
      megaMenuColumns: [
        {
          title: 'Hakkımızda',
          items: [
            { label: 'Hakkımızda', href: '/hakkimizda' },
          ],
        },
        {
          title: 'Manifesto',
          items: [
            { label: 'Manifesto', href: '/manifesto' },
          ],
        },
        {
          title: 'Mutabakat Zaptı',
          items: [
            { label: 'Mutabakat Zaptı', href: '/mutabakat' },
          ],
        },
        {
          title: 'Kurucu Kuruluşlar',
          items: [
            { label: 'Kurucu Kuruluşlar', href: '/kurucu-kuruluslar' },
          ],
        },
        {
          title: 'Üyeler',
          items: [
            { label: 'Üyeler', href: '/uyeler' },
          ],
        },
      ],
    },
    { 
      label: 'Medya', 
      href: '#medya',
      hasMegaMenu: true,
      megaMenuColumns: [
        {
          title: 'Haberler',
          items: [
            { label: 'Haberler', href: '/haberler' },
          ],
        },
        {
          title: 'Etkinlikler',
          items: [
            { label: 'Etkinlikler', href: '/haberler?category=Etkinlikler' },
          ],
        },
        {
          title: 'Videolar',
          items: [
            { label: 'Videolar', href: '/videolar' },
          ],
        },
      ],
    },
    { 
      label: 'Buluşmalar', 
      href: '/bulusmalar' 
    },
    { 
      label: 'İletişim', 
      href: '/iletisim' 
    },
  ];

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      // Disable body scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restore scroll position when menu closes
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isMobileMenuOpen]);

  // Mobile menu animation
  useEffect(() => {
    if (isMobileMenuOpen && mobileMenuRef.current) {
      // Animate menu items with stagger
      gsap.fromTo(
        mobileMenuItemsRef.current.filter(Boolean) as HTMLElement[],
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4, // 20% faster on mobile
          stagger: 0.05,
          ease: 'power2.out',
        }
      );
    }
  }, [isMobileMenuOpen]);

  // Handle scroll animations and background color
  useEffect(() => {
    if (!navRef.current) return;

    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY.current;
      
      // Update isScrolled state based on scroll position (unless page should always be blue)
      if (!shouldAlwaysBeBlue) {
        setIsScrolled(currentScrollY > 0);
      }
      
      // Disable scroll hide on mobile
      if (window.innerWidth < 1024) {
        return;
      }
      
      if (Math.abs(currentScrollY - lastScrollY.current) < 5) {
        return;
      }

      lastScrollY.current = currentScrollY;
      clearTimeout(scrollTimeout);

      if (scrollingDown && currentScrollY > 100) {
        gsap.to(navRef.current, {
          y: -100,
          duration: 0.24, // 20% faster on mobile
          ease: 'power2.out',
        });
      } else {
        gsap.to(navRef.current, {
          y: 0,
          duration: 0.24,
          ease: 'power2.out',
        });
      }

      scrollTimeout = setTimeout(() => {
        gsap.to(navRef.current, {
          y: 0,
          duration: 0.24,
          ease: 'power2.out',
        });
      }, 150);
    };

    // Initial check for scroll position (or if page should always be blue)
    if (shouldAlwaysBeBlue) {
      setIsScrolled(true);
    } else {
      setIsScrolled(window.scrollY > 0);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
      if (megaMenuTimeoutRef.current) {
        clearTimeout(megaMenuTimeoutRef.current);
      }
      if (medyaMenuTimeoutRef.current) {
        clearTimeout(medyaMenuTimeoutRef.current);
      }
    };
  }, [shouldAlwaysBeBlue]);

  // Update isScrolled when pathname changes
  useEffect(() => {
    if (shouldAlwaysBeBlue) {
      setIsScrolled(true);
    } else {
      setIsScrolled(window.scrollY > 0);
    }
  }, [pathname, shouldAlwaysBeBlue]);

  const handleKurumsalMouseEnter = () => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
      megaMenuTimeoutRef.current = null;
    }
    setIsMegaMenuOpen(true);
  };

  const handleKurumsalMouseLeave = () => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
    }
    megaMenuTimeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
      megaMenuTimeoutRef.current = null;
    }, 300);
  };

  const handleMegaMenuMouseEnter = () => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
      megaMenuTimeoutRef.current = null;
    }
    setIsMegaMenuOpen(true);
  };

  const handleMegaMenuMouseLeave = () => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
    }
    megaMenuTimeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
      megaMenuTimeoutRef.current = null;
    }, 200);
  };

  const handleMedyaMouseEnter = () => {
    if (medyaMenuTimeoutRef.current) {
      clearTimeout(medyaMenuTimeoutRef.current);
      medyaMenuTimeoutRef.current = null;
    }
    setIsMedyaMenuOpen(true);
  };

  const handleMedyaMouseLeave = () => {
    if (medyaMenuTimeoutRef.current) {
      clearTimeout(medyaMenuTimeoutRef.current);
    }
    medyaMenuTimeoutRef.current = setTimeout(() => {
      setIsMedyaMenuOpen(false);
      medyaMenuTimeoutRef.current = null;
    }, 300);
  };

  const handleMedyaMenuMouseEnter = () => {
    if (medyaMenuTimeoutRef.current) {
      clearTimeout(medyaMenuTimeoutRef.current);
      medyaMenuTimeoutRef.current = null;
    }
    setIsMedyaMenuOpen(true);
  };

  const handleMedyaMenuMouseLeave = () => {
    if (medyaMenuTimeoutRef.current) {
      clearTimeout(medyaMenuTimeoutRef.current);
    }
    medyaMenuTimeoutRef.current = setTimeout(() => {
      setIsMedyaMenuOpen(false);
      medyaMenuTimeoutRef.current = null;
    }, 200);
  };

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 w-full z-[100] h-16 lg:h-24 transition-colors duration-300 ${
          isScrolled || isMobileMenuOpen
            ? 'bg-[#336699] border-b border-white/20' 
            : 'bg-transparent border-b border-white/10'
        }`}
      >
        <div className="max-w-7xl mx-auto h-full px-5 lg:px-0">
          <div className="grid grid-cols-12 h-full gap-0">
            {/* Logo - Far Left */}
            <div className="col-span-8 lg:col-span-2 flex items-center justify-start lg:justify-center h-full border-r border-white/20 px-3 lg:px-6">
              <Link
                href="/"
                className="relative w-full h-full flex items-center justify-center"
              >
                <Image
                  src="/images/hero-section-logo.svg"
                  alt="Logo"
                  width={200}
                  height={45}
                  className="object-contain w-auto h-8 lg:h-11"
                  priority
                />
              </Link>
            </div>

            {/* Navigation Links - Center (Desktop Only) */}
            <div className="hidden lg:flex col-span-8 items-center h-full relative">
              <ul className="flex items-center h-full w-full">
                {navLinks.map((link, index) => {
                  const isKurumsal = link.label === 'Kurumsal';
                  const isMedya = link.label === 'Medya';
                  
                  return (
                    <NavButton
                      key={link.href}
                      ref={isKurumsal ? kurumsalButtonRef : isMedya ? medyaButtonRef : undefined}
                      label={link.label}
                      href={link.href}
                      hasMegaMenu={link.hasMegaMenu}
                      onMouseEnter={
                        isKurumsal
                          ? handleKurumsalMouseEnter
                          : isMedya
                          ? handleMedyaMouseEnter
                          : undefined
                      }
                      onMouseLeave={
                        isKurumsal
                          ? handleKurumsalMouseLeave
                          : isMedya
                          ? handleMedyaMouseLeave
                          : undefined
                      }
                      className={`flex-1 h-full border-r border-white/20 last:border-r-0`}
                    />
                  );
                })}
              </ul>

              {/* Mega Menu for Kurumsal */}
              {navLinks.find(link => link.label === 'Kurumsal')?.megaMenuColumns && (
                <div
                  onMouseEnter={handleMegaMenuMouseEnter}
                  onMouseLeave={handleMegaMenuMouseLeave}
                  className="absolute top-full left-0 w-full"
                >
                  <MegaMenu
                    isOpen={isMegaMenuOpen}
                    columns={navLinks.find(link => link.label === 'Kurumsal')?.megaMenuColumns || []}
                    onClose={() => {
                      if (megaMenuTimeoutRef.current) {
                        clearTimeout(megaMenuTimeoutRef.current);
                        megaMenuTimeoutRef.current = null;
                      }
                      setIsMegaMenuOpen(false);
                    }}
                    parentRef={kurumsalButtonRef}
                  />
                </div>
              )}

              {/* Mega Menu for Medya */}
              {navLinks.find(link => link.label === 'Medya')?.megaMenuColumns && (
                <div
                  onMouseEnter={handleMedyaMenuMouseEnter}
                  onMouseLeave={handleMedyaMenuMouseLeave}
                  className="absolute top-full left-0 w-full"
                >
                  <MegaMenu
                    isOpen={isMedyaMenuOpen}
                    columns={navLinks.find(link => link.label === 'Medya')?.megaMenuColumns || []}
                    onClose={() => {
                      if (medyaMenuTimeoutRef.current) {
                        clearTimeout(medyaMenuTimeoutRef.current);
                        medyaMenuTimeoutRef.current = null;
                      }
                      setIsMedyaMenuOpen(false);
                    }}
                    parentRef={medyaButtonRef}
                  />
                </div>
              )}
            </div>

            {/* Social Media Icons & Language Selector - Far Right (Desktop Only) */}
            <div className="hidden lg:flex col-span-2 items-center justify-center h-full border-l border-white/20 gap-2 px-4">
              {[
                { icon: Facebook, href: SOCIAL_LINKS.facebook, label: 'Facebook' },
                { icon: Twitter, href: SOCIAL_LINKS.twitter, label: 'X (Twitter)' },
                { icon: Instagram, href: SOCIAL_LINKS.instagram, label: 'Instagram' },
                ...(SOCIAL_LINKS.youtube
                  ? [{ icon: Youtube, href: SOCIAL_LINKS.youtube, label: 'YouTube' as const }]
                  : []),
              ].map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 border border-white/20 flex items-center justify-center hover:bg-white hover:border-white transition-none group"
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4 text-white group-hover:text-[#336699] transition-none" />
                  </a>
                );
              })}
              <div className="ml-2">
                <LanguageSelector variant="navbar" />
              </div>
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="col-span-4 lg:hidden flex items-center justify-end h-full border-l border-white/20 px-5">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="w-11 h-11 flex items-center justify-center text-white hover:bg-white/10 transition-none"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="fixed inset-0 z-[99] bg-[#1E3A5F] lg:hidden"
          style={{ marginTop: '64px' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsMobileMenuOpen(false);
            }
          }}
        >
          <div className="h-full overflow-y-auto">
            <ul className="py-8">
              {navLinks.map((link, index) => (
                <li
                  key={link.href}
                  ref={(el) => {
                    mobileMenuItemsRef.current[index] = el;
                  }}
                  style={{ opacity: 0 }}
                >
                  {link.hasMegaMenu ? (
                    <div>
                      <div className="px-5 py-4 text-white uppercase text-base font-bold tracking-widest font-montserrat border-b border-white/20">
                        {link.label}
                      </div>
                      {link.megaMenuColumns?.map((column) => (
                        <div key={column.title} className="px-5 py-2">
                          {column.items.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block px-5 py-3 text-white/80 uppercase text-sm font-bold tracking-widest font-montserrat border-b border-white/10 hover:bg-white/10 transition-none"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-5 py-4 text-white uppercase text-base font-bold tracking-widest font-montserrat border-b border-white/20 hover:bg-white/10 transition-none"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
              
              {/* Mobile Language Selector */}
              {translateCtx && (
                <li className="px-5 py-4 border-t border-white/20">
                  <div className="notranslate">
                    <button
                      onClick={() => setIsMobileLangOpen(!isMobileLangOpen)}
                      className="w-full flex items-center justify-between py-3 px-4 text-white font-medium border border-white/20 rounded-xl hover:bg-white/10 transition-colors"
                      translate="no"
                    >
                      <span className="text-sm uppercase">Dil: {LANGS.find((l) => l.value === translateCtx.currentLang)?.label ?? "TR"}</span>
                      <ChevronDown size={16} className={`transition-transform ${isMobileLangOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isMobileLangOpen && (
                      <div className="mt-2 bg-white/10 border border-white/20 rounded-xl overflow-hidden">
                        {LANGS.map(({ value, label }) => (
                          <button
                            key={value}
                            type="button"
                            translate="no"
                            onClick={() => {
                              translateCtx.changeLanguage(value);
                              setIsMobileLangOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 text-sm transition-colors border-b border-white/10 last:border-b-0 ${
                              translateCtx.currentLang === value
                                ? "text-white font-medium bg-white/20"
                                : "text-white/80 hover:bg-white/10"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
