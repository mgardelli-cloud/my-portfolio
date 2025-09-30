'use client';

import { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <article
      key={index}
      className="group p-6 sm:p-8 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-500 cursor-pointer"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
          <span>{project.date}</span>
          <span>{project.readTime}</span>
        </div>

        <h3 className="text-lg sm:text-xl font-medium leading-tight group-hover:text-muted-foreground transition-colors duration-300">
          {project.title}
        </h3>

        <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
          {project.excerpt}
        </p>

        <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
          <span>® </span>
          <svg
            className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </div>
      </div>
    </article>
  );
}
