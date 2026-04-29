// src/pages/dashboard/Tools.jsx

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";
import {
    FiBookOpen,
    FiTrendingUp,
    FiTarget,
    FiSearch,
    FiBarChart2,
    FiDroplet,
    FiBell,
    FiArrowRight,
    FiHeart,
  } from "react-icons/fi";

const Tools = () => {
  const navigate = useNavigate();
   useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  // The tools array is updated to use your theme's semantic variable names
  const tools = [
    { id: "meal-log", title: "Meal Log", description: "Track daily meals and monitor nutritional intake.", icon: <FiBookOpen className="h-6 w-6" />, route: "/dashboard/tools/meal-log", bg: 'bg-[var(--color-success-bg-subtle)]', text: 'text-[var(--color-success-text)]' },
    { id: "bmi-calculator", title: "BMI Calculator", description: "Calculate your Body Mass Index with precision.", icon: <FiTrendingUp className="h-6 w-6" />, route: "/dashboard/tools/bmi", bg: 'bg-[var(--color-warning-bg-subtle)]', text: 'text-[var(--color-warning-text)]' },
    { id: "weight-tracker", title: "Weight Tracker", description: "Monitor your weight progress with visual charts.", icon: <FiBarChart2 className="h-6 w-6" />, route: "/dashboard/tools/weight-tracker", bg: 'bg-[var(--color-info-bg-subtle)]', text: 'text-[var(--color-info-text)]' },
    { id: "nutrition-search", title: "Nutrition Search", description: "Find detailed nutritional information for any food.", icon: <FiSearch className="h-6 w-6" />, route: "/dashboard/tools/nutrition-search", bg: 'bg-[var(--color-success-bg-subtle)]', text: 'text-[var(--color-success-text)]' },
    { id: "fat-calculator", title: "Body Fat Calculator", description: "Analyze your body composition and fat percentage.", icon: <FiTarget className="h-6 w-6" />, route: "/dashboard/tools/fat-calculator", bg: 'bg-[var(--color-accent-1-bg-subtle)]', text: 'text-[var(--color-accent-1-text)]' },
    { id: "water-tracker", title: "Water Tracker", description: "Stay hydrated with daily water intake tracking.", icon: <FiDroplet className="h-6 w-6" />, route: "/dashboard/tools/water-tracker", bg: 'bg-[var(--color-info-bg-subtle)]', text: 'text-[var(--color-info-text)]' },
    { id: "health-reminders", title: "Custom Reminders", description: "Set personalized alerts for health activities.", icon: <FiBell className="h-6 w-6" />, route: "/dashboard/tools/custom-reminder", bg: 'bg-[var(--color-accent-3-bg-subtle)]', text: 'text-[var(--color-accent-3-text)]' },
    
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  const handleToolClick = (route) => {
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-app)] font-[var(--font-secondary)]">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-[var(--font-primary)] font-bold text-[var(--color-text-strong)] mb-6">
            Health & Wellness Tools
          </h1>
          <p className="text-lg md:text-xl text-[var(--color-text-default)] max-w-3xl mx-auto leading-relaxed">
            A suite of precision tools to accelerate your health and nutrition goals.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
        >
          {tools.map((tool) => (
            <motion.div
              key={tool.id}
              variants={itemVariants}
              onClick={() => handleToolClick(tool.route)}
              // Themed card with original hover effects
              className="group relative bg-[var(--color-bg-surface)] rounded-2xl p-6 shadow-lg border-2 border-[var(--color-border-default)] cursor-pointer transition-all duration-300 ease-out hover:shadow-2xl hover:border-[var(--color-primary)] hover:scale-105"
            >
              {/* Themed icon container */}
              <div
                className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${tool.bg} ${tool.text} mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                {tool.icon}
              </div>

              <div className="mb-4">
                <h3 className="text-xl font-[var(--font-primary)] font-semibold text-[var(--color-text-strong)] mb-2 group-hover:text-[var(--color-primary)] transition-colors duration-300">
                  {tool.title}
                </h3>
                <p className="text-[var(--color-text-default)] text-sm leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="flex justify-end mt-auto pt-2">
                <FiArrowRight className="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all duration-300 opacity-0 group-hover:opacity-100" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-16 pt-8 border-t-2 border-dashed border-[var(--color-border-default)]"
        >
          <p className="text-[var(--color-text-muted)] text-sm">
            Start your health journey today with our comprehensive tools
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Tools;