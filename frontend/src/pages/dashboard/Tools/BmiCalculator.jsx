// src/pages/dashboard/tools/BmiCalculator.jsx

import React, { useState, useEffect } from 'react';
import { Calculator, CheckCircle, Lock, Zap } from 'lucide-react';
import { motion, AnimatePresence, animate as framerAnimate } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getMySubscription } from '../../../api/getMySubscription'; // ← adjust path to your API file

// ─── Feature flag used to gate this tool ───────────────────────────────────────
const REQUIRED_FEATURE = 'BMI_Calculator_allowed';

// ─── BMI category data ─────────────────────────────────────────────────────────
const bmiCategories = [
  { name: 'Underweight', range: '< 18.5', colorClasses: { bg: 'bg-[var(--color-warning-bg-subtle)]', border: 'border-[var(--color-warning-text)]', text: 'text-[var(--color-warning-text)]' } },
  { name: 'Normal',      range: '18.5 - 24.9', colorClasses: { bg: 'bg-[var(--color-success-bg-subtle)]', border: 'border-[var(--color-success-text)]',  text: 'text-[var(--color-success-text)]'  } },
  { name: 'Overweight',  range: '25 - 29.9',   colorClasses: { bg: 'bg-[var(--color-warning-bg-subtle)]', border: 'border-[var(--color-warning-text)]', text: 'text-[var(--color-warning-text)]' } },
  { name: 'Obese',       range: '> 30',        colorClasses: { bg: 'bg-[var(--color-danger-bg-subtle)]',  border: 'border-[var(--color-danger-text)]',  text: 'text-[var(--color-danger-text)]'  } },
];

const getBMICategory = (bmiValue) => {
  if (bmiValue < 18.5) return bmiCategories[0];
  if (bmiValue < 25)   return bmiCategories[1];
  if (bmiValue < 30)   return bmiCategories[2];
  return bmiCategories[3];
};

// ─── Animated number counter ───────────────────────────────────────────────────
const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    const controls = framerAnimate(displayValue, value, {
      type: 'spring', mass: 0.8, stiffness: 100, damping: 20,
      onUpdate: (latest) => setDisplayValue(latest),
    });
    return () => controls.stop();
  }, [value]);
  return <>{displayValue.toFixed(1)}</>;
};

// ─── Upgrade prompt shown inside the result panel ──────────────────────────────
const UpgradePrompt = ({ planName, onUpgrade }) => (
  <motion.div
    key="upgrade"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.35, ease: 'backOut' }}
    className="flex flex-col items-center justify-center text-center py-6 px-4 h-56"
  >
    {/* lock icon with pulsing ring */}
    <div className="relative mb-4">
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="w-16 h-16 rounded-full bg-[var(--color-warning-bg-subtle)] flex items-center justify-center"
      >
        <Lock size={28} className="text-[var(--color-warning-text)]" />
      </motion.div>
    </div>

    <h3 className="text-lg font-[var(--font-primary)] font-bold text-[var(--color-text-strong)] mb-1">
      Results Locked
    </h3>
    <p className="text-sm text-[var(--color-text-default)] mb-5 max-w-xs">
      Your <span className="font-semibold">{planName}</span> plan doesn't include
      health calculators. Upgrade to see your BMI result instantly.
    </p>

    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={onUpgrade}
      className="flex items-center gap-2 bg-[var(--color-primary)] text-[var(--color-text-on-primary)] font-bold px-6 py-2.5 rounded-full shadow-lg hover:bg-[var(--color-primary-hover)] transition-colors"
    >
      <Zap size={16} />
      Upgrade Plan
    </motion.button>
  </motion.div>
);

// ─── Main component ────────────────────────────────────────────────────────────
export default function BMICalculator() {
  const navigate = useNavigate();

  // form state
  const [gender, setGender]         = useState('Male');
  const [age, setAge]               = useState('');
  const [feet, setFeet]             = useState('');
  const [inches, setInches]         = useState('');
  const [weight, setWeight]         = useState('');
  const [weightUnit, setWeightUnit] = useState('lbs');
  const [bmi, setBmi]               = useState(null);

  // subscription state
  const [subscription, setSubscription] = useState(null);   // null = loading
  const [subLoaded, setSubLoaded]       = useState(false);

  // ── fetch subscription once on mount ────────────────────────────────────────
  useEffect(() => {
    const fetchSub = async () => {
      try {
        const data = await getMySubscription();
        setSubscription(data);
      } catch {
        // if fetch fails, treat as free (no access) — safe default
        setSubscription({ plan: { name: 'Free', BMI_Calculator_allowed: false } });
      } finally {
        setSubLoaded(true);
      }
    };
    fetchSub();
  }, []);

  // ── derive access from subscription ─────────────────────────────────────────
  // Change REQUIRED_FEATURE at the top of the file to swap the flag
  const hasAccess = subLoaded && subscription?.plan?.[REQUIRED_FEATURE] === true;
  const planName  = subscription?.plan?.name || 'Free';

  // ── calculate ────────────────────────────────────────────────────────────────
  const calculateBMI = () => {
    // If no access, don't calculate — the button itself shows upgrade UI
    // but this is a safety guard in case someone calls it directly
    if (!hasAccess) return;

    const numFeet    = parseInt(feet);
    const numInches  = parseInt(inches);
    const numWeight  = parseFloat(weight);

    if (!isNaN(numFeet) && !isNaN(numInches) && !isNaN(numWeight) && numWeight > 0) {
      const totalInches   = numFeet * 12 + numInches;
      const heightInMeters = totalInches * 0.0254;
      if (heightInMeters === 0) return;
      const weightInKg  = weightUnit === 'lbs' ? numWeight * 0.453592 : numWeight;
      const bmiValue    = weightInKg / (heightInMeters * heightInMeters);
      setBmi(bmiValue);
    }
  };

  // ── what happens when user clicks Calculate ──────────────────────────────────
  // If no access → show upgrade prompt in results panel instead of result
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleCalculateClick = () => {
    if (!subLoaded) return; // still loading, do nothing

    if (!hasAccess) {
      setShowUpgrade(true); // show upgrade prompt in result panel
      return;
    }
    setShowUpgrade(false);
    calculateBMI();
  };

  const bmiInfo = bmi && !showUpgrade ? getBMICategory(parseFloat(bmi)) : null;

  return (
    <div className="min-h-screen bg-[var(--color-bg-app)] py-10 px-4 sm:px-6 lg:px-8 font-[var(--font-secondary)]">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[var(--color-primary-bg-subtle)] rounded-full shadow-lg mb-4">
            <Calculator className="w-7 h-7 text-[var(--color-primary)]" />
          </div>
          <h1 className="text-3xl font-[var(--font-primary)] font-bold text-[var(--color-text-strong)] mb-2 tracking-tight">
            BMI Calculator
          </h1>
          <p className="text-[var(--color-text-default)]">Know your body mass index and stay fit</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">

          {/* ── Input panel ─────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-[var(--color-bg-surface)] border-2 border-[var(--color-border-default)] rounded-2xl shadow-xl p-6"
          >
            <h2 className="text-xl font-[var(--font-primary)] font-semibold text-[var(--color-text-strong)] mb-5">
              Enter Your Details
            </h2>

            {/* Gender toggle */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-[var(--color-text-strong)] mb-2">Gender</label>
              <div className="flex w-full bg-[var(--color-bg-app)] rounded-full p-1 border-2 border-[var(--color-border-default)]">
                {['Male', 'Female'].map((g) => (
                  <button key={g} onClick={() => setGender(g)} className="relative w-1/2 rounded-full py-2.5 text-sm font-semibold capitalize transition-colors">
                    <span className={`relative z-10 transition-colors ${gender === g ? 'text-[var(--color-text-on-primary)]' : 'text-[var(--color-text-default)] hover:text-[var(--color-text-strong)]'}`}>{g}</span>
                    {gender === g && (
                      <motion.div layoutId="gender-toggle-bmi" className="absolute inset-0 rounded-full bg-[var(--color-primary)]" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Age */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-[var(--color-text-strong)] mb-2">
                Age <span className="text-xs text-[var(--color-text-muted)] font-normal">(not used in BMI formula)</span>
              </label>
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-text-default)]"
                placeholder="e.g., 25" />
            </div>

            {/* Height */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-[var(--color-text-strong)] mb-2">Height</label>
              <div className="flex gap-3">
                <input type="number" value={feet} onChange={(e) => setFeet(e.target.value)}
                  className="w-1/2 px-4 py-2.5 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-text-default)]"
                  placeholder="Feet" min="0" />
                <select value={inches} onChange={(e) => setInches(e.target.value)}
                  className="w-1/2 px-4 py-2.5 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-text-default)]">
                  <option value="">Inches</option>
                  {[...Array(12)].map((_, i) => <option key={i} value={i}>{i} in</option>)}
                </select>
              </div>
            </div>

            {/* Weight */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[var(--color-text-strong)] mb-2">Weight</label>
              <div className="flex gap-3">
                <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)}
                  className="w-3/4 px-4 py-2.5 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-text-default)]"
                  placeholder="Enter weight" min="0" />
                <select value={weightUnit} onChange={(e) => setWeightUnit(e.target.value)}
                  className="w-1/4 px-4 py-2.5 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-text-default)]">
                  <option value="lbs">lbs</option>
                  <option value="kg">kg</option>
                </select>
              </div>
            </div>

            {/* ── Calculate button ── */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCalculateClick}
              disabled={!feet || inches === '' || !weight || !subLoaded}
              className="w-full font-bold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg flex items-center justify-center gap-2
                bg-[var(--color-primary)] text-[var(--color-text-on-primary)] hover:bg-[var(--color-primary-hover)]"
            >
              {/* Show lock icon on button if no access (subtle hint before they click) */}
              {subLoaded && !hasAccess && <Lock size={16} />}
              Calculate BMI
            </motion.button>

            {/* Subtle upgrade hint below button for free users */}
            {subLoaded && !hasAccess && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-center text-[var(--color-text-muted)] mt-2"
              >
                Upgrade your plan to unlock results
              </motion.p>
            )}
          </motion.div>

          {/* ── Result panel ─────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[var(--color-bg-surface)] border-2 border-[var(--color-border-default)] rounded-2xl shadow-xl p-6"
          >
            <h2 className="text-xl font-semibold text-[var(--color-text-strong)] mb-5">Your BMI Result</h2>

            <div className="mb-5">
              <AnimatePresence mode="wait">

                {/* ── Upgrade prompt ── */}
                {showUpgrade && (
                  <UpgradePrompt
                    planName={planName}
                    onUpgrade={() => navigate('/dashboard/plans')}
                  />
                )}

                {/* ── Actual result ── */}
                {!showUpgrade && bmiInfo && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.4, ease: 'backOut' }}
                    className="text-center mb-6"
                  >
                    <div className={`text-4xl font-bold ${bmiInfo.colorClasses.text} tracking-tight mb-2`}>
                      <AnimatedNumber value={parseFloat(bmi)} />
                    </div>
                    <div className="mt-2 text-sm text-[var(--color-text-muted)]">BMI</div>

                    <div className="relative w-40 h-40 mx-auto">
                      <svg className="w-full h-full" viewBox="0 0 100 100" transform="rotate(-90 50 50)">
                        <circle cx="50" cy="50" r="45" stroke="var(--color-border-default)" strokeWidth="10" fill="none" />
                        <motion.circle
                          cx="50" cy="50" r="45"
                          stroke="var(--color-primary)" strokeWidth="10" fill="none" strokeLinecap="round"
                          initial={{ strokeDasharray: `0, ${2 * Math.PI * 45}` }}
                          animate={{ strokeDasharray: `${Math.min(bmi / 40, 1) * 2 * Math.PI * 45}, ${2 * Math.PI * 45}` }}
                          transition={{ duration: 1, ease: 'circOut', delay: 0.2 }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`text-lg font-semibold ${bmiInfo.colorClasses.text}`}>{bmiInfo.name}</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── Placeholder (no result yet, no upgrade shown) ── */}
                {!showUpgrade && !bmiInfo && (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-center mb-6 h-56 flex flex-col justify-center items-center"
                  >
                    <div className="text-5xl font-bold text-[var(--color-text-muted)] mb-1 tracking-tight">--</div>
                    <div className="text-sm text-[var(--color-text-muted)]">Awaiting calculation...</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* BMI categories list */}
            <div className="space-y-3 mb-6">
              <h3 className="font-semibold text-[var(--color-text-strong)] mb-3">BMI Categories</h3>
              {bmiCategories.map((item) => (
                <div key={item.name}
                  className={`flex justify-between items-center p-3 rounded-lg transition-all duration-300 ${
                    bmiInfo?.name === item.name
                      ? `${item.colorClasses.bg} ${item.colorClasses.border} border-2 shadow-md`
                      : 'bg-[var(--color-bg-interactive-subtle)]'
                  }`}>
                  <span className={`${bmiInfo?.name === item.name ? item.colorClasses.text : 'text-[var(--color-text-default)]'} font-medium text-sm`}>{item.name}</span>
                  <span className="text-sm text-[var(--color-text-muted)]">{item.range}</span>
                </div>
              ))}
            </div>

            {/* Health tips */}
            <div className="bg-[var(--color-primary-bg-subtle)] rounded-xl p-4 shadow-inner">
              <h3 className="font-semibold text-[var(--color-primary)] mb-3">Health Tips</h3>
              <div className="space-y-2 text-sm text-[var(--color-text-default)]">
                {[
                  'Maintain a balanced diet with proper nutrition',
                  'Regular physical activity is essential',
                  'Stay hydrated throughout the day',
                  'Consult healthcare professionals for guidance',
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}