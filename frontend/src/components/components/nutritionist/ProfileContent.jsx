// src/pages/nutritionist/ProfileContent.js

import { FaHeart, FaLungs, FaBone, FaHamburger } from "react-icons/fa";
import { GiDrop, GiStomach } from "react-icons/gi";

// This file is the single source of truth for your profile structure and options.

export const activityLevels = [
  { value: "Sedentary", label: "Sedentary (little or no exercise)" },
  { value: "Lightly Active", label: "Lightly Active (light exercise/sports 1-3 days/week)" },
  { value: "Moderately Active", label: "Moderately Active (moderate exercise/sports 3-5 days/week)" },
  { value: "Very Active", label: "Very Active (hard exercise/sports 6-7 days a week)" },
  { value: "Extra Active", label: "Extra Active (very hard exercise/physical job)" },
];

export const goals = [
  { value: "Lose Weight", label: "Lose Weight" },
  { value: "Maintain Weight", label: "Maintain Weight" },
  { value: "Gain Weight", label: "Gain Weight" },
  
];

export const dietTypeOptions = [
  { value: "Vegetarian", label: "Vegetarian" },
  { value: "Non Vegetarian", label: "Non Vegetarian" },
  { value: "Vegan", label: "Vegan" },
  { value: "Eggetarian", label: "Eggetarian" },
  { value: "Keto", label: "Keto" },
  { value: "Other", label: "Other" },
];

export const allergyOptions = [
    { value: "Peanut", label: "Peanut" },
    { value: "Soy", label: "Soy" },
    { value: "Gluten", label: "Gluten" },
    { value: "Milk", label: "Milk" },
    { value: "Shellfish", label: "Shellfish" },
    { value: "Eggs", label: "Eggs" },
    { value: "Wheat", label: "Wheat" },
    { value: "Sesame", label: "Sesame" },
    { value: "Fish", label: "Fish" },
    { value: "None", label: "None" },
];

// [UPDATED] The full list of medical conditions for dynamic rendering
export const medicalConditions = [
    { field: "is_diabetic", label: "Diabetic", icon: GiDrop },
    { field: "is_hypertensive", label: "Hypertensive", icon: FaHeart },
    { field: "has_heart_condition", label: "Heart Condition", icon: FaHeart },
    { field: "has_thyroid_disorder", label: "Thyroid Disorder", icon: FaLungs },
    { field: "has_arthritis", label: "Arthritis", icon: FaBone },
    { field: "has_gastric_issues", label: "Gastric Issues", icon: GiStomach },
];

// [UPDATED] The complete structure for a patient profile.
export const PROFILE_STRUCTURE_TEMPLATE = {
  full_name: "",
  email: "",
  date_of_birth: "",
  gender: "",
  height_cm: "",
  weight_kg: "",
  goal: "",
  activity_level: "",
  diet_type: "",
  allergies: "",
  family_history: "",
  // All medical conditions initialized to false
  is_diabetic: false,
  is_hypertensive: false,
  has_heart_condition: false,
  has_thyroid_disorder: false,
  has_arthritis: false,
  has_gastric_issues: false,
};

// Reusable styles for react-select
// Reusable styles for react-select
export const themedSelectStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: "var(--color-bg-app)",
    borderColor: "var(--color-border-default)",
    borderWidth: "2px",
    boxShadow: "none",
    "&:hover": { borderColor: "var(--color-primary)" },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? "var(--color-primary)" : "var(--color-bg-surface)",
    "&:hover": { backgroundColor: "var(--color-bg-interactive-subtle)" },
  }),
  singleValue: (provided) => ({ ...provided, color: "var(--color-text-strong)" }),

  // [THE FIX IS HERE]
  menu: (provided) => ({ 
    ...provided, 
    backgroundColor: "var(--color-bg-surface)",
    zIndex: 9999, // Set a high z-index to ensure the menu appears above other elements
  }),
};