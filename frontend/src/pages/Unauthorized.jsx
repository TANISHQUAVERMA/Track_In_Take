// src/pages/auth/Unauthorized.jsx

import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

const Unauthorized = () => {

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-bg-app)] text-center p-4 font-[var(--font-secondary)]">
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-[var(--color-bg-surface)] p-8 sm:p-12 rounded-2xl shadow-2xl border-2 border-[var(--color-border-default)] w-full max-w-md flex flex-col items-center"
      >
        <motion.div
          variants={itemVariants}
          className="w-20 h-20 bg-[var(--color-danger-bg-subtle)] rounded-full flex items-center justify-center mb-6"
        >
          <ShieldAlert className="w-10 h-10 text-[var(--color-danger-text)]" strokeWidth={2} />
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-4xl font-[var(--font-primary)] font-bold text-[var(--color-danger-text)] mb-4"
        >
          Access Denied
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-lg text-[var(--color-text-default)] mb-8 max-w-md"
        >
          You do not have the necessary permissions to view this page.
        </motion.p>

        <motion.div variants={itemVariants}>
          <Link
            to="/"
            className="
              inline-block px-8 py-3 
              bg-[var(--color-primary)] text-[var(--color-text-on-primary)] 
              font-semibold rounded-full 
              shadow-lg hover:shadow-xl hover:bg-[var(--color-primary-hover)] 
              transition-all duration-300 transform hover:-translate-y-1 
              focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg-surface)]
            "
          >
            Return to Homepage
          </Link>
        </motion.div>
      </motion.div>
      
    </div>
  );
};

export default Unauthorized;