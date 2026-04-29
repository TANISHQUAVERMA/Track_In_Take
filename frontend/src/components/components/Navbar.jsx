import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = ({ links = [], rightContent, align = "right", logo = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);
  const { pathname } = useLocation();

  const isHomepage = pathname === '/';

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
      if (isHomepage) {
        let currentSectionId = '';
        links.forEach(link => {
          if (!link.to?.startsWith('#')) return;
          const element = document.getElementById(link.to.substring(1));
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= 150 && rect.bottom >= 150) {
              currentSectionId = link.to;
            }
          }
        });
        setActiveSection(currentSectionId);
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname, links, isHomepage]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setIsOpen(false);
        setOpenDropdown(null);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openDropdown]);

  const handleAnchorLinkClick = (e, to) => {
    e.preventDefault();
    const targetId = to.substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    closeMenu();
    setOpenDropdown(null);
  };

  const navLinkStyle = "relative font-medium text-[var(--color-text-default)] transition-colors duration-300 focus:outline-none focus:text-[var(--color-primary)]";
  const activeLinkStyle = "text-[var(--color-primary)]";

  const renderNavLink = (link) => {
    const { to, label, dropdown, items } = link;
    
    // Handle dropdown menus
    if (dropdown) {
      const isDropdownOpen = openDropdown === label;
      return (
        <div key={label} className="relative dropdown-container">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenDropdown(isDropdownOpen ? null : label);
            }}
            className={`${navLinkStyle} flex items-center gap-1 hover:text-[var(--color-primary)] focus:outline-none`}
          >
            {label}
            <ChevronDown 
              size={16} 
              className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-[var(--color-bg-surface)] rounded-lg shadow-lg border border-[var(--color-border-default)] py-2 z-50">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => {
                    closeMenu();
                    setOpenDropdown(null);
                  }}
                  className={({ isActive }) =>
                    `block px-4 py-2 text-sm transition-colors duration-200 ${
                      isActive 
                        ? "text-[var(--color-primary)] bg-[var(--color-primary-bg-subtle)]" 
                        : "text-[var(--color-text-default)] hover:bg-[var(--color-bg-interactive-subtle)] hover:text-[var(--color-primary)]"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    // Handle regular anchor links (for homepage sections)
    const isAnchorLink = to?.startsWith("#");
    if (isAnchorLink) {
      const isActive = isHomepage && activeSection === to;
      return (
        <a
          key={to}
          href={to}
          onClick={(e) => handleAnchorLinkClick(e, to)}
          className={`${navLinkStyle} ${isActive ? activeLinkStyle : "hover:text-[var(--color-primary)]"}`}
        >
          {label}
        </a>
      );
    }
    
    // Handle regular navigation links
    return (
      <NavLink
        key={to}
        to={to}
        end={to === '/'}
        onClick={() => {
          closeMenu();
          setOpenDropdown(null);
        }}
        className={({ isActive }) =>
          `${navLinkStyle} ${isActive ? activeLinkStyle : "hover:text-[var(--color-primary)]"}`
        }
      >
        {label}
      </NavLink>
    );
  };

  const alignmentClasses = {
    center: "absolute left-1/2 transform -translate-x-1/2",
    right: "ml-auto",
  };

  return (
    <nav
      className={`sticky top-0 z-50 h-16 px-4 sm:px-6 flex items-center justify-between font-[var(--font-secondary)] text-sm md:text-base transition-all duration-300 ${
        isScrolled
          ? "bg-[var(--color-bg-surface)]/80 backdrop-blur-lg shadow-lg border-b border-[var(--color-border-default)]"
          : "bg-transparent"
      }`}
    >
      {/* LOGO - TrackIntake with Orange and Black (NO SPACE between words) */}
      <NavLink to="/" className="flex items-center" onClick={() => setOpenDropdown(null)}>
        {logo ? (
          logo
        ) : (
          <span className="text-2xl lg:text-3xl font-extrabold tracking-wide font-[var(--font-primary)]">
            <span className="text-[#FF7043]">Track</span>
            <span className="text-[#1a1a1a] dark:text-white">Intake</span>
          </span>
        )}
      </NavLink>

      {/* Desktop Navigation */}
      <div className={`hidden lg:flex items-center gap-8 ${alignmentClasses[align] || ""}`}>
        {links.map((link) => renderNavLink(link))}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4 text-sm font-medium">
          {rightContent}
        </div>
        {/* Mobile menu button */}
        <div className="lg:hidden text-[var(--color-primary)]">
          <button onClick={toggleMenu} aria-label="Toggle menu" className="p-1">
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute top-full left-0 w-full bg-[var(--color-bg-surface)] border-t border-[var(--color-border-default)] flex flex-col py-4 z-40 shadow-xl"
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
              className="flex flex-col gap-4 px-4"
            >
              {links.map((link) => (
                <motion.div 
                  key={link.to || link.label} 
                  variants={{ hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0 }}}
                  className="w-full"
                >
                  {link.dropdown ? (
                    <div className="w-full">
                      <div className="font-medium text-[var(--color-text-strong)] py-1 mb-2 border-b border-[var(--color-border-default)]">
                        {link.label}
                      </div>
                      <div className="flex flex-col gap-2 pl-4">
                        {link.items.map((item) => (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => {
                              closeMenu();
                              setOpenDropdown(null);
                            }}
                            className={({ isActive }) =>
                              `block py-1 text-sm transition-colors duration-200 ${
                                isActive 
                                  ? "text-[var(--color-primary)]" 
                                  : "text-[var(--color-text-default)] hover:text-[var(--color-primary)]"
                              }`
                            }
                          >
                            {item.label}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  ) : (
                    renderNavLink(link)
                  )}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;