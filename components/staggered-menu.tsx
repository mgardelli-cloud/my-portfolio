'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface StaggeredMenuItem {
  label: string;
  ariaLabel: string;
  link: string;
}

export interface StaggeredMenuSocialItem {
  label: string;
  link: string;
}

export interface StaggeredMenuProps {
  position?: 'left' | 'right';
  colors?: string[];
  items?: StaggeredMenuItem[];
  socialItems?: StaggeredMenuSocialItem[];
  displaySocials?: boolean;
  displayItemNumbering?: boolean;
  className?: string;
  logoUrl?: string;
  menuButtonColor?: string;
  openMenuButtonColor?: string;
  accentColor?: string;
  changeMenuColorOnOpen?: boolean;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
}

export const StaggeredMenu: React.FC<StaggeredMenuProps> = ({
  position = 'right',
  colors = ['#f5f5f5', '#e0e0e0'], // Lighter grey colors for the menu background
  items = [],
  socialItems = [],
  displaySocials = false, // Turn off social section by default
  displayItemNumbering = true,
  className = '',
  logoUrl = '/logo.svg',
  menuButtonColor = '#fff',
  openMenuButtonColor = '#fff',
  changeMenuColorOnOpen = true,
  accentColor = '#5227FF',
  onMenuOpen,
  onMenuClose,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const preLayersRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const toggleMenu = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    if (!isOpen) {
      setIsOpen(true);
      onMenuOpen?.();
      // Force reflow to ensure the element is in the DOM before animating
      void panelRef.current?.offsetHeight;
      panelRef.current?.classList.add('open');
      if (preLayersRef.current) {
        preLayersRef.current.classList.add('open');
      }
      menuButtonRef.current?.classList.add('open');
    } else {
      panelRef.current?.classList.remove('open');
      if (preLayersRef.current) {
        preLayersRef.current.classList.remove('open');
      }
      menuButtonRef.current?.classList.remove('open');
      onMenuClose?.();
      
      // Wait for the close animation to finish before updating the state
      setTimeout(() => {
        setIsOpen(false);
        setIsAnimating(false);
      }, 500); // Match this with the CSS transition duration
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen && 
        panelRef.current && 
        !panelRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        toggleMenu();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close menu when pressing Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        toggleMenu();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Generate background layers
  const renderBackgroundLayers = () => {
    const layers = colors.slice(0, 3); // Limit to 3 layers for better performance
    return layers.map((color, index) => (
      <div 
        key={index} 
        className="prelayer" 
        style={{
          backgroundColor: color,
          zIndex: 10 + index,
          transitionDelay: `${index * 0.1}s`,
        }}
      />
    ));
  };

  // Debug: verifica che il componente venga renderizzato
  console.log('StaggeredMenu rendering...');
  
  return (
    <div className={`staggered-menu ${className}`} data-position={position}>
      {/* Background layers */}
      <div 
        ref={preLayersRef} 
        className="prelayers"
        style={{
          '--accent-color': accentColor,
        } as React.CSSProperties}
      >
        {renderBackgroundLayers()}
      </div>

      {/* Menu button */}
      <header className="menu-header">
        <div className="logo">
          <Image 
            src={logoUrl} 
            alt="Logo" 
            width={120} 
            height={40} 
            className="logo-img"
            priority
          />
        </div>
        
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999
        }}>
          <button
            ref={menuButtonRef}
            id="menu-toggle-button"
            className="menu-toggle"
            onClick={toggleMenu}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
            aria-controls="menu-panel"
            style={{
              background: '#000',
              border: '2px solid #fff',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              boxShadow: '0 0 0 3px red'
            }}
          >
            ☰
          </button>
        </div>
      </header>

      {/* Menu panel */}
      {isOpen && (
        <div 
          ref={panelRef}
          id="menu-panel"
          className="menu-panel"
          style={{
            '--accent-color': accentColor,
          } as React.CSSProperties}
        >
          <nav className="menu-nav">
            <ul className="menu-list" data-numbering={displayItemNumbering || undefined}>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <li key={`${item.label}-${index}`} className="menu-item">
                    <Link 
                      href={item.link} 
                      className="menu-link"
                      aria-label={item.ariaLabel}
                      onClick={toggleMenu}
                    >
                      {displayItemNumbering && (
                        <span className="item-number">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      )}
                      <span className="item-text">{item.label}</span>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="menu-item">
                  <span className="menu-link">
                    <span className="item-text">No items</span>
                  </span>
                </li>
              )}
            </ul>

            {displaySocials && socialItems.length > 0 && (
              <div className="social-section">
                <h3 className="social-title">Socials</h3>
                <ul className="social-list">
                  {socialItems.map((social, index) => (
                    <li key={`${social.label}-${index}`} className="social-item">
                      <a 
                        href={social.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="social-link"
                      >
                        {social.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </nav>
        </div>
      )}

      <style jsx global>{`
        /* Base styles */
        .staggered-menu {
          --menu-width: 100%;
          --menu-max-width: 420px;
          --menu-bg: #fff;
          --text-color: #000;
          --accent-color: rgb(115, 115, 115); /* Grey accent color */
          --transition-duration: 0.3s;
          --easing: cubic-bezier(0.4, 0, 0.2, 1);
          --header-height: 80px;
          --z-layers: 10;
          --z-header: 20;
          --z-panel: 30;
        }

        /* Header styles */
        .menu-header {
          position: fixed !important;
          top: 0 !important;
          right: 0 !important;
          left: auto !important;
          width: auto !important;
          height: auto !important;
          display: flex !important;
          justify-content: flex-end !important;
          align-items: center !important;
          padding: 1rem !important;
          z-index: 9999 !important;
          background: rgba(255, 0, 0, 0.1) !important; /* Sfondo rosso trasparente per debug */
          pointer-events: none !important;
          border: 2px dashed red !important; /* Bordo tratteggiato per debug */
        }

        .menu-header > * {
          pointer-events: auto;
        }

        .logo {
          display: none; /* Hide the logo since we only want the menu button */
        }

        .logo-img {
          height: 100%;
          width: auto;
          object-fit: contain;
        }

        /* Menu toggle button */
        #menu-toggle-button {
          display: block !important;
          position: relative;
          z-index: 9999;
        }
        
        .menu-toggle:hover {
          background: #fff;
          transform: scale(1.05);
        }

        .menu-toggle:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.5);
          border-radius: 4px;
        }

        .menu-text {
          font-size: 0.875rem;
          font-weight: 500;
          transition: transform 0.3s var(--easing);
          display: none; /* Hide the text, only show icon */
        }

        .menu-icon {
          position: relative;
          width: 20px;
          height: 14px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .menu-icon-line {
          display: block;
          width: 100%;
          height: 2px;
          background-color: currentColor;
          transition: all 0.3s var(--easing);
          transform-origin: center;
        }

        .menu-toggle.open .menu-icon-line:first-child {
          transform: translateY(7px) rotate(45deg);
        }

        .menu-toggle.open .menu-icon-line:last-child {
          transform: translateY(-7px) rotate(-45deg);
        }

        /* Prelayers */
        .prelayers {
          position: fixed;
          top: 0;
          right: 0;
          width: 100%;
          max-width: var(--menu-max-width);
          height: 100%;
          z-index: var(--z-layers);
          pointer-events: none;
        }

        .prelayer {
          position: absolute;
          top: 0;
          right: 0;
          width: 100%;
          height: 100%;
          transform: translateX(100%);
          transition: transform var(--transition-duration) var(--easing);
        }

        .prelayers.open .prelayer {
          transform: translateX(0);
        }

        .prelayer:nth-child(1) { transition-delay: 0.05s; }
        .prelayer:nth-child(2) { transition-delay: 0.1s; }
        .prelayer:nth-child(3) { transition-delay: 0.15s; }

        /* Menu panel */
        .menu-panel {
          position: fixed;
          top: 0;
          right: 0;
          width: 100%;
          max-width: var(--menu-max-width);
          height: 100%;
          background: var(--menu-bg);
          z-index: var(--z-panel);
          padding: var(--header-height) 2rem 2rem;
          transform: translateX(100%);
          transition: transform var(--transition-duration) var(--easing);
          overflow-y: auto;
        }

        .staggered-menu[data-position="left"] .menu-panel {
          right: auto;
          left: 0;
          transform: translateX(-100%);
        }

        .staggered-menu[data-position="left"] .prelayers {
          right: auto;
          left: 0;
        }

        .menu-panel.open {
          transform: translateX(0);
        }

        /* Menu list */
        .menu-nav {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .menu-list {
          list-style: none;
          margin: 0;
          padding: 0;
          flex: 1;
        }

        .menu-item {
          margin-bottom: 1rem;
          overflow: hidden;
        }

        .menu-link {
          display: inline-flex;
          align-items: center;
          color: var(--text-color);
          font-size: 2.5rem;
          font-weight: 700;
          text-decoration: none;
          padding: 0.5rem 0;
          transition: color 0.3s var(--easing);
          position: relative;
        }

        .menu-link:hover {
          color: var(--accent-color);
        }

        .item-number {
          font-size: 0.8rem;
          margin-right: 1rem;
          color: var(--accent-color);
          opacity: 0.7;
        }

        .item-text {
          display: inline-block;
          transform: translateY(100%);
          transition: transform 0.5s var(--easing);
        }

        .menu-panel.open .item-text {
          transform: translateY(0);
        }

        /* Social section */
        .social-section {
          display: none; /* Hide social section by default */
          margin-top: auto;
          padding-top: 2rem;
        }

        .social-title {
          font-size: 1rem;
          color: var(--accent-color);
          margin: 0 0 1rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .social-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          gap: 1.5rem;
        }

        .social-link {
          color: var(--text-color);
          text-decoration: none;
          font-size: 1rem;
          font-weight: 500;
          position: relative;
          transition: color 0.3s var(--easing);
        }

        .social-link:hover {
          color: var(--accent-color);
        }

        .social-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 1px;
          background-color: var(--accent-color);
          transition: width 0.3s var(--easing);
        }

        .social-link:hover::after {
          width: 100%;
        }

        /* Responsive styles */
        @media (max-width: 768px) {
          .menu-panel {
            padding: var(--header-height) 1.5rem 1.5rem;
          }

          .menu-link {
            font-size: 2rem;
          }

          .social-list {
            flex-wrap: wrap;
            gap: 1rem;
          }
        }

        @media (min-width: 1024px) {
          .menu-panel {
            padding: calc(var(--header-height) + 1rem) 3rem 3rem;
          }

          .menu-link {
            font-size: 3.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default StaggeredMenu;
