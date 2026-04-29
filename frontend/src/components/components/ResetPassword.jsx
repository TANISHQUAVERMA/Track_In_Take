// src/pages/auth/ResetPassword.jsx

import React, { useState } from "react";
import { Lock, CircleCheck, CircleX, Loader } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { resetPassword } from "../../api/auth";
import { motion, AnimatePresence } from "framer-motion";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { uidb64, token } = useParams();

  const isLengthValid = password.length >= 8;
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isMatch = password && password === confirmPassword;
  const isFormValid = isLengthValid && hasSymbol && isMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.warning("Please meet all password requirements.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ uidb64, token, password });
      toast.success("Password reset successful! Redirecting to login...");
      setSubmitted(true);
      setTimeout(() => navigate("/login"), 3000); // Navigate to login specifically
    } catch (error) {
      toast.error(error?.response?.data?.message || "Password reset failed. The link may be invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-app)] px-4 font-[var(--font-secondary)]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-[var(--color-bg-surface)] border-2 border-[var(--color-border-default)] rounded-2xl shadow-2xl p-6 sm:p-8 my-10"
      >
        <h2 className="text-3xl font-[var(--font-primary)] font-bold text-center text-[var(--color-text-strong)] mb-6">
          Reset Password
        </h2>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="text-center py-4"
            >
              <CircleCheck className="w-16 h-16 text-[var(--color-success-text)] mx-auto mb-4" />
              <p className="text-center text-[var(--color-text-default)] font-medium">
                Password updated successfully! Redirecting to login...
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div>
                <label htmlFor="password" className="block mb-1 font-semibold text-[var(--color-text-strong)] text-sm">New Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] text-[var(--color-text-strong)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-sm placeholder:text-[var(--color-text-muted)]"
                    placeholder="Create a new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setShowChecklist(true)}
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted)]" />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block mb-1 font-semibold text-[var(--color-text-strong)] text-sm">Confirm Password</label>
                {/* FIX START: Added a relative div wrapper, the Lock icon, and adjusted input padding for consistency */}
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type="password"
                    className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] text-[var(--color-text-strong)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-sm placeholder:text-[var(--color-text-muted)]"
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted)]" />
                </div>
                {/* FIX END */}
              </div>

              <AnimatePresence>
                {(showChecklist || confirmPassword) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    className="text-sm text-[var(--color-text-strong)] bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] p-3 rounded-md space-y-2"
                  >
                    <div className={`flex items-center gap-2 ${isLengthValid ? 'text-[var(--color-success-text)]' : 'text-[var(--color-danger-text)]'}`}>
                      {isLengthValid ? <CircleCheck className="w-5 h-5" /> : <CircleX className="w-5 h-5" />}
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`flex items-center gap-2 ${hasSymbol ? 'text-[var(--color-success-text)]' : 'text-[var(--color-danger-text)]'}`}>
                      {hasSymbol ? <CircleCheck className="w-5 h-5" /> : <CircleX className="w-5 h-5" />}
                      <span>At least 1 special symbol</span>
                    </div>
                    <div className={`flex items-center gap-2 ${isMatch ? 'text-[var(--color-success-text)]' : 'text-[var(--color-danger-text)]'}`}>
                      {isMatch ? <CircleCheck className="w-5 h-5" /> : <CircleX className="w-5 h-5" />}
                      <span>Passwords match</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={!isFormValid || loading}
                className="w-full flex items-center justify-center bg-[var(--color-primary)] text-[var(--color-text-on-primary)] py-3 rounded-lg font-semibold hover:bg-[var(--color-primary-hover)] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? <span className="flex items-center gap-2"><Loader className="animate-spin" /> Resetting...</span> : 'Reset Password'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ResetPassword;