import React, { useState, useCallback, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./components/context/AuthContext";
import { Loader } from "lucide-react";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./components/components/ForgotPassword";
import ResetPassword from "./components/components/ResetPassword";
import Unauthorized from "./pages/Unauthorized";

import OwnerPage from "./pages/OwnerPage";
import OperatorPage from "./pages/OperatorPage";
import NutritionistPage from "./pages/NutritionistPage";
import Dashboard from "./pages/Dashboard";

import Navbar from "./components/components/Navbar";
import NotificationDropdown from "./components/components/NotificationDropdown";
import Footer from "./components/components/Footer";
import ProtectedRoute from "./components/components/ProtectedRoute";
import logo from "./assets/logo.png";

import BlogDetail from "./components/components/BlogDetails";
import BlogsPage from "./components/components/Blogs";
import HomeBlog from "./components/components/HomeBlog";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { ProfileDropdown } from "./components/components/ProfileDropdown";
import QuickTools from "./components/components/nutritionist/QuickTools";
import SmartAssistant from "./components/components/nutritionist/SmartAssistant";
import NutritionPopup from "./components/components/nutritionist/NutritionPopup";
import ChatPopUp from "./components/components/messages/ChatPopUp";
import SocialAuthHandler from "./components/components/SocialAuthHandler";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import PrivacyPolicy from "./pages/dashboard/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import RefundPolicy from "./pages/RefundPolicy";
import ContactPage from "./pages/dashboard/Tools/Contact";

import useWebSockets from "./api/useWebSockets";
import { FoodSuggestionToast } from "./components/FoodSuggestionToast";
import { FoodSuggestionsDrawer } from "./components/components/FoodSuggestionsDrawer";
import Career from "./pages/Career";

// Health Dashboard Imports
import HealthDashboard from "./components/components/diabetic/HealthDashboard";
import LabReportForm from "./components/components/diabetic/LabReportForm";
import AddDiabeticInfoModal from "./components/components/diabetic/AddDiabeticInfoModal";
import LabReportsList from "./components/components/diabetic/LabReportsList";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ── Stable no-op callbacks defined OUTSIDE the component ────────

const noop = () => {};

function App() {
  const { isAuthenticated, user, loading } = useAuth();

  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerInitData, setDrawerInitData] = useState(null);
  
  // State for Add Report Modal
  const [isAddReportModalOpen, setIsAddReportModalOpen] = useState(false);

  // Stable callback — useCallback with [] is correct here
  const handleSuggestion = useCallback((data) => {
    console.log("🍽️ Food suggestion received:", data);
    setSuggestion({
      message: data.message || "",
      topSuggestion: data.top_suggestion || "",
      reason: data.reason || "",
      caloriesLeft: data.calories_left || 0,
      receivedAt: Date.now(),
    });
  }, []);

  // ── useWebSockets with stable references ─────────────────────
  useWebSockets({
    onReminder: noop,
    onMessage: noop,
    onSuggestion: handleSuggestion,
  });

  // ── Trigger suggest-foods API on dashboard load ───────────────
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "user") return;
    const token = localStorage.getItem("token");
    if (!token) return;
    console.log("🔍 Calling suggest-foods API...");
    fetch(`${API_BASE}/suggest-foods/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => console.log("📊 suggest-foods delivery:", d.delivery))
      .catch(() => {});
  }, [isAuthenticated, user]);

  const handleOpenAssistant = () => setIsAssistantOpen(true);
  const handleOpenNutritionSearch = () => setShowNutrition(true);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[var(--color-bg-app)] font-[var(--font-secondary)]">
        <Loader className="w-16 h-16 animate-spin text-[var(--color-primary)]" />
        <p className="text-xl text-[var(--color-text-strong)] font-[var(--font-primary)] mt-4">
          Loading Application...
        </p>
      </div>
    );
  }

  const getRedirectPath = () => {
    const role = user?.role?.toLowerCase();
    if (!role) return "/";
    switch (role) {
      case "owner":
      case "operator":
      case "nutritionist":
        return `/${role}`;
      case "user":
      default:
        return "/dashboard";
    }
  };

  // Navbar links configuration with Health dropdown
  const navLinks = [
    { label: "Home", to: "/dashboard" },
    { label: "Tools", to: "/dashboard/tools" },
    { 
      label: "Health", 
      dropdown: true,
      items: [
        { label: "Health Dashboard", to: "/dashboard/health-section" },
        { label: "Lab Reports", to: "/dashboard/lab-reports" },
        { label: "Add Report", to: "/dashboard/add-report" }
      ]
    },
    { label: "Diet", to: "/dashboard/meals" },
    { label: "Progress", to: "/dashboard/reports" },
    { label: "Blogs", to: "/blogs-section" },
    { label: "Appointments", to: "/dashboard/appointments" },
    { label: "Plans", to: "/dashboard/plans" },
  ];

  return (
    <>
      {isAuthenticated && user?.role === "user" && (
        <Navbar
          align="center"
          links={navLinks}
          rightContent={
            <div className="flex items-center gap-4">
              <NotificationDropdown />
              <ProfileDropdown />
            </div>
          }
        />
      )}

      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to={getRedirectPath()} /> : <Home />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to={getRedirectPath()} /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to={getRedirectPath()} /> : <Register />} />
        <Route path="/forgot-password" element={isAuthenticated ? <Navigate to={getRedirectPath()} /> : <ForgotPassword />} />
        <Route path="/reset-password/:uidb64/:token" element={isAuthenticated ? <Navigate to={getRedirectPath()} /> : <ResetPassword />} />
        <Route path="/owner" element={<ProtectedRoute requiredRole="owner"><OwnerPage /></ProtectedRoute>} />
        <Route path="/operator" element={<ProtectedRoute requiredRole="operator"><OperatorPage /></ProtectedRoute>} />
        <Route path="/nutritionist/*" element={<ProtectedRoute requiredRole="nutritionist"><NutritionistPage /></ProtectedRoute>} />
        <Route path="/dashboard/*" element={<ProtectedRoute requiredRole="user"><Dashboard /></ProtectedRoute>} />
        
        {/* Health Dashboard Routes */}
        <Route path="/dashboard/health-section" element={
          <ProtectedRoute requiredRole="user">
            <HealthDashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/lab-reports" element={
          <ProtectedRoute requiredRole="user">
            <LabReportsList />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/add-report" element={
          <ProtectedRoute requiredRole="user">
            <div className="min-h-screen bg-[var(--color-bg-app)] py-8">
              <div className="max-w-5xl mx-auto px-4">
                <LabReportForm />
              </div>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/blog/:blogId" element={<BlogDetail />} />
        <Route path="/blogs" element={<HomeBlog />} />
        <Route path="/blogs-section" element={<BlogsPage />} />
        <Route path="/social-auth" element={<SocialAuthHandler />} />
        <Route path="/subscription/success" element={<SubscriptionSuccess />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/Contact" element={<ContactPage />} />
        <Route path="/pages/Career" element={<Career />} />
      </Routes>

      {isAuthenticated && user?.role === "user" && (
        <>
          <QuickTools
            onOpenAssistant={handleOpenAssistant}
            onOpenNutrition={handleOpenNutritionSearch}
            onOpenChat={() => setIsChatOpen(true)}
            userRole={user?.role}
          />
          <SmartAssistant
            isVisible={isAssistantOpen}
            onClose={() => setIsAssistantOpen(false)}
          />
          <NutritionPopup
            isVisible={showNutrition}
            onClose={() => setShowNutrition(false)}
          />
          <ChatPopUp
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
          />
          <FoodSuggestionToast
            suggestion={suggestion}
            onDismiss={() => setSuggestion(null)}
            onViewAll={() => {
              setDrawerInitData(null);
              setDrawerOpen(true);
            }}
          />
          <FoodSuggestionsDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            initialData={drawerInitData}
          />
        </>
      )}

      {isAuthenticated && user?.role === "user" && <Footer />}

      <ToastContainer position="top-right" autoClose={3000} pauseOnHover theme="light" />
    </>
  );
}

export default App;