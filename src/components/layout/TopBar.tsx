'use client';

import { useState, useRef, useEffect } from 'react';
import { Phone, ChevronDown, Shield } from 'lucide-react';
import { gsap } from 'gsap';

export default function TopBar() {
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const securityDropdownRef = useRef<HTMLDivElement>(null);
  const securityButtonRef = useRef<HTMLButtonElement>(null);

  const securityOptions = [
    { label: 'Güvenlik Hattı', href: 'tel:+905551234567', phone: '+90 555 123 45 67' },
    { label: 'Acil Durum', href: 'tel:+905551234568', phone: '+90 555 123 45 68' },
  ];

  useEffect(() => {
    if (isSecurityOpen && securityDropdownRef.current) {
      gsap.fromTo(
        securityDropdownRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' }
      );
    }
  }, [isSecurityOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        securityButtonRef.current &&
        securityDropdownRef.current &&
        !securityButtonRef.current.contains(event.target as Node) &&
        !securityDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSecurityOpen(false);
      }
    };

    if (isSecurityOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSecurityOpen]);

  return (
    <div className="w-full bg-transparent border-b border-solid border-white/20">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-end h-10 text-sm text-white">
          {/* Phone */}
          <div className="flex items-center h-full px-4 border-l border-solid border-white/20">
            <Phone className="w-4 h-4 mr-2" />
            <a href="tel:+905551234567" className="font-semibold hover:text-primary transition-none">
              +90 555 123 45 67
            </a>
          </div>

          {/* Security/Hotline Dropdown */}
          <div className="relative h-full border-l border-solid border-white/20">
            <button
              ref={securityButtonRef}
              className="h-full flex items-center px-4 hover:bg-white/10 transition-none"
              onClick={() => setIsSecurityOpen(!isSecurityOpen)}
            >
              <Shield className="w-4 h-4 mr-2" />
              <span className="font-semibold uppercase mr-2">Güvenlik</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isSecurityOpen ? 'rotate-180' : ''}`} />
            </button>

            {isSecurityOpen && (
              <div
                ref={securityDropdownRef}
                className="absolute top-full right-0 bg-light border border-solid border-dark z-50 min-w-[200px]"
              >
                {securityOptions.map((option, index) => (
                  <a
                    key={option.href}
                    href={option.href}
                    className="block px-4 py-3 text-dark border-b border-solid border-dark last:border-b-0 hover:bg-dark hover:text-light transition-none"
                    onClick={() => setIsSecurityOpen(false)}
                  >
                    <div className="font-semibold uppercase text-xs mb-1">{option.label}</div>
                    <div className="text-sm font-bold text-primary">{option.phone}</div>
                  </a>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
