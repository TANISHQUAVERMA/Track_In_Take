// src/components/layout/Layout.jsx

import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar"; // Assuming path is relative
import Footer from "./Footer"; // Assuming path is relative

const Layout = () => {
  const { user } = useAuth();

  // This logic is robust and unchanged
  if (!user || user.role.toLowerCase() !== "user") {
    // Redirect non-users or users with other roles
    return <Navigate to="/" replace />; 
  }

  return (
    // The root div now sets the global background, font, and text color for the entire app layout
    <div className="flex flex-col min-h-screen bg-[var(--color-bg-app)] font-[var(--font-secondary)] text-[var(--color-text-default)]">
      <Navbar />
      
      {/* The <main> content area provides flexible, responsive padding for all child pages */}
      <main className="flex-grow w-full p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;