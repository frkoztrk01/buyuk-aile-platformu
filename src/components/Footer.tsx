'use client';

import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { SOCIAL_LINKS } from '@/lib/site-social';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-[#336699] text-white border-t border-white/10">
      {/* Main Footer Content - Responsive Grid */}
      <div className="max-w-7xl mx-auto px-5 lg:px-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-b border-white/10">
          {/* Column 1: LOGO & ABOUT */}
          <div className="col-span-1 p-5 lg:p-8 border-b md:border-b-0 md:border-r border-white/10 lg:border-r">
            <div className="mb-4 lg:mb-6">
              {/* Logo */}
              <div className="mb-3 lg:mb-4">
                <Image
                  src="/images/hero-section-logo.svg"
                  alt="Büyük Aile Platformu"
                  width={120}
                  height={40}
                  className="filter brightness-0 invert w-auto h-8 lg:h-10"
                  priority
                />
              </div>
            </div>
            <p className="text-xs lg:text-sm leading-relaxed text-white/80 font-sans">
              Büyük Aile Platformu, toplumsal dayanışmayı güçlendirmek ve aile değerlerini korumak için çalışan bir sivil toplum kuruluşudur.
            </p>
          </div>

          {/* Column 2: QUICK LINKS */}
          <div className="col-span-1 p-5 lg:p-8 border-b md:border-b-0 md:border-r lg:border-r border-white/10">
            <h3 className="uppercase text-xs font-bold tracking-widest mb-4 lg:mb-6 font-montserrat text-white">
              Hızlı Linkler
            </h3>
            <ul className="space-y-2 lg:space-y-3">
              {[
                { label: 'Anasayfa', href: '/' },
                { label: 'Hakkımızda', href: '/hakkimizda' },
                { label: 'Manifesto', href: '/manifesto' },
                { label: 'Mutabakat Zaptı', href: '/mutabakat' },
                { label: 'Kurucu Kuruluşlar', href: '/kurucu-kuruluslar' },
                { label: 'Üyeler', href: '/uyeler' },
                { label: 'Haberler', href: '/haberler' },
                { label: 'Videolar', href: '/videolar' },
                { label: 'Buluşmalar', href: '/bulusmalar' },
                { label: 'İletişim', href: '/iletisim' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs lg:text-sm uppercase tracking-wide font-sans text-white/80 hover:text-white transition-none relative group block py-2 min-h-[44px] flex items-center"
                  >
                    {link.label}
                    <span className="absolute bottom-2 left-0 w-0 h-[1px] bg-white group-hover:w-full transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: CONTACT INFO */}
          <div className="col-span-1 p-5 lg:p-8 border-b md:border-b-0 md:border-r lg:border-r border-white/10">
            <h3 className="uppercase text-xs font-bold tracking-widest mb-4 lg:mb-6 font-montserrat text-white">
              İletişim
            </h3>
            <ul className="space-y-3 lg:space-y-4 text-xs lg:text-sm font-sans text-white/80">
              <li>
                <p className="leading-relaxed">
                  Büyük Aile Platformu<br />
                  İstanbul, Türkiye
                </p>
              </li>
              <li>
                <a
                  href="tel:+908501234567"
                  className="hover:text-white transition-none block py-2 min-h-[44px] flex items-center"
                >
                  +90 850 123 45 67
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@buyukaileplatformu.org"
                  className="hover:text-white transition-none block py-2 min-h-[44px] flex items-center break-all"
                >
                  info@buyukaileplatformu.org
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: SOCIAL MEDIA & ACTION */}
          <div className="col-span-1 p-5 lg:p-8">
            <h3 className="uppercase text-xs font-bold tracking-widest mb-4 lg:mb-6 font-montserrat text-white">
              Sosyal Medya
            </h3>
            <div className="flex gap-2 lg:gap-3 mb-6 lg:mb-8">
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
                    className="w-11 h-11 lg:w-10 lg:h-10 border border-white/20 flex items-center justify-center hover:bg-white hover:border-white transition-none group min-w-[44px] min-h-[44px]"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5 text-white group-hover:text-[#336699] transition-none" />
                  </a>
                );
              })}
            </div>
            <button className="w-full border border-white/20 bg-transparent text-white uppercase text-xs font-bold tracking-widest py-3 lg:py-3 px-6 hover:bg-white hover:text-[#336699] transition-none font-montserrat min-h-[44px]">
              BİZE KATIL
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between px-5 lg:px-8 py-4 lg:py-6 gap-4 lg:gap-0 text-xs uppercase tracking-wider font-sans text-white/60">
          <div>
            <p className="text-xs lg:text-xs">© {currentYear} Büyük Aile Platformu. Tüm Hakları Saklıdır.</p>
          </div>
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-6 items-start lg:items-center">
            <Link
              href="#privacy"
              className="hover:text-white transition-none min-h-[44px] flex items-center"
            >
              Gizlilik Politikası
            </Link>
            <span className="hidden lg:inline text-white/20">|</span>
            <span className="text-white/40 text-xs">WİSARC ile yapıldı</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
