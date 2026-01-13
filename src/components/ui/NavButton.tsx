'use client';

import { ReactNode, useState, useRef, useEffect, forwardRef } from 'react';
import { gsap } from 'gsap';

interface NavButtonProps {
  label: string;
  href?: string;
  hasMegaMenu?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string;
}

const NavButton = forwardRef<HTMLLIElement, NavButtonProps>(({ 
  label, 
  href = '#', 
  hasMegaMenu = false,
  onMouseEnter,
  onMouseLeave,
  className = '' 
}, ref) => {
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef<HTMLLIElement>(null);
  const redLineRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (onMouseEnter) onMouseEnter();

    // Animate red line
    if (redLineRef.current) {
      gsap.fromTo(
        redLineRef.current,
        { scaleX: 0, transformOrigin: 'left' },
        { scaleX: 1, duration: 0.2, ease: 'power2.out' }
      );
    }

    // Animate background
    if (bgRef.current) {
      gsap.to(bgRef.current, {
        opacity: 1,
        duration: 0.2,
        ease: 'power2.out',
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (onMouseLeave) onMouseLeave();

    // Animate red line out
    if (redLineRef.current) {
      gsap.to(redLineRef.current, {
        scaleX: 0,
        transformOrigin: 'right',
        duration: 0.2,
        ease: 'power2.in',
      });
    }

    // Animate background out
    if (bgRef.current) {
      gsap.to(bgRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
      });
    }
  };

  return (
    <li
      ref={ref || buttonRef}
      className={`relative h-full ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Red line at top */}
      <div
        ref={redLineRef}
        className="absolute top-0 left-0 right-0 h-0.5 bg-primary"
        style={{ transform: 'scaleX(0)' }}
      />

      {/* Background fill */}
      <div
        ref={bgRef}
        className="absolute inset-0 bg-white/10"
        style={{ opacity: 0 }}
      />

      <a
        href={href}
        className="relative h-full w-full flex items-center justify-center px-6 uppercase text-sm font-semibold tracking-wide text-white z-10 text-center overflow-hidden whitespace-nowrap"
      >
        {label}
      </a>
    </li>
  );
});

NavButton.displayName = 'NavButton';

export default NavButton;
