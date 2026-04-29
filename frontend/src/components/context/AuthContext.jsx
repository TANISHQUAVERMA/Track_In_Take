import React, { createContext, useContext, useEffect, useState } from "react";
import { logoutUser } from "../../api/auth";
import {
  getToken,
  setToken as storeToken,
  removeToken,
} from "../../services/tokenService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Detect role based on unique keys
  const detectRoleFromData = (userInfo) => {
    if (userInfo?.license_number) return "nutritionist";
    if (userInfo?.company_name) return "owner";
    if (userInfo?.assigned_tasks) return "operator";
    return "user";
  };

  useEffect(() => {
    const existingToken = getToken();
    if (existingToken) {
      setTokenState(existingToken);
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Error parsing stored user:", e);
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

const login = (newToken, refreshToken, userInfo) => {
  const role = userInfo.role?.toLowerCase() || detectRoleFromData(userInfo);

  const normalizedUser = {
    // 🔹 keep everything backend sends
    ...userInfo,

    // 🔹 normalize core fields
    id: userInfo.id || null,
    name:
      userInfo.full_name ||
      userInfo.name ||
      userInfo.username ||
      "Unknown",
    email: userInfo.email || "",
    role,

    // 🔹 ✅ EXPLICITLY PRESERVE THESE
    default_nutritionist_id: userInfo.default_nutritionist_id || null,
    default_nutritionist_name:
      userInfo.default_nutritionist_name || null,
  };

  storeToken(newToken);
  localStorage.setItem("refreshToken", refreshToken);
  localStorage.setItem("user", JSON.stringify(normalizedUser));

  setTokenState(newToken);
  setUser(normalizedUser);
};


const logout = async () => {
  try {
    const refresh = localStorage.getItem("refreshToken");
    if (refresh) {
      await logoutUser(refresh); // ✅ send to backend
    }
  } catch (err) {
    console.error("Logout API failed:", err);
    // Proceed anyway to clear localStorage
  } finally {
    removeToken(); // clear access token
    localStorage.removeItem("refreshToken"); // ✅ remove refresh token
    localStorage.removeItem("user");

    setTokenState(null);
    setUser(null);
  }
};


  const isAuthenticated = !!token && !!user;
  const role = user?.role || null;

  return (
    <AuthContext.Provider
      value={{
        token,
        login,
        logout,
        isAuthenticated,
        user,
        role,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
