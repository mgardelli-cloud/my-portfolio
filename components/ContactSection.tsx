'use client';

export default function ContactSection() {
  return (
    <div className="grid lg:grid-cols-2 gap-12 sm:gap-16">
      <div className="space-y-6 sm:space-y-8">
        <h2 className="text-3xl sm:text-4xl font-light">Let's Connect</h2>
        <div className="space-y-6">
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Always interested in new opportunities, collaborations, and conversations about industrial automation
            and traceability solutions.
          </p>
        </div>
      </div>

      <div className="space-y-6 sm:space-y-8">
        <div className="text-sm text-muted-foreground font-mono">CONTACT</div>
        <div className="space-y-4">
          <a
            href="mailto:gardellimarco3@gmail.com"
            className="group flex items-center gap-3 text-foreground hover:text-muted-foreground transition-colors duration-300"
          >
            <span className="text-base sm:text-lg">gardellimarco3@gmail.com</span>
            <svg
              className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
          <a
            href="tel:+393468691548"
            className="group flex items-center gap-3 text-foreground hover:text-muted-foreground transition-colors duration-300"
          >
            <span className="text-base sm:text-lg">+39 346 869 1548</span>
            <svg
              className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>

        <div className="space-y-4 mt-16 pt-8 border-t border-border/30">
          <div className="text-sm text-muted-foreground font-mono">SIDE PROJECTS</div>
          <button
            onClick={() => window.open('https://ai-prompt-library-eight.vercel.app/', '_blank')}
            className="group p-3 rounded-lg border border-border hover:border-muted-foreground/50 transition-all duration-300"
            aria-label="Open AI Prompt Library"
          >
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
              Ai-Promt-Library
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
