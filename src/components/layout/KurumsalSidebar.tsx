'use client';

import Link from 'next/link';
import { KURUMSAL_NAV_LINKS } from '@/lib/kurumsal-nav';

type KurumsalSidebarProps = {
  activeHref: string;
};

export default function KurumsalSidebar({ activeHref }: KurumsalSidebarProps) {
  return (
    <div className="lg:sticky lg:top-32">
      <h3 className="uppercase text-xs font-bold tracking-widest mb-4 lg:mb-6 text-[#1E3A5F] font-montserrat">
        Kurumsal
      </h3>
      <ul className="space-y-0 border border-black/10">
        {KURUMSAL_NAV_LINKS.map((link) => {
          const active = link.href === activeHref;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`block px-4 lg:px-6 py-3 lg:py-4 text-sm uppercase tracking-wide font-sans transition-none border-b border-black/10 last:border-b-0 min-h-[44px] flex items-center ${
                  active
                    ? 'bg-[#1E3A5F] text-white font-bold'
                    : 'text-[#1E3A5F] hover:bg-[#1E3A5F] hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
