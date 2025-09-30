'use client';

import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface NavigationProps {
  sections: string[];
}

export default function Navigation({ sections }: NavigationProps) {
  const { activeId } = useIntersectionObserver({
    threshold: 0.3,
    rootMargin: '0px 0px -20% 0px',
  });

  return (
    <nav className="fixed left-8 top-1/2 -translate-y-1/2 z-10 hidden lg:block">
      <div className="flex flex-col gap-4">
        {sections.map((section) => (
          <button
            key={section}
            onClick={() => {
              const element = document.getElementById(section);
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`w-2 h-8 rounded-full transition-all duration-500 ${
              activeId === section 
                ? 'bg-foreground' 
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/60'
            }`}
            aria-label={`Scroll to ${section}`}
            aria-current={activeId === section ? 'true' : 'false'}
          />
        ))}
      </div>
    </nav>
  );
}
