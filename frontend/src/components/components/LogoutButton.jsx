// src/components/auth/LogoutButton.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { motion } from "framer-motion";

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all user-related data from local storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    
    // Navigate to the home page
    navigate("/");

    // Optional: Force a full reload to reset any in-memory state
    window.location.reload(); 
  };

  return (
    <motion.button
      onClick={handleLogout}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className="
        group
        flex items-center justify-center gap-2
        px-5 py-2
        font-[var(--font-primary)] font-semibold rounded-full 
        transition-all duration-300 ease-in-out
        text-[var(--color-primary)] 
        border-2 border-[var(--color-primary)] 
        bg-transparent
        hover:bg-[var(--color-primary)] 
        hover:text-[var(--color-text-on-primary)] 
        hover:shadow-lg hover:shadow-[var(--color-primary)]/20
        focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg-app)]
      "
    >
      <LogOut 
        className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" 
      />
      Logout
    </motion.button>
  );
}

export default LogoutButton;