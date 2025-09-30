"use client";

import { Project, Job } from "@/types";
import { useRef, useState, useEffect } from "react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import Navigation from "@/components/Navigation";
import ProjectCard from "@/components/ProjectCard";
import JobTimeline from "@/components/JobTimeline";
import ContactSection from "@/components/ContactSection";
import ThemeToggle from "@/components/ThemeToggle";
import BuildWithModal from "@/components/BuildWithModal";

export default function Home() {
  const [activeSection, setActiveSection] = useState("intro");
  const [showBuildWith, setShowBuildWith] = useState(false);
  const sections = ["intro", "work", "projects", "connect"];
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  
  // Initialize section refs with proper typing
  const setSectionRef = (el: HTMLElement | null, id: string) => {
    if (el) {
      sectionRefs.current[id] = el;
    }
  };
  
  // Set dark mode class on mount and when isDark changes
  useEffect(() => {
    // Use requestAnimationFrame to avoid layout thrashing
    const updateDarkMode = () => {
      document.documentElement.classList.toggle("dark", isDark);
      // Store theme preference in localStorage for persistence
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    };
    
    const rafId = requestAnimationFrame(updateDarkMode);
    return () => cancelAnimationFrame(rafId);
  }, [isDark]);

  // Project data
  const projectsData: Project[] = [
    {
      title: "Stationary Industrial Scanners, Photocell-Operated, interfaced to MES/ERP with custom Middleware",
      excerpt:
        "Implementation of fixed Industrial Scanning Systems, activated by photocells for automated data collection. Development of custom middleware to route information in real time to MES/ERP systems, optimizing production line efficiency",
      readTime: "Auto-ID",
      date: "2025",
    },
    {
      title: "RFID label Tags Serializator, Ink-jet Marker combined with RFID Reader and Keyence System Visions",
      excerpt:
        "Engineered a PLC-controlled RFID and inkjet label serialization system. This project ensures comprehensive traceability for each label and RFID tag, complemented by Keyence vision systems for quality control and data verification.",
      readTime: "Automation - Traceability",
      date: "2025",
    },
    {
      title:
        "Print and Apply system made by combining an integrated Cobot, mini-PC and an Industrial Thermal Printer",
      excerpt:
        "Design of an advanced Print and Apply system that uses a Cobot for precise label application. The system includes an integrated mini-PC for software management and a 6-inch thermal printer, ensuring extreme flexibility.",
      readTime: "Print & Apply",
      date: "2024",
    },
    {
      title:
        "Industrial Android devices Fleets, deployed with MDM and AS400 emulator, configured with SE58 Scan Engine",
      excerpt:
        "Management and configuration of multiple fleets of industrial Android devices. Each device is equipped with an AS400 emulator and managed via MDM for centralized control, and configured with a powerful SE58 scan engine for lightning-fast barcode reading.",
      readTime: "Auto-ID",
      date: "2023",
    },
  ];

  // Job experience data
  const jobsData: Job[] = [
    {
      year: "2022 - Present",
      role: "Technical Consultant / Specialist",
      company: "Pluriservice SPA",
      description:
        "For projects in Food, Pharma, Automotive or Manufacturing that require item-level Traceability and Labeling.",
      tech: ["Traceability", "Labeling", "MES/ERP", "Automation", "WMS"],
    },
    {
      year: "2020 - Present",
      role: "Systems Integrator / Solutions Architect",
      company: "Pluriservice SPA",
      description:
        "PLC wiring. Coding (Scripting, APIs, Middleware). Enabling real-time communication between shop floor and management software, full-stack traceability from production to shipping.",
      tech: ["APIs", "PLC", "Middleware", "Scripting"],
    },
    {
      year: "2018 - Present",
      role: "Industrial Automation Specialist",
      company: "Pluriservice SPA",
      description:
        "Print & Apply (Zebra, Honeywell, TSC, SATO, Toshiba). RFID + Industrial Scanners (Datalogic). Custom software and integration with MES/ERP/WMA systems.",
      tech: ["Print & Apply", "RFID", "Industrial Scanners", "Custom Software"],
    },
    {
      year: "2016 - Present",
      role: "Technical Specialist",
      company: "Pluriservice SPA",
      description:
        "Started career focusing on Auto-ID solutions, Industrial Hardware Repairs and Failure Analysis for manufacturing environments.",
      tech: ["Auto-ID", "Industrial Hardware", "Laboratory", "Manufacturing"],
    },
  ];

  // Wikipedia links for skills with proper typing
  const wikipediaLinks: Record<string, string> = {
    "Auto-ID": "https://en.wikipedia.org/wiki/Automatic_identification_and_data_capture",
    "Print & Apply": "https://en.wikipedia.org/wiki/Label_printer_applicator",
  };

  const getWikipediaUrl = (skill: string): string | undefined => {
    return wikipediaLinks[skill];
  };

  // Memoize the sections array to prevent unnecessary re-renders
  const memoizedSections = useRef(sections);

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <Navigation 
        sections={sections} 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />

      <main 
        className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16 relative z-10"
        role="main"
        aria-label="Main content"
      >
        <header
          id="intro"
          ref={(el) => setSectionRef(el, 'intro')}
          className="min-h-screen py-20 sm:py-32"
        >
          <div className="grid lg:grid-cols-5 gap-12 sm:gap-16 w-full">
            <div className="lg:col-span-3 space-y-6 sm:space-y-8">
              <div className="space-y-3 sm:space-y-2">
                <div className="text-sm text-muted-foreground font-mono tracking-wider">PORTFOLIO / 2025</div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight">
                  Marco
                  <br />
                  <span className="text-muted-foreground">Gardelli</span>
                </h1>
              </div>

              <div className="space-y-6 max-w-md">
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                  Seasoned Senior Technical Specialist focused on solving complex challenges in industrial hardware,
                  bridging the gap between
                  <span className="text-foreground"> technical specs</span> and
                  <span className="text-foreground"> real-world application</span>.
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Available for work
                  </div>
                  <div>Italy - Forlì</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col justify-end space-y-6 sm:space-y-8 mt-8 lg:mt-0">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground font-mono">CURRENTLY</div>
                <div className="space-y-2">
                  <div className="text-foreground">Senior Technical Specialist</div>
                  <div className="text-muted-foreground">@ Pluriservice SPA</div>
                  <div className="text-xs text-muted-foreground">2016 — Present</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-sm text-muted-foreground font-mono">FOCUS</div>
                <div className="flex flex-wrap gap-2">
                  {["Auto-ID", "RFID", "Print & Apply", "Industrial Automation", "Traceability"].map((skill) => (
                    <a
                      key={skill}
                      href={getWikipediaUrl(skill)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-xs border border-border rounded-full hover:border-muted-foreground/50 transition-colors duration-300"
                    >
                      {skill}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        <section
          id="work"
          ref={(el) => setSectionRef(el, 'work')}
          className="min-h-screen py-20 sm:py-32 opacity-0"
        >
          <div className="space-y-12 sm:space-y-16">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <h2 className="text-3xl sm:text-4xl font-light">Selected Work</h2>
              <div className="text-sm text-muted-foreground font-mono">2016 — 2025</div>
            </div>
            <JobTimeline jobs={jobsData} />
          </div>
        </section>

        <section
          id="projects"
          ref={(el) => setSectionRef(el, 'projects')}
          className="min-h-screen py-20 sm:py-32 opacity-0"
        >
          <div className="space-y-12 sm:space-y-16">
            <h2 className="text-3xl sm:text-4xl font-light">Recent Projects</h2>
            <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
              {projectsData.map((project, index) => (
                <ProjectCard key={index} project={project} index={index} />
              ))}
            </div>
          </div>
        </section>

        <section 
          id="connect" 
          ref={(el) => setSectionRef(el, 'connect')} 
          className="py-20 sm:py-32 opacity-0"
        >
          <ContactSection />
        </section>

        <footer className="py-12 sm:py-16 border-t border-border">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 sm:gap-8">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">© 2025 Marco Gardelli. All rights reserved.</div>
              <div className="text-xs text-muted-foreground">Built with v0.dev by Marco Gardelli</div>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />

              <button
                onClick={() => setShowBuildWith(true)}
                className="group py-2 px-3 rounded-lg border border-border hover:border-muted-foreground/50 transition-all duration-300"
                aria-label="Show technologies used"
              >
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  Built With
                </span>
              </button>
            </div>
          </div>
        </footer>
      </main>

      <BuildWithModal isOpen={showBuildWith} onClose={() => setShowBuildWith(false)} />

      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none"></div>
    </div>
  )
}
