import React, { useState } from "react";
import { Bot, Salad, Zap, X, MessageSquare } from "lucide-react"; // MessageSquare icon added
import { motion, AnimatePresence } from "framer-motion";

// The component now accepts an `onOpenChat` prop
const QuickTools = ({ onOpenAssistant, onOpenNutrition, onOpenChat, userRole }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Animation variants for the container to stagger the children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
    exit: {
        opacity: 0,
        transition: {
            staggerChildren: 0.05,
            staggerDirection: -1
        }
    }
  };

  // Animation variants for each individual tool item
  const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
    exit: {
        opacity: 0,
        y: 15,
        scale: 0.9,
    }
  };

  return (
    <div className="fixed bottom-22 right-6 z-50">
      <div className="relative group flex items-center">
        {/* Tooltip that appears on hover */}
        <div className="absolute right-full mr-4 px-3 py-1.5 bg-[var(--color-bg-surface)] text-[var(--color-text-strong)] text-sm font-semibold rounded-lg shadow-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out">
          Quick Toolbox
        </div>
        
        <div className="relative">
          {/* Options Panel that appears on click */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute right-0 bottom-full mb-4 space-y-3"
              >
                {/* Smart Assistant Button */}
                <motion.button
                  variants={itemVariants}
                  onClick={() => {
                    onOpenAssistant();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 w-full p-3 bg-[var(--color-bg-surface)] rounded-xl shadow-lg border-2 border-[var(--color-border-default)] hover:bg-[var(--color-primary)] hover:text-[var(--color-text-on-primary)] text-[var(--color-text-strong)] font-semibold transition-all duration-200 transform hover:-translate-x-2"
                >
                  <Bot size={20} />
                  <span>Smart Assistant</span>
                </motion.button>

                {/* Nutrition Search Button */}
                <motion.button
                  variants={itemVariants}
                  onClick={() => {
                    onOpenNutrition();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 w-full p-3 bg-[var(--color-bg-surface)] rounded-xl shadow-lg border-2 border-[var(--color-border-default)] hover:bg-[var(--color-primary)] hover:text-[var(--color-text-on-primary)] text-[var(--color-text-strong)] font-semibold transition-all duration-200 transform hover:-translate-x-2"
                >
                  <Salad size={20} />
                  <span>Nutrition Search</span>
                </motion.button>

                {/* --- NEW: Chat with Nutritionist Button --- */}
                {userRole === 'user' && (
                  <motion.button
                    variants={itemVariants}
                    onClick={() => {
                      onOpenChat();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 w-full p-3 bg-[var(--color-bg-surface)] rounded-xl shadow-lg border-2 border-[var(--color-border-default)] hover:bg-[var(--color-primary)] hover:text-[var(--color-text-on-primary)] text-[var(--color-text-strong)] font-semibold transition-all duration-200 transform hover:-translate-x-2"
                  >
                    <MessageSquare size={20} />
                    <span>Chat with Nutritionist</span>
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Quick Tools Button */}
          <motion.button
            onClick={() => setIsOpen((prev) => !prev)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[var(--color-primary)] text-[var(--color-text-on-primary)] w-16 h-16 rounded-full shadow-2xl flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-bg-app)] focus:ring-[var(--color-primary)]"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isOpen ? "close" : "open"}
                initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                {isOpen ? <X size={28} /> : <Zap size={28} />}
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default QuickTools;