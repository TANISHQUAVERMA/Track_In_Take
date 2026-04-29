import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import Select from "react-select";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Replace your existing lucide-react imports with this single block
// At the top of PatientDetailsPage.jsx

// --- [CORRECTED] Consolidated lucide-react imports ---
import {
  Utensils, CalendarCheck, Flame, Zap, Wheat, Droplets, Leaf, Drumstick, Apple,
  Sandwich, Salad, Soup, FileDown, MessageSquare, Heart, Sun, Ban, Anchor, AlertTriangle,
} from "lucide-react";

// --- [CORRECTED] Complete react-icons/fa imports ---
import {
  FaUser, FaEnvelope, FaVenusMars, FaBirthdayCake, FaFileMedicalAlt, FaCheck,
  FaTimes, FaSave, FaPlus, FaThumbsUp, FaThumbsDown, FaBullseye, FaAllergies,
  FaChevronDown, FaSpinner, FaPencilAlt, FaTrashAlt, FaArchive, FaUndo
} from "react-icons/fa";

import {
  getPatientProfile,
  getPatientMeals,
  getDietByPatientId,
  editDiet,
  reviewDietPlan,
  submitFeedbackForML,
  generateDietPlan,
  getAllLabReports,
  getPatientMealsByDate,
  getTargetNutrients,
  getDailySummary,
  updateLabReport,
  updatePatientProfile,
  archiveDietPlan,
  restoreDietPlan
} from "../../../api/nutritionistApi";
import { PROFILE_STRUCTURE_TEMPLATE,goals,activityLevels,dietTypeOptions,themedSelectStyles, allergyOptions,        // <-- ADD THIS
  medicalConditions,  
 } from "./ProfileContent";
import { motion, AnimatePresence } from "framer-motion";
import NutriNavbar from "./NutriNavbar";
import QuickTools from "./QuickTools";
import NutritionPopup from "./NutritionPopup";
import SmartAssistant from "./SmartAssistant";


// --- All sub-components remain unchanged ---
const PulsingDotsLoader = ({ text = "Loading Patient Details..." }) => (
  <div className="flex flex-col items-center justify-center gap-6">
    <div className="flex items-center justify-center gap-3">
      <motion.div
        className="w-4 h-4 bg-[var(--color-primary)] rounded-full"
        animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="w-4 h-4 bg-[var(--color-accent-2-text)] rounded-full"
        animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2,
        }}
      />
      <motion.div
        className="w-4 h-4 bg-[var(--color-accent-3-text)] rounded-full"
        animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.4,
        }}
      />
    </div>
    <p className="text-lg text-[var(--color-text-default)] font-[var(--font-secondary)] tracking-wide">
      {text}
    </p>
  </div>
);

const ContentCard = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className={`bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] p-4 sm:p-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${className}`}
  >
    {children}
  </motion.div>
);

const MEAL_TYPE_API_MAPPING = {
  "early morning": "Early-Morning",
  "breakfast": "Breakfast",
  "mid morning snack": "Mid-Morning Snack",
  "lunch": "Lunch", // It's good practice to include all possible meals
  "afternoon snack": "Afternoon Snack",
  "dinner": "Dinner",
  "bedtime": "Bedtime",
};

const PatientDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [targetNutrients, setTargetNutrients] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [meals, setMeals] = useState([]);
  const [diets, setDiets] = useState([]);
  const [comment, setComment] = useState("");
  const [feedback, setFeedback] = useState("");
  const [editStates, setEditStates] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [allDietPlans, setAllDietPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [underlineStyle, setUnderlineStyle] = useState({});
  const tabRefs = useRef([]);
  const [activeDayPerDiet, setActiveDayPerDiet] = useState({});
  const [planOptions, setPlanOptions] = useState([]);
  const [editingDay, setEditingDay] = useState(null);
  const [deletingPlanId, setDeletingPlanId] = useState(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
const [editableProfile, setEditableProfile] = useState(null);
const [isSavingProfile, setIsSavingProfile] = useState(false);

const [isEditingReport, setIsEditingReport] = useState(false);
const [editableReport, setEditableReport] = useState(null);
const [isSavingReport, setIsSavingReport] = useState(false);

  // States for Meal Log tab
  const [filteredMeals, setFilteredMeals] = useState([]);
  const [selectedMealDate, setSelectedMealDate] = useState("");
  const [mealCurrentPage, setMealCurrentPage] = useState(1);
  const mealsPerPage = 5;
  const [activeLogDate, setActiveLogDate] = useState(null);
  const [isSearchingMeals, setIsSearchingMeals] = useState(false);
  const [dailySummaries, setDailySummaries] = useState({});
  const [loadingSummaries, setLoadingSummaries] = useState({});

  // States for Lab Reports tab
  const [allLabReportsHistory, setAllLabReportsHistory] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState("");
  const [labReports, setLabReports] = useState([]);
  const [loadingReport, setLoadingReport] = useState(false);
  const [isArchiving, setIsArchiving] = useState(null);

   console.log('[RENDER] Page rendering. Current "diets" state:', JSON.parse(JSON.stringify(diets)));

  // --- [CORRECTED] Sorting constant matching the backend model ---
  // --- [CORRECTED] Sorting constant matching the backend model ---
const DIET_PLAN_MEAL_ORDER = [
  "Early Morning",
  "Breakfast",
  "Mid Morning Snack",
  "Lunch",
  "Afternoon Snack",
  "Dinner",
  "Bedtime",
];

const MANDATORY_PROFILE_FIELDS = [
    'full_name',
    'date_of_birth',
    'gender',
    'height_cm',
    'weight_kg',
    'activity_level',
    'goal',
    'diet_type',
    'allergies'
  ];

  // [UPDATED] Check for profile completion (This is the new hard requirement for the button)
  const isProfileComplete = useMemo(() => {
  // First, handle the initial loading/error/placeholder states.
  if (!profile || profile.full_name === "New Patient (Profile Incomplete)" || profile.full_name === "Error Loading Patient") {
    return false;
  }

  // Now, check if every mandatory field has a valid, non-empty value.
  return MANDATORY_PROFILE_FIELDS.every(field => {
    const value = profile[field];
    // For numbers, we must allow 0. `!= null` checks for both null and undefined.
    if (typeof value === 'number') {
      return value != null;
    }
    // For strings and other types, a simple truthy check is fine (e.g., an empty string is falsy).
    return !!value; 
  });
}, [profile]);

  // [NEW] A separate check to see if lab reports exist (This will be used for showing messages)
  const hasLabReports = useMemo(() => {
    return labReports && labReports.length > 0;
  }, [labReports]);

  // --- [ENHANCED] Memoized logic for generating conditional suggestion cards ---
  const suggestionCards = useMemo(() => {
    const suggestions = [];
    const latestReport = labReports?.[0];

    if (!profile || !latestReport) return [];

    // --- The single theme for the hover state, now including title color ---
    const primaryHoverTheme = {
        border: 'group-hover:border-[var(--color-primary)]/70',
        iconBg: 'group-hover:bg-[var(--color-primary-bg-subtle)]',
        iconText: 'group-hover:text-[var(--color-primary)]',
        titleText: 'group-hover:text-[var(--color-primary)]', // <--- THE NEW ADDITION
    };
    
    // --- Suggestion 1: Diabetes / High Blood Sugar ---
    const isDiabeticCondition =
      profile.is_diabetic ||
      latestReport.hba1c > 6.5 ||
      latestReport.fasting_blood_sugar > 125;

    if (isDiabeticCondition) {
      suggestions.push({
        key: "diabetes", icon: <Leaf />, title: "Low Glycemic & Low Sugar",
        description: "Focus on complex carbs and fiber. Strictly avoid simple sugars and refined grains to manage blood glucose.",
        theme: primaryHoverTheme,
      });
    }

    // --- Suggestion 2: Heart Health / Cholesterol ---
    const isHeartCondition =
      profile.is_hypertensive ||
      latestReport.ldl_cholesterol > 130 ||
      latestReport.triglycerides > 150;

    if (isHeartCondition) {
      suggestions.push({
        key: "heart", icon: <Heart />, title: "Heart-Healthy Diet",
        description: "Prioritize soluble fiber, omega-3s, and healthy fats. Limit sodium and avoid saturated/trans fats.",
        theme: primaryHoverTheme,
      });
    }

    // --- Suggestion 3: Anemia / Low Iron ---
    if (latestReport.hemoglobin && latestReport.hemoglobin < 12) {
      suggestions.push({
        key: 'anemia', icon: <Anchor />, title: "Iron-Rich Diet",
        description: "Low hemoglobin detected. Increase intake of leafy greens, legumes, and lean red meat, paired with Vitamin C.",
        theme: primaryHoverTheme,
      });
    }

    // --- Suggestion 4: Weight Loss Goal ---
    if (profile.goal === "Lose Weight") {
      suggestions.push({
        key: "weightloss", icon: <FaBullseye />, title: "Calorie Deficit & High Protein",
        description: "Recommend a moderate calorie deficit (~300-500 kcal/day). Emphasize protein for satiety and muscle preservation.",
        theme: primaryHoverTheme,
      });
    }
    
    // --- Suggestion 5: High Uric Acid (Gout Risk) ---
    if (latestReport.uric_acid > 6.8) {
      suggestions.push({
        key: "gout", icon: <Ban />, title: "Low-Purine Diet Required",
        description: "High uric acid detected. Limit red meat, organ meats, certain seafood, and high-fructose corn syrup.",
        theme: primaryHoverTheme,
      });
    }

    // --- Suggestion 6: Vitamin Deficiency ---
    if (latestReport.vitamin_d3 < 20 || latestReport.vitamin_b12 < 200) {
      suggestions.push({
        key: 'vitamins', icon: <Sun />, title: "Focus on Vitamin-Rich Foods",
        description: "Low D3 or B12 detected. Recommend fortified foods, fatty fish, dairy, or potential supplementation.",
        theme: primaryHoverTheme,
      });
    }

    return suggestions;
  }, [profile, labReports]);
  const findLatestValidPlan = (allPlans) => {
    if (!allPlans || allPlans.length === 0) return null;

    
    const nonRejected = allPlans.filter((diet) => diet.status !== "rejected");
    nonRejected.sort(
      (a, b) => new Date(b.for_week_starting) - new Date(a.for_week_starting)
    );
    return nonRejected.length > 0 ? nonRejected[0] : null;
  };

  const fetchAndSetAllPlans = useCallback(async () => {
    try {
      const dietRes = await getDietByPatientId(id);

      console.log('[FETCH-A] Inside fetchAndSetAllPlans. Raw API Response:', JSON.parse(JSON.stringify(dietRes.data)));
      
      const allDietsData = (dietRes.data.results || []).sort(
        (a, b) => new Date(b.for_week_starting) - new Date(a.for_week_starting)
      );
      setAllDietPlans(allDietsData);

      // --- [MODIFIED] Logic to find the latest non-archived, non-rejected plan for display ---
      const latestPlanForDisplay = allDietsData.find(
        (diet) => diet.status !== "rejected" && diet.status !== "archived"
      );

      console.log('[FETCH-B] Inside fetchAndSetAllPlans. Identified latest plan for display:', JSON.parse(JSON.stringify(latestPlanForDisplay)));


      // Filter for displayable plans in the dropdown: approved, pending, and now archived
      const options = allDietsData.map((plan) => {
        let label = `${new Date(
          plan.for_week_starting + "T00:00:00"
        ).toLocaleDateString()} (${plan.status})`;

        if (latestPlanForDisplay && plan.id === latestPlanForDisplay.id) {
          label = `${new Date(
            plan.for_week_starting + "T00:00:00"
          ).toLocaleDateString()} - Current`;
        } else if (plan.status === 'archived') {
            label = `${new Date(
                plan.for_week_starting + "T00:00:00"
            ).toLocaleDateString()} (Archived)`;
        }
        return { id: plan.id, label: label, status: plan.status }; // Add status to option
      });
      setPlanOptions(options);
      return { latestPlan: latestPlanForDisplay, allDietsData };
    } catch (error) {
      console.error("Failed to fetch diet plans:", error);
      toast.error("Could not load diet plans.");
      return { latestPlan: null, allDietsData: [] };
    }
  }, [id]);
  const isCurrentPlanApproved = useMemo(() => {
  // We only display one diet plan at a time in the `diets` state array.
  // So, we can safely check the first (and only) item.
  if (diets && diets.length > 0) {
    return diets[0].status === 'approved';
  }
  return false; // Default to false if no diet is being displayed
}, [diets]);

  
useEffect(() => {
  const fetchPatientData = async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];

      // --- [REVISED] Fetch the combined profile/report and the full report history separately.
      const [profileAndReportRes, allReportsHistoryRes, mealsRes, targetNutrientsRes] =
        await Promise.all([
          // This is now our primary source of truth for the display
          getPatientProfile(id).catch((err) => {
            if (err.response && err.response.status === 404) {
              return { data: { profile: null, latest_lab_report: null } };
            }
            throw err;
          }),
          // This call is ONLY for populating the dropdown history
          getAllLabReports(id).catch(() => ({ data: { results: [] } })),
          getPatientMeals(id).catch(() => ({ data: { results: [] } })),
          getTargetNutrients(id, today).catch(() => ({ data: null })),
        ]);

      // --- [REVISED] State setting logic based on the new API response ---
      const { profile, latest_lab_report } = profileAndReportRes.data;

      // 1. Set the Basic Profile State
      if (profile) {
        setProfile(profile);
      } else {
        setProfile({ full_name: "New Patient (Profile Incomplete)" });
      }

      // 2. Set the Lab Report State for Display
      if (latest_lab_report) {
        setLabReports([latest_lab_report]);
        setSelectedReportId(latest_lab_report.id);
      } else {
        setLabReports([]);
      }

      // 3. Set the Lab Report History for the Dropdown
      const allReports = (allReportsHistoryRes?.data?.results || []).sort(
        (a, b) => new Date(b.report_date) - new Date(a.report_date)
      );
      setAllLabReportsHistory(allReports);

      // Set other states as before
      setMeals(mealsRes?.data?.results || []);
      setTargetNutrients(targetNutrientsRes?.data);

      // Fetch and set the diet plans
      const { latestPlan } = await fetchAndSetAllPlans();
      if (latestPlan) {
        setDiets([latestPlan]);
        setSelectedPlanId(latestPlan.id);
        const planDays = Object.keys(latestPlan.meals || {});
        if (planDays.length > 0) setActiveDayPerDiet({ [latestPlan.id]: planDays[0] });
      } else {
        setDiets([]);
        setSelectedPlanId(null);
      }
    } catch (err) {
      console.error("Critical error fetching patient details:", err);
      toast.error("Could not load critical patient data.");
      setProfile({ full_name: "Error Loading Patient" });
    } finally {
      setIsLoading(false);
    }
  };

  fetchPatientData();
}, [id, fetchAndSetAllPlans]);

  useEffect(() => {
    const activeTabRef = tabRefs.current.find(
      (ref) => ref?.dataset.tabKey === activeTab
    );
    if (activeTabRef) {
      setUnderlineStyle({
        left: activeTabRef.offsetLeft,
        width: activeTabRef.offsetWidth,
      });
    }
  }, [activeTab]);

  const calculateAge = (dob) =>
    !dob
      ? "-"
      : Math.floor(
          (Date.now() - new Date(dob).getTime()) /
            (1000 * 60 * 60 * 24 * 365.25)
        );

  // --- [UPDATED & CORRECTED] The handleSave logic with explicit mapping ---
const handleSave = async (dietId, day) => {
    setIsSaving(true);
    const dayChanges = editStates[dietId]?.[day];

    if (!dayChanges || Object.keys(dayChanges).length === 0) {
      toast.info("No changes to save.");
      setIsSaving(false);
      return;
    }

    const apiDayKey = day
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    const apiMealsForDay = {};

    // Iterate over the changed meals
    for (const rawMealKey in dayChanges) {
      const mealData = dayChanges[rawMealKey];
      
      // --- [THIS IS THE NEW MAPPING LOGIC] ---
      // 1. Normalize the key from our state (e.g., "Early Morning", "early-morning" all become "early morning")
      const normalizedKey = rawMealKey.replace(/-/g, " ").toLowerCase();

      // 2. Look up the correct API key from our mapping object.
      //    If a key is not found in the map, we'll use the original key as a safe fallback.
      const apiMealKey = MEAL_TYPE_API_MAPPING[normalizedKey] || rawMealKey;
      
      // For developers: log a warning if a meal type isn't in our map
      if (!MEAL_TYPE_API_MAPPING[normalizedKey]) {
        console.warn(`Meal type "${rawMealKey}" was not found in MEAL_TYPE_API_MAPPING. Using original key as fallback.`);
      }
      // --- [END OF NEW MAPPING LOGIC] ---

      // Construct the item object, as required by the API.
      if (mealData && mealData.food_name) {
        apiMealsForDay[apiMealKey] = { item: mealData.food_name };
      }
    }

    // The payload will now have the correctly mapped keys
    // e.g., { meals: { "Day 1": { "Early-Morning": { "item": "milk" } } } }
    const payload = { meals: { [apiDayKey]: apiMealsForDay } };

    try {
      await editDiet(dietId, payload);
      toast.success("Changes saved!");
      
      const { allDietsData } = await fetchAndSetAllPlans();
      const updatedPlan = allDietsData.find((p) => p.id === dietId);
      if (updatedPlan) {
        setDiets([updatedPlan]);
      }

      setEditingDay(null);
      setEditStates((prev) => {
        const newEditStates = { ...prev };
        if (newEditStates[dietId]) {
          delete newEditStates[dietId][day];
          if (Object.keys(newEditStates[dietId]).length === 0) {
            delete newEditStates[dietId];
          }
        }
        return newEditStates;
      });
    } catch (err) {
      console.error("Save failed:", err.response?.data || err.message);
      toast.error("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditProfileClick = () => {
  // [UPDATED] Merge the current profile with the complete structure template.
  // This ensures all fields (even empty ones) are present for the edit form.
  setEditableProfile({
    ...PROFILE_STRUCTURE_TEMPLATE,
    ...profile,
  });
  setIsEditingProfile(true);
};

const handleCancelProfileEdit = () => {
  setIsEditingProfile(false);
  setEditableProfile(null);
};

const handleProfileInputChange = (e) => {
  const { name, value, type, checked } = e.target;
  setEditableProfile((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value,
  }));
};

const handleSaveProfile = async () => {
  setIsSavingProfile(true);
  try {
    // We assume updatePatientProfile takes (patientId, data)
    const res = await updatePatientProfile(id, editableProfile);
    
    // [FIXED] Use res.data directly, as it is the profile object.
    setProfile(res.data); 

    setIsEditingProfile(false);
    setEditableProfile(null);
    toast.success("Profile updated successfully!");
  } catch (err) {
    console.error("Failed to update profile:", err);
    toast.error(err.response?.data?.detail || "Failed to update profile.");
  } finally {
    setIsSavingProfile(false);
  }
};

const handleEditReportClick = () => {
  // Assumes we are editing the first (and only) displayed report
  if (labReports.length > 0) {
    setEditableReport(JSON.parse(JSON.stringify(labReports[0])));
    setIsEditingReport(true);
  }
};

const handleCancelReportEdit = () => {
  setIsEditingReport(false);
  setEditableReport(null);
};

const handleReportInputChange = (key, value) => {
  setEditableReport((prev) => ({
    ...prev,
    [key]: value,
  }));
};

const handleSaveReport = async () => {
  if (!editableReport) return;
  setIsSavingReport(true);

  const originalReport = labReports[0];
  const changesPayload = {};

  for (const key in editableReport) {
    if (
      Object.prototype.hasOwnProperty.call(editableReport, key) &&
      !['id', 'user', 'report_file'].includes(key)
    ) {
      if (editableReport[key] !== originalReport[key]) {
        changesPayload[key] = editableReport[key];
      }
    }
  }

  if (Object.keys(changesPayload).length === 0) {
    toast.info("No changes were made.");
    setIsEditingReport(false);
    setEditableReport(null);
    setIsSavingReport(false);
    return;
  }

  try {
    const reportId = editableReport.id;
    const patientId = id; 
    
    // This call will now work perfectly with the corrected API function
    await updateLabReport(patientId, reportId, changesPayload);
    
    // Refresh the lab reports list after successful update
    const allReportsRes = await getAllLabReports(patientId);
    const allReports = (allReportsRes?.data?.results || []).sort(
      (a, b) => new Date(b.report_date) - new Date(a.report_date)
    );
    setAllLabReportsHistory(allReports);
    
    const updatedReport = allReports.find(r => r.id === reportId);
    if (updatedReport) {
      setLabReports([updatedReport]);
    }

    setIsEditingReport(false);
    setEditableReport(null);
    toast.success("Lab report updated successfully!");
  } catch (err) {
    console.error("Failed to update lab report:", err.response || err);
    const errorDetail = err.response?.data?.detail || JSON.stringify(err.response?.data) || "Failed to update lab report.";
    toast.error(errorDetail);
  } finally {
    setIsSavingReport(false);
  }
};

  // --- All other handler functions remain unchanged ---
  const handleReportSelectionChange = (e) => {
    const newId = e.target.value;
    setSelectedReportId(newId);
    setLoadingReport(true);
    setTimeout(() => {
      // The logic to find a report by its ID is all we need now.
      const foundReport = allLabReportsHistory.find(
        (report) => String(report.id) === newId
      );
      setLabReports(foundReport ? [foundReport] : []);
      setLoadingReport(false);
    }, 300);
  };

  const handleNavigateToChat = () => {
    if (!id) {
      toast.error("Patient ID is missing, cannot open chat.");
      return;
    }
    navigate("/nutritionist/chat", {
      state: { openChatForUserId: id },
    });
  };

  const handlePlanChange = async (e) => {
    const newPlanId = e.target.value;
    setSelectedPlanId(newPlanId);
    const planToDisplay = allDietPlans.find(
      (p) => String(p.id) === String(newPlanId)
    );
    if (planToDisplay) {
      setDiets([planToDisplay]);
      setComment("");
      setEditingDay(null);
    }
  };

  const handleReview = async (dietId, action) => {
    if (action === "rejected" && !comment) {
      toast.warn("A comment is required to reject a plan.");
      return;
    }
    setIsReviewing(true);
    try {
      await reviewDietPlan(dietId, action, comment);
      toast.success(`Diet plan ${action} successfully.`);
      const { latestPlan } = await fetchAndSetAllPlans();
      setDiets(latestPlan ? [latestPlan] : []);
      setSelectedPlanId(latestPlan ? latestPlan.id : null);
      setComment("");
    } catch (err) {
      toast.error("Review submission failed.");
    } finally {
      setIsReviewing(false);
    }
  };

  const handleDeletePlan = async (dietId) => {
    if (window.confirm("Are you sure? This cannot be undone.")) {
      setDeletingPlanId(dietId);
      try {
        await reviewDietPlan(
          dietId,
          "rejected",
          "Plan deleted by nutritionist."
        );
        toast.success("Plan deleted.");
        const { latestPlan } = await fetchAndSetAllPlans();
        setDiets(latestPlan ? [latestPlan] : []);
        setSelectedPlanId(latestPlan ? latestPlan.id : null);
      } catch (err) {
        toast.error("Failed to delete plan.");
      } finally {
        setDeletingPlanId(null);
      }
    }
  };

  const handleArchivePlan = async (dietId) => {
    if (window.confirm("Are you sure you want to archive this diet plan? It can be restored later.")) {
        setIsArchiving(dietId);
        try {
            await archiveDietPlan(dietId);
            toast.success("Diet plan archived successfully!");
            // Re-fetch all plans to update the UI
            const { latestPlan } = await fetchAndSetAllPlans();
            setDiets(latestPlan ? [latestPlan] : []); // Display the new latest non-archived plan
            setSelectedPlanId(latestPlan ? latestPlan.id : null);
        } catch (err) {
            console.error("Failed to archive diet plan:", err);
            toast.error("Failed to archive plan.");
        } finally {
            setIsArchiving(null);
        }
    }
};

// --- [NEW] handleRestorePlan function ---
const handleRestorePlan = async (dietId) => {
    if (window.confirm("Are you sure you want to restore this diet plan?")) {
        setIsArchiving(dietId);
        try {
            await restoreDietPlan(dietId);
            toast.success("Diet plan restored successfully!");
            // Re-fetch all plans to update the UI
            const { latestPlan } = await fetchAndSetAllPlans();
            setDiets(latestPlan ? [latestPlan] : []); // Display the new latest non-archived plan
            setSelectedPlanId(latestPlan ? latestPlan.id : null);
        } catch (err) {
            console.error("Failed to restore diet plan:", err);
            toast.error("Failed to restore plan.");
        } finally {
            setIsArchiving(null);
        }
    }
};

  const handleMealSearchByDate = async (e) => {
    const input = e.target.value;
    setSelectedMealDate(input);
    if (!input) {
      setFilteredMeals([]);
      setActiveLogDate(null);
      return;
    }
    setIsSearchingMeals(true);
    try {
      const res = await getPatientMealsByDate(id, input);
      setFilteredMeals(res.data?.results || []);
    } catch (err) {
      toast.error("Failed to fetch meals.");
    } finally {
      setIsSearchingMeals(false);
    }
  };

  // Inside PatientDetailsPage.jsx

const handleLogDateClick = async (date) => {
    const newActiveDate = activeLogDate === date ? null : date;
    setActiveLogDate(newActiveDate);

    if (newActiveDate) {
      // --- THE FIX IS HERE ---
      // 1. Create a Date object from the input string (e.g., "Thu Aug 03 2023").
      // This object correctly represents the local date.
      const localDate = new Date(date);

      // 2. Manually construct the YYYY-MM-DD string, avoiding timezone conversion methods.
      const year = localDate.getFullYear();
      // getMonth() is 0-indexed, so we add 1. Pad with '0' if it's a single digit.
      const month = String(localDate.getMonth() + 1).padStart(2, '0');
      // Pad with '0' if it's a single digit.
      const day = String(localDate.getDate()).padStart(2, '0');
      
      const formattedDateForApi = `${year}-${month}-${day}`;
      // --- END OF FIX ---

      if (
        !dailySummaries[formattedDateForApi] &&
        !loadingSummaries[formattedDateForApi]
      ) {
        setLoadingSummaries((prev) => ({
          ...prev,
          [formattedDateForApi]: true,
        }));
        try {
          // Now, this sends the correct date, e.g., "2023-08-03"
          const res = await getDailySummary(id, formattedDateForApi);
          setDailySummaries((prev) => ({
            ...prev,
            [formattedDateForApi]: res.data,
          }));
        } catch (err) {
          console.error(
            `Failed to fetch summary for ${formattedDateForApi}`,
            err
          );
        } finally {
          setLoadingSummaries((prev) => ({
            ...prev,
            [formattedDateForApi]: false,
          }));
        }
      }
    }
  };

  const handleFeedback = async (dietId, approved) => {
    setIsSubmittingFeedback(true);
    try {
      await submitFeedbackForML(dietId, feedback, approved);
      setFeedback("");
      toast.success("Feedback submitted!");
    } catch (err) {
      toast.error("Feedback submission failed.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

   // --- [CORRECTED] handleGenerateDiet with polling for real-time updates ---
   // --- [MODIFIED] handleGenerateDiet with delayed fetch instead of polling ---
const handleGenerateDiet = async () => {
  if (
    !window.confirm(
      "Generate a new AI diet plan? This will run in background."
    )
  ) {
    return;
  }

  setIsGenerating(true);

  try {
    // 1️⃣ Backend returns placeholder plan immediately
    const res = await generateDietPlan(id);
    const placeholderPlan = res.data;

    toast.info("AI generation started...");

    // Show placeholder immediately
    setDiets([placeholderPlan]);
    setSelectedPlanId(placeholderPlan.id);

    const planId = placeholderPlan.id;

    const POLL_INTERVAL = 8000;   // 8 seconds
    const MAX_ATTEMPTS = 25;      // ~3 minutes max
    let attempts = 0;

    const poll = async () => {
      attempts++;

      try {
        const { allDietsData } = await fetchAndSetAllPlans();
        const updatedPlan = allDietsData.find(p => p.id === planId);

        if (!updatedPlan) {
          if (attempts < MAX_ATTEMPTS) {
            setTimeout(poll, POLL_INTERVAL);
          } else {
            toast.warn("Plan still processing. Please refresh later.");
            setIsGenerating(false);
          }
          return;
        }

        // ✅ SUCCESS
        if (updatedPlan.status === "pending") {
          toast.success("Diet plan generated successfully!");
          setDiets([updatedPlan]);
          setIsGenerating(false);
          return;
        }

        // ❌ FAILED
        if (updatedPlan.status === "failed") {
          toast.error("AI failed to generate the plan.");
          setDiets([updatedPlan]);
          setIsGenerating(false);
          return;
        }

        // 🔄 STILL GENERATING
        if (updatedPlan.status === "generating") {
          if (attempts < MAX_ATTEMPTS) {
            setTimeout(poll, POLL_INTERVAL);
          } else {
            toast.warn("Still generating. Please check later.");
            setIsGenerating(false);
          }
        }

      } catch (err) {
        console.error("Polling error:", err);
        toast.error("Error checking plan status.");
        setIsGenerating(false);
      }
    };

    setTimeout(poll, POLL_INTERVAL);

  } catch (err) {
    toast.error(
      err.response?.data?.error || "Failed to start generation."
    );
    setIsGenerating(false);
  }
};



  const handleInputChange = (dietId, day, mealType, field, value) => {
    setEditStates((prev) => {
      // Get previous changes for the specific day, or start with a new empty object.
      const dayChanges = prev[dietId]?.[day] || {};
      
      // Get previous changes for the specific meal, or start with a new empty object.
      const mealChanges = dayChanges[mealType] || {};

      return {
        ...prev, // Keep state for other diet plans
        [dietId]: {
          ...(prev[dietId] || {}), // Keep state for other days in this diet plan
          [day]: {
            ...dayChanges, // Keep other meal changes for this day
            [mealType]: {
              ...mealChanges, // Keep other field changes for this meal (for future-proofing)
              [field]: value, // Apply the specific change
            },
          },
        },
      };
    });
  };

  const handleCancelEdit = (dietId, day) => {
    setEditingDay(null);
    setEditStates((prev) => {
      const newEditStates = { ...prev };
      if (newEditStates[dietId]) {
        const newDietDayStates = { ...newEditStates[dietId] };
        delete newDietDayStates[day];
        if (Object.keys(newDietDayStates).length === 0) {
          delete newEditStates[dietId];
        } else {
          newEditStates[dietId] = newDietDayStates;
        }
      }
      return newEditStates;
    });
  };

  const handleOpenAssistant = () => setIsAssistantOpen(true);
  const handleOpenNutritionSearch = () => setShowNutrition(true);

  // --- [NEW] Calculate daily totals for the active diet plan day ---
  const dailyTotals = useMemo(() => {
    const activeDietPlan = diets[0];
    const activeDay = activeDietPlan
      ? activeDayPerDiet[activeDietPlan.id]
      : null;
    if (!activeDietPlan || !activeDay || !activeDietPlan.meals[activeDay]) {
      return null;
    }
    const totals = {
      Calories: 0,
      Protein: 0,
      Carbs: 0,
      Fats: 0,
      Fiber: 0,
      Sugar: 0,
    };
    const mealsForDay = activeDietPlan.meals[activeDay];
    for (const mealType in mealsForDay) {
      const mealDetails = mealsForDay[mealType];
      for (const nutrient in totals) {
        totals[nutrient] += parseFloat(mealDetails[nutrient] || 0);
      }
    }
    return totals;
  }, [diets, activeDayPerDiet]);

  const TABS = [
    { key: "profile", label: "Profile", icon: <FaUser /> },
    { key: "reports", label: "Lab Reports", icon: <FaFileMedicalAlt /> },
    { key: "meals", label: "Meal Log", icon: <Utensils /> },
    { key: "diet", label: "Diet Plans", icon: <CalendarCheck /> },
  ];
  const mealTypeStyles = {
    "early-morning":
      "bg-[var(--color-accent-1-bg-subtle)] text-[var(--color-accent-1-text)]",
    breakfast:
      "bg-[var(--color-success-bg-subtle)] text-[var(--color-success-text)]",
    "mid-morning-snack":
      "bg-[var(--color-accent-2-bg-subtle)] text-[var(--color-accent-2-text)]",
    lunch:
      "bg-[var(--color-warning-bg-subtle)] text-[var(--color-warning-text)]",
    "afternoon-snack":
      "bg-[var(--color-accent-3-bg-subtle)] text-[var(--color-accent-3-text)]",
    dinner:
      "bg-[var(--color-danger-bg-subtle)] text-[var(--color-danger-text)]",
    bedtime: "bg-[var(--color-info-bg-subtle)] text-[var(--color-info-text)]",
    uncategorized:
      "bg-[var(--color-bg-interactive-subtle)] text-[var(--color-text-muted)]",
  };
  const mealTypeIcons = {
    "early-morning": <Soup size={18} />,
    breakfast: <Apple size={18} />,
    "mid-morning-snack": <Sandwich size={18} />,
    lunch: <Salad size={18} />,
    "afternoon-snack": <Sandwich size={18} />,
    dinner: <Drumstick size={18} />,
    bedtime: <Soup size={18} />,
    uncategorized: <Utensils size={18} />,
  };
  const hasPendingOrApprovedPlan = allDietPlans.some(
  (diet) =>
    diet.status === "pending" ||
    diet.status === "approved" ||
    diet.status === "generating"
);

  const currentPlan = diets[0];

  const isPlanRenderable =
    currentPlan &&
    currentPlan.status !== "generating" &&
    currentPlan.meals &&
    Object.keys(currentPlan.meals).length > 0;


  const mealsToDisplay = selectedMealDate ? filteredMeals : meals;
  const mealGroups = mealsToDisplay.reduce((acc, meal) => {
    const date = new Date(meal.date).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(meal);
    return acc;
  }, {});
  const sortedMealDates = Object.keys(mealGroups).sort(
    (a, b) => new Date(b) - new Date(a)
  );
  const indexOfLastMealDay = mealCurrentPage * mealsPerPage;
  const indexOfFirstMealDay = indexOfLastMealDay - mealsPerPage;
  const currentMealDays = sortedMealDates.slice(
    indexOfFirstMealDay,
    indexOfLastMealDay
  );
  const maxMealPage = Math.ceil(sortedMealDates.length / mealsPerPage);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen bg-[var(--color-bg-app)]">
        <PulsingDotsLoader />
      </div>
    );
  if (!profile)
    return (
      <div className="flex justify-center items-center h-screen bg-[var(--color-bg-app)]">
        <p className="text-xl text-[var(--color-danger-text)]">
          Could not load patient profile.
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[var(--color-bg-app)] font-[var(--font-primary)]">
      <div className="sticky top-0 z-40 bg-[var(--color-bg-surface-glass)] backdrop-blur-md shadow-sm">
        <NutriNavbar />
      </div>
      <ToastContainer position="top-right" autoClose={4000} theme="light" />
      <main className="text-[var(--color-text-default)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-[var(--color-bg-surface)] rounded-2xl shadow-xl border-2 border-[var(--color-border-default)]"
        >
          <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
            <div className="flex items-center gap-6 flex-grow">
              <div className="p-4 bg-[var(--color-primary-bg-subtle)] text-[var(--color-primary)] rounded-full text-5xl ring-4 ring-[var(--color-primary)]/20">
                <FaUser />
              </div>
              <div>
                <div className="flex items-center gap-4">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text-strong)] font-[var(--font-primary)] tracking-tight">
                    {profile.full_name}
                  </h1>
                  <motion.div
                    initial="hidden"
                    whileHover="visible"
                    className="relative"
                  >
                    <motion.button
                      onClick={handleNavigateToChat}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-3 text-[var(--color-text-muted)] bg-[var(--color-bg-app)] rounded-full shadow-md border-2 border-[var(--color-border-default)] transition-colors duration-300 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-bg-subtle)] hover:border-[var(--color-primary)]/50"
                      aria-label={`Chat with ${profile.full_name}`}
                    >
                      <MessageSquare size={20} />
                    </motion.button>
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 5, scale: 0.95 },
                        visible: { opacity: 1, y: 0, scale: 1 },
                      }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 text-xs font-semibold text-white bg-[var(--color-text-strong)] rounded-md shadow-lg pointer-events-none"
                    >
                      Chat with {profile.full_name.split(" ")[0]}
                      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[var(--color-text-strong)]"></div>
                    </motion.div>
                  </motion.div>
                </div>
                <p className="text-lg text-[var(--color-text-default)] font-[var(--font-secondary)] mt-1">
                  Patient ID: {id}
                </p>
              </div>
            </div>
            {targetNutrients && (
<div className="w-full lg:w-auto mt-4 lg:mt-0 p-4 bg-white border border-[var(--color-border-default)] rounded-xl shadow-sm">
  {/* Header */}
  <div className="flex items-center gap-4 mb-4 border-b border-dashed border-[var(--color-border-default)] pb-3">
    <Flame className="text-orange-500 w-8 h-8 transition-transform duration-300 hover:scale-110" />
    <div>
      <h3 className="text-xs font-semibold uppercase text-[var(--color-text-muted)] tracking-wider">
        Target Calories
      </h3>
      <p className="text-2xl font-bold text-[var(--color-text-strong)] leading-tight">
        {Math.round(targetNutrients.recommended_calories)}{" "}
        <span className="text-base font-semibold text-[var(--color-primary)] ml-1">kcal</span>
      </p>
    </div>
  </div>

  {/* Nutrients */}
  <div className="grid grid-cols-3 sm:grid-cols-5 gap-x-4 gap-y-4 justify-items-center text-center font-[var(--font-secondary)]">
    {[
      { label: "Protein", value: targetNutrients.macronutrients?.protein_g, icon: <Drumstick size={20} /> },
      { label: "Carbs", value: targetNutrients.macronutrients?.carbs_g, icon: <Wheat size={20} /> },
      { label: "Fats", value: targetNutrients.macronutrients?.fats_g, icon: <Droplets size={20} /> },
      { label: "Sugar", value: targetNutrients.macronutrients?.sugar_g, icon: <Apple size={20} /> },
      { label: "Fiber", value: targetNutrients.macronutrients?.fiber_g, icon: <Leaf size={20} /> },
    ].map((n) => (
      <div key={n.label} className="flex flex-col items-center w-20 group transition-all duration-200">
        <div className="flex items-center gap-1 text-[var(--color-text-strong)]">
          <span className="text-[var(--color-primary)] group-hover:scale-110 transition-transform duration-200">
            {n.icon}
          </span>
          <p className="font-bold text-lg">
            {Math.round(n.value)}
            <span className="text-[13px] font-semibold text-[var(--color-primary)] ml-0.5">g</span>
          </p>
        </div>
        <p className="text-[13px] font-semibold text-[var(--color-text-muted)] uppercase mt-1 tracking-wide">
          {n.label}
        </p>
      </div>
    ))}
  </div>
</div>
      )}
          </div>
          <div className="mt-6 pt-6 border-t-2 border-dashed border-[var(--color-border-default)] flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-[var(--font-secondary)]">
            <div className="flex items-center gap-2 font-semibold">
              <FaEnvelope className="text-[var(--color-primary)]" />
              {profile.email}
            </div>
            <div className="flex items-center gap-2 capitalize font-semibold">
              <FaVenusMars className="text-[var(--color-primary)]" />
              {profile.gender}
            </div>
            <div className="flex items-center gap-2 font-semibold">
              <FaBirthdayCake className="text-[var(--color-primary)]" />
              {calculateAge(profile.date_of_birth)} years old
            </div>
          </div>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          className="bg-[var(--color-bg-surface)] rounded-2xl border-2 border-[var(--color-border-default)] shadow-xl p-2 sm:p-4"
        >
          <nav className="relative mb-6">
            <div className="flex justify-center sm:justify-start border-b-2 border-[var(--color-border-default)] overflow-x-auto">
              {TABS.map((tab, index) => (
                <button
                  key={tab.key}
                  ref={(el) => (tabRefs.current[index] = el)}
                  data-tab-key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex-shrink-0 flex items-center gap-2.5 px-4 sm:px-6 py-3 text-sm sm:text-base font-semibold transition-colors duration-300 outline-none ${
                    activeTab === tab.key
                      ? "text-[var(--color-primary)]"
                      : "text-[var(--color-text-default)] hover:text-[var(--color-text-strong)]"
                  }`}
                >
                  {tab.icon} <span>{tab.label}</span>
                </button>
              ))}
            </div>
            <motion.div
              className="absolute bottom-0 h-1 bg-[var(--color-primary)] rounded-full"
              animate={underlineStyle}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
          </nav>

          <div className="p-2 sm:p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                
{activeTab === "profile" && (
  <div>
    {/* --- [NEW] Edit/Save/Cancel controls for Profile --- */}
    <div className="flex justify-end items-center mb-4 gap-3">
      {isEditingProfile ? (
        <>
          <button
            onClick={handleCancelProfileEdit}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm bg-[var(--color-bg-interactive-subtle)] text-[var(--color-text-default)] hover:bg-opacity-80"
          >
            <FaTimes /> Cancel
          </button>
          <button
            onClick={handleSaveProfile}
            disabled={isSavingProfile}
            className="flex items-center justify-center gap-2 px-4 py-2 w-28 rounded-lg font-semibold text-sm bg-[var(--color-success-bg)] text-[var(--color-success-text)] hover:bg-[var(--color-success-bg-hover)] disabled:opacity-50"
          >
            {isSavingProfile ? <FaSpinner className="animate-spin" /> : <FaSave />} Save
          </button>
        </>
      ) : (
        <button
          onClick={handleEditProfileClick}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm bg-[var(--color-primary-bg-subtle)] text-[var(--color-primary)] hover:bg-[var(--color-primary-bg)] hover:text-[var(--color-text-on-primary)] transition-all duration-200"
        >
          <FaPencilAlt /> Edit Profile
        </button>
      )}
    </div>

    {/* --- [UPDATED] The rest of the profile section --- */}
    {/* --- [FULLY UPDATED] Profile content section --- */}
<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
  {/* Left Column: Stats & Preferences */}
  <div className="space-y-6">
    <h3 className="text-xl font-[var(--font-secondary)] font-semibold text-[var(--color-text-strong)]">
      Core Statistics
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <ContentCard className="text-center">
        <p className="text-sm text-[var(--color-text-muted)] font-semibold">Height</p>
        {isEditingProfile ? (
          <input type="number" name="height_cm" value={editableProfile.height_cm || ""} onChange={handleProfileInputChange} className="mt-1 text-3xl font-bold w-full text-center bg-transparent focus:outline-none" />
        ) : (
          <p className="mt-1 text-3xl font-bold text-[var(--color-text-strong)]">
            {profile.height_cm ? `${profile.height_cm} cm` : "Not Set"}
          </p>
        )}
      </ContentCard>
      <ContentCard className="text-center">
        <p className="text-sm text-[var(--color-text-muted)] font-semibold">Weight</p>
        {isEditingProfile ? (
          <input type="number" name="weight_kg" value={editableProfile.weight_kg || ""} onChange={handleProfileInputChange} className="mt-1 text-3xl font-bold w-full text-center bg-transparent focus:outline-none" />
        ) : (
          <p className="mt-1 text-3xl font-bold text-[var(--color-text-strong)]">
            {profile.weight_kg ? `${profile.weight_kg} kg` : "Not Set"}
          </p>
        )}
      </ContentCard>
      <ContentCard className="text-center">
        <p className="text-sm text-[var(--color-text-muted)] font-semibold">BMI</p>
        <p className="mt-1 text-3xl font-bold text-[var(--color-text-strong)]">{profile.bmi?.toFixed(1) || "Not Set"}</p>
      </ContentCard>
    </div>

    <h3 className="text-xl font-[var(--font-secondary)] font-semibold text-[var(--color-text-strong)] pt-4 border-t-2 border-dashed border-[var(--color-border-default)]">
      Goals & Preferences
    </h3>
    <div className="space-y-4">
      {/* Dynamic Fields */}
      {[
        { icon: FaBullseye, label: "Primary Goal", key: "goal", options: goals },
        { icon: Zap, label: "Activity Level", key: "activity_level", options: activityLevels },
        { icon: Utensils, label: "Dietary Preference", key: "diet_type", options: dietTypeOptions },
        { icon: FaAllergies, label: "Allergies", key: "allergies", options: allergyOptions },
      ].map(({ icon: Icon, label, key, options }) => (
        <ContentCard key={key} className="flex items-center gap-4">
          <span className="text-2xl text-[var(--color-primary)] p-2 bg-[var(--color-primary-bg-subtle)] rounded-lg"><Icon/></span>
          <div className="w-full">
            <p className="text-sm text-[var(--color-text-default)]">{label}</p>
            {isEditingProfile ? (
              
              
            <Select
    styles={themedSelectStyles}
    options={options}
    value={options.find(opt => opt.value === (editableProfile?.[key] || ''))}
    onChange={(selected) => handleProfileInputChange({ target: { name: key, value: selected.value }})}
    
    // [ADD THESE TWO PROPS TO FIX OVERLAPPING]
    menuPosition="fixed"
    menuPortalTarget={document.body}
  />
            ) : (
              <p className="capitalize font-semibold text-[var(--color-text-strong)]">{profile[key]?.replace(/_/g, " ") || 'Not Set'}</p>
            )}
          </div>
        </ContentCard>
      ))}
    </div>
  </div>

  {/* Right Column: Medical Summary */}
  <div className="space-y-6">
    <h3 className="text-xl font-[var(--font-secondary)] font-semibold text-[var(--color-text-strong)]">
      Medical Summary
    </h3>
    <ContentCard>
      <p className="text-sm text-[var(--color-text-default)] font-semibold mb-3">Reported Chronic Conditions</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
        {isEditingProfile ? (
          medicalConditions.map(({ field, label }) => (
            <label key={field} className="flex items-center gap-3 font-semibold cursor-pointer">
              <input type="checkbox" name={field} checked={!!editableProfile?.[field]} onChange={handleProfileInputChange} className="h-4 w-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
              {label}
            </label>
          ))
        ) : (
          medicalConditions.some(c => profile[c.field]) ? (
            medicalConditions.map(({ field, label }) =>
              profile[field] && (
                <div key={field} className="flex items-center gap-1.5 px-2 py-1 rounded bg-[var(--color-warning-bg-subtle)] text-[var(--color-warning-text)] font-semibold"><FaCheck />{label}</div>
              )
            )
          ) : (
            <p className="text-sm text-gray-500 col-span-2">None Reported</p>
          )
        )}
      </div>
    </ContentCard>
    <ContentCard>
      <p className="text-sm text-[var(--color-text-default)] font-semibold mb-2">Family Medical History</p>
      {isEditingProfile ? (
          <textarea name="family_history" value={editableProfile.family_history || ""} onChange={handleProfileInputChange} rows="4" className="w-full text-sm bg-[var(--color-bg-app)] focus:outline-none border-2 border-[var(--color-border-default)] focus:border-[var(--color-primary)] rounded-md p-2"/>
        ) : (
          <p className="text-sm text-[var(--color-text-strong)] whitespace-pre-wrap">{profile.family_history || "None Reported"}</p>
        )
      }
    </ContentCard>
  </div>
</div>
  </div>
)}
                
                               {activeTab === "reports" && (
  <div>
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <h2 className="text-2xl font-[var(--font-secondary)] font-bold text-[var(--color-text-strong)]">
        Lab Reports
      </h2>
      {allLabReportsHistory.length > 0 && (
        <div className="flex items-center gap-4">
          <div className="relative group w-full sm:w-auto">
            <select
              id="report-selector"
              value={selectedReportId}
              onChange={handleReportSelectionChange}
              disabled={isEditingReport}
              className="appearance-none w-full sm:w-56 cursor-pointer bg-[var(--color-bg-surface)] border-2 border-[var(--color-border-default)] text-sm text-[var(--color-text-strong)] font-semibold py-2.5 pl-4 pr-10 rounded-lg shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-bg-surface)] focus:ring-[var(--color-primary)] hover:border-[var(--color-primary)] hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {allLabReportsHistory.map((report) => (
                <option key={report.id} value={report.id}>Report: {new Date(report.report_date + 'T00:00:00').toLocaleDateString()}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[var(--color-text-muted)] transition-colors duration-300 group-hover:text-[var(--color-primary)]">
              <FaChevronDown size={14} />
            </div>
          </div>
          {/* --- [NEW] Edit button for Lab Report --- */}
          {!isEditingReport && (
            <button
              onClick={handleEditReportClick}
              className="p-2.5 rounded-lg text-sm bg-[var(--color-primary-bg-subtle)] text-[var(--color-primary)] hover:bg-[var(--color-primary-bg)] hover:text-[var(--color-text-on-primary)] transition-all duration-200"
              title="Edit this report"
            >
              <FaPencilAlt />
            </button>
          )}
        </div>
      )}
    </div>

    {allLabReportsHistory.length === 0 ? (
      <div className="text-center py-16 bg-[var(--color-bg-app)] rounded-lg border-2 border-dashed border-[var(--color-border-default)]">
        <FaFileMedicalAlt className="mx-auto h-12 w-12 text-[var(--color-text-muted)]" />
        <h3 className="mt-4 text-lg font-semibold text-[var(--color-text-strong)]">No Lab Reports Uploaded</h3>
        <p className="mt-1 text-sm text-[var(--color-text-default)]">The patient has not uploaded any lab reports yet.</p>
      </div>
    ) : loadingReport ? (
      <div className="flex justify-center items-center py-10">
        <FaSpinner className="animate-spin text-4xl text-[var(--color-primary)]" />
      </div>
    ) : (
      <div className="space-y-8">
        {(isEditingReport ? [editableReport] : labReports).map((report) => (
          <div key={report.id} className="bg-[var(--color-bg-app)] p-5 rounded-xl border-2 border-[var(--color-border-default)] shadow-sm">
            <h4 className="text-lg font-bold font-[var(--font-secondary)] text-[var(--color-text-strong)] mb-4 pb-3 border-b-2 border-dashed border-[var(--color-border-default)]">
              Report Date: {new Date(report.report_date + 'T00:00:00').toLocaleDateString()}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Object.entries(report)
                .filter(([key]) => !["id", "user", "report_date", "report_file"].includes(key))
                .map(([key, value]) => (
                  <ContentCard key={key} className="bg-[var(--color-bg-surface)]">
                    <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">{key.replace(/_/g, " ")}</p>
                    {isEditingReport ? (
                      <input
                        type="text"
                        value={editableReport[key] ?? ""}
                        onChange={(e) => handleReportInputChange(key, e.target.value)}
                        className="text-2xl font-bold text-[var(--color-text-strong)] mt-1 bg-transparent w-full focus:outline-none"
                      />
                    ) : (
                      <p className="text-2xl font-bold text-[var(--color-text-strong)] mt-1">{value ?? "—"}</p>
                    )}
                  </ContentCard>
                ))}
              {report.report_file && !isEditingReport && (
                <a href={report.report_file} target="_blank" rel="noopener noreferrer" download className="bg-[var(--color-primary-bg-subtle)] border-2 border-dashed border-[var(--color-primary)]/30 rounded-lg p-3 transition-all duration-300 hover:shadow-lg hover:bg-[var(--color-primary)] hover:text-white hover:border-solid text-[var(--color-primary)] flex flex-col justify-center items-center gap-2 text-center group">
                  <FileDown className="w-10 h-10 transition-transform duration-300 group-hover:scale-110" />
                  <span className="font-bold text-lg">Download Report</span>
                </a>
              )}
            </div>
            {/* --- [NEW] Save/Cancel controls for Lab Report --- */}
            {isEditingReport && (
              <div className="flex justify-end items-center mt-6 gap-3 border-t-2 border-dashed border-[var(--color-border-default)] pt-4">
                <button
                  onClick={handleCancelReportEdit}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm bg-[var(--color-bg-interactive-subtle)] text-[var(--color-text-default)] hover:bg-opacity-80"
                >
                  <FaTimes /> Cancel
                </button>
                <button
                  onClick={handleSaveReport}
                  disabled={isSavingReport}
                  className="flex items-center justify-center gap-2 px-4 py-2 w-28 rounded-lg font-semibold text-sm bg-[var(--color-success-bg)] text-[var(--color-success-text)] hover:bg-[var(--color-success-bg-hover)] disabled:opacity-50"
                >
                  {isSavingReport ? <FaSpinner className="animate-spin" /> : <FaSave />} Save
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
)}
                {/* Other tabs remain the same logically, just with updated styling where applicable */}
                {activeTab === "meals" && (
                  <div>
                    <h2 className="text-2xl font-bold font-[var(--font-secondary)] text-[var(--color-text-strong)] mb-6">
                      Patient Meal Log
                    </h2>
                    <div className="mb-6 flex items-center gap-4">
                      <label
                        htmlFor="mealDate"
                        className="text-sm font-semibold text-[var(--color-text-default)]"
                      >
                        Filter by Date:
                      </label>
                      <input
                        type="date"
                        value={selectedMealDate}
                        onChange={handleMealSearchByDate}
                        max={new Date().toISOString().split("T")[0]}
                        className="bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-md p-2 text-[var(--color-text-strong)] focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] outline-none transition-all"
                      />
                      {isSearchingMeals && (
                        <FaSpinner className="animate-spin text-[var(--color-primary)]" />
                      )}
                    </div>
                    {sortedMealDates.length > 0 ? (
                      <>
                        <div className="space-y-4">
                          {currentMealDays.map((date) => {
                            const mealsForDay = mealGroups[date];
                            const isActive = activeLogDate === date;
                             const localDate = new Date(date);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const formattedDateForKey = `${year}-${month}-${day}`; 
                            const summary = dailySummaries[formattedDateForKey];
                            const isLoadingSummary =
                              loadingSummaries[formattedDateForKey];
                            return (
                              <div
                                key={date}
                                className="border-2 bg-[var(--color-bg-surface)] rounded-xl shadow-sm transition-all duration-300 hover:shadow-lg hover:border-[var(--color-primary)]/50"
                              >
                                <button
                                  onClick={() => handleLogDateClick(date)}
                                  className="w-full flex justify-between items-center p-4"
                                >
                                  <div className="flex items-center gap-4">
                                    <CalendarCheck
                                      className={`text-xl ${
                                        isActive
                                          ? "text-[var(--color-primary)]"
                                          : "text-[var(--color-text-muted)]"
                                      }`}
                                    />
                                    <h3 className="font-bold font-[var(--font-primary)] text-lg text-left text-[var(--color-text-strong)]">
                                      {date}
                                    </h3>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className="hidden sm:inline-block bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] text-[var(--color-text-default)] text-xs font-bold px-2.5 py-1 rounded-full">
                                      {mealsForDay.length} items
                                    </span>
                                    <FaChevronDown
                                      className={`transform transition-transform duration-300 text-[var(--color-text-muted)] ${
                                        isActive
                                          ? "rotate-180 text-[var(--color-primary)]"
                                          : ""
                                      }`}
                                    />
                                  </div>
                                </button>
                                <div
                                  className={`${
                                    isActive ? "max-h-[2000px]" : "max-h-0"
                                  } overflow-hidden transition-[max-height,padding] duration-700 ease-in-out`}
                                >
                                  <div className="pb-4 px-4">
                                    <div className="border-t-2 border-dashed border-[var(--color-border-default)] pt-4">
                                      {isLoadingSummary ? (
                                        <div className="flex justify-center p-4">
                                          <FaSpinner className="animate-spin text-2xl text-[var(--color-primary)]" />
                                        </div>
                                      ) : summary ? (
                                        <div className="mb-4 p-4 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-lg">
                                          <h4 className="text-sm font-semibold text-[var(--color-text-strong)] mb-3">
                                            Daily Summary
                                          </h4>
                                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                                            <div className="text-center p-2 rounded-lg bg-[var(--color-stat-1-bg)]">
                                              <p className="text-xs text-[var(--color-text-muted)]">
                                                Calories
                                              </p>
                                              <p className="font-bold text-lg text-[var(--color-primary)]">
                                                {Math.round(summary.calories)}{" "}
                                                <span className="text-sm font-normal text-[var(--color-text-muted)]">
                                                  kcal
                                                </span>
                                              </p>
                                            </div>
                                            <div className="text-center p-2 rounded-lg bg-[var(--color-stat-2-bg)]">
                                              <p className="text-xs text-[var(--color-text-muted)]">
                                                Protein
                                              </p>
                                              <p className="font-bold text-lg text-[var(--color-text-strong)]">
                                                {Math.round(summary.protein)}g
                                              </p>
                                            </div>
                                            <div className="text-center p-2 rounded-lg bg-[var(--color-stat-3-bg)]">
                                              <p className="text-xs text-[var(--color-text-muted)]">
                                                Carbs
                                              </p>
                                              <p className="font-bold text-lg text-[var(--color-text-strong)]">
                                                {Math.round(summary.carbs)}g
                                              </p>
                                            </div>
                                            <div className="text-center p-2 rounded-lg bg-[var(--color-stat-4-bg)]">
                                              <p className="text-xs text-[var(--color-text-muted)]">
                                                Fats
                                              </p>
                                              <p className="font-bold text-lg text-[var(--color-text-strong)]">
                                                {Math.round(summary.fats)}g
                                              </p>
                                            </div>
                                            <div className="text-center p-2 rounded-lg bg-[var(--color-accent-1-bg-subtle)]">
                                              <p className="text-xs text-[var(--color-text-muted)]">
                                                Sugar
                                              </p>
                                              <p className="font-bold text-lg text-[var(--color-text-strong)]">
                                                {Math.round(summary.sugar)}g
                                              </p>
                                            </div>
                                            <div className="text-center p-2 rounded-lg bg-[var(--color-accent-2-bg-subtle)]">
                                              <p className="text-xs text-[var(--color-text-muted)]">
                                                Fiber
                                              </p>
                                              <p className="font-bold text-lg text-[var(--color-text-strong)]">
                                                {Math.round(summary.fiber)}g
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      ) : null}
                                      <div className="overflow-x-auto">
                                        <table className="min-w-full text-sm align-middle">
                                          <thead className="bg-[var(--color-bg-app)]">
                                            <tr>
                                              <th
                                                scope="col"
                                                className="py-3 pl-4 pr-3 text-left text-xs font-semibold  text-[var(--color-text-muted)] sm:pl-6"
                                              >
                                                Meal
                                              </th>
                                              <th
                                                scope="col"
                                                className="px-3 py-3 text-left text-xs font-semibold  text-[var(--color-text-muted)]"
                                              >
                                                Item
                                              </th>
                                              <th
                                                scope="col"
                                                className="px-3 py-3 text-center text-xs font-semibold  text-[var(--color-text-muted)]"
                                              >
                                                Qty
                                              </th>
                                              <th
                                                scope="col"
                                                className="px-3 py-3 text-center text-xs font-semibold  text-[var(--color-text-muted)]"
                                              >
                                                Calories
                                              </th>
                                              <th
                                                scope="col"
                                                className="px-3 py-3 text-center text-xs font-semibold  text-[var(--color-text-muted)]"
                                              >
                                                Time
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {[...mealsForDay]
                                              .sort(
                                                (a, b) =>
                                                  new Date(a.consumed_at) -
                                                  new Date(b.consumed_at)
                                              )
                                              .map((item) => (
                                                <tr
                                                  key={item.id}
                                                  className="transition-colors duration-200 hover:bg-[var(--color-bg-app)] border-b last:border-b-0 border-[var(--color-border-default)]"
                                                >
                                                  <td className="py-4 pl-4 pr-3 sm:pl-6">
                                                    <span
                                                      className={`inline-flex items-center gap-2 px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                                                        mealTypeStyles[
                                                          item.meal_type
                                                            ?.toLowerCase()
                                                            .replace(
                                                              / /g,
                                                              "-"
                                                            ) || "uncategorized"
                                                        ]
                                                      }`}
                                                    >
                                                      {
                                                        mealTypeIcons[
                                                          item.meal_type
                                                            ?.toLowerCase()
                                                            .replace(
                                                              / /g,
                                                              "-"
                                                            ) || "uncategorized"
                                                        ]
                                                      }{" "}
                                                      {item.meal_type?.replace(
                                                        /-/g,
                                                        " "
                                                      ) || "Uncategorized"}
                                                    </span>
                                                  </td>
                                                  <td className="px-3 py-4 font-semibold text-[var(--color-text-strong)]">
                                                    {item.food_name}
                                                  </td>
                                                  <td className="px-3 py-4 text-center text-[var(--color-text-default)]">
                                                    {item.quantity} {item.unit}
                                                  </td>
                                                  <td className="px-3 py-4 text-center text-[var(--color-text-default)]">
                                                    {item.calories}
                                                  </td>
                                                  <td className="px-3 py-4 text-center text-[var(--color-text-default)]">
                                                    {new Date(
                                                      item.consumed_at
                                                    ).toLocaleTimeString(
                                                      "en-IN",
                                                      {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        hour12: true,
                                                      }
                                                    )}
                                                  </td>
                                                </tr>
                                              ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {maxMealPage > 1 && (
                          <div className="flex justify-center items-center mt-8 gap-4">
                            <button
                              onClick={() =>
                                setMealCurrentPage((p) => Math.max(1, p - 1))
                              }
                              disabled={mealCurrentPage === 1}
                              className="px-4 py-2 rounded-md text-sm font-semibold transition bg-[var(--color-bg-interactive-subtle)] hover:bg-opacity-80 text-[var(--color-text-default)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Previous
                            </button>
                            <span className="text-sm font-semibold text-[var(--color-text-default)]">
                              Page {mealCurrentPage} of {maxMealPage}
                            </span>
                            <button
                              onClick={() =>
                                setMealCurrentPage((p) =>
                                  Math.min(maxMealPage, p + 1)
                                )
                              }
                              disabled={mealCurrentPage === maxMealPage}
                              className="px-4 py-2 rounded-md text-sm font-semibold transition bg-[var(--color-bg-interactive-subtle)] hover:bg-opacity-80 text-[var(--color-text-default)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-16 bg-[var(--color-bg-app)] rounded-xl border-2 border-dashed border-[var(--color-border-default)]">
                        <p className="text-[var(--color-text-default)]">
                          No meal logs recorded.
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {/* Diet plan tab is unchanged logically but will benefit from the overall aesthetic updates */}
                {activeTab === "diet" && (
                  <div className="space-y-6">
                    <div className="bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] p-4 rounded-xl flex flex-wrap gap-6 justify-between items-center">
                      <h2 className="text-xl font-[var(--font-secondary)] font-semibold text-[var(--color-text-strong)]">
                        Diet Plan Management
                      </h2>
                      <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
                        {planOptions.length > 0 && (
                          <div>
                            <label
                              htmlFor="plan-selector"
                              className="block text-sm font-medium text-[var(--color-text-default)] mb-1"
                            >
                              View Plan:
                            </label>
                            <div className="relative">
                              <select
                                id="plan-selector"
                                value={selectedPlanId || ""}
                                onChange={handlePlanChange}
                                className="appearance-none w-full sm:w-60 bg-[var(--color-bg-surface)] border-2 border-[var(--color-border-default)] text-sm text-[var(--color-text-strong)] font-semibold py-2 pl-3 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                              >
                                {planOptions.map((plan) => (
                                  <option key={plan.id} value={plan.id}>
                                    {plan.label}
                                  </option>
                                ))}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--color-text-default)]">
                                <FaChevronDown size={12} />
                              </div>
                            </div>
                          </div>
                        )}
                                          <div
                          title={
                            !isProfileComplete // <-- Use the new variable
                              ? "Patient profile must be complete to generate a diet."
                              : hasPendingOrApprovedPlan
                              ? "Cannot generate while a plan is pending or approved."
                              : "Generate a new AI diet plan"
                          }
                        >
                          <button
                            onClick={handleGenerateDiet}
                            disabled={!isProfileComplete || hasPendingOrApprovedPlan || isGenerating} // <-- Use the new variable
                            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all w-44 ${
                              !isProfileComplete || hasPendingOrApprovedPlan || isGenerating // <-- Use the new variable
                                ? "bg-[var(--color-bg-interactive-subtle)] opacity-60 cursor-not-allowed text-[var(--color-text-muted)]"
                                : "bg-[var(--color-primary)] text-[var(--color-text-on-primary)] hover:bg-[var(--color-primary-hover)] hover:shadow-lg hover:-translate-y-0.5"
                            }`}
                          >
                            {isGenerating ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              <FaPlus />
                            )}{" "}
                            {isGenerating
                              ? "Generating..."
                              : "Generate New Plan"}
                          </button>
                        </div>
            </div>
        </div>

             {/* --- [UPDATED] Multi-stage conditional rendering for messages --- */}

        {/* Condition 1: Profile is NOT complete (Hard Lock) */}
        {!isProfileComplete ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative flex items-center gap-5 p-5 overflow-hidden rounded-xl border border-transparent bg-[var(--color-bg-surface)]/60 backdrop-blur-md shadow-lg"
          >
            <div className="relative z-10 flex-shrink-0 p-3 bg-[var(--color-bg-surface)] rounded-full shadow-md">
              <AlertTriangle className="h-8 w-8 text-[var(--color-warning-text-strong)]" />
            </div>
            <div className="relative z-10 flex-grow">
              <h3 className="text-lg font-extrabold text-[var(--color-text-strong)]">Action Required</h3>
              <p className="mt-1 text-sm font-semibold text-[var(--color-text-default)]">AI Diet Generation is locked.</p>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Please ensure the patient's <strong>Profile</strong> is fully completed to unlock this feature.
                For more accurate diet , make sure patient's <strong>Lap Reports</strong> are also uploaded
              </p>
            </div>
          </motion.div>

        /* Condition 2: Profile complete, NO lab reports (Styled Suggestion Card) */
        ) : !hasLabReports ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            // --- [NEW STYLING] "Prism Card" styling for a premium, modern feel ---
            className="relative flex items-center gap-5 p-5 overflow-hidden rounded-xl border border-transparent hover:border-[var(--color-info-text)]/40 bg-[var(--color-bg-surface)]/60 backdrop-blur-md shadow-lg hover:shadow-xl shadow-black/5 transition-all duration-300"
          >
            {/* --- Animated Background Blobs for the Aurora Effect --- */}
            <div
              style={{ animationDelay: '0s' }}
              className="absolute -top-10 -right-20 w-72 h-72 animate-blob rounded-full bg-[var(--color-info-text)] mix-blend-multiply filter opacity-20"
            ></div>
            <div
              style={{ animationDelay: '2s' }}
              className="absolute -bottom-8 -left-16 w-72 h-72 animate-blob rounded-full bg-[var(--color-primary)]/70 mix-blend-multiply filter opacity-20"
            ></div>

            {/* --- Icon with a floating, styled container --- */}
            <div className="relative z-10 flex-shrink-0 p-3 bg-[var(--color-bg-surface)] rounded-full shadow-md shadow-black/10 ring-2 ring-white/10">
              <Zap className="h-8 w-8 text-[var(--color-info-text)]" />
            </div>

            {/* --- Text content with updated message --- */}
            <div className="relative z-10 flex-grow">
              <h3 className="text-lg font-extrabold font-[var(--font-primary)] text-[var(--color-text-strong)]">
                Ready to Generate Diet Plan
              </h3>
              <p className="mt-1 text-sm text-[var(--color-text-muted)] leading-relaxed">
                You can generate a plan using the patient's profile. For <strong>better results and accuracy</strong>, we strongly recommend adding lab reports if they are available.
              </p>
            </div>
          </motion.div>

        /* Condition 3: Both profile and lab reports exist (Show AI suggestions) */
        ) : (
          suggestionCards.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] p-4 sm:p-6 rounded-xl space-y-4"
            >
              <h3 className="text-lg font-[var(--font-secondary)] font-semibold text-[var(--color-text-strong)] flex items-center gap-2">
                <Zap size={20} className="text-[var(--color-primary)]" />
                AI-Powered Suggestions for <span>{profile.full_name}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {suggestionCards.map((card) => (
                  <motion.div
                    key={card.key}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className={`group relative p-5 rounded-xl border-2 transition-all duration-300
                      bg-[var(--color-bg-surface)] 
                      border-[var(--color-border-default)]
                      border-l-4 border-l-[var(--color-primary)] 
                      hover:shadow-xl hover:shadow-gray-200/50
                      ${card.theme.border}`}
                  >
                    <div
                      className={`inline-flex p-3 mb-4 rounded-lg transition-all duration-300
                        bg-[var(--color-bg-interactive-subtle)]
                        ${card.theme.iconBg}`}
                    >
                      {React.cloneElement(card.icon, {
                        className: `w-7 h-7 transition-colors duration-300 
                          text-[var(--color-text-strong)] 
                          ${card.theme.iconText}`,
                      })}
                    </div>
                    <div>
                      <h4 className={`text-lg font-extrabold font-[var(--font-primary)] text-[var(--color-text-strong)] transition-colors duration-300 ${card.theme.titleText}`}>
                        {card.title}
                      </h4>
                      <p className="mt-2 text-sm text-[var(--color-text-muted)] leading-relaxed">{card.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )
        )}

{currentPlan?.status === "generating" && (
  <div className="p-10 text-center bg-[var(--color-bg-app)] rounded-xl border-2 border-dashed border-[var(--color-border-default)]">
    <FaSpinner className="animate-spin text-4xl text-[var(--color-primary)] mx-auto mb-4" />
    <p className="font-semibold text-lg text-[var(--color-text-strong)]">
      AI is generating the diet plan...
    </p>
  </div>
)}
{currentPlan?.status === "failed" && (
  <div className="p-8 text-center bg-red-50 border border-red-200 rounded-xl">
    <AlertTriangle className="mx-auto text-red-500 text-3xl mb-3" />
    <p className="font-semibold text-red-600 mb-4">
      AI failed to generate the plan.
    </p>
    <button
      onClick={handleGenerateDiet}
      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
    >
      Retry
    </button>
  </div>
)}


                    {isPlanRenderable ? (

                      diets.map((diet) => {
  // --- THIS IS THE FIX ---
  // We now explicitly filter the keys to only include ones that start with "Day"
  const planDays = Object.keys(diet.meals || {}).filter(key => 
    key.toLowerCase().startsWith('day ')
  );
                        const activeDay =
                          activeDayPerDiet[diet.id] ||
                          (planDays.length > 0 ? planDays[0] : null);
                        const isEditingThisDay =
                          editingDay?.dietId === diet.id &&
                          editingDay?.day === activeDay;

                        return (
                          <div
                            key={diet.id}
                            className="bg-[var(--color-bg-surface)] p-6 rounded-xl border-2 border-[var(--color-border-default)] space-y-4 shadow-sm"
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 pb-4 border-b-2 border-dashed border-[var(--color-border-default)]">
                              <div>
                                <h3 className="text-lg font-bold font-[var(--font-secondary)] text-[var(--color-text-strong)]">
                                  Plan for week starting:{" "}
                                  {new Date(
                                    diet.for_week_starting + "T00:00:00"
                                  ).toLocaleDateString()}
                                </h3>
                                <p className="text-sm text-[var(--color-text-muted)]">
                                  Generated by:{" "}
                                  <strong className="capitalize">
                                    {diet.generated_by || "Manual"}
                                  </strong>
                                </p>
                              </div>
                              <div className="flex items-center gap-4">
                                <span
                                  className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${
                                    diet.status === "approved"
                                      ? "bg-[var(--color-success-bg-subtle)] text-[var(--color-success-text)]"
                                      : diet.status === "pending"
                                      ? "bg-[var(--color-warning-bg-subtle)] text-[var(--color-warning-text)]"
                                      : "bg-[var(--color-danger-bg-subtle)] text-[var(--color-danger-text)]"
                                  }`}
                                >
                                  {diet.status}
                                </span>
                                {diet.status !== "rejected" && (
                                  <button
                                    onClick={() => handleDeletePlan(diet.id)}
                                    disabled={
                                      deletingPlanId === diet.id || isReviewing
                                    }
                                    className="p-2 text-sm text-[var(--color-danger-text)] bg-[var(--color-danger-bg-subtle)] rounded-full hover:bg-[var(--color-danger-bg)] hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Delete Plan"
                                  >
                                    {deletingPlanId === diet.id ? (
                                      <FaSpinner className="animate-spin" />
                                    ) : (
                                      <FaTrashAlt />
                                    )}
                                  </button>
                                )}
                                
                              </div>
                              {diet.status !== "archived" && diet.status !== "rejected" ? (
    <button
      onClick={() => handleArchivePlan(diet.id)}
      disabled={isArchiving === diet.id}
      className="p-2 text-sm text-[var(--color-info-text)] bg-[var(--color-info-bg-subtle)] rounded-full hover:bg-[var(--color-info-bg)] hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      title="Archive Plan"
      aria-label={`Archive plan ${diet.id}`}
    >
      {isArchiving === diet.id ? <FaSpinner className="animate-spin" /> : <FaArchive />}
    </button>
  ) : null}

  {/* If plan IS archived, show Restore button */}
  {diet.status === "archived" && (
    <button
      onClick={() => handleRestorePlan(diet.id)}
      disabled={isArchiving === diet.id}
      className="p-2 text-sm text-[var(--color-success-text)] bg-[var(--color-success-bg-subtle)] rounded-full hover:bg-[var(--color-success-bg)] hover:text-[var(--color-success-text)] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      title="Restore Plan"
      aria-label={`Restore plan ${diet.id}`}
    >
      {isArchiving === diet.id ? <FaSpinner className="animate-spin" /> : <FaUndo />}
    </button>
  )}
</div>
                           
                            

                            {planDays.length > 0 && (
                              <div className="flex flex-wrap gap-2 border-b-2 border-[var(--color-border-default)] pb-4">
                                {planDays.map((day) => (
                                  <button
                                    key={day}
                                    onClick={() => {
                                      setActiveDayPerDiet((prev) => ({
                                        ...prev,
                                        [diet.id]: day,
                                      }));
                                      setEditingDay(null);
                                    }}
                                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-all capitalize ${
                                      activeDay === day
                                        ? "bg-[var(--color-primary)] text-[var(--color-text-on-primary)] shadow-md"
                                        : "bg-[var(--color-bg-app)] text-[var(--color-text-default)] hover:bg-[var(--color-bg-interactive-subtle)]"
                                    }`}
                                  >
                                    {day.replace(/_/g, " ")}
                                  </button>
                                ))}
                              </div>
                            )}

                            {activeDay && diet.meals[activeDay] && (
                              <AnimatePresence mode="wait">
                                <motion.div
                                  key={activeDay}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="overflow-x-auto"
                                >
                                  <table className="min-w-full text-sm">
                                    <thead className="bg-[var(--color-bg-app)]">
                                      <tr>
                                        <th className="py-2 px-3 text-left font-semibold text-[var(--color-text-muted)]">
                                          Meal Time
                                        </th>
                                        <th className="py-2 px-3 text-left font-semibold text-[var(--color-text-muted)]">
                                          Food Item
                                        </th>
                                        <th className="py-2 px-3 text-left font-semibold text-[var(--color-text-muted)]">
                                          Calories(g)
                                        </th>
                                        <th className="py-2 px-3 text-left font-semibold text-[var(--color-text-muted)]">
                                          Carbs(g)
                                        </th>
                                        <th className="py-2 px-3 text-left font-semibold text-[var(--color-text-muted)]">
                                          Fiber(g)
                                        </th>
                                        <th className="py-2 px-3 text-left font-semibold text-[var(--color-text-muted)]">
                                          Protein(g)
                                        </th>
                                        <th className="py-2 px-3 text-left font-semibold text-[var(--color-text-muted)]">
                                          Sugar(g)
                                        </th>
                                        <th className="py-2 px-3 text-left font-semibold text-[var(--color-text-muted)]">
                                          Fats(g)
                                        </th>
                                        {!isCurrentPlanApproved && (
      <th className="py-2 px-3 text-center font-semibold text-[var(--color-text-muted)] w-20">
        Actions
      </th>
    )}
                                      </tr>
                                    </thead>
                                                                        <tbody>
            {(() => {
              // Create a quick lookup map with normalized keys from the current diet data.
              // This handles any key format from the API ("Early-Morning", "breakfast", etc.).
              const mealLookup = Object.entries(diet.meals[activeDay] || {}).reduce((acc, [key, value]) => {
                const normalized = key.replace(/-/g, " ").toLowerCase();
                // Store the data AND the original key for editing state management
                acc[normalized] = { ...value, originalKey: key }; 
                return acc;
              }, {});

              // Now, map over our *display order* and use the lookup map for a perfect match.
              return DIET_PLAN_MEAL_ORDER.map((canonicalMealType) => {
                const normalizedKey = canonicalMealType.toLowerCase();
                const meal = mealLookup[normalizedKey]; // Direct, unambiguous lookup

                // If no meal of this type exists in the data, don't render a row.
                if (!meal) {
                  return null;
                }

                // A meal was found, so we can get its original key for the input handler.
                const originalKeyForState = meal.originalKey;
                const inputClass =
                  "w-full bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded px-2 py-1 text-sm focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none";
                
                return (
                  <tr
                    key={canonicalMealType} // Use the clean, canonical name for the React key
                    className="border-b border-[var(--color-border-default)] hover:bg-[var(--color-bg-app)]/50"
                  >
                    <td className="py-3 px-3 capitalize font-semibold text-[var(--color-text-strong)]">
                      {canonicalMealType}
                    </td>
                    <td className="py-3 px-3">
  {isEditingThisDay ? (
    <input
      type="text"
      value={
        editStates[diet.id]?.[activeDay]?.[originalKeyForState]?.food_name ??
        meal.food_name ??
        ""
      }
      onChange={(e) =>
        handleInputChange(
          diet.id,
          activeDay,
          originalKeyForState,
          "food_name",
          e.target.value
        )
      }
      // Add the disabled attribute here VVV
      disabled={diet.status === 'approved'}
      className={`${inputClass} ${diet.status === 'approved' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
    />
  ) : (
    meal.food_name || ""
  )}
</td>
                    <td className="py-3 px-3">{meal.Calories ?? "-"}</td>
                    <td className="py-3 px-3">{meal.Carbs ?? "-"}</td>
                    <td className="py-3 px-3">{meal.Fiber ?? "-"}</td>
                    <td className="py-3 px-3">{meal.Protein ?? "-"}</td>
                    <td className="py-3 px-3">{meal.Sugar ?? "-"}</td>
                    <td className="py-3 px-3">{meal.Fats ?? "-"}</td>
                   {!isCurrentPlanApproved && (
  <td className="py-3 px-3 text-center">
    {!isEditingThisDay && diet.status !== "rejected" && (
      <button
        onClick={() =>
          setEditingDay({
            dietId: diet.id,
            day: activeDay,
          })
        }
        className="text-[var(--color-text-default)] hover:text-[var(--color-primary)] transition-colors"
        title={`Edit ${
          activeDay.charAt(0).toUpperCase() +
          activeDay.slice(1)
        }'s Plan`}
      >
        <FaPencilAlt />
      </button>
    )}
  </td>
)}
                  </tr>
                );
              });
            })()}
          </tbody>
                                    {/* --- [NEW] Table footer for displaying daily totals --- */}
                                    {dailyTotals && (
                                      <tfoot className="bg-[var(--color-bg-app)] border-t-2 border-[var(--color-border-default)]">
                                        <tr>
                                          <td
                                            colSpan="2"
                                            className="py-3 px-3 text-right font-bold text-[var(--color-text-strong)]"
                                          >
                                            Daily Totals:
                                          </td>
                                          <td className="py-3 px-3 font-bold text-[var(--color-primary)]">
                                            {dailyTotals.Calories.toFixed(1)}
                                          </td>
                                          <td className="py-3 px-3 font-bold text-[var(--color-text-strong)]">
                                            {dailyTotals.Carbs.toFixed(1)}
                                          </td>
                                          <td className="py-3 px-3 font-bold text-[var(--color-text-strong)]">
                                            {dailyTotals.Fiber.toFixed(1)}
                                          </td>
                                          <td className="py-3 px-3 font-bold text-[var(--color-text-strong)]">
                                            {dailyTotals.Protein.toFixed(1)}
                                          </td>
                                          <td className="py-3 px-3 font-bold text-[var(--color-text-strong)]">
                                            {dailyTotals.Sugar.toFixed(1)}
                                          </td>
                                          <td className="py-3 px-3 font-bold text-[var(--color-text-strong)]">
                                            {dailyTotals.Fats.toFixed(1)}
                                          </td>
                                          <td className="py-3 px-3"></td>
                                        </tr>
                                      </tfoot>
                                    )}
                                  </table>
                                </motion.div>
                              </AnimatePresence>
                            )}

                            <div className="pt-4 space-y-4">
                              {isEditingThisDay && (
  <div className="flex items-center gap-4 p-4 bg-[var(--color-bg-app)] rounded-lg">
    <p className="text-sm font-semibold text-[var(--color-text-strong)] flex-grow">
      {/* Add a message if the plan is approved */}
      {diet.status === 'approved' ? (
        <span className="text-[var(--color-success-text)]">
          This plan is approved and cannot be edited.
        </span>
      ) : (
        <>
          Editing plan for{" "}
          <span className="capitalize">
            {activeDay?.replace(/_/g, " ")}
          </span>.
        </>
      )}
    </p>
    <button
      onClick={() =>
        handleCancelEdit(diet.id, activeDay)
      }
      className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm bg-[var(--color-bg-interactive-subtle)] text-[var(--color-text-default)] hover:bg-opacity-80"
    >
      <FaTimes /> 
      {/* Change text based on context */}
      {diet.status === 'approved' ? 'Close' : 'Cancel'}
    </button>
    
    {/* Conditionally render the Save button VVV */}
    {diet.status !== 'approved' && (
      <button
        onClick={() =>
          handleSave(diet.id, activeDay)
        }
        disabled={isSaving}
        className="flex items-center justify-center gap-2 px-4 py-2 w-28 rounded-lg font-semibold text-sm bg-[var(--color-success-bg)] text-[var(--color-success-text)] hover:bg-[var(--color-success-bg-hover)] disabled:opacity-50"
      >
        {isSaving ? (
          <FaSpinner className="animate-spin" />
        ) : (
          <FaSave />
        )}{" "}
        Save
      </button>
    )}
  </div>
)}
                              {diet.status === "pending" && (
                                <div className="p-4 bg-[var(--color-info-bg-subtle)] border-2 border-[var(--color-info-text)]/20 rounded-lg space-y-3">
                                  <h4 className="font-semibold text-[var(--color-info-text)]">
                                    Review This Plan
                                  </h4>
                                  <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Add instructions or comments... (required for rejection)"
                                    className="w-full p-2 text-sm bg-[var(--color-bg-surface)] border-2 border-[var(--color-border-default)] rounded-md focus:border-[var(--color-primary)] outline-none"
                                    rows="3"
                                  ></textarea>
                                  <div className="flex items-center gap-4">
                                    <button
                                      onClick={() =>
                                        handleReview(diet.id, "approved")
                                      }
                                      disabled={isReviewing}
                                      className="flex items-center justify-center gap-2 px-4 py-2 w-32 rounded-lg font-semibold text-sm bg-[var(--color-success-bg)] text-[var(--color-success-text)] hover:bg-[var(--color-success-bg-hover)] disabled:opacity-50"
                                    >
                                      {isReviewing ? (
                                        <FaSpinner className="animate-spin" />
                                      ) : (
                                        <FaCheck />
                                      )}{" "}
                                      Approve
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleReview(diet.id, "rejected")
                                      }
                                      disabled={isReviewing || !comment}
                                      className="flex items-center justify-center gap-2 px-4 py-2 w-32 rounded-lg font-semibold text-sm bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] hover:bg-[var(--color-danger-bg-hover)] disabled:opacity-50"
                                    >
                                      {isReviewing ? (
                                        <FaSpinner className="animate-spin" />
                                      ) : (
                                        <FaTimes />
                                      )}{" "}
                                      Reject
                                    </button>
                                  </div>
                                </div>
                              )}
                              {diet.status === "approved" && (
                                <div className="p-5 bg-[var(--color-bg-app)] border-2 border-dashed border-[var(--color-border-default)] rounded-xl space-y-4 mt-4">
                                  <div>
                                    <h4 className="text-lg font-semibold text-[var(--color-text-strong)]">
                                      Help Improve Our AI
                                    </h4>
                                    <p className="text-sm text-[var(--color-text-secondary)]">
                                      Was this AI-generated plan helpful for the
                                      patient?
                                    </p>
                                  </div>

                                  <textarea
                                    value={feedback}
                                    onChange={(e) =>
                                      setFeedback(e.target.value)
                                    }
                                    placeholder="Optional: Provide specific feedback to help the AI learn..."
                                    className="w-full p-2.5 text-sm bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] rounded-md focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] outline-none transition-all duration-200"
                                    rows="3"
                                  ></textarea>

                                  <div className="flex items-center gap-x-3 pt-1">
                                    <button
                                      onClick={() =>
                                        handleFeedback(diet.id, true)
                                      }
                                      disabled={isSubmittingFeedback}
                                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold text-sm bg-[var(--color-success-bg)] text-[var(--color-success-text)] hover:bg-[var(--color-success-bg-hover)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200"
                                    >
                                      {isSubmittingFeedback ? (
                                        <FaSpinner className="animate-spin" />
                                      ) : (
                                        <FaThumbsUp />
                                      )}
                                      Helpful
                                    </button>

                                    <button
                                      onClick={() =>
                                        handleFeedback(diet.id, false)
                                      }
                                      disabled={isSubmittingFeedback}
                                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold text-sm border border-[var(--color-danger-border-subtle)] text-[var(--color-danger-text-subtle)] hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger-text)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200"
                                    >
                                      {isSubmittingFeedback ? (
                                        <FaSpinner className="animate-spin" />
                                      ) : (
                                        <FaThumbsDown />
                                      )}
                                      Not Helpful
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-16 bg-[var(--color-bg-app)] rounded-xl border-2 border-dashed border-[var(--color-border-default)]">
                        <p className="text-[var(--color-text-default)]">
                          No diet plans available. Generate a new one to get
                          started.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </main>
      <QuickTools
        onOpenAssistant={handleOpenAssistant}
        onOpenNutrition={handleOpenNutritionSearch}
      />

      <SmartAssistant
        isVisible={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />

      <NutritionPopup
        isVisible={showNutrition}
        onClose={() => setShowNutrition(false)}
      />
    </div>
  );
};

export default PatientDetailsPage;