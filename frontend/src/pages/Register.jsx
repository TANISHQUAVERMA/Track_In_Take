import React, { useEffect, useState } from "react";
import axios from "axios";
import { registerUser, sendOtp, verifyOtp } from "../api/auth";
import { User, Mail, Lock, CircleCheck, CircleX, User2, ShieldCheck, CreditCard, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { useGoogleLogin } from "@react-oauth/google";
import { loginWithGoogle } from "../api/socialAuth";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../components/context/AuthContext";
// ─── Constants ────────────────────────────────────────────────────────────────
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;
const BASE_URL = import.meta.env.VITE_API_URL;

// Plain axios with NO interceptors — used for public endpoints on registration page
const publicAxios = axios.create({ baseURL: BASE_URL });

// ─── Helper: Load Razorpay script ─────────────────────────────────────────────
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─── Main Component ───────────────────────────────────────────────────────────
const Register = ({ onSwitchToLogin }) => {
  const [role, setRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showChecklist, setShowChecklist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verificationToken, setVerificationToken] = useState(null);

  // ── Plan / Payment state ──────────────────────────────────────────────────
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  // After successful payment, store IDs so we can send them to registerUser
  const [paymentData, setPaymentData] = useState(null); // { razorpay_order_id, razorpay_payment_id, razorpay_signature }

  const { login } = useAuth();
  const navigate = useNavigate();

  // ── Password validation ───────────────────────────────────────────────────
  const isLengthValid = password.length >= 8;
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isMatch = confirmPassword !== "" && password === confirmPassword;
  const isFormValid = isLengthValid && hasSymbol && isMatch;

  // ── OTP timer ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let timer;
    if (otpSent && otpTimer > 0) {
      timer = setTimeout(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpSent, otpTimer]);

  // ── Reset payment state when role changes ─────────────────────────────────
  useEffect(() => {
    setPaymentData(null);
    setSelectedPlan(null);
  }, [role]);

  // ── OTP handlers ──────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!email) return toast.warn("Please enter your email address.");
    const normalizedEmail = email.trim().toLowerCase();
    setEmail(normalizedEmail);
    setOtpLoading(true);
    try {
      await sendOtp(normalizedEmail);
      toast.success(`OTP sent to ${normalizedEmail}`);
      setOtpSent(true);
      setOtpTimer(60);
    } catch (error) {
      toast.error(error?.response?.data?.email?.[0] || "Failed to send OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return toast.warn("Please enter the OTP.");
    try {
      const response = await verifyOtp(email, otp);
      const token = response?.verification_token || response?.data?.verification_token;
      if (token) {
        setVerificationToken(token);
        setIsOtpVerified(true);
        toast.success("Email verified successfully!");
      } else {
        toast.error("Verification failed. No token received.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.otp?.[0] || "Invalid OTP. Please try again.");
    }
  };

  // ── Fetch nutritionist plans ───────────────────────────────────────────────
  const fetchNutritionistPlans = async () => {
    setPlansLoading(true);
    try {
      const res = await publicAxios.get("/subscriptions/plans/?type=nutritionist");
      setPlans(res.data);
    } catch {
      toast.error("Failed to load plans. Please try again.");
    } finally {
      setPlansLoading(false);
    }
  };
  const fetchUserPlans = async () => {
  setPlansLoading(true);
  try {
    const res = await publicAxios.get("/subscriptions/plans/?type=patient");
    setPlans(res.data);
  } catch {
    toast.error("Failed to load plans. Please try again.");
  } finally {
    setPlansLoading(false);
  }
};
  // ── Open plan modal (triggered from submit when role = nutritionist) ───────
  const openPlanModal = async () => {
  setShowPlanModal(true);
  if (plans.length === 0) {
    if (role === "nutritionist") await fetchNutritionistPlans();
    else await fetchUserPlans();
  }
};

  // ── Razorpay payment flow ──────────────────────────────────────────────────
  const handlePurchasePlan = async (plan) => {
  setSelectedPlan(plan);
  setPaymentLoading(true);

  const scriptLoaded = await loadRazorpayScript();
  if (!scriptLoaded) {
    toast.error("Payment gateway failed to load. Please refresh.");
    setPaymentLoading(false);
    return;
  }

  try {
    // ✅ Use correct endpoint based on role
    const endpoint =
      role === "nutritionist"
        ? "/subscriptions/nutritionist-registration-order/"
        : "/subscriptions/user-registration-order/";

    const res = await publicAxios.post(endpoint, {
      plan_id: plan.id,
      email,
      full_name: fullName,
    });

    const { order_id, amount, currency, key } = res.data;

    const options = {
      key: key || RAZORPAY_KEY,
      amount,
      currency,
      name: "NutriApp",
      description: `${plan.name} Plan`,
      order_id,
      prefill: { name: fullName, email },
      theme: { color: "var(--color-primary, #f97316)" },
      handler: async function (response) {
          try {
            await publicAxios.post("/subscriptions/verify-payment/", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            setShowPlanModal(false);
            toast.success("Payment successful! Creating your account...");

            // ── Auto-register immediately after payment ──
            try {
              await registerUser({
                full_name: fullName,
                email,
                password,
                password2: confirmPassword,
                verification_token: verificationToken,
                role,
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
              });
              toast.success("🎉 Account created successfully! Please log in.");
              navigate("/login");
            } catch (regError) {
              const errData = regError?.response?.data;
              const message =
                errData?.payment?.[0] ||
                errData?.token?.[0] ||
                errData?.message ||
                "Registration failed after payment. Please contact support.";
              toast.error(message);
            }

          } catch {
            toast.error("Payment verification failed. Please contact support.");
          }
          setPaymentLoading(false);
        },
      modal: {
        ondismiss: () => {
          toast.info("Payment cancelled.");
          setPaymentLoading(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (error) {
    toast.error(error?.response?.data?.error || "Failed to initiate payment.");
    setPaymentLoading(false);
  }
};

  // ── Final registration ─────────────────────────────────────────────────────
  const handleRegister = async (e) => {
  e.preventDefault();

  if (!isFormValid) return toast.warn("Please ensure your password meets all requirements.");
  if (!role) return toast.error("Please select a role before registering.");

  // ✅ Gate payment for BOTH roles, not just nutritionist
  if (!paymentData) {
    openPlanModal();
    return;
  }

  setLoading(true);
  try {
    const payload = {
      full_name: fullName,
      email,
      password,
      password2: confirmPassword,
      verification_token: verificationToken,
      role,
      ...(paymentData && {
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
      }),
    };

    await registerUser(payload);
    toast.success("Registration successful! Please log in.");
    navigate("/login");
  } catch (error) {
    const errData = error?.response?.data;
    const message =
      errData?.payment?.[0] ||
      errData?.token?.[0] ||
      errData?.message ||
      "Registration failed. Please try again.";
    toast.error(message);
  } finally {
    setLoading(false);
  }
};

  // ── Google login ───────────────────────────────────────────────────────────
  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      const googleToken = tokenResponse.access_token;
      const res = await loginWithGoogle(googleToken);
      const { access, refresh, role, email: userEmail, full_name } = res.data;
      const id = jwtDecode(access).user_id;
      login(access, refresh, { id, role, email: userEmail, full_name });
      localStorage.setItem("userRole", role.toLowerCase());
      toast.success(`Welcome, ${full_name || "User"}!`);
      const redirectPath = { nutritionist: "/nutritionist", operator: "/operator", owner: "/owner" }[role.toLowerCase()] || "/dashboard";
      navigate(redirectPath);
    } catch {
      toast.error("Google login failed. Please try again.");
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error("Google login failed."),
  });

  // ── Animation variants ─────────────────────────────────────────────────────
  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };
  const checklistItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  // ── Submit button label logic ──────────────────────────────────────────────
  const submitLabel = () => {
  if (loading) return "Registering...";
  if (!paymentData) return "Continue →";
  return "Create Account";
};
  
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="text-left w-full max-w-sm mx-auto p-4 font-[var(--font-secondary)]">
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-[var(--font-primary)] text-center mb-6 text-[var(--color-text-strong)]"
      >
        Create Account
      </motion.h2>

      <motion.form
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        onSubmit={handleRegister}
        className="space-y-5"
      >
        {/* ── Step 1: Email + OTP ── */}
        {!isOtpVerified && (
          <>
            <motion.div variants={itemVariants}>
              <label className="block mb-1 text-sm font-semibold text-[var(--color-text-strong)]">Email</label>
              <div className="relative">
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] text-[var(--color-text-strong)] rounded-lg"
                  placeholder="email@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
                  required
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted)]" />
              </div>
              
              {!otpSent ? (
                <button
  type="button"
  onClick={handleSendOtp}
  disabled={otpLoading}
  className="w-full mt-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-text-on-primary)] py-3 rounded-lg font-semibold shadow-md disabled:opacity-50 transition-colors"
>
  {otpLoading ? "Sending..." : "Click here to get OTP →"}
</button>
              ) : (
                <button type="button" disabled={otpTimer > 0} onClick={handleSendOtp} className="text-sm text-[var(--color-primary)] mt-1 disabled:opacity-50">
                  {otpTimer > 0 ? `Resend in ${otpTimer}s` : "Resend OTP"}
                </button>
              )}
            </motion.div>

            {otpSent && (
              <motion.div variants={checklistItemVariants}>
                <label className="block mb-1 text-sm font-semibold text-[var(--color-text-strong)]">Enter OTP</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] text-[var(--color-text-strong)] rounded-lg"
                    placeholder="Enter OTP here"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted)]" />
                </div>
                <button
  type="button"
  onClick={handleVerifyOtp}
  disabled={loading}
  className="w-full mt-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-text-on-primary)] py-3 rounded-lg font-semibold shadow-md disabled:opacity-50 transition-colors"
>
  {loading ? "Verifying..." : "Continue →"}
</button>
              </motion.div>
            )}
          </>
        )}

        {/* ── Step 2: Role + Details ── */}
        {isOtpVerified && (
          <>
            {/* Role */}
            <motion.div variants={itemVariants}>
              <label className="block mb-1 text-sm font-semibold text-[var(--color-text-strong)]">Role</label>
              <div className="relative">
                <select
                  className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] text-[var(--color-text-strong)] rounded-lg appearance-none"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="">Select Role</option>
                  <option value="nutritionist">Nutritionist</option>
                  <option value="user">User</option>
                </select>
                <User2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted)]" />
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </motion.div>

            {/* Nutritionist plan info banner */}
           <AnimatePresence>
            {role && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {paymentData ? (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      <strong>{selectedPlan?.name}</strong> plan purchased — complete registration below.
                    </span>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-orange-50 border border-orange-300 text-sm text-orange-700">
                    <CreditCard className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                      Registration requires a <strong>plan purchase</strong>. You'll be prompted to select a plan next.
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

            {/* Full Name */}
            <motion.div variants={itemVariants}>
              <label className="block mb-1 text-sm font-semibold text-[var(--color-text-strong)]">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] text-[var(--color-text-strong)] rounded-lg"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted)]" />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants}>
              <label className="block mb-1 text-sm font-semibold text-[var(--color-text-strong)]">Password</label>
              <div className="relative">
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] text-[var(--color-text-strong)] rounded-lg"
                  placeholder="Min 8 chars + 1 symbol"
                  value={password}
                  onFocus={() => setShowChecklist(true)}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted)]" />
              </div>
            </motion.div>

            {/* Confirm Password */}
            <motion.div variants={itemVariants}>
              <label className="block mb-1 text-sm font-semibold text-[var(--color-text-strong)]">Confirm Password</label>
              <div className="relative">
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] text-[var(--color-text-strong)] rounded-lg"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted)]" />
              </div>
            </motion.div>
          </>
        )}

        {/* Password checklist */}
        {(isOtpVerified && (showChecklist || password || confirmPassword)) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="text-sm text-[var(--color-text-strong)] bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] p-3 rounded-md space-y-1"
          >
            <ChecklistItem isValid={isLengthValid} text="At least 8 characters" />
            <ChecklistItem isValid={hasSymbol} text="At least 1 special symbol" />
            <ChecklistItem isValid={isMatch} text="Passwords match" />
          </motion.div>
        )}

        {/* Submit */}
        {/* Submit — only show after OTP verified */}
{isOtpVerified && (
  <motion.button
    variants={itemVariants}
    type="submit"
    disabled={!isFormValid || loading}
    className="w-full bg-[var(--color-primary)] text-[var(--color-text-on-primary)] px-5 py-3 rounded-lg font-semibold shadow-lg hover:bg-[var(--color-primary-hover)] disabled:opacity-50 transition-colors"
  >
    {submitLabel()}
  </motion.button>
)}
      </motion.form>

      {/* Divider */}
      <div className="my-6 flex items-center">
        <div className="flex-grow border-t border-[var(--color-border-default)]"></div>
        <span className="mx-4 flex-shrink text-sm text-[var(--color-text-muted)]">OR</span>
        <div className="flex-grow border-t border-[var(--color-border-default)]"></div>
      </div>

      {/* Google */}
      {/* <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => googleLogin()}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-60"
        disabled={loading}
      >
        <svg className="h-5 w-5" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.021,35.596,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
        </svg>
        Sign in with Google
      </motion.button> */}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.6 } }}
        className="mt-6 text-center text-sm"
      >
        <span className="text-[var(--color-text-default)] font-medium">Already have an account? </span>
        <button onClick={onSwitchToLogin} className="text-[var(--color-primary)] font-semibold underline hover:text-[var(--color-primary-hover)] transition-colors">
          Login here
        </button>
      </motion.div>

      {/* ── Plan Selection Modal ── */}
      <AnimatePresence>
        {showPlanModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowPlanModal(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[var(--color-bg-app)] rounded-2xl shadow-2xl w-full max-w-lg p-6"
            >
              <h3 className="text-xl font-bold text-[var(--color-text-strong)] mb-1">Choose Your Plan</h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-6">
                Select a plan to activate your {role === "nutritionist" ? "nutritionist" : "user"} account.
              </p>

              {plansLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : plans.length === 0 ? (
                <p className="text-center text-[var(--color-text-muted)] py-8">No plans available. Please contact support.</p>
              ) : (
                <div className="space-y-3">
                  {plans.map((plan) => (
                    <motion.div
                      key={plan.id}
                      whileHover={{ scale: 1.01 }}
                      className="border-2 border-[var(--color-border-default)] hover:border-[var(--color-primary)] rounded-xl p-4 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-[var(--color-text-strong)] text-base">{plan.name}</p>
                          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                            {plan.duration_days} days
                            {plan.expert_consults > 0 && ` · ${plan.expert_consults} expert consults`}
                            {plan.inhouse_consults > 0 && ` · ${plan.inhouse_consults} in-house consults`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-[var(--color-primary)]">
                            ₹{plan.price.toLocaleString()}
                          </p>
                          <button
                            type="button"
                            disabled={paymentLoading}
                            onClick={() => handlePurchasePlan(plan)}
                            className="mt-1 text-xs bg-[var(--color-primary)] text-[var(--color-text-on-primary)] px-3 py-1.5 rounded-lg font-semibold hover:bg-[var(--color-primary-hover)] disabled:opacity-50 transition-colors"
                          >
                            {paymentLoading && selectedPlan?.id === plan.id ? "Loading..." : "Buy Now"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowPlanModal(false)}
                className="mt-5 w-full py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-strong)] transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Reusable Sub-components ──────────────────────────────────────────────────
const ChecklistItem = ({ isValid, text }) => (
  <div className={`flex items-center gap-2 ${isValid ? "text-[var(--color-success-text)]" : "text-[var(--color-danger-text)]"}`}>
    {isValid ? <CircleCheck className="w-4 h-4" /> : <CircleX className="w-4 h-4" />}
    <span>{text}</span>
  </div>
);

export default Register;