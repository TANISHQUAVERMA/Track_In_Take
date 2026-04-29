import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginWithFacebook, loginWithGoogle } from "../../api/socialAuth";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode"; // ✅ Add this

const SocialAuthHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const code = query.get("code");
    const state = query.get("state")?.toLowerCase(); // "google" or "facebook"

    if (!code || !state) {
      toast.error("Missing authorization data. Please try again.");
      return navigate("/login");
    }

    const authFunction = state === "facebook" ? loginWithFacebook : loginWithGoogle;

    authFunction(code)
      .then((res) => {
        const { access, refresh, full_name, email, role } = res.data;
        const decoded = jwtDecode(access);
        const userInfo = {
          id: decoded.user_id,
          full_name,
          email,
          role,
        };

        login(access, refresh, userInfo);

        const roleLower = (role || "").toLowerCase();
        const path = {
          nutritionist: "/nutritionist",
          operator: "/operator",
          owner: "/owner",
        }[roleLower] || "/dashboard";

        toast.success(`Welcome back, ${full_name || "User"}!`);
        navigate(path);
      })
      .catch((err) => {
        console.error("Social login error:", err);
        toast.error("Social login failed. Try again.");
        navigate("/login");
      });
  }, [location]);

  return null; // Or a loading spinner
};

export default SocialAuthHandler;
