// src/components/dashboard/UseMealLogger.js

import { useEffect, useState, useCallback } from "react";
import { getMeals, createMeal, deleteMeal, getMealsByDate, patchMeal } from "../../../api/mealLog";
import { toast } from "react-hot-toast";
import { CheckCircle, AlertTriangle, CircleHelp } from "lucide-react";
import React from "react";

// ── Changed by Samruddhi - Start ──
// Auto meal type from time (central logic)
const getMealTypeFromTime = (time) => {
  if (!time) return "";
  const [hours] = time.split(":").map(Number);
  if (hours >= 5  && hours < 8)  return "Early-Morning";
  if (hours >= 8  && hours < 11) return "Breakfast";
  if (hours >= 11 && hours < 13) return "Mid-Morning Snack";
  if (hours >= 13 && hours < 16) return "Lunch";
  if (hours >= 16 && hours < 18) return "Afternoon Snack";
  if (hours >= 18 && hours < 21) return "Dinner";
  return "Bedtime";
};
// ── Changed by Samruddhi - End ──
const getLocalDateString = (date) => {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
};

const useMealLogger = () => {

  const getInitialFoodInput = () => ({
    id: Date.now(),
    name: "",
    unit: "",
    quantity: "",
    remark: "",
    logDate: '',
    logTime: '',
    mealType: 'Breakfast',
    portionValue: null,
    portionUnit: null,
    original_unit: "",
    original_quantity: "",
  });

  const [foodInputs, setFoodInputs] = useState([getInitialFoodInput()]);
  const [loggedMeals, setLoggedMeals] = useState([]);
  const [dailySummary, setDailySummary] = useState({ calories: 0, carbs: 0, protein: 0, fat: 0 });
  const [searchDate, setSearchDate] = useState(() => getLocalDateString(new Date()));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [editingMeal, setEditingMeal] = useState(null);

  // ── Changed by Rishika - Start ──
  // unitOptions: purani chhoti list thi, ab poori UNITS list use ho rahi hai
  // Yahi list MealLogger.jsx ke FoodRow unit dropdown mein bhi use hoti hai
  const unitOptions = [
    "Gram","Kilogram","Milliliters","Liters","Glass","Cup","Bowl",
    "Piece","Tbsp","Tsp","Slice","Plate","Handful","Pinch","Dash","Sprinkle","Other"
  ];
  // ── Changed by Rishika - End ──

  const mealTypeOptions = [
    "Early-Morning","Breakfast","Mid-Morning Snack",
    "Lunch","Afternoon Snack","Dinner","Bedtime"
  ];

  useEffect(() => {
    const updateDateAtMidnight = () => {
      const currentDateString = getLocalDateString(new Date());
      setSearchDate(currentDateString);
    };
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    const timeoutId = setTimeout(updateDateAtMidnight, msUntilMidnight + 1000);
    return () => clearTimeout(timeoutId);
  }, []);

  const fetchMeals = useCallback(async () => {
    setIsFetching(true);
    let allResults = [];
    try {
      let response = await getMealsByDate(searchDate);
      allResults = response.results || [];
      let nextUrl = response.next;
      while (nextUrl) {
        response = await getMeals(nextUrl);
        const newMeals = response.results || [];
        allResults.push(...newMeals);
        nextUrl = response.next;
      }
      setLoggedMeals(allResults);
    } catch (error) {
      toast.error("Could not fetch meals.", { icon: <AlertTriangle className="text-[var(--color-danger-text)]" /> });
      setLoggedMeals([]);
    } finally {
      setIsFetching(false);
    }
  }, [searchDate]);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  const searchByDate = useCallback((date) => {
    const newDate = date || getLocalDateString(new Date());
    setSearchDate(newDate);
  }, []);

  const addItem = (idx) => {
    setFoodInputs(prev => {
      const current = prev[idx];
      const newItem = {
        id: Date.now(),
        name: "",
        quantity: "",
        unit: "",
        remark: "",
        logDate: current.logDate,
        logTime: current.logTime,
        mealType: current.mealType,
      };
      return [...prev, newItem];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    const allInputs = foodInputs.filter(
      input => input.name && input.quantity && input.unit && input.logDate && input.logTime
    );
    if (allInputs.length === 0) {
      toast.error("Please fill at least one complete food item including date and time.");
      setIsSubmitting(false);
      return;
    }

    try {
      if (editingMeal) {
        const input = allInputs[0];
        const consumedAt = new Date(`${input.logDate}T${input.logTime}:00`).toISOString();

        // ── Changed by Rishika - Start ──
        // portionValue valid hai to use karo (portion selector se aaya)
        // warna original quantity/unit bhejo backend ko
        const hasPortion = input.portionValue != null && input.portionValue !== "" && !isNaN(parseFloat(input.portionValue));
        const finalQty   = hasPortion ? parseFloat(input.portionValue) : parseFloat(input.quantity);
        const finalUnit  = hasPortion ? (input.portionUnit || input.unit) : input.unit;
        // original_unit aur original_quantity — display ke liye save karo
        const originalUnit = input.original_unit || input.unit;
        const originalQty  = input.original_quantity || input.quantity;
        // ── Changed by Rishika - End ──

        await patchMeal(editingMeal.id, {
          food_name: input.name,
          quantity: finalQty,
          unit: finalUnit,
          meal_type: input.mealType,
          remarks: input.remark,
          date: input.logDate,
          consumed_at: consumedAt,
          // ── Changed by Rishika - Start ──
          original_unit: originalUnit,
          original_quantity: originalQty,
          // ── Changed by Rishika - End ──
        }, token);

        toast.success("Meal updated successfully!", {
          icon: <CheckCircle className="text-[var(--color-success-text)]" />
        });
        setEditingMeal(null);

      } else {
        for (const input of allInputs) {
          const consumedAt = new Date(`${input.logDate}T${input.logTime}:00`).toISOString();

          // ── Changed by Rishika - Start ──
          const hasPortion = input.portionValue != null && input.portionValue !== "" && !isNaN(parseFloat(input.portionValue));
          const finalQty   = hasPortion ? parseFloat(input.portionValue) : parseFloat(input.quantity);
          const finalUnit  = hasPortion ? (input.portionUnit || input.unit) : input.unit;
          const originalUnit = input.original_unit || input.unit;
          const originalQty  = input.original_quantity || input.quantity;
          // ── Changed by Rishika - End ──

          await createMeal({
            food_name: input.name,
            quantity: finalQty,
            unit: finalUnit,
            meal_type: input.mealType,
            remarks: input.remark,
            date: input.logDate,
            consumed_at: consumedAt,
            // ── Changed by Rishika - Start ──
            original_unit: originalUnit,
            original_quantity: originalQty,
            // ── Changed by Rishika - End ──
          }, token);
        }
        toast.success(`${allInputs.length} Meal(s) logged successfully!`, {
          icon: <CheckCircle className="text-[var(--color-success-text)]" />
        });
      }

      await fetchMeals();
      setFoodInputs([getInitialFoodInput()]);

    } catch (err) {
      toast.error("Failed to save meal(s).", {
        icon: <AlertTriangle className="text-[var(--color-danger-text)]" />
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditMeal = (meal) => {
    setEditingMeal(meal);
    setFoodInputs([{
      id: meal.id,
      name: meal.food_name_display || meal.food_name || "",
      quantity: meal.quantity,
      unit: meal.unit,
      remark: meal.remarks,
      logDate: meal.date,
      logTime: new Date(meal.consumed_at).toTimeString().slice(0, 5),
      mealType: meal.meal_type,
    }]);
  };

  const cancelEdit = () => {
    setEditingMeal(null);
    setFoodInputs([getInitialFoodInput()]);
  };

  // ── Changed by Rishika - Start ──
  // Auto update meal type when time changes + field update
  const handleFoodChange = (idx, field, value) => {
    setFoodInputs(prev =>
      prev.map((input, i) => {
        if (i !== idx) return input;
        const updated = { ...input, [field]: value };
        if (field === "logTime") {
          updated.mealType = getMealTypeFromTime(value);
        }
        return updated;
      })
    );
  };
  // ── Changed by Rishika - End ──
  const addFoodField = () => {
    setFoodInputs(prev => [...prev, getInitialFoodInput()]);
  };

  const removeFoodField = (index) => {
    setFoodInputs(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteMeal = async (id) => {
    if (!id) return toast.error("Invalid meal ID.");
    try {
      const token = localStorage.getItem("token");
      await deleteMeal(id, token);
      toast("Meal removed.", { icon: <CircleHelp className="text-[var(--color-text-default)]" /> });
      await fetchMeals();
    } catch (error) {
      toast.error("Failed to delete meal.", {
        icon: <AlertTriangle className="text-[var(--color-danger-text)]" />
      });
    }
  };

  return {
    foodInputs, handleFoodChange, addFoodField, removeFoodField,
    mealTypeOptions, handleSubmit, unitOptions,
    loggedMeals, addItem,
    handleDeleteMeal, dailySummary, searchDate,
    setSearchDate, searchByDate, isSubmitting, isFetching,
    editingMeal, handleEditMeal, cancelEdit,
  };
};

export default useMealLogger;