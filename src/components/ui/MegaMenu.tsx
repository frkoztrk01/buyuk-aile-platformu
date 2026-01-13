'use client';

import { useRef, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';

interface MegaMenuColumn {
  title: string;
  items: Array<{
    label: string;
    href: string;
  }>;
}

interface MegaMenuProps {
  isOpen: boolean;
  columns: MegaMenuColumn[];
  onClose: () => void;
  parentRef: React.RefObject<HTMLElement | null>;
}

export default function MegaMenu({ isOpen, columns, onClose, parentRef }: MegaMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuRef.current) return;

    if (isOpen) {
      // Animate dropdown
      gsap.fromTo(
        menuRef.current,
        { opacity: 0, y: -20, display: 'none' },
        {
          opacity: 1,
          y: 0,
          display: 'block',
          duration: 0.3,
          ease: 'power2.out',
        }
      );
    } else {
      if (menuRef.current) {
        gsap.to(menuRef.current, {
          opacity: 0,
          y: -20,
          duration: 0.2,
          ease: 'power2.in',
          onComplete: () => {
            if (menuRef.current) {
              menuRef.current.style.display = 'none';
            }
          },
        });
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        !parentRef.current?.contains(event.target as Node)
      ) {
        // Only close if clicking outside both menu and parent button
        const target = event.target as HTMLElement;
        const isInsideMenu = containerRef.current.contains(target);
        const isInsideParent = parentRef.current?.contains(target);
        
        if (!isInsideMenu && !isInsideParent) {
          onClose();
        }
      }
    };

    if (isOpen) {
      // Use a small delay to prevent immediate closing
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, parentRef]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 w-full z-50"
    >
      <div
        ref={menuRef}
        className="bg-light border border-solid border-dark"
        style={{ display: 'none' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col">
            {columns.map((column, colIndex) => (
              <div
                key={column.title}
                className={`p-6 ${
                  colIndex < columns.length - 1 ? 'border-b border-solid border-dark' : ''
                }`}
              >
                <a
                  href={column.items[0]?.href || '#'}
                  className="flex items-center justify-between group text-sm font-bold uppercase text-dark hover:text-primary transition-none py-1"
                  onClick={onClose}
                >
                  <span>{column.title}</span>
                  <div className="w-6 h-6 border-2 border-solid border-dark group-hover:border-primary group-hover:bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-none">
                    <ArrowRight className="w-3 h-3 text-dark group-hover:text-light" />
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
