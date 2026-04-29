import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Adjust path as needed
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MessageSquare, LogOut, ChevronDown } from 'lucide-react'; // Replaced Bell with a more generic User icon for the profile

// --- Custom Hook (Internal to this file, unchanged) ---
const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

// --- [DESIGN ENHANCEMENT] Helper Components ---

// Avatar remains a strong visual element
const Avatar = ({ name, className = 'h-10 w-10 text-base' }) => {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U';
  return (
    <div className={`rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] flex items-center justify-center text-[var(--color-text-on-primary)] font-bold flex-shrink-0 shadow-inner ${className}`}>
      {initials}
    </div>
  );
};

// Dropdown item with enhanced hover effects and icon container
const DropdownItem = ({ icon, label, to, onClick, isDestructive = false }) => {
  const itemClasses = `group flex w-full items-center gap-3 px-3 py-2.5 text-sm cursor-pointer transition-all duration-200 ease-in-out rounded-lg ${
    isDestructive
      ? 'text-[var(--color-danger-text)] hover:bg-[var(--color-danger-bg-subtle)]'
      : 'text-[var(--color-text-strong)] hover:bg-[var(--color-bg-interactive-subtle)] hover:text-[var(--color-primary)]'
  }`;

  const content = (
    <div className={itemClasses} onClick={onClick}>
      <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-[var(--color-bg-surface-alt)] rounded-lg group-hover:bg-[var(--color-primary-bg-subtle)] group-hover:text-[var(--color-primary)] transition-colors duration-200">
        {icon}
      </div>
      <span className="font-semibold transition-transform duration-200 group-hover:translate-x-1">{label}</span>
    </div>
  );

  return to ? <Link to={to} className="block">{content}</Link> : content;
};


// --- [DESIGN ENHANCEMENT] Main ProfileDropdown Component ---

export const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const dropdownRef = useRef(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  if (!user) {
    return null; // Or a login button if you prefer
  }

  const dropdownVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { 
        type: 'spring', 
        damping: 20, 
        stiffness: 300,
        when: "beforeChildren",
        staggerChildren: 0.05,
      } 
    },
  };
  
  const itemVariants = {
    hidden: { opacity: 0, x: -10, scale: 0.95 },
    visible: { opacity: 1, x: 0, scale: 1 },
  };

  return (
    <div className="relative font-[var(--font-secondary)]" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)] hover:bg-[var(--color-bg-interactive-subtle)] hover:shadow-md"
      >
        <Avatar name={user.full_name || user.email} />
        <span className="hidden md:inline font-semibold text-[var(--color-text-strong)] font-[var(--font-primary)] pr-1">
          {user.full_name || user.email}
        </span>
        <ChevronDown
          size={20}
          className={`hidden md:inline text-[var(--color-text-muted)] transition-transform duration-300 ease-in-out ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute right-0 mt-3 w-72 origin-top-right bg-[var(--color-bg-surface)] rounded-2xl shadow-2xl border-2 border-[var(--color-border-default)] z-50 p-2 overflow-hidden"
          >
            {/* --- Creative Dropdown Header --- */}
            <div className="p-3 mb-2 text-center border-b-2 border-[var(--color-border-default)] bg-[linear-gradient(45deg,var(--color-bg-app)_25%,transparent_25%,transparent_50%,var(--color-bg-app)_50%,var(--color-bg-app)_75%,transparent_75%,transparent_100%)] bg-[length:30px_30px]">
                <Avatar name={user.full_name || user.email} className="h-16 w-16 text-2xl mx-auto mb-2" />
                <h3 className="font-bold text-lg text-[var(--color-text-strong)] font-[var(--font-primary)] truncate">
                    {user.full_name || "User"}
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] truncate">{user.email}</p>
            </div>
            
            {/* --- Action Items --- */}
            <motion.div variants={itemVariants}>
               <DropdownItem
                icon={<User size={18} />}
                label="Profile"
                to="/dashboard/user-profile"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <DropdownItem
                icon={<MessageSquare size={18} />}
                label="Messages"
                to="/dashboard/messages"
              />
            </motion.div>
              
            <div className="border-t-2 border-[var(--color-border-default)] my-2" />
            
            <motion.div variants={itemVariants}>
              <DropdownItem
                icon={<LogOut size={18} />}
                label="Logout"
                onClick={handleLogout}
                isDestructive={true}
              />
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};