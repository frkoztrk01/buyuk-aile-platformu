'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Navbar from './layout/Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const mainRef = useRef<HTMLElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    // Initialize GSAP context
    if (mainRef.current) {
      ctxRef.current = gsap.context(() => {
        // GSAP animations will be set up here
        // This context will be available for all child components
      }, mainRef.current);
    }

    // Cleanup
    return () => {
      if (ctxRef.current) {
        ctxRef.current.revert();
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main
        ref={mainRef}
        className="relative w-full min-h-screen"
        style={{ scrollBehavior: 'smooth' }}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
