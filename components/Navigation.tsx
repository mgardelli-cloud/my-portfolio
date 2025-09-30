'use client';

import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface NavigationProps {
  sections: string[];
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function Navigation({ sections, activeSection, onSectionChange }: NavigationProps) {
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
            onClick={() => onSectionChange(section)}
            className={`w-2 h-8 rounded-full transition-all duration-500 ${
              activeSection === section 
                ? 'bg-foreground' 
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/60'
            }`}
            aria-label={`Scroll to ${section}`}
          />
        ))}
      </div>
    </nav>
  );
}
