'use client';

import { useState } from 'react';
import { Menu, X, Globe, Mail } from 'lucide-react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Projects', href: '#projects' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#f1faee] border-b border-solid border-[#0a1128]">
      <div className="grid grid-cols-12 items-center h-16">
        {/* Logo Section */}
        <div className="col-span-3 md:col-span-2 flex items-center justify-center h-full border-r border-solid border-[#0a1128]">
          <a href="/" className="font-bold text-lg uppercase tracking-wider hover:bg-[#0a1128] hover:text-[#f1faee] transition-colors px-4 py-2">
            LOGO
          </a>
        </div>

        {/* Navigation Links - Hidden on mobile */}
        <div className="hidden md:flex col-span-6 items-center justify-center h-full border-r border-solid border-[#0a1128]">
          <ul className="flex items-center gap-0 h-full">
            {navLinks.map((link, index) => (
              <li key={link.href} className="h-full">
                <a
                  href={link.href}
                  className="h-full flex items-center px-6 uppercase text-sm font-semibold tracking-wide hover:bg-[#0a1128] hover:text-[#f1faee] transition-colors border-l border-solid border-[#0a1128] first:border-l-0"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Section - Language & Contact */}
        <div className="col-span-9 md:col-span-4 flex items-center justify-end h-full">
          <div className="flex items-center h-full">
            {/* Language Selector */}
            <button className="h-full flex items-center px-4 border-l border-solid border-[#0a1128] hover:bg-[#0a1128] hover:text-[#f1faee] transition-colors">
              <Globe className="w-5 h-5" />
              <span className="ml-2 uppercase text-sm font-semibold hidden sm:inline">EN</span>
            </button>

            {/* Contact Button */}
            <a
              href="#contact"
              className="h-full flex items-center px-4 border-l border-solid border-[#0a1128] hover:bg-[#e63946] hover:text-[#f1faee] transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span className="ml-2 uppercase text-sm font-semibold hidden sm:inline">Contact</span>
            </a>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden h-full flex items-center px-4 border-l border-solid border-[#0a1128] hover:bg-[#0a1128] hover:text-[#f1faee] transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-solid border-[#0a1128] bg-[#f1faee]">
          <ul className="flex flex-col">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block px-6 py-4 uppercase text-sm font-semibold tracking-wide border-b border-solid border-[#0a1128] hover:bg-[#0a1128] hover:text-[#f1faee] transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
