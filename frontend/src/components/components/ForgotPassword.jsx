// src/pages/auth/ForgotPassword.jsx

import React, { useState } from "react";
import { Mail, CheckCircle, ArrowLeft, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../api/auth";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error(error.response?.data?.error || "Something went wrong. Please try again.");
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
        
        <div className="text-center">
            <h2 className="text-3xl font-[var(--font-primary)] font-bold text-[var(--color-text-strong)] mb-2">Forgot Password</h2>
            {!submitted && (
              <p className="text-[var(--color-text-default)] mb-6">Enter your email to receive a reset link.</p>
            )}
        </div>

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
              <CheckCircle className="w-16 h-16 text-[var(--color-success-text)] mx-auto mb-4" />
              <p className="text-center text-[var(--color-text-default)] font-medium">
                If an account with that email exists, you will receive a password reset link shortly.
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
                <label htmlFor="email" className="block mb-1 font-semibold text-[var(--color-text-strong)] text-sm">Email Address</label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] text-[var(--color-text-strong)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-sm placeholder:text-[var(--color-text-muted)]"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted)]" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center bg-[var(--color-primary)] text-[var(--color-text-on-primary)] py-3 rounded-lg font-semibold hover:bg-[var(--color-primary-hover)] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-[.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? <span className="flex items-center gap-2"><Loader className="animate-spin" /> Sending...</span> : 'Send Reset Link'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-6 text-center">
            <Link to="/" className="text-sm font-medium text-[var(--color-primary)] hover:underline flex items-center justify-center gap-1">
                <ArrowLeft size={16} />
                Back to homepage
            </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;