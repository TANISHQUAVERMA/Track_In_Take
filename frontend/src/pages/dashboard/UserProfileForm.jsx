// src/pages/user/UserProfileForm.jsx
// Samruddhi update

import React, { useState, useEffect } from "react";
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
} from "../../api/userProfile";
import { Toaster, toast } from "react-hot-toast";
import Select from "react-select";
import { motion } from "framer-motion";

// --- OPTIONS FOR DROPDOWNS ---
const countryOptions = [
  { value: "India", label: "India" },
  { value: "United States", label: "United States" },
  { value: "Canada", label: "Canada" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "Australia", label: "Australia" },
  { value: "Germany", label: "Germany" },
  { value: "Japan", label: "Japan" },
  { value: "Brazil", label: "Brazil" },
  { value: "South Africa", label: "South Africa" },
  { value: "United Arab Emirates", label: "United Arab Emirates" },
];

const allergyOptions = [
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



const activityLevels = [
  { value: "Sedentary", label: "Sedentary (little or no exercise)" },
  {
    value: "Lightly Active",
    label: "Lightly Active (light exercise/sports 1-3 days/week)",
  },
  {
    value: "Moderately Active",
    label: "Moderately Active (moderate exercise/sports 3-5 days/week)",
  },
  {
    value: "Very Active",
    label: "Very Active (hard exercise/sports 6-7 days a week)",
  },
  {
    value: "Extra Active",
    label: "Extra Active (very hard exercise/physical job)",
  },
];
const goals = [
  { value: "Lose Weight", label: "Lose Weight" },
  { value: "Maintain Weight", label: "Maintain Weight" },
  { value: "Gain Weight", label: "Gain Weight" },
];
const dietTypeOptions = [
  { value: "Vegetarian", label: "Vegetarian" },
  { value: "Non Vegetarian", label: "Non Vegetarian" },
  { value: "Vegan", label: "Vegan" },
  { value: "Eggetarian", label: "Eggetarian" },
  { value: "Keto", label: "Keto" },
  { value: "Other", label: "Other" },
];
const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

// --- THEMED STYLES FOR REACT-SELECT ---
const themedSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "var(--color-bg-app)",
    borderColor: state.isFocused
      ? "var(--color-primary)"
      : "var(--color-border-default)",
    borderWidth: "2px",
    boxShadow: "none",
    "&:hover": { borderColor: "var(--color-primary)" },
    borderRadius: "0.75rem",
    padding: "0.3rem",
    minHeight: "52px",
    transition: "border-color 0.2s ease-in-out",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "var(--color-primary)"
      : state.isFocused
      ? "var(--color-bg-interactive-subtle)"
      : "var(--color-bg-surface)",
    color: state.isSelected
      ? "var(--color-text-on-primary)"
      : "var(--color-text-strong)",
    "&:active": { backgroundColor: "var(--color-primary-hover)" },
    cursor: "pointer",
    fontWeight: "500",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "transparent", // Hide default placeholder to allow custom label to work
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "var(--color-text-strong)",
    fontWeight: "500",
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "var(--color-bg-surface)",
    border: "2px solid var(--color-border-default)",
    zIndex: 50,
  }),
};

// --- INITIAL FORM STATE STRUCTURE ---
const initialFormData = {
  date_of_birth: "",
  gender: "",
  height_cm: "",
  weight_kg: "",
  mobile_number: "",
  occupation: "",
  activity_level: "",
  goal: "",
  country: "",
  city: "",
  diet_type: "",
  allergies: "",
  is_diabetic: false,
  is_hypertensive: false,
  has_heart_condition: false,
  has_thyroid_disorder: false,
  has_arthritis: false,
  has_gastric_issues: false,
  other_chronic_condition: "",
  family_history: "",
    is_pregnant: false,
  is_breastfeeding: false,
  due_date: "",
};

const UserProfileForm = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        if (data && Object.keys(data).length > 1) {
          const profileData = {
            ...initialFormData,
            ...data,
            is_diabetic: !!data.is_diabetic,
            is_hypertensive: !!data.is_hypertensive,
            has_heart_condition: !!data.has_heart_condition,
            has_thyroid_disorder: !!data.has_thyroid_disorder,
            has_arthritis: !!data.has_arthritis,
            has_gastric_issues: !!data.has_gastric_issues,
              is_pregnant: !!data.is_pregnant, // ✅ use data, not formData
    is_breastfeeding: !!data.is_breastfeeding, // ✅ use data
    due_date: data.due_date || "", 
          };
          setFormData(profileData);
          setIsEditing(true);
        } else {
          setFormData(initialFormData);
          setIsEditing(false);
        }
      } catch (error) {
        console.log("No profile found. Ready to create a new one.");
        setFormData(initialFormData);
        setIsEditing(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // ✅ Simple required fields check
  for (const [key, value] of Object.entries(formData)) {
    if (
      (value === "" || value === null || value === undefined) &&
      key !== "other_chronic_condition" && // optional fields if you want
      key !== "family_history"&&
      key !== "due_date"  &&
      !(key === "is_pregnant" || key === "is_breastfeeding")
    ) {
      toast.error(`Please fill in the ${key.replace(/_/g, " ")} field.`);
      return;
    }
  }
    setLoading(true);
    try {
      const mappedData = {
        ...formData,
        height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
          is_pregnant: !!formData.is_pregnant,
  is_breastfeeding: !!formData.is_breastfeeding,
      };

      if (isEditing) {
        await updateUserProfile(mappedData);
        toast.success("Profile updated successfully! ✅");
      } else {
        await createUserProfile(mappedData);
        toast.success("🎉 Profile created successfully!");
        setIsEditing(true);
      }
    } catch (err) {
      console.error("Error:", err);
      const errorMessage =
        err.response?.data?.detail ||
        "Something went wrong. Please check your inputs.";
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // --- STYLES FOR FLOATING LABELS ---
  const baseInputStyles =
    "w-full px-4 py-3 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-xl focus:ring-0 focus:outline-none focus:border-[var(--color-primary)] transition-all duration-300 text-[var(--color-text-strong)]";
  
  const floatingLabelStyles = (hasValue, isFocused) =>
    `absolute left-4 z-10 pointer-events-none transition-all duration-200 bg-[var(--color-bg-app)] px-1 ${
      hasValue || isFocused
        ? 'top-0 -translate-y-1/2 text-xs text-[var(--color-primary)]'
        : 'top-1/2 -translate-y-1/2 text-base text-[var(--color-text-muted)]'
    }`;
  // ✅ Samruddhi ✨ required star helper
const requiredLabel = (text) => (
  <>
    {text} <span className="text-red-500">*</span>
  </>
);
  const [focusedField, setFocusedField] = useState(null);

  const medicalConditions = [
    { field: "is_diabetic", label: "Diabetic" },
    { field: "is_hypertensive", label: "Hypertensive" },
    { field: "has_heart_condition", label: "Heart Condition" },
    { field: "has_thyroid_disorder", label: "Thyroid Disorder" },
    { field: "has_arthritis", label: "Arthritis" },
    { field: "has_gastric_issues", label: "Gastric Issues" },
  ];

   useEffect(() => {
    window.scrollTo(0, 0);
  }, []); 

  return (
    <div className="max-w-4xl mx-auto my-10 bg-[var(--color-bg-surface)] py-10 px-6 sm:px-10 rounded-2xl shadow-2xl border-2 border-[var(--color-border-default)] font-[var(--font-secondary)] text-[var(--color-text-strong)]">
      <Toaster position="top-center" />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl sm:text-4xl font-[var(--font-primary)] font-bold text-[var(--color-primary)]">
          Personalize Your Profile
        </h2>
        <p className="text-md text-[var(--color-text-default)] mt-2">
          Help us understand your health and nutrition needs better.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          <h3 className="text-xl font-[var(--font-primary)] font-semibold text-[var(--color-text-strong)] border-b-2 border-dashed border-[var(--color-primary)]/20 pb-3">
            Personal Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="relative">
              <label className={floatingLabelStyles(formData.date_of_birth, focusedField === "date_of_birth")}>
  {requiredLabel("Date of Birth")}
</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth || ""}
                onChange={handleChange}
                onFocus={() => setFocusedField('date_of_birth')}
                onBlur={() => setFocusedField(null)}
                required
                className={baseInputStyles}
              />
            </div>

            <div className="relative" onFocus={() => setFocusedField('gender')} onBlur={() => setFocusedField(null)}>
<label className={floatingLabelStyles(formData.gender, focusedField === "gender")}>
  {requiredLabel("Gender")}
</label>              <Select
                styles={themedSelectStyles}
                options={genderOptions}
                required
                value={genderOptions.find((opt) => opt.value === formData.gender)}
                onChange={(selected) =>
                  setFormData({ ...formData, gender: selected.value })
                }
                placeholder=""
              />
            </div>
            
            <div className="relative">
<label className={floatingLabelStyles(formData.height_cm, focusedField === "height_cm")}>
  {requiredLabel("Height (cm)")}
</label>              <input
                type="number"
                name="height_cm"
                required
                value={formData.height_cm || ""}
                onChange={handleChange}
                onFocus={() => setFocusedField('height_cm')}
                onBlur={() => setFocusedField(null)}
                className={baseInputStyles}
              />
            </div>

            <div className="relative">
<label className={floatingLabelStyles(formData.weight_kg, focusedField === "weight_kg")}>
  {requiredLabel("Weight (kg)")}
</label>              <input
                type="number"
                name="weight_kg"
                required
                value={formData.weight_kg || ""}
                onChange={handleChange}
                onFocus={() => setFocusedField('weight_kg')}
                onBlur={() => setFocusedField(null)}
                className={baseInputStyles}
              />
            </div>

            <div className="relative">
<label className={floatingLabelStyles(formData.mobile_number, focusedField === "mobile_number")}>
  {requiredLabel("Mobile Number")}
</label>
              <input
                type="tel"
                name="mobile_number"
                required
                value={formData.mobile_number || ""}
                onChange={handleChange}
                onFocus={() => setFocusedField('mobile_number')}
                onBlur={() => setFocusedField(null)}
                className={baseInputStyles}
              />
            </div>

            <div className="relative">
<label className={floatingLabelStyles(formData.occupation, focusedField === "occupation")}>
  {requiredLabel("Occupation")}
</label>              <input
                name="occupation"
                required
                value={formData.occupation || ""}
                onChange={handleChange}
                onFocus={() => setFocusedField('occupation')}
                onBlur={() => setFocusedField(null)}
                className={baseInputStyles}
              />
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          <h3 className="text-xl font-[var(--font-primary)] font-semibold text-[var(--color-text-strong)] border-b-2 border-dashed border-[var(--color-primary)]/20 pb-3">
            Lifestyle & Goals
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="relative" onFocus={() => setFocusedField('activity_level')} onBlur={() => setFocusedField(null)}>
<label className={floatingLabelStyles(formData.activity_level, focusedField === "activity_level")}>
  {requiredLabel("Activity Level")}
</label>              <Select
                styles={themedSelectStyles}
                options={activityLevels}
                required
                value={activityLevels.find(
                  (opt) => opt.value === formData.activity_level
                )}
                onChange={(selected) =>
                  setFormData({ ...formData, activity_level: selected.value })
                }
                placeholder=""
              />
            </div>
            
            <div className="relative" onFocus={() => setFocusedField('goal')} onBlur={() => setFocusedField(null)}>
<label className={floatingLabelStyles(formData.goal, focusedField === "goal")}>
  {requiredLabel("Your Goal")}
</label>
              <Select
                styles={themedSelectStyles}
                options={goals}
                required
                value={goals.find((opt) => opt.value === formData.goal)}
                onChange={(selected) =>
                  setFormData({ ...formData, goal: selected.value })
                }
                placeholder=""
              />
            </div>
            
            <div className="relative" onFocus={() => setFocusedField('country')} onBlur={() => setFocusedField(null)}>
<label className={floatingLabelStyles(formData.country, focusedField === "country")}>
  {requiredLabel("Country")}
</label>              <Select
                styles={themedSelectStyles}
                options={countryOptions}
                required
                value={countryOptions.find(
                  (opt) => opt.value === formData.country
                )}
                onChange={(selected) =>
                  setFormData({ ...formData, country: selected.value })
                }
                placeholder=""
              />
            </div>
            <div className="relative">
              <label className={floatingLabelStyles(formData.city, focusedField === "city")}>
  {requiredLabel("City")}
</label>
              <input
                name="city"
                required
                value={formData.city || ""}
                onChange={handleChange}
                onFocus={() => setFocusedField('city')}
                onBlur={() => setFocusedField(null)}
                className={baseInputStyles}
              />
            </div>
            
            <div className="relative" onFocus={() => setFocusedField('diet_type')} onBlur={() => setFocusedField(null)}>
<label className={floatingLabelStyles(formData.diet_type, focusedField === "diet_type")}>
  {requiredLabel("Diet Type")}
</label>              <Select
                styles={themedSelectStyles}
                options={dietTypeOptions}
                required
                value={dietTypeOptions.find(
                  (opt) =>
                    opt.value.toLowerCase() === formData.diet_type?.toLowerCase()
                )}
                onChange={(selected) =>
                  setFormData({ ...formData, diet_type: selected.value })
                }
                placeholder=""
              />
            </div>

            <div className="sm:col-span-2 relative" onFocus={() => setFocusedField('allergies')} onBlur={() => setFocusedField(null)}>
 <label className={floatingLabelStyles(formData.allergies, focusedField === "allergies")}>
  {requiredLabel("Any food allergies?")}
</label>
  <Select
    styles={themedSelectStyles}
    options={allergyOptions}
    required
    value={allergyOptions.find(opt => opt.value === formData.allergies)}
    onChange={(selected) =>
      setFormData({ ...formData, allergies: selected.value })
    }
    placeholder=""
  />
</div>
</div>

        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-6"
        >
          <h3 className="text-xl font-[var(--font-primary)] font-semibold text-[var(--color-text-strong)] border-b-2 border-dashed border-[var(--color-primary)]/20 pb-3">
            Medical History
          </h3>
          <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm text-[var(--color-text-default)] font-medium">
            {medicalConditions.map(({ field, label }) => (
              <label
                key={field}
                className="flex items-center space-x-3 cursor-pointer p-2 rounded-md"
              >
                <input
                  type="checkbox"
                  name={field}
                  checked={!!formData[field]}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-[var(--color-border-default)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
          {formData.gender === "female" && (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-sm text-[var(--color-text-default)] font-medium">
    <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-md">
      <input
        type="checkbox"
        name="is_pregnant"
        checked={!!formData.is_pregnant}
        onChange={handleChange}
        className="h-4 w-4 rounded border-[var(--color-border-default)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
      />
      <span>Is Pregnant</span>
    </label>

    <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-md">
      <input
        type="checkbox"
        name="is_breastfeeding"
        checked={!!formData.is_breastfeeding}
        onChange={handleChange}
        className="h-4 w-4 rounded border-[var(--color-border-default)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
      />
      <span>Is Breastfeeding</span>
    </label>

    <div className="relative">
  <label
    className={floatingLabelStyles(formData.due_date, focusedField === 'due_date')}
  >
    Due Date
  </label>
  <input
    type="date"
    name="due_date"
    value={formData.due_date || ""}
    onChange={handleChange}
    onFocus={() => setFocusedField('due_date')}
    onBlur={() => setFocusedField(null)}
    className={`${baseInputStyles}  focus:text-[var(--color-text-strong)]`}
  />
</div>

  </div>
)}

          <div className="grid grid-cols-1 gap-6 pt-2">
            <div className="relative">
              <label className={floatingLabelStyles(formData.other_chronic_condition, focusedField === 'other_chronic_condition')}>Other chronic conditions (if any)</label>
              <input
                name="other_chronic_condition"
                value={formData.other_chronic_condition || ""}
                onChange={handleChange}
  
                onFocus={() => setFocusedField('other_chronic_condition')}
                onBlur={() => setFocusedField(null)}
                className={baseInputStyles}
              />
            </div>

        

            <div className="relative">
              <label className={floatingLabelStyles(formData.family_history, focusedField === 'family_history')}>Any relevant family medical history?</label>
              <input
                name="family_history"
                value={formData.family_history || ""}
                onChange={handleChange}
                
                onFocus={() => setFocusedField('family_history')}
                onBlur={() => setFocusedField(null)}
                className={baseInputStyles}
              />
            </div>
          </div>
        </motion.section>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-lg text-[var(--color-text-on-primary)] font-semibold bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:transform-none"
        >
          {loading
            ? "Saving..."
            : isEditing
            ? "Save Changes"
            : "Create My Profile"}
        </motion.button>
      </form>
    </div>
  );
};

export default UserProfileForm;