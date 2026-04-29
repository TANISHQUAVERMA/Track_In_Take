// src/components/dashboard/QuickMealLogger.jsx

import React, { useState, useMemo, useEffect, useRef } from "react";
import { FaUtensils } from "react-icons/fa";
import useMealLogger from "./UseMealLogger";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Plus,
  Loader,
  ChevronLeft,
  ChevronRight,
  Search,
  Trash2,
  FilePenLine,
  Flame,
  Beef,
  Wheat,
  Droplet,
  Candy,
  Leaf,
  X,
  ChevronDown,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Changed by Rishika - Start ──
// Fix: Browser native select dropdown ki height control nahi hoti
// Custom UnitDropdown component banaya — sirf 7 items visible, baaki scroll se
// Font size bhi bada kiya
const UNITS = [
  "Gram","Kilogram","Milliliters","Liters","Glass","Cup","Bowl",
  "Piece","Tbsp","Tsp","Slice","Plate","Handful","Pinch","Dash","Sprinkle","Other",
];

const UnitDropdown = ({ value, onChange }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-lg px-2 py-2 text-[var(--color-text-default)] focus:outline-none focus:border-[var(--color-primary)] transition-colors text-sm font-medium"
      >
        <span>{value || "Unit"}</span>
        <svg className={`w-3 h-3 ml-1 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <ul
          className="absolute z-50 w-full mt-1 bg-[var(--color-bg-surface)] border-2 border-[var(--color-border-default)] rounded-lg shadow-xl overflow-y-auto"
          style={{ maxHeight: "14rem" }}
        >
          {UNITS.map((unit) => (
            <li
              key={unit}
              onClick={() => { onChange(unit); setOpen(false); }}
              className={`px-3 py-2 text-sm font-medium cursor-pointer transition-colors
                ${value === unit
                  ? "bg-[var(--color-primary)] text-[var(--color-text-on-primary)]"
                  : "text-[var(--color-text-default)] hover:bg-[var(--color-primary-subtle)] hover:text-[var(--color-primary)]"}`}
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

// ── Changed by Rishika - Start ──
const PORTION_MAP = {
  bowl:  { small: 150, medium: 250, large: 400 },
  plate: { small: 200, medium: 350, large: 500 },
  glass: { small: 150, medium: 250, large: 350 },
  piece: { small: 30,  medium: 60,  large: 100 },
  cup:   { small: 150, medium: 240, large: 350 },
};
const PORTION_UNIT_TYPE = {
  bowl:  { isMl: true,  unit: "Milliliters" },
  plate: { isMl: false, unit: "Gram"        },
  glass: { isMl: true,  unit: "Milliliters" },
  piece: { isMl: false, unit: "Gram"        },
  cup:   { isMl: true,  unit: "Milliliters" },
};
const PORTION_SUBLABELS = {
  bowl:  { small: "~150 ml", medium: "~250 ml", large: "~400 ml" },
  plate: { small: "~200 g",  medium: "~350 g",  large: "~500 g"  },
  glass: { small: "~150 ml", medium: "~250 ml", large: "~350 ml" },
  piece: { small: "~30 g",   medium: "~60 g",   large: "~100 g"  },
  cup:   { small: "~150 ml", medium: "~240 ml", large: "~350 ml" },
};
const AMBIGUOUS_UNITS = new Set(["Bowl", "Plate", "Glass", "Piece", "Cup"]);

const PortionSelector = ({ item, index, handleFoodChange }) => {
  const [portionSize, setPortionSize] = useState("medium");
  const [useExact, setUseExact]       = useState(false);
  const [exactVal, setExactVal]       = useState("");

  const unitLower       = (item.unit || "").toLowerCase();
  const showPortionBox  = AMBIGUOUS_UNITS.has(item.unit) && !useExact;
  const portionData     = PORTION_MAP[unitLower];
  const portionUnitInfo = PORTION_UNIT_TYPE[unitLower] || { isMl: false, unit: "Gram" };
  const exactUnitLabel  = portionUnitInfo.isMl ? "ml" : "g";

  useEffect(() => {
    setUseExact(false);
    setExactVal("");
    setPortionSize("medium");
    const p     = PORTION_MAP[unitLower]?.medium;
    const uInfo = PORTION_UNIT_TYPE[unitLower] || { isMl: false, unit: "Gram" };
    if (p) {
      handleFoodChange(index, "portionValue",    p);
      handleFoodChange(index, "portionUnit",     uInfo.unit);
      handleFoodChange(index, "original_unit",   item.unit);
    } else {
      handleFoodChange(index, "portionValue", null);
      handleFoodChange(index, "portionUnit",  null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.unit]);

  const handlePortionSize = (s) => {
    setPortionSize(s);
    const g     = PORTION_MAP[unitLower]?.[s];
    const uInfo = PORTION_UNIT_TYPE[unitLower] || { isMl: false, unit: "Gram" };
    if (g) {
      handleFoodChange(index, "portionValue",      g);
      handleFoodChange(index, "portionUnit",       uInfo.unit);
      handleFoodChange(index, "original_unit",     item.unit);
      handleFoodChange(index, "original_quantity", item.quantity);
    }
  };

  const handleExactSwitch = () => {
    setUseExact(true);
    handleFoodChange(index, "portionValue", null);
    handleFoodChange(index, "portionUnit",  null);
  };

  const handleExactInput = (val) => {
    setExactVal(val);
    handleFoodChange(index, "portionValue", val);
    const uInfo = PORTION_UNIT_TYPE[unitLower] || { isMl: false, unit: "Gram" };
    handleFoodChange(index, "portionUnit", uInfo.unit);
  };

  const handleExactBack = () => { setUseExact(false); setExactVal(""); };

  if (!showPortionBox && !useExact) return null;

  return (
    <AnimatePresence>
      {showPortionBox && portionData && (
        <motion.div
          key="portion-selector"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="rounded-xl border-2 border-dashed border-[var(--color-primary-subtle,rgba(255,107,53,0.3))] bg-[var(--color-primary-bg-subtle,#fff8f5)] p-3"
        >
          <p className="text-xs font-semibold text-[var(--color-primary)] mb-2">
            📐 Select portion size
          </p>
          <div className="flex gap-2 mb-2">
            {["small", "medium", "large"].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => handlePortionSize(s)}
                className={`flex-1 py-2 rounded-xl border-2 text-center transition-all duration-200 font-semibold text-xs
                  ${portionSize === s
                    ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-text-on-primary)] shadow-md"
                    : "bg-white border-[var(--color-border-default)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]"
                  }`}
              >
                <span className="block capitalize">{s}</span>
                <span className="block text-xs font-normal mt-0.5 opacity-75">
                  {PORTION_SUBLABELS[unitLower]?.[s] || ""}
                </span>
              </button>
            ))}
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">
            Prefer exact {exactUnitLabel}?{" "}
            <span onClick={handleExactSwitch} className="text-[var(--color-primary)] underline cursor-pointer font-semibold">
              Enter exact {exactUnitLabel} →
            </span>
          </p>
        </motion.div>
      )}
      {useExact && (
        <motion.div
          key="exact-input"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="flex items-center gap-3 flex-wrap rounded-xl border-2 border-green-500 bg-green-50 p-3"
        >
          <label className="text-xs font-medium text-[var(--color-text-muted)]">
            Exact {exactUnitLabel}:
          </label>
          <input
            type="number"
            min="1"
            value={exactVal}
            onChange={e => handleExactInput(e.target.value)}
            className="w-20 text-center border-2 border-green-500 rounded-lg px-2 py-1.5 text-green-700 font-bold bg-white focus:outline-none"
          />
          <span className="text-xs text-[var(--color-text-muted)]">{exactUnitLabel}</span>
          <button
            type="button"
            onClick={handleExactBack}
            className="ml-auto text-xs text-[var(--color-primary)] underline cursor-pointer font-medium bg-transparent border-none"
          >
            ← back
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
// ── Changed by Rishika - End ──

const NutrientDetail = ({ icon: Icon, label, value, unit, colorClass }) => {
  if (value === null || value === undefined) return null;
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 },
      }}
      className="flex items-center justify-between text-sm"
    >
      <div className={`flex items-center gap-2 text-sm text-[var(--color-text-muted)] ${colorClass}`}>
        <Icon size={16} className="opacity-80" />
        <span>{label}</span>
      </div>
      <span className="font-bold text-base text-[var(--color-text-strong)]">
        {parseFloat(value).toFixed(1)}
        <span className="text-xs font-normal text-[var(--color-text-muted)] ml-1">{unit}</span>
      </span>
    </motion.div>
  );
};

// ── Changed by Rishika - Start ──
// SmartTooltip: automatically positions above or below card based on available screen space
const SmartTooltip = ({ meal, tooltipVariants }) => {
  const ref = useRef(null);
  const [showAbove, setShowAbove] = useState(false);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      // Tooltip height is ~220px — if less space below, show above
      const spaceBelow = window.innerHeight - rect.bottom;
      setShowAbove(spaceBelow < 220);
    }
  }, []);

  return (
    <motion.div
      ref={ref}
      variants={tooltipVariants}
      className={`absolute ${
        showAbove ? "bottom-full mb-2" : "top-full mt-2"
      } left-1/2 -translate-x-1/2 w-72 p-4 bg-[var(--color-warning-bg-subtle)] backdrop-blur-sm border border-[var(--color-border-default)] rounded-xl shadow-2xl z-50 pointer-events-none`}
    >
      <motion.div variants={{ visible: { transition: { staggerChildren: 0.04 } } }}>
        <div className="flex items-baseline justify-between pb-2 mb-2 border-b border-dashed border-[var(--color-border-default)]">
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-[var(--color-warning-text)]" />
            <h4 className="font-bold text-base text-[var(--color-text-strong)]">Calories</h4>
          </div>
          <p className="font-extrabold text-2xl text-[var(--color-warning-text)]">
            {parseFloat(meal.calories).toFixed(0) || 0}
            <span className="text-sm font-medium text-[var(--color-text-muted)] ml-1">kcal</span>
          </p>
        </div>
        <NutrientDetail icon={Beef}    label="Protein" value={meal.protein} unit="g" colorClass="text-[var(--color-info-text)]" />
        <NutrientDetail icon={Wheat}   label="Carbs"   value={meal.carbs}   unit="g" colorClass="text-[var(--color-success-text)]" />
        <NutrientDetail icon={Droplet} label="Fats"    value={meal.fats}    unit="g" colorClass="text-[var(--color-accent-3-text)]" />
        <hr className="my-1.5 border-dashed border-[var(--color-border-default)]/50" />
        <NutrientDetail icon={Candy} label="Sugar" value={meal.sugar} unit="g" />
        <NutrientDetail icon={Leaf}  label="Fiber" value={meal.fiber} unit="g" />
      </motion.div>
    </motion.div>
  );
};

// MealCard: reusable card component used in both All view and filtered view
const MealCard = ({ meal, style, handleEditMeal, handleDeleteMeal, tooltipVariants }) => (
  <motion.li
    initial="hidden"
    whileHover="visible"
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
    layout
    className={`group flex items-center gap-4 p-3 rounded-lg border-2 shadow-sm relative transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-px ${
      style?.border || "border-[var(--color-border-default)]"
    }`}
    style={{ zIndex: 0 }}
    onMouseEnter={(e) => (e.currentTarget.style.zIndex = 10)}
    onMouseLeave={(e) => (e.currentTarget.style.zIndex = 0)}
  >
    <div className={`p-3 rounded-full text-xl transition-transform group-hover:scale-110 ${style?.bg} ${style?.iconColor}`}>
      <FaUtensils />
    </div>
    <div className="flex-1 truncate">
      <p className="font-semibold text-[var(--color-text-strong)] text-base truncate">{meal.food_name_display}</p>
      <p className="text-sm text-[var(--color-text-default)] capitalize">
        {meal.meal_type || "Meal"} • {meal.quantity} {meal.unit}
        {meal.consumed_at && (
          <span className="text-[var(--color-text-muted)]">
            {' • '}{new Date(meal.consumed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </p>
      {meal.remarks && (
        <p className="text-sm italic text-[var(--color-primary)] mt-1 truncate">"{meal.remarks}"</p>
      )}
    </div>

    {/* Smart tooltip auto-positions above or below based on screen space */}
    <SmartTooltip meal={meal} tooltipVariants={tooltipVariants} />

    <div className="text-right flex items-center gap-6">
      <button
        onClick={() => handleEditMeal(meal)}
        className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors p-1 rounded-full hover:bg-[var(--color-primary-bg-subtle)]"
        title="Edit"
      >
        <FilePenLine size={16} />
      </button>
      <button
        onClick={() => handleDeleteMeal(meal.id)}
        className="text-[var(--color-text-muted)] hover:text-[var(--color-danger-text)] transition-colors p-1 rounded-full hover:bg-[var(--color-danger-bg-subtle)]"
        title="Remove"
      >
        <Trash2 size={16} />
      </button>
    </div>
  </motion.li>
);
// ── Changed by Rishika - End ──

const QuickMealLogger = ({ onMealLogged }) => {
  const {
    foodInputs,
    handleFoodChange,
    addFoodField,
    removeFoodField,
    unitOptions,
    handleSubmit,
    loggedMeals,
    handleDeleteMeal,
    searchDate,
    setSearchDate,
    searchByDate,
    isSubmitting,
    isFetching,
    addItem,
    editingMeal,
    handleEditMeal,
    cancelEdit,
  } = useMealLogger();

  const mealTypeMap = {
    "Early-Morning": "Early-Morning",
    Breakfast: "Breakfast",
    "Mid-Morning Snack": "Mid-Morning Snack",
    Lunch: "Lunch",
    "Afternoon Snack": "Afternoon Snack",
    Dinner: "Dinner",
    Bedtime: "Bedtime",
  };

  const navigate = useNavigate();

  const handleNavigateToDetailedLog = () => {
    navigate('/dashboard/tools/meal-log');
  };

  const mealTypeStyles = {
    "early-morning": { border: "border-[var(--color-accent-1-text)]", bg: "bg-[var(--color-accent-1-bg-subtle)]", iconColor: "text-[var(--color-accent-1-text)]" },
    breakfast: { border: "border-[var(--color-success-text)]", bg: "bg-[var(--color-success-bg-subtle)]", iconColor: "text-[var(--color-success-text)]" },
    "mid-morning snack": { border: "border-[var(--color-accent-2-text)]", bg: "bg-[var(--color-accent-2-bg-subtle)]", iconColor: "text-[var(--color-accent-2-text)]" },
    lunch: { border: "border-[var(--color-warning-text)]", bg: "bg-[var(--color-warning-bg-subtle)]", iconColor: "text-[var(--color-warning-text)]" },
    "afternoon snack": { border: "border-[var(--color-accent-3-text)]", bg: "bg-[var(--color-accent-3-bg-subtle)]", iconColor: "text-[var(--color-accent-3-text)]" },
    dinner: { border: "border-[var(--color-danger-text)]", bg: "bg-[var(--color-danger-bg-subtle)]", iconColor: "text-[var(--color-danger-text)]" },
    bedtime: { border: "border-[var(--color-info-text)]", bg: "bg-[var(--color-info-bg-subtle)]", iconColor: "text-[var(--color-info-text)]" },
  };

  const getLocalDateInputFormat = (date) => {
    return new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  };

  const getCanonicalMealType = (type) => {
    if (!type) return "Uncategorized";
    const cleanedType = type.trim();
    if (cleanedType === "Early Morning Snack" || cleanedType === "Early-Morning ") {
      return "Early-Morning";
    }
    return cleanedType;
  };

  const groupedMeals = useMemo(() => {
    if (!loggedMeals) return {};
    return loggedMeals.reduce((acc, meal) => {
      const type = getCanonicalMealType(meal.meal_type);
      if (!acc[type]) acc[type] = [];
      acc[type].push(meal);
      return acc;
    }, {});
  }, [loggedMeals]);

  const mealOrder = ["Early-Morning", "Breakfast", "Mid-Morning Snack", "Lunch", "Afternoon Snack", "Dinner", "Bedtime"];

  const [activeMealType, setActiveMealType] = useState("All");
  const [categoryCurrentPage, setCategoryCurrentPage] = useState(1);
  const [openMeals, setOpenMeals] = useState({});

  const toggleMeal = (type) => {
    setOpenMeals(prev => ({ ...prev, [type]: !prev[type] }));
  };

  useEffect(() => {
    setCategoryCurrentPage(1);
  }, [activeMealType, searchDate]);

  const currentViewData = useMemo(() => {
    const itemsPerPage = 5;
    const sourceArrayUnsorted = activeMealType === "All" ? loggedMeals : groupedMeals[activeMealType] || [];
    const sourceArray = [...sourceArrayUnsorted].sort((a, b) => new Date(b.consumed_at) - new Date(a.consumed_at));
    const totalItems = sourceArray.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (categoryCurrentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = sourceArray.slice(startIndex, endIndex);
    return { pageItems, currentPage: categoryCurrentPage, totalPages, totalItems };
  }, [activeMealType, loggedMeals, groupedMeals, categoryCurrentPage]);

  const tooltipVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut",
        staggerChildren: 0.04,
      },
    },
  };

  return (
    <section className="w-full bg-[var(--color-bg-app)] px-6 sm:px-12 py-16 font-[var(--font-secondary)]">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-12">
          <h2 className="text-center text-2xl sm:text-3xl font-[var(--font-primary)] font-bold text-[var(--color-text-strong)]">Quick Meal Logger</h2>
          <p className="text-lg text-[var(--color-text-default)] mt-2">Track your nutrition smartly & simply</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:items-stretch">
          <motion.form
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={async (e) => {
              e.preventDefault();
              await handleSubmit(e);
              if (onMealLogged) onMealLogged();
            }}
            className="bg-[var(--color-bg-surface)] rounded-2xl p-6 shadow-xl border-2 border-[var(--color-border-default)]"
          >
            <div className="flex items-center gap-3 mb-6">
              <FaUtensils size={24} className="text-[var(--color-primary)]" />
              <h3 className="text-xl font-semibold text-[var(--color-text-strong)]">{editingMeal ? "Edit Meal" : "Add Meals"}</h3>
            </div>

            <AnimatePresence>
              {foodInputs.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 space-y-3 border-t-2 border-dashed border-[var(--color-border-default)] pt-4 overflow-hidden"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <input type="text" value={item.name} onChange={(e) => handleFoodChange(index, "name", e.target.value)} placeholder={`Food ${index + 1}`} className="flex-1 bg-[var(--color-bg-app)] text-[var(--color-text-strong)] border-2 border-[var(--color-border-default)] rounded-lg px-3 py-2 text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition" required />
                    <input type="number" value={item.quantity} onChange={(e) => handleFoodChange(index, "quantity", e.target.value)} placeholder="Qty" className="w-20 bg-[var(--color-bg-app)] text-[var(--color-text-strong)] border-2 border-[var(--color-border-default)] rounded-lg px-2 py-2 text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition" />
                    {/* ── Changed by Rishika - Start ── */}
                    {/* Fix: Native select ki jagah custom UnitDropdown use kiya — sirf 5 items dikhenge */}
                    <div className="relative w-28">
                      <UnitDropdown
                        value={item.unit}
                        onChange={(val) => handleFoodChange(index, "unit", val)}
                      />
                    </div>
                    {/* ── Changed by Rishika - End ── */}
                  </div>
                  {/* ── Changed by Rishika - Start ── */}
                  <PortionSelector item={item} index={index} handleFoodChange={handleFoodChange} />
                  {/* ── Changed by Rishika - End ── */}
                  <input type="text" value={item.remark} onChange={(e) => handleFoodChange(index, "remark", e.target.value)} placeholder="Remark (optional)" className="w-full bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] text-[var(--color-text-strong)] rounded-lg px-3 py-2 text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition" />
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input type="date" value={item.logDate || ""} max={getLocalDateInputFormat(new Date())} onChange={(e) => handleFoodChange(index, "logDate", e.target.value)} className="flex-1 bg-[var(--color-bg-app)] text-[var(--color-text-strong)] border-2 border-[var(--color-border-default)] rounded-lg px-3 py-2 text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition" required />
                    <div className="flex-1">
                      <DatePicker
                        selected={item.logTime ? new Date(`1970-01-01T${item.logTime}`) : null}
                        onChange={(date) => {
                          const timeString = date ? date.toTimeString().slice(0, 5) : "";
                          handleFoodChange(index, "logTime", timeString);
                        }}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeCaption="Time"
                        dateFormat="h:mm aa"
                        className="w-full bg-[var(--color-bg-app)] text-[var(--color-text-strong)] border-2 border-[var(--color-border-default)] rounded-lg px-3 py-2 text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition"
                        placeholderText="Select time"
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm mb-2 font-medium text-[var(--color-text-default)]">Meal Type</label>
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(mealTypeMap).map(([label, value]) => (
                        <label key={value} className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border-2 transition-all duration-200 ${ item.mealType === value ? "bg-[var(--color-primary)] text-[var(--color-text-on-primary)] border-[var(--color-primary)]" : "border-[var(--color-border-default)] text-[var(--color-text-default)] bg-[var(--color-bg-app)] hover:border-[var(--color-primary)] hover:text-[var(--color-text-strong)]" }`}>
                          <input type="radio" name={`mealType-${item.id}`} value={value} checked={item.mealType === value} onChange={() => handleFoodChange(index, "mealType", value)} className="hidden" />
                          {label}
                        </label>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => addItem(index)}
                      className="flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] bg-transparent px-4 py-2 rounded-lg border-2 border-transparent hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-bg-subtle)] transition-all"
                    >
                      <Plus size={16} className="text-[var(--color-primary)]" /> Add Item
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {!editingMeal && (
              <div className="flex gap-4 mb-6">
                <button type="button" onClick={addFoodField} className="flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] bg-transparent px-4 py-2 rounded-lg border-2 border-transparent hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-bg-subtle)] transition-all">
                  <Plus size={16} /> Add Another Meal
                </button>
                {foodInputs.length > 1 && (
                  <button type="button" onClick={() => removeFoodField(foodInputs.length - 1)} className="flex items-center gap-2 text-sm font-semibold text-[var(--color-danger-text)] bg-transparent px-4 py-2 rounded-lg border-2 border-transparent hover:border-[var(--color-danger-border)] hover:bg-[var(--color-danger-bg-subtle)] transition-all">
                    <Trash2 size={16} /> Remove Last
                  </button>
                )}
              </div>
            )}
            <div className="flex justify-center gap-3 pt-4">
              {editingMeal && (
                <button type="button" onClick={cancelEdit} className="w-full sm:w-2/5 bg-transparent border-2 border-[var(--color-border-default)] text-[var(--color-text-strong)] hover:bg-[var(--color-bg-interactive-subtle)] px-6 py-3 rounded-full text-lg font-bold font-[var(--font-primary)] transition-all duration-300 flex items-center justify-center gap-2">
                  <X size={20} /> Cancel
                </button>
              )}
              <button type="submit" disabled={isSubmitting} className={`w-full ${ editingMeal ? "sm:w-3/5" : "" } ${ editingMeal ? "bg-[var(--color-success-bg)] text-[var(--color-success-text)] hover:bg-[var(--color-success-bg-hover)]" : "bg-[var(--color-primary)] text-[var(--color-text-on-primary)] hover:bg-[var(--color-primary-hover)]" } px-6 py-3 rounded-full text-lg font-bold font-[var(--font-primary)] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}>
                {isSubmitting ? ( <span className="flex items-center justify-center gap-2"><Loader className="animate-spin" />{editingMeal ? "Updating..." : "Logging..."}</span> ) : ( <span className="flex items-center justify-center gap-2">{editingMeal ? <FilePenLine /> : <Plus />}{editingMeal ? "Update Meal" : "Log Meal(s)"}</span> )}
              </button>
            </div>
          </motion.form>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-[var(--color-bg-surface)] rounded-2xl p-6 shadow-xl border-2 border-[var(--color-border-default)]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-[var(--color-text-strong)] font-[var(--font-primary)]">Logged Meals</h3>
              <motion.button
                onClick={handleNavigateToDetailedLog}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] bg-transparent px-3 py-2 rounded-lg border-2 border-transparent hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-bg-subtle)] transition-all"
                title="View the detailed meal log page"
              >
                <ExternalLink size={16} />
                <span>View Full Log</span>
              </motion.button>
            </div>
            <div className="mb-6 bg-[var(--color-bg-interactive-subtle)] p-4 rounded-lg">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
                <input type="date" value={searchDate} max={getLocalDateInputFormat(new Date())} onChange={(e) => { const newDate = e.target.value; setSearchDate(newDate); searchByDate(newDate); }} className="w-full bg-[var(--color-bg-surface)] border-2 border-[var(--color-border-default)] rounded-lg pl-10 pr-4 py-2 text-[var(--color-text-default)] focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
              </div>
            </div>
            {isFetching ? (
              <div className="flex items-center justify-center p-6 text-center text-[var(--color-text-muted)] gap-2"><Loader className="animate-spin" />Loading meals...</div>
            ) : (
              <div>
                <div className="flex gap-2 flex-wrap pb-4 mb-4 border-b-2 border-[var(--color-border-default)]">
                  <button onClick={() => setActiveMealType("All")} className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 border-2 ${ activeMealType === "All" ? "bg-[var(--color-primary)] text-[var(--color-text-on-primary)] border-[var(--color-primary)]" : "bg-[var(--color-bg-interactive-subtle)] text-[var(--color-text-default)] border-transparent hover:border-[var(--color-primary)] hover:text-[var(--color-text-strong)]" }`}>
                    All ({loggedMeals.length})
                  </button>
                  {mealOrder.map((type) => {
                    const mealsInGroup = groupedMeals[type] || [];
                    const displayName = Object.keys(mealTypeMap).find((key) => mealTypeMap[key] === type) || type;
                    return (
                      <button key={type} onClick={() => setActiveMealType(type)} className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 border-2 ${ activeMealType === type ? "bg-[var(--color-primary)] text-[var(--color-text-on-primary)] border-[var(--color-primary)]" : "bg-[var(--color-bg-interactive-subtle)] text-[var(--color-text-default)] border-transparent hover:border-[var(--color-primary)] hover:text-[var(--color-text-strong)]" }`}>
                        {displayName} ({mealsInGroup.length})
                      </button>
                    );
                  })}
                </div>

                {loggedMeals.length === 0 ? (
                  <div className="text-[var(--color-text-default)] p-6 bg-[var(--color-bg-app)] rounded-xl border-2 border-dashed border-[var(--color-border-default)] text-center">
                    <p className="font-semibold">No meals logged for this date.</p>
                    <p className="text-sm">Use the form above to add a meal!</p>
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div key={activeMealType} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                      {currentViewData.pageItems.length > 0 ? (
                        activeMealType === "All" ? (
                          <div className="space-y-3">
                            {mealOrder.map((type) => {
                              const mealsInGroup = groupedMeals[type] || [];
                              if (mealsInGroup.length === 0) return null;
                              const isOpen = openMeals[type] || false;

                              return (
                                <div key={type} className="border-2 border-[var(--color-border-default)] rounded-xl shadow-sm overflow-visible">
                                  <button
                                    onClick={() => toggleMeal(type)}
                                    className="w-full flex justify-between items-center px-4 py-2 text-[var(--color-text-strong)] font-semibold bg-[var(--color-bg-interactive-subtle)] hover:bg-[var(--color-bg-surface)] transition-all rounded-xl"
                                  >
                                    <span>{type} ({mealsInGroup.length})</span>
                                    <ChevronDown size={18} className={`transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`} />
                                  </button>
                                  <AnimatePresence>
                                    {isOpen && (
                                      <motion.ul
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-2 space-y-2 overflow-visible"
                                      >
                                        {mealsInGroup.map((meal) => {
                                          const style = mealTypeStyles[type?.toLowerCase().trim()] || {};
                                          return (
                                            <MealCard
                                              key={meal.id}
                                              meal={meal}
                                              style={style}
                                              handleEditMeal={handleEditMeal}
                                              handleDeleteMeal={handleDeleteMeal}
                                              tooltipVariants={tooltipVariants}
                                            />
                                          );
                                        })}
                                      </motion.ul>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <ul className="space-y-3">
                            {currentViewData.pageItems.map((meal) => {
                              const style = mealTypeStyles[meal.meal_type?.toLowerCase().trim()] || {};
                              return (
                                <MealCard
                                  key={meal.id}
                                  meal={meal}
                                  style={style}
                                  handleEditMeal={handleEditMeal}
                                  handleDeleteMeal={handleDeleteMeal}
                                  tooltipVariants={tooltipVariants}
                                />
                              );
                            })}
                          </ul>
                        )
                      ) : (
                        <div className="text-[var(--color-text-default)] p-6 text-center">
                          <p className="font-semibold">No meals logged for this category.</p>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}

                {currentViewData.totalPages > 1 && (
                  <div className="flex justify-center items-center mt-6 space-x-2">
                    <button onClick={() => setCategoryCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentViewData.currentPage === 1} className="p-2 rounded-full border-2 border-[var(--color-border-default)] transition-all duration-300 enabled:hover:bg-[var(--color-bg-interactive-subtle)] enabled:hover:border-[var(--color-primary)] disabled:opacity-50"><ChevronLeft size={18} /></button>
                    <span className="text-sm text-[var(--color-text-default)] font-semibold">Page {currentViewData.currentPage} of {currentViewData.totalPages}</span>
                    <button onClick={() => setCategoryCurrentPage((prev) => Math.min(prev + 1, currentViewData.totalPages))} disabled={currentViewData.currentPage === currentViewData.totalPages} className="p-2 rounded-full border-2 border-[var(--color-border-default)] transition-all duration-300 enabled:hover:bg-[var(--color-bg-interactive-subtle)] enabled:hover:border-[var(--color-primary)] disabled:opacity-50"><ChevronRight size={18} /></button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default QuickMealLogger;