"use client"

import { useEffect, useRef, useState } from "react"

export default function Home() {
  const [isDark, setIsDark] = useState(true)
  const [activeSection, setActiveSection] = useState("")
  const [showBuildWith, setShowBuildWith] = useState(false)
  const sectionsRef = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
  }, [isDark])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up")
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.3, rootMargin: "0px 0px -20% 0px" },
    )

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section)
    })

    return () => observer.disconnect()
  }, [])

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  const projectsData = [
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
      title: "Print and Apply system made by combining an integrated Cobot, mini-PC and an Industrial Thermal Printer",
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
  ]

  const wikipediaLinks = {
    "Auto-ID": "https://en.wikipedia.org/wiki/Automatic_identification_and_data_capture",
    "Print & Apply": "https://en.wikipedia.org/wiki/Label_printer_applicator",
  }

  const getWikipediaUrl = (skill) => {
    if (wikipediaLinks[skill]) {
      return wikipediaLinks[skill]
    }
    const pageName = skill.replace(/ /g, "_").replace(/&/g, "and")
    return `https://en.wikipedia.org/wiki/${pageName}`
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <nav className="fixed left-8 top-1/2 -translate-y-1/2 z-10 hidden lg:block">
        <div className="flex flex-col gap-4">
          {["intro", "work", "projects", "connect"].map((section) => (
            <button
              key={section}
              onClick={() => document.getElementById(section)?.scrollIntoView({ behavior: "smooth" })}
              className={`w-2 h-8 rounded-full transition-all duration-500 ${
                activeSection === section ? "bg-foreground" : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
              }`}
              aria-label={`Maps to ${section}`}
            />
          ))}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16 relative z-10">
        <header
          id="intro"
          ref={(el) => (sectionsRef.current[0] = el)}
          className="min-h-screen flex items-center opacity-0"
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
          ref={(el) => (sectionsRef.current[1] = el)}
          className="min-h-screen py-20 sm:py-32 opacity-0"
        >
          <div className="space-y-12 sm:space-y-16">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <h2 className="text-3xl sm:text-4xl font-light">Selected Work</h2>
              <div className="text-sm text-muted-foreground font-mono">2016 — 2025</div>
            </div>

            <div className="space-y-8 sm:space-y-12">
              {[
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
              ].map((job, index) => (
                <div
                  key={index}
                  className="group grid lg:grid-cols-12 gap-4 sm:gap-8 py-6 sm:py-8 border-b border-border/50 hover:border-border transition-colors duration-500"
                >
                  <div className="lg:col-span-2">
                    <div className="text-xl sm:text-2xl font-light text-muted-foreground group-hover:text-foreground transition-colors duration-500">
                      {job.year}
                    </div>
                  </div>

                  <div className="lg:col-span-6 space-y-3">
                    <div>
                      <h3 className="text-lg sm:text-xl font-medium">{job.role}</h3>
                      <div className="text-muted-foreground">{job.company}</div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed max-w-lg">{job.description}</p>
                  </div>

                  <div className="lg:col-span-4 flex flex-wrap gap-2 lg:justify-end mt-2 lg:mt-0">
                    {job.tech.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-1 text-xs text-muted-foreground rounded group-hover:border-muted-foreground/50 transition-colors duration-500"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="projects"
          ref={(el) => (sectionsRef.current[2] = el)}
          className="min-h-screen py-20 sm:py-32 opacity-0"
        >
          <div className="space-y-12 sm:space-y-16">
            <h2 className="text-3xl sm:text-4xl font-light">Recent Projects</h2>

            <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
              {projectsData.map((post, index) => (
                <article
                  key={index}
                  className="group p-6 sm:p-8 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-500 cursor-pointer"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                      <span>{post.date}</span>
                      <span>{post.readTime}</span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-medium leading-tight group-hover:text-muted-foreground transition-colors duration-300">
                      {post.title}
                    </h3>

                    <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{post.excerpt}</p>

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
              ))}
            </div>
          </div>
        </section>

        <section id="connect" ref={(el) => (sectionsRef.current[3] = el)} className="py-20 sm:py-32 opacity-0">
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
            </div>
          </div>
        </section>

        <footer className="py-12 sm:py-16 border-t border-border">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 sm:gap-8">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">© 2025 Marco Gardelli. All rights reserved.</div>
              <div className="text-xs text-muted-foreground">Built with v0.dev by Marco Gardelli</div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="group p-3 rounded-lg border border-border hover:border-muted-foreground/50 transition-all duration-300"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <svg
                    className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>

              <button
                onClick={() => setShowBuildWith(true)}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-xs text-gray-300 hover:text-white"
              >
                Build with:
              </button>
            </div>
          </div>
        </footer>
      </main>

      {showBuildWith && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg shadow-xl max-w-sm w-full mx-4 relative">
            <button
              onClick={() => setShowBuildWith(false)}
              className="absolute top-2 right-2 text-white hover:text-gray-300 text-xl font-bold"
            >
              ×
            </button>

            <div className="space-y-3 mt-4">
              <div>
                <a
                  href="https://nextjs.org/"
                  target="_blank"
                  className="text-white hover:underline font-semibold"
                  rel="noreferrer"
                >
                  Next.js
                </a>
                <span className="text-gray-400"> - React framework</span>
              </div>

              <div>
                <a
                  href="https://www.typescriptlang.org/"
                  target="_blank"
                  className="text-white hover:underline font-semibold"
                  rel="noreferrer"
                >
                  TypeScript
                </a>
                <span className="text-gray-400"> - Type safety</span>
              </div>

              <div>
                <a
                  href="https://tailwindcss.com/"
                  target="_blank"
                  className="text-white hover:underline font-semibold"
                  rel="noreferrer"
                >
                  Tailwind CSS
                </a>
                <span className="text-gray-400"> - Styling</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none"></div>
    </div>
  )
}
