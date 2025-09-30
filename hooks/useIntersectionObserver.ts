import { useEffect, useRef, useState } from 'react';

export function useIntersectionObserver(options: IntersectionObserverInit = {}) {
  const [activeId, setActiveId] = useState('');
  const [elements, setElements] = useState<HTMLElement[]>([]);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (elements.length === 0) return;

    observer.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
          setActiveId(entry.target.id);
        }
      });
    }, options);

    elements.forEach((element) => {
      if (element) observer.current?.observe(element);
    });

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [elements, options]);

  const ref = (element: HTMLElement | null) => {
    if (element && !elements.includes(element)) {
      setElements((prev) => [...prev, element]);
    }
  };

  return { activeId, ref };
}
