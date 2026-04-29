// src/components/dashboard/HeroSection.jsx

import React, { useState, useEffect, useMemo } from "react";
import { Flame, Droplet, Weight } from "lucide-react";
import heroImage from "../../assets/heroImage.png";
import { getUserProfile } from "../../api/userProfile";
import { getWater } from "../../api/WaterTracker";
import { targetApi, targetProgressApi } from "../../api/reportsApi";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import axiosInstance from "../../api/axiosInstance";

const getLocalDateString = (date) => {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
};

const HeroSection = ({ waterUpdateTrigger = 0, mealUpdateTrigger = 0 }) => {
  const [weight, setWeight] = useState(null);
  const [waterIntakeML, setWaterIntakeML] = useState(0);
  const [caloriesToday, setCaloriesToday] = useState(0);
  const [calorieGoal, setCalorieGoal] = useState(null);
  const [waterGoalML, setWaterGoalML] = useState(3000);
  const [breakdown, setBreakdown] = useState({ Breakfast: 0, Lunch: 0, Dinner: 0, Snack: 0 });

  const glassSizeML = 250;
   const today = useMemo(() => getLocalDateString(new Date()), []);

  const waterIntakeGlasses = useMemo(() => Math.floor(waterIntakeML / glassSizeML) || 0, [waterIntakeML]);
  const waterGoalGlasses = useMemo(() => Math.round(waterGoalML / glassSizeML), [waterGoalML]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [profileData, goalData] = await Promise.all([getUserProfile(), targetApi(today)]);
        setWeight(profileData.weight_kg);
        setCalorieGoal(goalData.recommended_calories || 2000);
        setWaterGoalML(goalData.water?.recommended_ml || 3000);
      } catch (error) {
        // Silently fail or log, as toasts can be annoying on initial load
        console.error("Failed to load profile and goal data:", error);
      }
    };
    fetchAllData();
  }, [today]);

  useEffect(() => {
    const fetchTodayCalories = async () => {
      try {
        const summaryData = await targetProgressApi(today);
        const totalCalories = summaryData.calories || 0;
        setCaloriesToday(Number(totalCalories.toFixed(0)));
        // Also fetch breakdown
        try {
          const breakdownRes = await axiosInstance.get(`/recommendations/calorie-summary/?date=${today}`);
          setBreakdown(breakdownRes.data.breakdown_by_meal || { Breakfast: 0, Lunch: 0, Dinner: 0, Snack: 0 });
        } catch { /* silent */ }
      } catch (error) {
        console.error("Failed to load today's calorie data:", error);
      }
    };
    fetchTodayCalories();
    window.addEventListener('meal-logged', fetchTodayCalories);
    return () => window.removeEventListener('meal-logged', fetchTodayCalories);
  }, [today, mealUpdateTrigger]);

  useEffect(() => {
    const fetchWaterIntake = async () => {
      try {
        const data = await getWater(today);
        const entries = data.results || [];
        const totalML = entries.reduce((sum, item) => sum + Number(item.amount_ml || 0), 0);
        setWaterIntakeML(totalML);
      } catch (error) {
        console.error("Failed to load water intake data:", error);
      }
    };
    fetchWaterIntake();
  }, [today, waterUpdateTrigger]);

  const stats = [
    { label: "Calories Today", value: caloriesToday, goal: `Goal: ${calorieGoal ?? "..."}`, icon: <Flame size={18} />, color: "text-[var(--color-warning-text)]", bg: "bg-[var(--color-warning-bg-subtle)]" },
    { label: "Water Intake", value: `${waterIntakeGlasses} Glass${waterIntakeGlasses !== 1 ? "es" : ""}`, goal: `Goal: ${waterGoalGlasses} Glasses`, icon: <Droplet size={18} />, color: "text-[var(--color-info-text)]", bg: "bg-[var(--color-info-bg-subtle)]" },
    { label: "Current Weight", value: weight !== null ? `${weight} kg` : "...", goal: "Last Logged", icon: <Weight size={18} />, color: "text-[var(--color-primary)]", bg: "bg-[var(--color-primary-bg-subtle)]" },
  ];

  return (
    <div className="w-full relative bg-[var(--color-bg-surface-alt)] text-[var(--color-text-strong)]">
      <div className="relative z-10 max-w-7xl mx-auto pt-16 pb-28 px-6 md:px-10 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
          
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="w-full md:w-2/3 space-y-6 font-[var(--font-secondary)]">
            <div>
              <h1 className="text-3xl sm:text-4xl font-[var(--font-primary)] font-bold text-[var(--color-text-strong)]">
                Fuel your journey with{" "}
                <span className="text-[var(--color-primary)]">smart nutrition</span>
              </h1>
              <p className="mt-2 text-lg text-[var(--color-text-default)]">
                Log, learn, and stay ahead of your health goals every day.
              </p>
            </div>

            <motion.div 
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  className="bg-[var(--color-bg-surface)] p-5 rounded-2xl shadow-lg hover:shadow-2xl border-2 border-[var(--color-border-default)] hover:border-[var(--color-primary)] hover:-translate-y-2 transform transition-all duration-300 ease-in-out relative"
                >
                  <div className={`absolute top-3 right-3 p-2 rounded-full ${stat.bg} ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <p className="text-sm font-medium mb-1 text-[var(--color-text-default)]">{stat.label}</p>
                  <p className="text-2xl font-bold text-[var(--color-text-strong)]">{stat.value}</p>
                  <p className="text-sm text-[var(--color-text-muted)]">{stat.goal}</p>
                  {/* Breakdown for Calories card */}
                  {stat.label === "Calories Today" && caloriesToday > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {Object.entries(breakdown).filter(([,v]) => v > 0).map(([meal, cal]) => (
                        <span key={meal} className="text-xs bg-[var(--color-warning-bg-subtle)] text-[var(--color-warning-text)] px-2 py-0.5 rounded-full font-medium">
                          {meal}: {Math.round(cal)}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
            className="hidden md:block w-full md:w-1/3 z-10"
          >
            <motion.img
              whileHover={{ scale: 1.05 }}
              src={heroImage}
              alt="Healthy food bowl"
              className="max-h-[280px] mx-auto shadow-2xl transition-all duration-300 ease-in-out rounded-xl"
            />
          </motion.div>
        </div>
      </div>
      {/* Themed SVG Curve Background */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none" style={{ transform: "translateY(1px)" }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120">
            <path 
                fill="var(--color-bg-app)" 
                d="M0,64L80,80C160,96,320,128,480,117.3C640,107,800,53,960,42.7C1120,32,1280,64,1360,80L1440,96L1440,121L1360,121C1280,121,1120,121,960,121C800,121,640,121,480,121C320,121,160,121,80,121L0,121Z"
            ></path>
        </svg>
      </div>
    </div>
  );
};

export default HeroSection;