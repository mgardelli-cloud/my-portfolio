export interface Project {
  title: string;
  excerpt: string;
  readTime: string;
  date: string;
}

export interface Job {
  year: string;
  role: string;
  company: string;
  description: string;
  tech: string[];
}

export interface SectionRefs {
  [key: string]: HTMLElement | null;
}
