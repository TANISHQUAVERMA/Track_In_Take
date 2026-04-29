// src/components/auth/LogoutButton.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/context/AuthContext";
import { LogOut } from "lucide-react";
import { motion } from "framer-motion";

function LogoutButton() {
  const navigate = useNavigate();
  const { logout } = useAuth(); // Get logout from context

  const handleLogout = () => {
    logout(); // Call context logout
    navigate("/", { replace: true });
  };

  return (
    <motion.button
      onClick={handleLogout}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className="
        group
        flex items-center justify-center gap-2
        px-5 py-2.5
        font-[var(--font-primary)] font-semibold rounded-full 
        transition-all duration-300 ease-in-out
        bg-[var(--color-primary)] 
        text-[var(--color-text-on-primary)]
        shadow-lg
        hover:bg-[var(--color-primary-hover)] 
        hover:shadow-xl hover:shadow-[var(--color-primary)]/20
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