import React, { useState, useEffect } from 'react';
// --- RECHARTS IMPORTS ---
import {
  PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, Legend, ReferenceLine
} from "recharts";
// --- ICONS ---
import { 
    FaAppleAlt, FaCoffee, FaHamburger, FaFireAlt, FaDrumstickBite, FaBreadSlice, FaTint, 
    FaCandyCane, FaSpa // Added icons for Sugar and Fiber
} from "react-icons/fa";
import { Loader , UtensilsCrossed } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {  ExternalLink } from 'lucide-react'; // Add ExternalLink here


// --- API imports ---
// Note: Assuming these imports are correctly set up to use axios as per your API definitions.
import { targetApi, targetProgressApi, weeklyTrack } from '../api/reportsApi';
import { getMealsByDate } from "../api/mealLog";

 


// --- THEME VALUES FOR CHARTS ---
// Recharts needs direct hex values. These are taken from your index.css file.
const THEME_VALUES = {
  primary: '#FF7043',
  primaryHover: '#F4511E',
  accent1: '#b45309',    // Amber
  accent2: '#4338ca',    // Indigo
  textStrong: '#263238',
  textDefault: '#546E7A',
  borderDefault: '#ECEFF1',
  dangerText: '#be123c'
};

// UPDATED: Colors for the Pie Chart slices, expanded to 5 for all nutrients
const PIE_CHART_COLORS = [
    THEME_VALUES.primary, // Protein (Orange)
    THEME_VALUES.accent2, // Carbs (Indigo)
    THEME_VALUES.accent1, // Fats (Amber)
    '#EC4899',            // Sugar (Pink)
    '#10B981'             // Fiber (Green)
];

// Classes for the Nutrient Cards, expanded to 6 to include Sugar and Fiber
const NUTRIENT_CARD_CLASSES = [
  'bg-[var(--color-stat-1-bg)]', // Calories (Yellow)
  'bg-[var(--color-stat-2-bg)]', // Protein (Green)
  'bg-[var(--color-stat-3-bg)]', // Carbs (Blue)
  'bg-[var(--color-stat-4-bg)]', // Fats (Red/Orange)
  'bg-[var(--color-accent-3-bg-subtle)]', // Sugar (Purple-ish from theme)
  'bg-[var(--color-accent-2-bg-subtle)]'  // Fiber (Green-ish from theme)
];

// Classes for Meal Log Icons to provide visual variety and style
const MEAL_LOG_ICON_CLASSES = [
    { bg: 'bg-[var(--color-accent-1-bg-subtle)]', text: 'text-[var(--color-accent-1-text)]' },
    { bg: 'bg-[var(--color-accent-2-bg-subtle)]', text: 'text-[var(--color-accent-2-text)]' },
    { bg: 'bg-[var(--color-accent-3-bg-subtle)]', text: 'text-[var(--color-accent-3-text)]' },
    { bg: 'bg-[var(--color-info-bg-subtle)]', text: 'text-[var(--color-info-text)]' },
];

// --- DATE HELPER FUNCTIONS (THE DEFINITIVE FIX) ---

/**
 * ✅ Gets the user's local date as a 'YYYY-MM-DD' string, guaranteed to be correct for any timezone.
 * This uses the browser's built-in Internationalization API, which is the gold standard for this task.
 * The 'en-CA' locale reliably formats the date to 'YYYY-MM-DD' based on the user's local clock.
 * @param {Date} date The local date object to format.
 * @returns {string} The formatted date string (e.g., "2024-07-19").
 */
const getLocalDateString = (date) => {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
};


/**
 * ✅ Parses a 'YYYY-MM-DD' string from the API as a local date.
 * Appending 'T00:00:00' ensures the browser interprets it in the user's local timezone,
 * not UTC, preventing off-by-one-day display errors in charts.
 * @param {string} dateString The date string from the API.
 * @returns {Date} The parsed local date object.
 */
const parseDateStringAsLocal = (dateString) => {
    return new Date(`${dateString}T00:00:00`);
};

const WelcomeEmptyState = ({ onLogMealClick, todayDate }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center p-6 bg-[var(--color-bg-app)] animate-fade-up">
      <div className="bg-[var(--color-bg-surface)] p-8 sm:p-12 rounded-3xl shadow-xl border border-[var(--color-border-default)] max-w-lg w-full">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary-bg-subtle)]">
          <UtensilsCrossed className="h-10 w-10 text-[var(--color-primary)]" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-strong)] font-[var(--font-primary)]">
          Ready to Start Your Day?
        </h1>
        <p className="mt-4 text-base sm:text-lg text-[var(--color-text-default)]">
          Log your first meal for <span className="font-semibold text-[var(--color-primary)]">{todayDate}</span> to see your progress and unlock your personalized dashboard.
        </p>
        <button
          onClick={onLogMealClick}
          className="mt-8 w-full sm:w-auto inline-block px-8 py-4 bg-[var(--color-primary)] text-white font-bold rounded-xl shadow-lg transform transition-all duration-300 ease-in-out hover:bg-[var(--color-primary-hover)] hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[var(--color-primary-ring)]"
        >
          Log Your First Meal
        </button>
      </div>
    </div>
  );
};

const Reports = () => {
  const [macroData, setMacroData] = useState([]);
  const [calorieProgress, setCalorieProgress] = useState([]);
  const [nutrientProgress, setNutrientProgress] = useState([]);
  const [goalCalories, setGoalCalories] = useState(0);
  const [mealData, setMealData] = useState([]);
   const [hasLoggedData, setHasLoggedData] = useState(false);
  const [todayDate, setTodayDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
 const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) { throw new Error("Authentication token not found. Please log in."); }

        // --- PERFECT DATE SYNCHRONIZATION ---
        const today = new Date();
        const apiDate = getLocalDateString(today); // Use the new, robust function
        setTodayDate(today.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        }));

          
        
        // Pass the accurate user's local date string (apiDate) to each API call.
        const [recommendedResponse, progressResponse, weeklyDataResponse, mealLogResponse] = await Promise.all([
          targetApi(apiDate),
          targetProgressApi(apiDate),
          weeklyTrack(apiDate),
          getMealsByDate( apiDate)
        ]);

       
        // --- Data Extraction with Fallbacks for Robustness ---
        const rec_calories = recommendedResponse.recommended_calories || 0;
        const rec_protein = recommendedResponse.macronutrients.protein_g || 0;
        const rec_carbs = recommendedResponse.macronutrients.carbs_g || 0;
        const rec_fats = recommendedResponse.macronutrients.fats_g || 0;
        const rec_sugar = recommendedResponse.macronutrients.sugar_g || 0;
        const rec_fiber = recommendedResponse.macronutrients.fiber_g || 0;

        const prog_calories = progressResponse.calories || 0;
        const prog_protein = progressResponse.protein || 0;
        const prog_carbs = progressResponse.carbs || 0;
        const prog_fats = progressResponse.fats || 0;
        const prog_sugar = progressResponse.sugar || 0;
        const prog_fiber = progressResponse.fiber || 0;

         if (prog_calories > 0) {
          setHasLoggedData(true); // User has data, so we'll show the dashboard.
          
          const rec_calories = recommendedResponse.recommended_calories || 0;
          setGoalCalories(rec_calories);}

        // UPDATED: Pie chart data now includes all 5 nutrients (Protein, Carbs, Fats, Sugar, Fiber)
        setMacroData([
            { name: "Protein", value: prog_protein }, 
            { name: "Carbs", value: prog_carbs }, 
            { name: "Fats", value: prog_fats },
            { name: "Sugar", value: prog_sugar },
            { name: "Fiber", value: prog_fiber }
        ]);
        
        setCalorieProgress(weeklyDataResponse.map(day => ({
            name: parseDateStringAsLocal(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            calories: day.calories
        })));

        // --- Nutrient Progress now includes Sugar and Fiber ---
        setNutrientProgress([
          { title: "Calories", current: prog_calories, goal: rec_calories, value: `${Math.round(prog_calories)} kcal`, goalFormatted: `${Math.round(rec_calories)} kcal`, percentage: rec_calories > 0 ? Math.round((prog_calories / rec_calories) * 100) : 0, icon: <FaFireAlt className="text-xl text-[var(--color-primary)]" /> },
          { title: "Protein", current: prog_protein, goal: rec_protein, value: `${prog_protein.toFixed(1)}g`, goalFormatted: `${rec_protein}g`, percentage: rec_protein > 0 ? Math.round((prog_protein / rec_protein) * 100) : 0, icon: <FaDrumstickBite className="text-xl text-[var(--color-primary)]" /> },
          { title: "Carbs", current: prog_carbs, goal: rec_carbs, value: `${prog_carbs.toFixed(1)}g`, goalFormatted: `${rec_carbs}g`, percentage: rec_carbs > 0 ? Math.round((prog_carbs / rec_carbs) * 100) : 0, icon: <FaBreadSlice className="text-xl text-[var(--color-primary)]" /> },
          { title: "Fats", current: prog_fats, goal: rec_fats, value: `${prog_fats.toFixed(1)}g`, goalFormatted: `${rec_fats}g`, percentage: rec_fats > 0 ? Math.round((prog_fats / rec_fats) * 100) : 0, icon: <FaTint className="text-xl text-[var(--color-primary)]" /> },
          { title: "Sugar", current: prog_sugar, goal: rec_sugar, value: `${prog_sugar.toFixed(1)}g`, goalFormatted: `${rec_sugar}g`, percentage: rec_sugar > 0 ? Math.round((prog_sugar / rec_sugar) * 100) : 0, icon: <FaCandyCane className="text-xl text-[var(--color-primary)]" /> },
          { title: "Fiber", current: prog_fiber, goal: rec_fiber, value: `${prog_fiber.toFixed(1)}g`, goalFormatted: `${rec_fiber}g`, percentage: rec_fiber > 0 ? Math.round((prog_fiber / rec_fiber) * 100) : 0, icon: <FaSpa className="text-xl text-[var(--color-primary)]" /> }
        ]);

        if (mealLogResponse && mealLogResponse.results) {
            setMealData(mealLogResponse.results
              .sort((a, b) => new Date(b.consumed_at) - new Date(a.consumed_at))
              .slice(0, 4)
              .map(meal => ({ title: meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1), meal: meal.food_name, calories: `${Math.round(meal.calories)} kcal`, time: new Date(meal.consumed_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) }))
            );
        }
      } catch (err) { console.error("Failed to load reports:", err); setError(err.message || "Failed to load report data. Please try again later.");
      } finally { setIsLoading(false); }
    };
    fetchData();
  }, []);

  // Bar chart data automatically includes Sugar and Fiber from the nutrientProgress state.
  const barChartData = nutrientProgress.filter(item => item.title !== "Calories").map((item) => ({ name: item.title, "Current (g)": item.current, "Goal (g)": item.goal }));
  const getIcon = (title) => ({ "breakfast": <FaCoffee />, "snack": <FaAppleAlt />, "lunch": <FaHamburger />, "dinner": <FaDrumstickBite /> }[title.toLowerCase()] || <FaAppleAlt />);

  
  const handleNavigateToFullLog = () => {
    navigate('/dashboard/tools/meal-log');
  };

  
  
  if (isLoading) { return <div className="flex flex-col justify-center items-center h-screen bg-[var(--color-bg-app)]"><Loader className="w-16 h-16 animate-spin text-[var(--color-primary)]" /></div>; }
  if (error) { return <div className="flex justify-center items-center h-screen bg-[var(--color-bg-app)]"><p className="text-xl text-[var(--color-danger-text)] font-[var(--font-primary)]">{error}</p></div>; }
    if (!hasLoggedData) {
    return <WelcomeEmptyState onLogMealClick={handleNavigateToFullLog} todayDate={todayDate} />;
  }

  
  return (
    <div className="bg-[var(--color-bg-app)] min-h-screen">
      <main className="text-[var(--color-text-default)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto font-[var(--font-secondary)]">
        
        <header className="mb-8 opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
          <h1 className="text-4xl font-bold text-[var(--color-text-strong)] font-[var(--font-primary)]">Daily Progress</h1>
          <p className="mt-2 text-lg"><span className="font-semibold text-[var(--color-primary)]">Today: {todayDate}</span> • Your Goal: {goalCalories} kcal</p>
        </header>

        {/* Section 1: Grid Layout for 6 Nutrient Cards */}
        <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6 mb-10">
          {nutrientProgress.map((item, idx) => (
            <div 
              key={idx} 
              className={`group p-5 rounded-2xl border-2 border-transparent shadow-md transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2 hover:border-[var(--color-primary)] opacity-0 animate-fade-up ${NUTRIENT_CARD_CLASSES[idx % NUTRIENT_CARD_CLASSES.length]}`}
              style={{ animationDelay: `${100 + idx * 100}ms`, animationFillMode: 'forwards' }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[var(--color-text-strong)] font-[var(--font-primary)] font-semibold text-lg">{item.title}</h3>
                <span className="bg-white/60 p-2 rounded-full shadow-sm transition-transform duration-300 group-hover:scale-110">{item.icon}</span>
              </div>
              <div className="text-3xl font-bold text-[var(--color-text-strong)]">{item.value}</div>
              <div className="text-[var(--color-text-default)] text-sm">of {item.goalFormatted}</div>
              
              <div className="w-full h-2.5 mt-4 bg-black/10 rounded-full overflow-hidden">
                <div className="h-full bg-[var(--color-primary)] transition-all duration-500" style={{ width: `${item.percentage > 100 ? 100 : item.percentage}%` }}></div>
              </div>
              <div className="text-xs text-right text-[var(--color-primary)] font-semibold mt-1">{item.percentage}% Complete</div>
            </div>
          ))}
        </section>

        {/* Section 2: Charts with Animation and Enhanced Hover */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-10">
          <div className="lg:col-span-2 bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-[var(--color-border-default)] shadow-md transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 hover:border-[var(--color-primary)] opacity-0 animate-fade-up" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
            <h2 className="text-[var(--color-text-strong)] font-[var(--font-primary)] font-semibold text-xl text-center mb-4">Nutrient Grams Breakdown</h2>
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                    <Pie data={macroData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => { if (percent === 0) return null; const radius = innerRadius + (outerRadius - innerRadius) * 1.2; const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180)); const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180)); return (<text x={x} y={y} fill={THEME_VALUES.textDefault} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">{`${(percent * 100).toFixed(0)}%`}</text>); }}>
                        {macroData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value) => `${parseFloat(value).toFixed(1)}g`} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-3 bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-[var(--color-border-default)] shadow-md transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 hover:border-[var(--color-primary)] opacity-0 animate-fade-up" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
            <h2 className="text-[var(--color-text-strong)] font-[var(--font-primary)] font-semibold text-xl text-center mb-4">Weekly Calorie Progress</h2>
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={calorieProgress} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={THEME_VALUES.borderDefault} />
                    <XAxis dataKey="name" stroke={THEME_VALUES.textDefault} />
                    <YAxis stroke={THEME_VALUES.textDefault} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="calories" stroke={THEME_VALUES.primary} strokeWidth={3} name="Calories Consumed" dot={{ r: 5 }} activeDot={{ r: 8, stroke: THEME_VALUES.primary, strokeWidth: 2, fill: 'white' }} />
                    <ReferenceLine y={goalCalories} label={{ value: `Goal`, position: 'insideTopLeft', fill: THEME_VALUES.dangerText }} stroke={THEME_VALUES.dangerText} strokeDasharray="4 4" />
                </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Section 3: Bar Chart and Meal Log */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 bg-[var(--color-bg-surface)] p-6 rounded-2xl border border-[var(--color-border-default)] shadow-md transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 hover:border-[var(--color-primary)] opacity-0 animate-fade-up" style={{ animationDelay: '700ms', animationFillMode: 'forwards' }}>
              <h2 className="text-[var(--color-text-strong)] font-[var(--font-primary)] font-semibold text-xl text-center mb-4">Nutrient Intake – Current vs Goal</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={THEME_VALUES.borderDefault} />
                    <XAxis dataKey="name" stroke={THEME_VALUES.textDefault} />
                    <YAxis stroke={THEME_VALUES.textDefault} label={{ value: 'Grams (g)', angle: -90, position: 'insideLeft', fill: THEME_VALUES.textDefault }}/>
                    <Tooltip formatter={(value) => `${Number(value).toFixed(1)}g`} />
                    <Legend />
                    <Bar dataKey="Current (g)" fill={THEME_VALUES.primary} radius={[4, 4, 0, 0]} />
                   <Bar dataKey="Goal (g)" fill="#0D9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="lg:col-span-2 flex flex-col gap-4 opacity-0 animate-fade-up" style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}>
                            <div className="flex justify-between items-center mb-2">
                <h2 className="text-[var(--color-text-strong)] font-[var(--font-primary)] font-semibold text-xl">
                  Today's Meal Log
                </h2>
                <button
                  onClick={handleNavigateToFullLog}
                  className="group flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:underline"
                  title="Go to the detailed Meal Log page"
                >
                  <span className="hidden sm:inline">View Full Log</span>
                  <ExternalLink size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>
              {mealData.length > 0 ? mealData.map((meal, index) => {
                const iconTheme = MEAL_LOG_ICON_CLASSES[index % MEAL_LOG_ICON_CLASSES.length];
                return (
                  <div key={index} className="group flex items-center justify-between p-4 rounded-2xl border-2 border-[var(--color-border-default)] shadow-md bg-[var(--color-bg-surface)] transition-all duration-300 ease-in-out hover:shadow-xl hover:border-[var(--color-primary)] hover:-translate-y-1">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full text-xl transition-transform duration-300 group-hover:scale-110 ${iconTheme.bg} ${iconTheme.text}`}>
                        {getIcon(meal.title)}
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--color-text-strong)]">{meal.title}</p>
                        <p className="text-sm text-[var(--color-text-default)] truncate max-w-[120px] sm:max-w-[150px]">{meal.meal}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-[var(--color-primary)] font-bold">{meal.calories}</p>
                      <p className="text-sm text-[var(--color-text-muted)]">{meal.time}</p>
                    </div>
                  </div>
                )
              }) : (
                <div className="text-[var(--color-text-default)] p-6 bg-[var(--color-bg-surface)] rounded-2xl border-2 border-dashed border-[var(--color-border-default)] shadow-sm text-center">
                  No meals logged for today.
                </div>
              )}
            </div>
        </section>
      </main>
    </div>
  );
};

export default Reports;