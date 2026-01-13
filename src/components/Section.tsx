import { ReactNode } from 'react';

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  backgroundColor?: 'off-white' | 'navy' | 'red';
}

export default function Section({ 
  id, 
  children, 
  className = '', 
  backgroundColor = 'off-white' 
}: SectionProps) {
  const bgColors = {
    'off-white': 'bg-light',
    'navy': 'bg-dark text-light',
    'red': 'bg-primary text-light',
  };

  const borderColor = backgroundColor === 'off-white' ? 'border-dark' : 'border-light';

  return (
    <section
      id={id}
      className={`min-h-screen h-screen snap-start snap-always flex items-center justify-center border-b border-solid ${borderColor} ${bgColors[backgroundColor]} ${className}`}
    >
      <div className="w-full max-w-7xl mx-auto px-6">
        {children}
      </div>
    </section>
  );
}
