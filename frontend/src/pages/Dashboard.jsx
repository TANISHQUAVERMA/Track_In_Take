import { Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import { useState ,useEffect} from "react";
import { useAuth } from "../components/context/AuthContext";
import AppointmentPage from "./AppointmentPage";


// Dashboard tools and pages
import UserProfileForm from "./dashboard/UserProfileForm";
import Tools from "./dashboard/Tools/Tools";
import BmiCalculator from "./dashboard/Tools/BmiCalculator";
import FatCalculator from "./dashboard/Tools/FatCalculator";
import FatResult from "./dashboard/Tools/FatResult";
import MealLogger from "./dashboard/Tools/MealLogger";
import NutritionSearch from "./dashboard/Tools/NutritionSearch";
import WeightTracker from "./dashboard/Tools/WeightTracker";
import WaterTracker from "./dashboard/Tools/WaterTracker";
import CustomReminder from "./dashboard/Tools/CustomReminder";
import HealthSection from "./dashboard/Tools/HealthSection";
import Meals from "./dashboard/Meals";
import Reports from "./Reports";

// Dashboard main components
import HeroSection from "../components/components/HeroSection";
import QuickMealLogger from "../components/components/MealLogger/QuickMealLogger";
import WaterIntakeWidget from "../components/components/WaterTracker/WaterWidget";
import HealthTools from "../components/components/HealthSection";
import DietRecommendations from "../components/components/RecommendationSection";
import HealthDashboard from "../components/components/diabetic/HealthDashboard";
import BlogsPage from "../components/components/Blogs";
import PatientChat from "../components/components/messages/PatientChat";
import { triggerReminders } from "../api/CustomReminderApi";
import DashboardPlans from "./dashboard/plans"
import UpgradeCard from "../components/subscription/upgradecard"
import { getMySubscription } from '../api/subscriptionService';
import Career from "./Career";



function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [waterUpdateTrigger, setWaterUpdateTrigger] = useState(0);
  const [mealUpdateTrigger, setMealUpdateTrigger] = useState(0); // ✅ New state
  useEffect(() => {
  const checkSubscription = async () => {
    try {
      const subscription = await getMySubscription();
      if (!subscription.has_plan) {
        navigate('/dashboard/plans', {
          state: { forced: true }
        });
      }
    } catch (err) {
      console.error("Subscription check failed:", err);
    }
  };

  if (user?.role === "user") {
    checkSubscription();
  }
}, [user]);
    // ✅ Only keep this one
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []); // The [user] dependency ensures this runs once when the user logs in.
  // --- END OF THE BLOCK TO ADD ---


  if (!user || user.role !== "user") {
    return <Navigate to="/" />;
  }

  if (!user || user.role !== "user") {
    return <Navigate to="/" />;
  }

  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      {location.pathname === "/dashboard" && (
        <>
          <HeroSection
            waterUpdateTrigger={waterUpdateTrigger}
            mealUpdateTrigger={mealUpdateTrigger} // ✅ Passed down
          />
         <UpgradeCard />
          <QuickMealLogger
            onMealLogged={() => setMealUpdateTrigger((prev) => prev + 1)} // ✅ Triggers refresh
          />
          <WaterIntakeWidget
            onWaterLogged={() => setWaterUpdateTrigger((prev) => prev + 1)}
          />
          <HealthTools />
          <DietRecommendations />
        
        </>
      )}

      <Routes>
        <Route path="user-profile" element={<UserProfileForm />} />
        <Route path="tools" element={<Tools />} />
        <Route path="tools/bmi" element={<BmiCalculator />} />
        <Route path="tools/fat-calculator" element={<FatCalculator />} />
        <Route path="fat-result" element={<FatResult />} />
        <Route path="tools/meal-log" element={<MealLogger />} />
        <Route path="tools/nutrition-search" element={<NutritionSearch />} />
        <Route path="tools/weight-tracker" element={<WeightTracker />} />
        <Route path="tools/water-tracker" element={<WaterTracker />} />
        <Route path="tools/custom-reminder" element={<CustomReminder />} />
        <Route path="health-section" element={<HealthSection />} />
        <Route path="meals" element={<Meals />} />
        <Route path="reports" element={<Reports />} />
        <Route path="/diabetes" element={<HealthDashboard />} />
        <Route path="/blogs-section" element={<BlogsPage />} />
        <Route path="/messages" element={<PatientChat/>} />
        <Route path="appointments" element={<AppointmentPage />} />
        <Route path="plans" element={<DashboardPlans />} />
        
      </Routes>
    </div>
  );
}

export default Dashboard;
