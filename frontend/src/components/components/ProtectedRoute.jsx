// src/components/auth/ProtectedRoute.jsx

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader } from "lucide-react"; // Using a consistent, clean loader icon

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // A full-page, themed, and animated loading indicator
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[var(--color-bg-app)] font-[var(--font-secondary)] animate-fade-in">
        <Loader className="w-16 h-16 animate-spin text-[var(--color-primary)]" />
        <p className="text-xl text-[var(--color-text-strong)] font-[var(--font-primary)] mt-4">
          Verifying Access...
        </p>
      </div>
    );
  }

  // Redirect to home if not logged in.
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Check for the user's role.
  const userRole = user?.role?.toLowerCase();

  // Redirect to an "Unauthorized" page if the role doesn't match.
  if (requiredRole && userRole !== requiredRole.toLowerCase()) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If all checks pass, render the child components.
  return children;
};

export default ProtectedRoute;