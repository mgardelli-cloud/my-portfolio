'use client';

import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { memo, useCallback, KeyboardEvent } from 'react';

interface NavigationProps {
  sections: string[];
}

const NavigationItem = memo(({ 
  section, 
  isActive, 
  onClick 
}: { 
  section: string; 
  isActive: boolean;
  onClick: (section: string) => void;
}) => {
  const handleClick = useCallback(() => {
    onClick(section);
  }, [onClick, section]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(section);
    }
  }, [onClick, section]);

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`w-2 h-8 rounded-full transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
        isActive 
          ? 'bg-foreground' 
          : 'bg-muted-foreground/30 hover:bg-muted-foreground/60'
      }`}
      aria-label={`Scroll to ${section}`}
      aria-current={isActive ? 'true' : 'false'}
      role="tab"
      tabIndex={isActive ? 0 : -1}
    />
  );
});

NavigationItem.displayName = 'NavigationItem';

function Navigation({ sections }: NavigationProps) {
  const { activeId } = useIntersectionObserver({
    threshold: 0.3,
    rootMargin: '0px 0px -20% 0px',
  });

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      // Focus the target element for better keyboard navigation
      element.setAttribute('tabIndex', '-1');
      element.focus({ preventScroll: true });
    }
  }, []);

  return (
    <nav 
      className="fixed left-8 top-1/2 -translate-y-1/2 z-10 hidden lg:block"
      aria-label="Page navigation"
      role="tablist"
    >
      <div className="flex flex-col gap-4">
        {sections.map((section) => (
          <NavigationItem
            key={section}
            section={section}
            isActive={activeId === section}
            onClick={scrollToSection}
          />
        ))}
      </div>
    </nav>
  );
}

export default memo(Navigation);
