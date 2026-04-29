// src/pages/dashboard/tools/NutritionSearch.jsx

import React, { useState } from "react";
import { searchFoodNutrition } from "../../../api/nutritionApi";
import {
  Search,
  Loader,
  ClipboardList,
  AlertTriangle,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Vegan,
  Drumstick,
  ListOrdered,
  Sparkles,
  BrainCircuit,
  BarChart3,
  Zap,
  TrendingUp,
  Gauge,
  FlaskConical,
  ShieldAlert,
  Clock,
  Leaf,
} from "lucide-react";

// --- Themed & Enhanced Helper Components ---
const FeatureCard = ({ icon, title, description, delay }) => (
  <div
    className="bg-[var(--color-bg-surface)] p-6 rounded-2xl border-2 border-[var(--color-border-default)] shadow-lg transform-gpu transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 group animate-fade-in-up"
    style={{ animationDelay: delay }}
  >
    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-[var(--color-primary-bg-subtle)] mb-4 transition-transform duration-300 group-hover:scale-110">
      {React.cloneElement(icon, {
        className: "text-[var(--color-primary)] h-6 w-6",
      })}
    </div>
    <h3 className="text-lg font-[var(--font-primary)] font-bold text-[var(--color-text-strong)] mb-2">
      {title}
    </h3>
    <p className="text-sm text-[var(--color-text-default)] leading-relaxed">
      {description}
    </p>
  </div>
);

const NutritionCard = ({
  label,
  value,
  unit,
  icon,
  accentColorClass,
  delay,
  isPopup, // Prop to adjust styling
}) => (
  <div
    className="group relative bg-[var(--color-bg-surface)] rounded-xl p-4 border-2 border-[var(--color-border-default)] shadow-lg transform-gpu transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1.5 animate-fade-in-up"
    style={{ animationDelay: delay }}
  >
    <div
      className={`absolute top-0 left-0 h-1.5 w-full rounded-t-lg opacity-70 group-hover:opacity-100 transition-opacity ${accentColorClass}`}
    />
    <div className="flex justify-between items-start mb-2">
      <span className="font-semibold text-sm text-[var(--color-text-strong)]">
        {label}
      </span>
      {icon &&
        React.cloneElement(icon, {
          className: `text-2xl transition-colors ${accentColorClass.replace(
            "bg-",
            "text-"
          )}`,
        })}
    </div>
    <div>
      <span
        className={`${
          isPopup ? 'text-3xl' : 'text-4xl'
        } font-bold ${accentColorClass.replace("bg-", "text-")}`}
      >
        {typeof value === "number"
          ? value.toFixed(value < 10 ? 1 : 0)
          : value || "0"}
      </span>
      <span className="text-sm font-medium text-[var(--color-text-default)] ml-1.5">
        {unit}
      </span>
    </div>
  </div>
);

const DetailRow = ({ label, value, unit = "" }) => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    (typeof value === "number" && isNaN(value))
    
  )
    return null;
  return (
    <div className="flex justify-between items-center py-2.5 px-3 rounded-md transition-colors duration-200 hover:bg-[var(--color-bg-interactive-subtle)] border-b-2 border-dashed border-[var(--color-border-default)] last:border-b-0">
      <span className="font-medium text-[var(--color-text-default)] text-sm">
        {label}
      </span>
      <span className="font-semibold text-[var(--color-text-strong)] text-sm">
        {typeof value === "number" ? value.toFixed(1) : value}
        {unit && (
          <span className="text-[var(--color-text-muted)] ml-1.5">{unit}</span>
        )}
      </span>
    </div>
  );
};

const InsightPill = ({ icon, label, value }) => {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0 bg-[var(--color-primary-bg-subtle)] text-[var(--color-primary)] rounded-full p-1.5">
        {icon}
      </div>
      <div>
        <p className="text-xs text-[var(--color-text-default)]">{label}</p>
        <p className="text-sm font-semibold text-[var(--color-text-strong)] capitalize">
          {Array.isArray(value) ? value.join(", ") : value}
        </p>
      </div>
    </div>
  );
};

const NutritionSearch = ({ isPopup = false }) => {
  const [foodItem, setFoodItem] = useState("");
  const [nutritionData, setNutritionData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const safeParseList = (list) => {
    if (!list) return [];
    if (Array.isArray(list)) return list;
    if (typeof list === "string") {
      try {
        const parsed = JSON.parse(list.replace(/'/g, '"'));
        return Array.isArray(parsed) ? parsed : [list];
      } catch (e) {
        return [list];
      }
    }
    return [];
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setNutritionData(null);
    setError(null);
    if (!foodItem.trim()) {
      setError("Please enter a food name to search.");
      return;
    }
    setIsLoading(true);
    try {
      const data = await searchFoodNutrition(foodItem);
      if (data && data.name) {
        setNutritionData(data);
      } else {
        setNutritionData(null);
        setError(
          `No detailed nutrition data found for "${foodItem}". Try another name or check spelling.`
        );
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const AnimationStyles = () => (
    <style>{`
      @keyframes fade-in-up { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
      .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
      @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
      .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
    `}</style>
  );

  return (
    <div
      className={`relative w-full ${
        isPopup ? "" : "min-h-screen bg-[var(--color-bg-app)]"
      } font-[var(--font-secondary)] overflow-x-hidden`}
    >
      
         {!isPopup && (
  <div className="animate-fade-in-up flex flex-col items-center justify-center text-center pt-10 mb-0" style={{ animationDelay: '100ms' }}>
    <h1 className="text-4xl sm:text-5xl font-[var(--font-primary)] font-extrabold mb-4 flex items-center justify-center gap-3 text-[var(--color-text-strong)]">
      <ClipboardList className="text-[var(--color-primary)]" />
      Nutrition Insights
    </h1>
    <p className="text-lg text-[var(--color-text-default)] max-w-2xl">
      Unlock the nutritional secrets of your food. Simple, fast, and accurate.
    </p>
  </div>
)}

      
      <AnimationStyles />
      <main
        className={`relative flex flex-col ${
          isPopup
            ? "p-2 "
            : "max-w-5xl mx-auto py-12 px-4 sm:px-6"
        } text-center `}
      >
        <div
          className="animate-fade-in-up"
          style={{ animationDelay: "100ms" }}
        ></div>

        <form
          onSubmit={handleSearch}
          className={`flex flex-col sm:flex-row gap-3 ${
            isPopup ? "mb-4" : "mb-10"
          } justify-center items-center animate-fade-in-up`}
          style={{ animationDelay: "250ms" }}
        >
          <div className="relative w-full max-w-lg">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
              size={20}
            />
            <input
              type="text"
              value={foodItem}
              placeholder="e.g., Avocado, Brown Rice"
              onChange={(e) => setFoodItem(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-[var(--color-border-default)] bg-[var(--color-bg-surface)] text-[var(--color-text-strong)] rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all duration-300 placeholder:text-[var(--color-text-muted)] shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-3 bg-[var(--color-primary)] text-[var(--color-text-on-primary)] font-semibold rounded-lg shadow-lg hover:shadow-xl hover:bg-[var(--color-primary-hover)] hover:-translate-y-0.5 active:scale-[0.98] transform transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:bg-opacity-50 disabled:shadow-none disabled:transform-none"
          >
            {isLoading ? (
              <Loader className="animate-spin" />
            ) : (
              <Search size={18} />
            )}
            <span>{isLoading ? "Searching..." : "Search"}</span>
          </button>
        </form>

        <div className={`mt-6 ${isPopup ? 'min-h-[200px]' : 'min-h-[400px]'}`}>
          {isLoading ? (
            <div className="p-4 rounded-lg text-base font-medium text-[var(--color-primary)] bg-[var(--color-primary-bg-subtle)] flex items-center justify-center gap-3">
              <Loader className="animate-spin text-xl" /> Loading...
            </div>
          ) : error ? (
            <div className="p-4 rounded-lg text-base font-medium text-[var(--color-danger-text)] bg-[var(--color-danger-bg-subtle)] flex items-center justify-center gap-3 animate-shake">
              <AlertTriangle className="text-xl" /> {error}
            </div>
          ) : nutritionData ? (
            <div
              className={`text-left bg-[var(--color-bg-surface)] ${
                isPopup ? "p-3" : "p-4 sm:p-6"
              } rounded-2xl border-2 border-[var(--color-border-default)] shadow-xl`}
            >
              <div
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6 pb-4 border-b-2 border-dashed border-[var(--color-border-default)] animate-fade-in-up"
                style={{ animationDelay: "100ms" }}
              >
                <h2
                  className={`${
                    isPopup ? "text-xl" : "text-2xl sm:text-3xl"
                  } font-[var(--font-primary)] font-bold text-[var(--color-text-strong)] flex items-center gap-3 capitalize`}
                >
                  {nutritionData.name}
                  {nutritionData.food_types?.some(ft => ft.name.toLowerCase() === "vegetarian") ? (
                    <Vegan
                      className="text-[var(--color-success-text)]"
                      title="Vegetarian"
                    />
                  ) : (
                    <Drumstick
                      className="text-[var(--color-danger-text)]"
                      title="Non-Vegetarian"
                    />
                  )}
                </h2>
                <p className="text-[var(--color-text-default)] font-medium text-sm">
                  Serving:{" "}
                  <span className="font-semibold text-[var(--color-text-strong)]">
                    {nutritionData.default_quantity}{" "}
                    {nutritionData.default_unit}
                  </span>{" "}
                  (
                  <span className="font-semibold text-[var(--color-text-strong)]">
                    {nutritionData.gram_equivalent?.toFixed(0)}g
                  </span>
                  )
                </p>
              </div>
              <section className="macro-nutrients mb-8">
                <div
                  className={`grid grid-cols-2 ${
                    !isPopup && "lg:grid-cols-4"
                  } gap-4`}
                >
                  <NutritionCard
                    label="Calories"
                    value={nutritionData.calories}
                    unit="kcal"
                    icon={<Flame />}
                    accentColorClass="bg-[var(--color-warning-text)]"
                    delay="200ms"
                    isPopup={isPopup}
                  />
                  <NutritionCard
                    label="Protein"
                    value={nutritionData.protein}
                    unit="g"
                    icon={<Beef />}
                    accentColorClass="bg-[var(--color-primary)]"
                    delay="300ms"
                    isPopup={isPopup}
                  />
                  <NutritionCard
                    label="Carbs"
                    value={nutritionData.carbs}
                    unit="g"
                    icon={<Wheat />}
                    accentColorClass="bg-[var(--color-accent-1-text)]"
                    delay="400ms"
                    isPopup={isPopup}
                  />
                  <NutritionCard
                    label="Fats"
                    value={nutritionData.fats}
                    unit="g"
                    icon={<Droplets />}
                    accentColorClass="bg-[var(--color-danger-text)]"
                    delay="500ms"
                    isPopup={isPopup}
                  />
                </div>
              </section>
              <div
                className={`grid grid-cols-1 ${
                  !isPopup && "lg:grid-cols-3"
                } gap-x-6 gap-y-8`}
              >
                <section
                  className="animate-fade-in-up"
                  style={{ animationDelay: "600ms" }}
                >
                  <h3 className="text-lg font-[var(--font-primary)] font-semibold text-[var(--color-text-strong)] mb-3 flex items-center gap-2">
                    <ListOrdered
                      size={20}
                      className="text-[var(--color-primary)]"
                    />{" "}
                    Detailed Breakdown
                  </h3>
                  <div className="space-y-1 bg-[var(--color-bg-app)] p-2 rounded-lg border-2 border-[var(--color-border-default)] shadow-sm">
                    <DetailRow
                      label="Sugar"
                      value={nutritionData.sugar}
                      unit="g"
                    />
                    <DetailRow
                      label="Fiber"
                      value={nutritionData.fiber}
                      unit="g"
                    />
                    <DetailRow
                      label="Saturated Fat"
                      value={nutritionData.saturated_fat_g}
                      unit="g"
                    />
                    <DetailRow
                      label="Trans Fat"
                      value={nutritionData.trans_fat_g}
                      unit="g"
                    />
                    <DetailRow
                      label="Glycemic Index (GI)"
                      value={nutritionData.estimated_gi}
                    />
                    <DetailRow
                      label="Glycemic Load (GL)"
                      value={nutritionData.glycemic_load}
                    />
                    <DetailRow
                      label="Cholesterol"
                      value={nutritionData.cholesterol_mg}
                      unit="mg"
                    />
                    <DetailRow
                      label="Sodium"
                      value={nutritionData.sodium_mg}
                      unit="mg"
                    />
                  </div>
                </section>
                <section
                  className="animate-fade-in-up"
                  style={{ animationDelay: "700ms" }}
                >
                  <h3 className="text-lg font-[var(--font-primary)] font-semibold text-[var(--color-text-strong)] mb-3 flex items-center gap-2">
                    <Leaf size={20} className="text-[var(--color-primary)]" />{" "}
                    Vitamins & Minerals
                  </h3>
                  <div className="space-y-1 bg-[var(--color-bg-app)] p-2 rounded-lg border-2 border-[var(--color-border-default)] shadow-sm">
                    <DetailRow
                      label="Potassium"
                      value={nutritionData.potassium_mg}
                      unit="mg"
                    />
                    <DetailRow
                      label="Iron"
                      value={nutritionData.iron_mg}
                      unit="mg"
                    />
                    <DetailRow
                      label="Calcium"
                      value={nutritionData.calcium_mg}
                      unit="mg"
                    />
                    <DetailRow
                      label="Magnesium"
                      value={nutritionData.magnesium_mg}
                      unit="mg"
                    />
                    <DetailRow
                      label="Zinc"
                      value={nutritionData.zinc_mg}
                      unit="mg"
                    />
                    <DetailRow
                      label="Selenium"
                      value={nutritionData.selenium_mcg}
                      unit="mcg"
                    />
                    <DetailRow
                      label="Iodine"
                      value={nutritionData.iodine_mcg}
                      unit="mcg"
                    />
                    <DetailRow
                      label="Omega-3"
                      value={nutritionData.omega_3_g}
                      unit="g"
                    />
                    <DetailRow
                      label="Vitamin D"
                      value={nutritionData.vitamin_d_mcg}
                      unit="mcg"
                    />
                    <DetailRow
                      label="Vitamin B12"
                      value={nutritionData.vitamin_b12_mcg}
                      unit="mcg"
                    />
                  </div>
                </section>
                <section
                  className="animate-fade-in-up"
                  style={{ animationDelay: "800ms" }}
                >
                  <h3 className="text-lg font-[var(--font-primary)] font-semibold text-[var(--color-text-strong)] mb-3 flex items-center gap-2">
                    <Sparkles
                      size={20}
                      className="text-[var(--color-primary)]"
                    />{" "}
                    Additional Insights
                  </h3>
                  <div className="grid grid-cols-1 gap-y-5 bg-[var(--color-bg-app)] p-4 rounded-lg border-2 border-[var(--color-border-default)] shadow-sm">
                    <InsightPill
                      icon={<Clock size={20} />}
                      label="Meal Type"
                      value={nutritionData.meal_types?.map(m => m.name)}
                    />
                    <InsightPill
                      icon={<TrendingUp size={20} />}
                      label="FODMAP"
                      value={nutritionData.fodmap_level}
                    />
                    <InsightPill
                      icon={<Gauge size={20} />}
                      label="Spice Level"
                      value={nutritionData.spice_level}
                    />
                    <InsightPill
                      icon={<FlaskConical size={20} />}
                      label="Purine Level"
                      value={nutritionData.purine_level}
                    />
                    <InsightPill
                      icon={<ShieldAlert size={20} />}
                      label="Allergens"
                      value={nutritionData.allergens?.map(a => a.name)}
                    />
                  </div>
                </section>
              </div>
            </div>
          ) : (
            isPopup ? (
              <div className="pt-8 text-center text-[var(--color-text-muted)]">
                <ClipboardList size={40} className="mx-auto mb-2 opacity-50"/>
                <p className="font-semibold">Search for a food to see details.</p>
              </div>
            ) : (
              <div className="text-left">
                <h2
                  className="text-2xl font-[var(--font-primary)] font-bold text-[var(--color-text-strong)] mb-6 text-center animate-fade-in-up"
                  style={{ animationDelay: "400ms" }}
                >
                  Discover More Than Just Calories
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FeatureCard
                    icon={<BarChart3 />}
                    title="Detailed Breakdown"
                    description="Go beyond macros. Get insights into micronutrients, glycemic index, and more."
                    delay="500ms"
                  />
                  <FeatureCard
                    icon={<BrainCircuit />}
                    title="Smart Insights"
                    description="Learn about FODMAP, spice levels, allergens, and other helpful classifications."
                    delay="650ms"
                  />
                  <FeatureCard
                    icon={<Zap />}
                    title="Fast & Intuitive"
                    description="A clean, modern interface designed to give you the information you need without the clutter."
                    delay="800ms"
                  />
                </div>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
};

export default NutritionSearch;