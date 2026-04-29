// src/pages/dashboard/tools/MealLogger.jsx

import React, { useEffect, useState, useMemo } from "react";
import useMealLogger from "../../../components/components/MealLogger/UseMealLogger";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  X,
  Search,
  Loader,
  FilePenLine,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getTotalWaterForDate } from "../../../api/WaterTracker";
import { targetApi, targetProgressApi } from "../../../api/reportsApi";
import {
  FaFireAlt, FaBreadSlice, FaDrumstickBite, FaTint,
  FaGlassWhiskey, FaCoffee, FaAppleAlt, FaHamburger,
  FaPizzaSlice, FaCookieBite, FaConciergeBell,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// ── Changed by Rishika - Start ──
// Portion size data: unit ke hisaab se small/medium/large gram/ml values
const PORTION_MAP = {
  bowl:  { small: 150, medium: 250, large: 400 },
  plate: { small: 200, medium: 350, large: 500 },
  glass: { small: 150, medium: 250, large: 350 },
  piece: { small: 30,  medium: 60,  large: 100 },
  cup:   { small: 150, medium: 240, large: 350 },
};

// isMl: true = Milliliters mein bhejo backend ko, false = Gram mein
const PORTION_UNIT_TYPE = {
  bowl:  { isMl: true,  unit: "Milliliters" },
  plate: { isMl: false, unit: "Gram"        },
  glass: { isMl: true,  unit: "Milliliters" },
  piece: { isMl: false, unit: "Gram"        },
  cup:   { isMl: true,  unit: "Milliliters" },
};

// Display labels shown under each portion button
const PORTION_SUBLABELS = {
  bowl:  { small: "~150 ml", medium: "~250 ml", large: "~400 ml" },
  plate: { small: "~200 g",  medium: "~350 g",  large: "~500 g"  },
  glass: { small: "~150 ml", medium: "~250 ml", large: "~350 ml" },
  piece: { small: "~30 g",   medium: "~60 g",   large: "~100 g"  },
  cup:   { small: "~150 ml", medium: "~240 ml", large: "~350 ml" },
};

// Yeh units ambiguous hain — inke liye portion selector dikhao
const AMBIGUOUS_UNITS = new Set(["Bowl", "Plate", "Glass", "Piece", "Cup"]);

// ── Changed by Rishika - Start ──
// Hardcoded UNITS list — UI mein unit dropdown mein yahi dikhenge
const UNITS = [
  "Gram","Kilogram","Milliliters","Liters","Glass","Cup","Bowl",
  "Piece","Tbsp","Tsp","Slice","Plate","Handful","Pinch","Dash","Sprinkle","Other"
];
// ── Changed by Rishika - End ──

const MealLogger = () => {
  const {
    foodInputs = [],
    handleFoodChange,
    addFoodField,
    removeFoodField,
    handleSubmit,
    unitOptions = [],
    loggedMeals = [],
    handleDeleteMeal,
    searchDate,
    setSearchDate,
    searchByDate,
    isSubmitting,
    isFetching,
    editingMeal,
    handleEditMeal,
    addItem,
    cancelEdit,
    mealTypeOptions = [],
  } = useMealLogger();

  const [activeCategory, setActiveCategory] = useState("all");
  const [dailySummary, setDailySummary] = useState({
    calories: 0, carbs: 0, protein: 0, fat: 0, sugar: 0, fiber: 0,
  });
  const [waterLogged, setWaterLogged] = useState(0);
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const todayDate = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [currentPage, setCurrentPage] = useState(1);
  const MEALS_PER_PAGE = 5;

  useEffect(() => {
    const fetchDailySummary = async () => {
      if (!searchDate) return;
      try {
        const summaryData = await targetProgressApi(searchDate);
        setDailySummary({
          calories: summaryData.calories || 0,
          carbs:    summaryData.carbs    || 0,
          protein:  summaryData.protein  || 0,
          fat:      summaryData.fats     || 0,
          sugar:    summaryData.sugar    || 0,
          fiber:    summaryData.fiber    || 0,
        });
      } catch (error) {
        console.error("Failed to fetch daily summary:", error);
        setDailySummary({ calories: 0, carbs: 0, protein: 0, fat: 0, sugar: 0, fiber: 0 });
      }
    };
    fetchDailySummary();
  }, [searchDate, loggedMeals]);

  useEffect(() => {
    const fetchWaterData = async () => {
      if (!searchDate) return;
      try {
        const data = await getTotalWaterForDate(searchDate);
        setWaterLogged(data?.total_water_ml || 0);
      } catch (error) {
        setWaterLogged(0);
      }
    };
    fetchWaterData();
  }, [searchDate, loggedMeals]);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const data = await targetApi(todayDate);
        if (data) {
          if (data.recommended_calories) setCalorieGoal(data.recommended_calories);
          if (data.macronutrients) setMacroGoals(data.macronutrients);
        }
      } catch (error) {
        console.error("Failed to fetch goals:", error);
      }
    };
    fetchGoals();
  }, [todayDate]);

  const waterGlasses = Math.floor((waterLogged || 0) / 250);
  const [macroGoals, setMacroGoals] = useState({
    protein_g: 140, carbs_g: 125, fats_g: 65, sugar_g: 40, fiber_g: 25,
  });

  const mealTypeStyles = {
    breakfast:            { bg: 'bg-amber-100/70',  border: 'border-amber-300',   iconColor: 'text-amber-700',   gradient: 'bg-gradient-to-br from-amber-50 to-amber-100'   },
    lunch:                { bg: 'bg-emerald-100/70', border: 'border-emerald-300', iconColor: 'text-emerald-700', gradient: 'bg-gradient-to-br from-emerald-50 to-emerald-100' },
    dinner:               { bg: 'bg-indigo-100/70',  border: 'border-indigo-300',  iconColor: 'text-indigo-700',  gradient: 'bg-gradient-to-br from-indigo-50 to-indigo-100'   },
    snack:                { bg: 'bg-purple-100/70',  border: 'border-purple-300',  iconColor: 'text-purple-700',  gradient: 'bg-gradient-to-br from-purple-50 to-purple-100'   },
    'early-morning':      { bg: 'bg-yellow-100/70',  border: 'border-yellow-300',  iconColor: 'text-yellow-700',  gradient: 'bg-gradient-to-br from-yellow-50 to-yellow-100'   },
    'mid-morning snack':  { bg: 'bg-orange-100/70',  border: 'border-orange-300',  iconColor: 'text-orange-700',  gradient: 'bg-gradient-to-br from-orange-50 to-orange-100'   },
    'afternoon snack':    { bg: 'bg-pink-100/70',    border: 'border-pink-300',    iconColor: 'text-pink-700',    gradient: 'bg-gradient-to-br from-pink-50 to-pink-100'       },
    bedtime:              { bg: 'bg-slate-100/70',   border: 'border-slate-300',   iconColor: 'text-slate-700',   gradient: 'bg-gradient-to-br from-slate-50 to-slate-100'     },
    default:              { bg: 'bg-gray-100/70',    border: 'border-gray-300',    iconColor: 'text-gray-700',    gradient: 'bg-gradient-to-br from-gray-50 to-gray-100'       },
  };

  const getMealIcon = (mealType) => {
    switch (mealType?.toLowerCase()) {
      case 'breakfast':          return '🍳';
      case 'lunch':              return '🍔';
      case 'dinner':             return '🍝';
      case 'snack':              return '🍎';
      case 'early-morning':      return '🌅';
      case 'mid-morning snack':  return '🥪';
      case 'afternoon snack':    return '🍩';
      case 'bedtime':            return '🌙';
      default:                   return '🍽️';
    }
  };

  const getProgressPercent = (value, target) => {
    if (!target || target === 0) return 0;
    return Math.min((value / target) * 100, 100);
  };

  const { mealsByCategory, mealCounts, sortedAllMeals } = useMemo(() => {
    const sorted = [...loggedMeals].sort((a, b) => new Date(b.consumed_at) - new Date(a.consumed_at));
    const byCategory = sorted.reduce((acc, meal) => {
      const type = meal.meal_type.toLowerCase().replace(/-/g, ' ');
      if (!acc[type]) acc[type] = [];
      acc[type].push(meal);
      return acc;
    }, {});
    const counts = Object.keys(byCategory).reduce((acc, key) => {
      acc[key] = byCategory[key].length;
      return acc;
    }, {});
    counts["all"] = sorted.length;
    return { mealsByCategory: byCategory, mealCounts: counts, sortedAllMeals: sorted };
  }, [loggedMeals]);

  const categoryOrder = ["All", "Early-Morning", "Breakfast", "Mid-Morning Snack", "Lunch", "Afternoon Snack", "Dinner", "Bedtime"];

  // ── Changed by Rishika - Start ──
  // NutritionExpand: meal card ke andar click karne par calories + macros dikhata hai
  // Pehle sirf plain chips the — ab proper styled expand section hai
  const NutritionExpand = ({ item }) => {
    const cal   = parseFloat(item.calories || 0).toFixed(0);
    const prot  = parseFloat(item.protein  || 0).toFixed(1);
    const carbs = parseFloat(item.carbs    || 0).toFixed(1);
    const fats  = parseFloat(item.fats     || 0).toFixed(1);
    const sugar = parseFloat(item.sugar    || 0).toFixed(1);
    const fiber = parseFloat(item.fiber    || 0).toFixed(1);

    return (
      <div className="mt-3 p-3 bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border-default)] shadow-sm">
        {/* ── Changed by Rishika - Start ── */}
        {/* Calories + quantity/unit — tooltip me kitni g ya ml liya ye bhi dikhao */}
        <div className="flex justify-between items-center pb-2 mb-2 border-b border-dashed border-[var(--color-border-default)]">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">🔥 Calories</span>
            {/* ── Changed by Rishika - Start ── */}
            {/* original_unit/original_quantity dikhao — jaise "1 Bowl", "1 Cup" */}
            {/* Agar original_unit nahi hai toh backend wali value dikhao */}
            {(item.quantity || item.unit) && (
              <span className="text-xs text-[var(--color-text-muted)] italic">
                {item.original_quantity || item.quantity} {item.original_unit || item.unit}
                {/* Agar backend ne convert kiya hai toh approx bhi dikhao */}
                {item.original_unit && item.original_unit.toLowerCase() !== (item.unit || "").toLowerCase() && (
                  <span className="ml-1 opacity-70">
                    (≈{item.quantity} {item.unit?.toLowerCase().includes("mil") ? "ml" : "g"})
                  </span>
                )}
              </span>
            )}
            {/* ── Changed by Rishika - End ── */}
          </div>
          <span className="text-2xl font-extrabold text-[var(--color-primary)] font-[var(--font-primary)]">
            {cal}
            <span className="text-xs font-normal text-[var(--color-text-muted)] ml-1">kcal</span>
          </span>
        </div>
        {/* ── Changed by Rishika - End ── */}
        {/* Protein / Carbs / Fats — 3 colored boxes */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          {[
            { label: "Protein", val: prot,  colorText: "text-sky-600",   colorBg: "bg-sky-50"   },
            { label: "Carbs",   val: carbs, colorText: "text-green-600", colorBg: "bg-green-50" },
            { label: "Fats",    val: fats,  colorText: "text-red-600",   colorBg: "bg-red-50"   },
          ].map(r => (
            <div key={r.label} className={`${r.colorBg} rounded-xl p-2 text-center`}>
              <div className={`text-xs font-semibold mb-0.5 opacity-80 ${r.colorText}`}>{r.label}</div>
              <div className={`text-sm font-extrabold ${r.colorText}`}>
                {r.val}<span className="text-xs font-normal">g</span>
              </div>
            </div>
          ))}
        </div>
        {/* Sugar + Fiber — 2 inline rows */}
        <div className="flex gap-2">
          {[
            { label: "🍬 Sugar", val: sugar },
            { label: "🌿 Fiber", val: fiber },
          ].map(r => (
            <div key={r.label} className="flex-1 flex justify-between items-center bg-[var(--color-bg-app)] rounded-lg px-3 py-1">
              <span className="text-xs text-[var(--color-text-muted)]">{r.label}</span>
              <span className="text-sm font-bold text-[var(--color-text-default)]">
                {r.val}<span className="text-xs ml-0.5">g</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── Changed by Rishika - Start ──
  // UnitDropdown: Custom dropdown — sirf 4-5 items dikhenge, baaki scroll se
  // Font size bada, controlled height, smooth scroll
  const UnitDropdown = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = React.useRef(null);

    // Bahar click karne par band ho
    useEffect(() => {
      const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
      <div ref={ref} className="relative w-full">
        {/* Trigger button */}
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-lg px-3 py-2.5 text-[var(--color-text-default)] focus:outline-none focus:border-[var(--color-primary)] transition-colors text-base font-medium"
        >
          <span>{value || "Unit"}</span>
          <svg className={`w-4 h-4 ml-2 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown list — max 5 items visible, rest scroll */}
        {open && (
          <ul className="absolute z-50 w-full mt-1 bg-[var(--color-bg-surface)] border-2 border-[var(--color-border-default)] rounded-lg shadow-xl overflow-y-auto"
            style={{ maxHeight: "14rem" }}  // ~7 items visible
          >
            {UNITS.map((unit) => (
              <li
                key={unit}
                onClick={() => { onChange(unit); setOpen(false); }}
                className={`px-4 py-2 text-base font-medium cursor-pointer transition-colors
                  ${ value === unit
                    ? "bg-[var(--color-primary)] text-[var(--color-text-on-primary)]"
                    : "text-[var(--color-text-default)] hover:bg-[var(--color-primary-subtle)] hover:text-[var(--color-primary)]"
                  }`}
              >
                {unit}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };
  // ── Changed by Rishika - End ──

  // FoodRow: ek food input row with portion size selector
  // Unit select hone par PORTION_MAP check karta hai — Bowl/Cup/Glass/Plate/Piece ke liye
  // Small/Medium/Large buttons dikhata hai with ml/g labels
  const FoodRow = ({ input, idx }) => {
    const [portionSize, setPortionSize] = useState("medium");
    const [useExact, setUseExact]       = useState(false);
    const [exactVal, setExactVal]       = useState("");

    const unitLower       = (input.unit || "").toLowerCase();
    const showPortionBox  = AMBIGUOUS_UNITS.has(input.unit) && !useExact;
    const portionData     = PORTION_MAP[unitLower];
    const portionUnitInfo = PORTION_UNIT_TYPE[unitLower] || { isMl: false, unit: "Gram" };
    const exactUnitLabel  = portionUnitInfo.isMl ? "ml" : "g";

    // Unit change hone par medium portion default set karo
    const handleUnitChange = (val) => {
      handleFoodChange(idx, "unit", val);
      setUseExact(false);
      setExactVal("");
      setPortionSize("medium");
      const vLower = val.toLowerCase();
      const p      = PORTION_MAP[vLower]?.medium;
      const uInfo  = PORTION_UNIT_TYPE[vLower] || { isMl: false, unit: "Gram" };
      if (p) {
        handleFoodChange(idx, "portionValue", p);
        handleFoodChange(idx, "portionUnit",  uInfo.unit);
      } else {
        handleFoodChange(idx, "portionValue", null);
        handleFoodChange(idx, "portionUnit",  null);
      }
    };

    // Small/Medium/Large button click
    const handlePortionSize = (s) => {
      setPortionSize(s);
      const g     = PORTION_MAP[unitLower]?.[s];
      const uInfo = PORTION_UNIT_TYPE[unitLower] || { isMl: false, unit: "Gram" };
      if (g) {
        handleFoodChange(idx, "portionValue", g);
        handleFoodChange(idx, "portionUnit",  uInfo.unit);
      }
    };

    // "Enter exact ml/g" link click
    const handleExactSwitch = () => {
      setUseExact(true);
      handleFoodChange(idx, "portionValue", null);
      handleFoodChange(idx, "portionUnit",  null);
    };

    // Exact value input change
    const handleExactInput = (val) => {
      setExactVal(val);
      handleFoodChange(idx, "portionValue", val);
      const uInfo = PORTION_UNIT_TYPE[unitLower] || { isMl: false, unit: "Gram" };
      handleFoodChange(idx, "portionUnit", uInfo.unit);
    };

    const handleExactBack = () => { setUseExact(false); setExactVal(""); };

    return (
      <motion.div
        key={input.id}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="border-t-2 border-dashed border-[var(--color-border-default)] pt-6 pb-2 mb-4"
      >
        <div className="flex items-start gap-3">
          <div className="flex-grow grid grid-cols-12 gap-4">

            {/* Food Name */}
            <div className="col-span-12 sm:col-span-6 relative">
              <input type="text" value={input.name}
                onChange={(e) => handleFoodChange(idx, "name", e.target.value)}
                className="w-full bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-lg px-3 py-2.5 text-[var(--color-text-default)] focus:outline-none focus:border-[var(--color-primary)] transition-colors peer"
                placeholder=" " />
              <label className="absolute left-3 -top-2.5 text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-surface)] px-1 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[var(--color-primary)] transition-all pointer-events-none">
                Food Name
              </label>
            </div>

            {/* Quantity */}
            <div className="col-span-6 sm:col-span-3 relative">
              <input type="number" value={input.quantity}
                onChange={(e) => handleFoodChange(idx, "quantity", e.target.value)}
                className="w-full bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-lg px-3 py-2.5 text-[var(--color-text-default)] focus:outline-none focus:border-[var(--color-primary)] transition-colors peer"
                placeholder=" " />
              <label className="absolute left-3 -top-2.5 text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-surface)] px-1 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[var(--color-primary)] transition-all pointer-events-none">
                Quantity
              </label>
            </div>

            {/* Unit — handleUnitChange: Bowl/Cup etc select hone par portion box trigger hoga */}
            <div className="col-span-6 sm:col-span-3 relative">
              {/* ── Changed by Rishika - Start ── */}
              {/* Fix: Browser native select dropdown size control nahi hoti
                   Custom dropdown banaya — sirf 4-5 items dikhenge, baaki scroll se */}
              <UnitDropdown
                value={input.unit}
                onChange={(val) => handleUnitChange(val)}
              />
              {/* ── Changed by Rishika - End ── */}
            </div>

            {/* Portion Size Selector — sirf Bowl/Cup/Glass/Plate/Piece ke liye dikhta hai */}
            {showPortionBox && portionData && (
              <div className="col-span-12 rounded-xl border-2 border-dashed border-[var(--color-primary-subtle,rgba(255,107,53,0.3))] bg-[var(--color-primary-bg-subtle,#fff8f5)] p-4">
                <p className="text-xs font-semibold text-[var(--color-primary)] mb-3">📐 Select portion size</p>
                <div className="flex gap-2 mb-3">
                  {["small", "medium", "large"].map(s => (
                    <button key={s} type="button" onClick={() => handlePortionSize(s)}
                      className={`flex-1 py-2 rounded-xl border-2 text-center transition-all duration-200 font-semibold text-xs
                        ${portionSize === s
                          ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-text-on-primary)] shadow-md"
                          : "bg-white border-[var(--color-border-default)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]"
                        }`}>
                      <span className="block capitalize">{s}</span>
                      <span className="block text-xs font-normal mt-0.5 opacity-75">
                        {PORTION_SUBLABELS[unitLower]?.[s] || ""}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Prefer exact {exactUnitLabel}?{" "}
                  <span onClick={handleExactSwitch}
                    className="text-[var(--color-primary)] underline cursor-pointer font-semibold">
                    Enter exact {exactUnitLabel} →
                  </span>
                </p>
              </div>
            )}

            {/* Exact input box — "Enter exact ml/g" click karne par dikhta hai */}
            {useExact && (
              <div className="col-span-12 flex items-center gap-3 flex-wrap rounded-xl border-2 border-green-400 bg-green-50 p-3">
                <label className="text-xs font-medium text-[var(--color-text-muted)]">Exact {exactUnitLabel}:</label>
                <input type="number" min="1" value={exactVal}
                  onChange={e => handleExactInput(e.target.value)}
                  className="w-20 text-center border-2 border-green-500 rounded-lg px-2 py-1.5 text-green-700 font-bold bg-white focus:outline-none" />
                <span className="text-xs text-[var(--color-text-muted)]">{exactUnitLabel}</span>
                <button type="button" onClick={handleExactBack}
                  className="ml-auto text-xs text-[var(--color-primary)] underline cursor-pointer font-medium bg-transparent border-none">
                  ← back
                </button>
              </div>
            )}

            {/* Meal Type */}
            <div className="col-span-12 sm:col-span-4">
              <select value={input.mealType}
                onChange={(e) => handleFoodChange(idx, "mealType", e.target.value)}
                className="w-full bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-lg px-3 py-2.5 text-[var(--color-text-default)] focus:outline-none focus:border-[var(--color-primary)] transition-colors">
                {mealTypeOptions.map((type) => (<option key={type} value={type}>{type}</option>))}
              </select>
            </div>

            {/* Date */}
            <div className="col-span-6 sm:col-span-4 relative">
              <input type="date" id={`logDate-${input.id}`} value={input.logDate}
                max={new Date().toLocaleDateString("en-CA")}
                onChange={(e) => handleFoodChange(idx, "logDate", e.target.value)}
                className="w-full bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-lg px-3 py-2.5 text-[var(--color-text-default)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                required />
              <label htmlFor={`logDate-${input.id}`} className="absolute left-3 -top-2.5 text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-surface)] px-1 pointer-events-none">Date</label>
            </div>

            {/* Time */}
            <div className="col-span-6 sm:col-span-4 relative">
              <DatePicker
                selected={input.logTime ? new Date(`1970-01-01T${input.logTime}`) : null}
                onChange={(date) => { const t = date ? date.toTimeString().slice(0, 5) : ""; handleFoodChange(idx, "logTime", t); }}
                showTimeSelect showTimeSelectOnly timeIntervals={15} timeCaption="Time" dateFormat="h:mm aa"
                className="w-full bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-lg px-3 py-2.5 text-[var(--color-text-default)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                placeholderText="Time" required />
              <label htmlFor={`logTime-${input.id}`} className="absolute left-3 -top-2.5 text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-surface)] px-1 pointer-events-none">Time</label>
            </div>

            {/* Remarks */}
            <div className="col-span-12 relative">
              <input type="text" value={input.remark}
                onChange={(e) => handleFoodChange(idx, "remark", e.target.value)}
                className="w-full bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-lg px-3 py-2.5 text-[var(--color-text-default)] focus:outline-none focus:border-[var(--color-primary)] transition-colors peer"
                placeholder=" " />
              <label className="absolute left-3 -top-2.5 text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-surface)] px-1 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[var(--color-primary)] transition-all pointer-events-none">
                Remarks (Optional)
              </label>
            </div>

            {/* Add Item button */}
            <button type="button" onClick={() => addItem(idx)}
              className="flex items-center gap-2 whitespace-nowrap text-[var(--color-primary)] font-semibold py-2 px-4 rounded-lg hover:bg-[var(--color-primary-subtle)] transition-colors">
              <Plus size={16} className="text-[var(--color-primary)]" /> Add Item
            </button>

          </div>

          {/* Remove food field button */}
          {foodInputs.length > 1 && (
            <button type="button" onClick={() => removeFoodField(idx)}
              className="mt-1.5 p-1 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-danger-text)] hover:bg-[var(--color-danger-bg-subtle)] transition-colors"
              title={`Remove ${input.name || "item"}`}>
              <X size={20} />
            </button>
          )}
        </div>
      </motion.div>
    );
  };
  // ── Changed by Rishika - End ──

  const MealList = ({ meals, currentPage, setCurrentPage, mealsPerPage, activeCategory }) => {
    const [openIndividualMealItems, setOpenIndividualMealItems] = useState({});
    const toggleIndividualMealItem = (itemId) => {
      setOpenIndividualMealItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
    };

    let itemsToDisplay = [];
    if (activeCategory === "all") {
      itemsToDisplay = Object.values(
        meals.reduce((acc, meal) => {
          const type = meal.meal_type.toLowerCase().replace(/-/g, " ");
          if (!acc[type]) acc[type] = { id: type, meal_type: meal.meal_type, items: [] };
          acc[type].items.push(meal);
          return acc;
        }, {})
      );
    } else {
      itemsToDisplay = meals.map(meal => ({ ...meal, isIndividual: true }));
    }

    const indexOfLastMeal  = currentPage * mealsPerPage;
    const indexOfFirstMeal = indexOfLastMeal - mealsPerPage;
    const currentMeals     = itemsToDisplay.slice(indexOfFirstMeal, indexOfLastMeal);
    const totalPages       = Math.ceil(itemsToDisplay.length / mealsPerPage);

    return (
      <>
        <AnimatePresence mode="wait">
          {currentMeals.length > 0 ? (
            currentMeals.map(mealGroupOrItem => {
              const style = mealTypeStyles[mealGroupOrItem.meal_type?.toLowerCase().replace(/-/g, " ")] || mealTypeStyles.default;

              if (activeCategory === "all") {
                const [openMealGroupsLocal, setOpenMealGroupsLocal] = useState({});
                const toggleMealGroupLocal = (id) => setOpenMealGroupsLocal(prev => ({ ...prev, [id]: !prev[id] }));
                const isOpen = openMealGroupsLocal[mealGroupOrItem.id];

                return (
                  <motion.div key={mealGroupOrItem.id}
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.4, ease: "easeOut" }}
                    className={`group flex flex-col gap-2 p-4 rounded-2xl border-2 shadow-lg mb-6 ${style.border} bg-[var(--color-bg-surface-glass)] backdrop-blur-md hover:shadow-xl transition-all duration-300 ease-in-out`}
                  >
                    <div className="flex items-center justify-between gap-3 p-2 cursor-pointer" onClick={() => toggleMealGroupLocal(mealGroupOrItem.id)}>
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full text-xl flex items-center justify-center ${style.gradient} ${style.iconColor} shadow-md`}>
                          {getMealIcon(mealGroupOrItem.meal_type)}
                        </div>
                        <h4 className="font-primary font-bold text-[var(--color-text-strong)] text-xl tracking-wide">{mealGroupOrItem.meal_type}</h4>
                      </div>
                      <motion.svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-[var(--color-text-muted)]" animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </motion.svg>
                    </div>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.ul initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="space-y-3 pt-2">
                          {mealGroupOrItem.items.map(item => (
                            <motion.li key={item.id}
                              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2, ease: "easeOut" }}
                              className="flex flex-col gap-2 p-4 bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border-default)] shadow-sm hover:shadow-md transition-all duration-300 ease-in-out"
                            >
                              <div className="flex justify-between items-start">
                                <span className="font-semibold text-[var(--color-text-strong)] text-base md:text-lg">
                                  {item.food_name_display}
                                  {/* ── Changed by Rishika - Start ── */}
                                  <span className="ml-2 font-normal text-[var(--color-text-muted)] text-sm">• {item.original_quantity || item.quantity} {item.original_unit || item.unit}</span>
                                  {/* ── Changed by Rishika - End ── */}
                                </span>
                                {item.consumed_at && (
                                  <span className="text-sm text-[var(--color-text-subtle)] whitespace-nowrap ml-4">
                                    {new Date(item.consumed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                )}
                              </div>
                              {item.remarks && (
                                <p className="text-sm text-[var(--color-text-default)] border-l-2 border-[var(--color-primary)] pl-3 italic">
                                  <span className="font-semibold text-[var(--color-text-strong)]">Remarks:</span> {item.remarks}
                                </p>
                              )}
                              {/* ── Changed by Rishika - Start ── */}
                              {/* NutritionExpand: calories kcal + protein/carbs/fats boxes + sugar/fiber */}
                              <NutritionExpand item={item} />
                              {/* ── Changed by Rishika - End ── */}
                              <div className="flex justify-end gap-2 mt-1">
                                <button onClick={(e) => { e.stopPropagation(); handleEditMeal(item); }} className="p-2 rounded-full text-[var(--color-info-text)] hover:bg-[var(--color-info-bg-subtle)] transition-colors" title="Edit Meal"><FilePenLine size={18} /></button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteMeal(item.id); }} className="p-2 rounded-full text-[var(--color-danger-text)] hover:bg-[var(--color-danger-bg-subtle)] transition-colors" title="Delete Meal"><Trash2 size={18} /></button>
                              </div>
                            </motion.li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );

              } else {
                const isItemOpen = openIndividualMealItems[mealGroupOrItem.id];
                return (
                  <motion.div key={mealGroupOrItem.id}
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.4, ease: "easeOut" }}
                    className={`flex flex-col gap-2 p-4 rounded-2xl border-2 shadow-lg mb-6 ${style.border} bg-[var(--color-bg-surface-glass)] backdrop-blur-md hover:shadow-xl transition-all duration-300 ease-in-out cursor-pointer`}
                    onClick={() => toggleIndividualMealItem(mealGroupOrItem.id)}
                  >
                    <div className="flex justify-between items-center px-2 py-1">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full text-lg flex items-center justify-center ${style.gradient} ${style.iconColor} shadow-sm`}>
                          {getMealIcon(mealGroupOrItem.meal_type)}
                        </div>
                        <span className="font-primary font-bold text-[var(--color-text-strong)] text-lg tracking-wide">{mealGroupOrItem.food_name_display}</span>
                      </div>
                      {mealGroupOrItem.consumed_at && (
                        <span className="text-sm text-[var(--color-text-subtle)] whitespace-nowrap ml-4">
                          {new Date(mealGroupOrItem.consumed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                      <motion.svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-[var(--color-text-muted)] ml-auto" animate={{ rotate: isItemOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </motion.svg>
                    </div>

                    <AnimatePresence>
                      {isItemOpen && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="pt-1">
                          <div className="flex flex-col gap-2 p-4 bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border-default)] shadow-sm">
                            {/* ── Changed by Rishika - Start ── */}
                            {/* original_unit dikhao — jaise "1 Bowl" na ki "250 Milliliters" */}
                            <p className="font-semibold text-[var(--color-text-strong)] text-base">
                              Quantity: <span className="font-normal text-[var(--color-text-default)]">{mealGroupOrItem.original_quantity || mealGroupOrItem.quantity} {mealGroupOrItem.original_unit || mealGroupOrItem.unit}</span>
                            </p>
                            {/* ── Changed by Rishika - End ── */}
                            {mealGroupOrItem.remarks && (
                              <p className="text-sm text-[var(--color-text-default)] border-l-2 border-[var(--color-primary)] pl-3 italic">
                                <span className="font-semibold text-[var(--color-text-strong)]">Remarks:</span> {mealGroupOrItem.remarks}
                              </p>
                            )}
                            {/* ── Changed by Rishika - Start ── */}
                            {/* NutritionExpand: calories kcal + protein/carbs/fats boxes + sugar/fiber */}
                            <NutritionExpand item={mealGroupOrItem} />
                            {/* ── Changed by Rishika - End ── */}
                            <div className="flex justify-end gap-2 mt-1">
                              <button onClick={(e) => { e.stopPropagation(); handleEditMeal(mealGroupOrItem); }} className="p-2 rounded-full text-[var(--color-info-text)] hover:bg-[var(--color-info-bg-subtle)] transition-colors" title="Edit Meal"><FilePenLine size={18} /></button>
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteMeal(mealGroupOrItem.id); }} className="p-2 rounded-full text-[var(--color-danger-text)] hover:bg-[var(--color-danger-bg-subtle)] transition-colors" title="Delete Meal"><Trash2 size={18} /></button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              }
            })
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center text-[var(--color-text-muted)] p-8 bg-[var(--color-bg-surface-alt)] rounded-xl shadow-inner">
              <p className="font-semibold text-lg mb-2 text-[var(--color-text-strong)]">No meals logged for this category.</p>
              <p className="text-[var(--color-text-default)]">Start by adding your first meal!</p>
            </motion.div>
          )}
        </AnimatePresence>

        {totalPages > 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center items-center gap-4 mt-6">
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-full bg-[var(--color-bg-interactive-subtle)] hover:bg-[var(--color-primary-subtle)] text-[var(--color-text-strong)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"><ChevronLeft size={20} /></button>
            <span className="font-semibold text-sm text-[var(--color-text-default)]">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 rounded-full bg-[var(--color-bg-interactive-subtle)] hover:bg-[var(--color-primary-subtle)] text-[var(--color-text-strong)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"><ChevronRight size={20} /></button>
          </motion.div>
        )}
      </>
    );
  };

  return (
    <div className="bg-[var(--color-bg-app)] min-h-screen text-[var(--color-text-default)] font-[var(--font-secondary)]">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
          <h1 className="text-4xl font-[var(--font-primary)] font-bold text-[var(--color-text-strong)]">Meal Logger</h1>
          <p className="text-lg mt-1">Log your daily meals to track calories, nutrients, and water intake.</p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-[var(--color-bg-surface)] border-2 border-[var(--color-border-default)] rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-[var(--font-primary)] font-semibold text-[var(--color-text-strong)] mb-1">
                {editingMeal ? "Editing Meal" : "Log a New Meal"}
              </h3>
              <p className="text-sm mb-6">Enter one or more food items below.</p>

              {/* ── Changed by Rishika - Start ── */}
              {/* FoodRow: har food input ke liye portion size selector bhi include hai */}
              <AnimatePresence>
                {foodInputs.map((input, idx) => (
                  <FoodRow key={input.id} input={input} idx={idx} />
                ))}
              </AnimatePresence>
              {/* ── Changed by Rishika - End ── */}

              <div className="flex items-center justify-between pt-6 mt-4 border-t-2 border-dashed border-[var(--color-border-default)]">
                <div className="flex gap-4">
                  {!editingMeal && (
                    <button type="button" onClick={addFoodField} className="flex items-center gap-2 text-[var(--color-primary)] font-semibold py-2 px-4 rounded-lg hover:bg-[var(--color-primary-subtle)] transition-colors">
                      <Plus size={16} /> Add Another Meal
                    </button>
                  )}
                </div>
                <div className="flex gap-4 items-center">
                  {editingMeal ? (
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={cancelEdit} className="w-full sm:w-auto bg-transparent border-2 border-[var(--color-border-default)] hover:bg-[var(--color-bg-interactive-subtle)] text-[var(--color-text-strong)] py-2 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2">
                        <X size={16} /> Cancel
                      </button>
                      <button type="submit" disabled={isSubmitting} className="w-full sm:w-40 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-text-on-primary)] py-2.5 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:transform-none disabled:shadow-md">
                        {isSubmitting ? <Loader className="animate-spin" /> : "Update Meal"}
                      </button>
                    </div>
                  ) : (
                    <button type="submit" disabled={isSubmitting} className="w-full sm:w-40 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-text-on-primary)] py-2.5 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:transform-none disabled:shadow-md">
                      {isSubmitting ? <Loader className="animate-spin" /> : "Log Meal"}
                    </button>
                  )}
                </div>
              </div>
            </motion.form>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-[var(--color-bg-surface)] border-2 border-[var(--color-border-default)] rounded-2xl shadow-lg p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h3 className="text-xl font-[var(--font-primary)] font-semibold text-[var(--color-text-strong)] mb-4 sm:mb-0">Recently Logged</h3>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
                  <input type="date" value={searchDate} max={new Date().toLocaleDateString("en-CA")}
                    onChange={(e) => { const d = e.target.value; setSearchDate(d); searchByDate(d || new Date().toISOString().split("T")[0]); }}
                    className="w-full bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-lg pl-10 pr-4 py-2 text-[var(--color-text-default)] focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
                </div>
              </div>

              {isFetching ? (
                <div className="flex items-center justify-center p-12 text-center text-[var(--color-text-muted)] gap-2"><Loader className="animate-spin" />Loading meals...</div>
              ) : loggedMeals.length === 0 && !isFetching ? (
                <div className="text-[var(--color-text-default)] p-8 bg-[var(--color-bg-app)] rounded-xl border-2 border-dashed border-[var(--color-border-default)] text-center">
                  <p className="font-semibold text-lg text-[var(--color-text-strong)]">No meals logged for this date.</p>
                  <p className="text-sm">Use the form above to add your first meal!</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-3 mb-4">
                    {categoryOrder.map(categoryDisplayName => {
                      const categoryKey = categoryDisplayName === 'All' ? 'all' : categoryDisplayName.toLowerCase().replace(/-/g, ' ');
                      const count    = mealCounts[categoryKey] || 0;
                      const isActive = activeCategory === categoryKey;
                      return (
                        <button key={categoryDisplayName} onClick={() => { setActiveCategory(categoryKey); setCurrentPage(1); }}
                          className={`relative py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 flex-shrink-0 flex items-center gap-2 group hover:shadow-lg hover:-translate-y-px ${isActive ? 'bg-[var(--color-primary)] text-[var(--color-text-on-primary)] shadow-md' : 'bg-[var(--color-bg-app)] text-[var(--color-text-muted)] hover:text-[var(--color-text-strong)]'}`}>
                          {categoryDisplayName}
                          <span className={`flex items-center justify-center text-xs font-bold rounded-full w-5 h-5 transition-colors ${isActive ? 'bg-white/20 text-white' : 'bg-[var(--color-bg-interactive-subtle)] text-[var(--color-text-default)] group-hover:bg-[var(--color-primary-subtle)] group-hover:text-[var(--color-primary)]'}`}>{count}</span>
                        </button>
                      );
                    })}
                  </div>
                  <MealList meals={activeCategory === 'all' ? sortedAllMeals : (mealsByCategory[activeCategory] || [])} currentPage={currentPage} setCurrentPage={setCurrentPage} mealsPerPage={MEALS_PER_PAGE} activeCategory={activeCategory} />
                </>
              )}
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-col items-start space-y-8">
            <div className="bg-[var(--color-bg-surface)] border-2 border-[var(--color-border-default)] rounded-2xl shadow-lg p-6 w-full">
              <h4 className="font-[var(--font-primary)] font-semibold text-xl text-[var(--color-text-strong)] mb-4">Today's Summary</h4>
              <div className="flex items-center gap-3 mb-4 border-b-2 border-dashed border-[var(--color-border-default)] pb-4">
                <span className="bg-[var(--color-warning-bg-subtle)] p-3 rounded-full text-[var(--color-warning-text)] text-2xl"><FaFireAlt /></span>
                <div>
                  <p className="text-2xl font-bold text-[var(--color-text-strong)]">{dailySummary.calories?.toFixed(0) || 0} kcal</p>
                  <p className="text-sm text-[var(--color-text-default)]">of {calorieGoal?.toFixed(0) || 2000} goal</p>
                </div>
              </div>
              <div className="space-y-4 text-sm">
                {[
                  { label: "Carbs",   value: dailySummary.carbs,   target: macroGoals.carbs_g,   color: "bg-[var(--color-accent-1-text)]", icon: <FaBreadSlice    className="text-[var(--color-accent-1-text)]" /> },
                  { label: "Protein", value: dailySummary.protein, target: macroGoals.protein_g, color: "bg-[var(--color-primary)]",        icon: <FaDrumstickBite className="text-[var(--color-primary)]" /> },
                  { label: "Fat",     value: dailySummary.fat,     target: macroGoals.fats_g,    color: "bg-[var(--color-danger-text)]",    icon: <FaTint          className="text-[var(--color-danger-text)]" /> },
                  { label: "Sugar",   value: dailySummary.sugar,   target: macroGoals.sugar_g,   color: "bg-[var(--color-info-text)]",      icon: <FaCookieBite    className="text-[var(--color-info-text)]" /> },
                  { label: "Fiber",   value: dailySummary.fiber,   target: macroGoals.fiber_g,   color: "bg-[var(--color-success-text)]",   icon: <FaAppleAlt      className="text-[var(--color-success-text)]" /> },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-[var(--color-text-strong)] flex items-center gap-2">{item.icon} {item.label}</span>
                      <span className="text-[var(--color-text-default)]">{item.value?.toFixed(1) || "0.0"}g / {item.target}g</span>
                    </div>
                    <div className="w-full h-2 bg-[var(--color-bg-interactive-subtle)] rounded-full overflow-hidden">
                      <div className={`${item.color} h-full rounded-full transition-all duration-500`} style={{ width: `${getProgressPercent(item.value, item.target)}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[var(--color-bg-surface)] border-2 border-[var(--color-border-default)] rounded-2xl shadow-lg p-6 w-full">
              <h4 className="font-[var(--font-primary)] font-semibold text-xl text-[var(--color-text-strong)] mb-4">Other Goals</h4>
              <div className="text-base space-y-3 font-semibold text-[var(--color-text-default)]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><FaGlassWhiskey className="text-[var(--color-info-text)]" /> Water Intake</span>
                  <span>{waterGlasses} glasses</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MealLogger;