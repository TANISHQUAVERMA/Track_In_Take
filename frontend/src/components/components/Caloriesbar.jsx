// src/components/dashboard/CalorieProgressBar.jsx

import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { motion, animate as framerAnimate } from "framer-motion";

// --- Animated Number Helper ---
const AnimatedNumber = ({ value }) => {
    const [displayValue, setDisplayValue] = useState(0);
    useEffect(() => {
        const controls = framerAnimate(displayValue, value, {
            type: "spring", mass: 0.8, stiffness: 100, damping: 20,
            onUpdate: (latest) => setDisplayValue(latest),
        });
        return () => controls.stop();
    }, [value]);

    const formatNumber = (num) => new Intl.NumberFormat('en-IN').format(Math.round(num));
    return <>{formatNumber(displayValue)}</>;
};

// --- Themed CalorieProgressBar Component ---
const CalorieProgressBar = ({ 
  currentCalories = 0, 
  targetCalories = 2000, 
  title = "Progress"
}) => {
  const progressPercentage = targetCalories > 0 ? (currentCalories / targetCalories) * 100 : 0;
  const isOverTarget = currentCalories > targetCalories;
  const remainingCalories = targetCalories - currentCalories;

  return (
    <div className="w-full max-w-md mx-auto font-[var(--font-secondary)]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-[var(--color-bg-surface)] border-2 border-[var(--color-border-default)] rounded-2xl p-4 sm:p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-[var(--color-primary)]"
      >
        
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[var(--color-text-strong)] font-semibold text-base sm:text-lg">
            {title}
          </h3>
          <div className="text-[var(--color-text-strong)] font-medium text-sm sm:text-base">
            <span className="font-bold"><AnimatedNumber value={currentCalories} /></span>
            <span className="text-[var(--color-text-default)]"> / {new Intl.NumberFormat('en-IN').format(targetCalories)} cal</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="w-full bg-[var(--color-bg-app)] rounded-full h-3 sm:h-4 overflow-hidden border border-[var(--color-border-default)]">
            <motion.div
              className={`h-full rounded-full ${isOverTarget ? 'bg-[var(--color-danger-text)]' : 'bg-[var(--color-primary)]'}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
              transition={{ duration: 1, ease: "circOut" }}
            >
              {progressPercentage >= 100 && (
                <div className={`h-full w-full rounded-full ${isOverTarget ? 'animate-pulse' : ''}`} 
                     style={{boxShadow: `0 0 12px ${isOverTarget ? 'var(--color-danger-text)' : 'var(--color-primary)'}`}}
                />
              )}
            </motion.div>
          </div>
        </div>

        <div className="text-center mb-2">
          <span className={`text-base sm:text-lg font-bold ${isOverTarget ? 'text-[var(--color-danger-text)]' : 'text-[var(--color-primary)]'}`}>
            <AnimatedNumber value={progressPercentage} />% Complete
          </span>
        </div>

        <div className="text-center text-[var(--color-text-default)] text-sm sm:text-base">
          {isOverTarget ? (
            <div className="flex items-center justify-center gap-2 text-[var(--color-danger-text)] font-medium">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>
                <span className="font-semibold"><AnimatedNumber value={currentCalories - targetCalories} /></span> calories over target
              </span>
            </div>
          ) : (
            <span>
              <span className="font-semibold text-[var(--color-text-strong)]"><AnimatedNumber value={remainingCalories} /></span> calories remaining
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// --- Parent Demo Component ---
const CalorieProgress = () => {
  const [calorieData, setCalorieData] = useState({
    current: 1200,
    target: 1995
  });

  const simulateDataUpdate = () => {
    const scenarios = [
      { current: 800, target: 1995 },
      { current: 1995, target: 1995 },
      { current: 2500, target: 1995 },
      { current: 434, target: 1995 },
      { current: 0, target: 1995 },
    ];
    const currentIndex = scenarios.findIndex(s => s.current === calorieData.current);
    const nextIndex = (currentIndex + 1) % scenarios.length;
    setCalorieData(scenarios[nextIndex]);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-app)] p-4 sm:p-8 font-[var(--font-secondary)] flex items-center justify-center">
      <div className="max-w-2xl mx-auto space-y-8 w-full">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
          <h1 className="text-2xl sm:text-3xl font-[var(--font-primary)] font-bold text-[var(--color-text-strong)] mb-2">
            Daily Calorie Progress
          </h1>
          <p className="text-[var(--color-text-default)] mb-6">A visual summary of your energy intake.</p>
        </motion.div>

        <CalorieProgressBar 
          currentCalories={calorieData.current}
          targetCalories={calorieData.target}
          title="Today's Calories"
        />

        <div className="text-center">
          <motion.button
            onClick={simulateDataUpdate}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[var(--color-primary)] text-[var(--color-text-on-primary)] font-semibold px-6 py-2 rounded-lg shadow-lg hover:bg-[var(--color-primary-hover)] transition-all flex items-center gap-2 mx-auto"
          >
            <TrendingUp size={18} />
            Simulate Update
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default CalorieProgress;