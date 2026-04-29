// src/utils/logoutHelper.js
import { removeToken } from "../services/tokenService";

export const forceLogout = () => {
  try {
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    removeToken();
    window.location.href = "/"; // redirect to login
  } catch (err) {
    console.error("Force logout error:", err);
  }
};
