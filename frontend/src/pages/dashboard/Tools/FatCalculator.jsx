// src/pages/dashboard/tools/FatCalculator.jsx

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, animate as framerAnimate } from "framer-motion";
import { Sparkles, Zap, PersonStanding, Cake, Weight, Ruler, BarChart2, HeartPulse, Scale, BrainCircuit, Droplet, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getMySubscription } from '../../../api/getMySubscription'; // ← adjust path to your API file

// ─── Feature flag used to gate this tool ───────────────────────────────────────
const REQUIRED_FEATURE = 'Fat_Calculator_allowed';

// ─── Animated Number ───────────────────────────────────────────────────────────
const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    const controls = framerAnimate(displayValue, value, {
      type: "spring", mass: 0.8, stiffness: 100, damping: 20,
      onUpdate: (latest) => setDisplayValue(latest),
    });
    return () => controls.stop();
  }, [value]);
  return <>{value % 1 === 0 ? Math.round(displayValue) : displayValue.toFixed(1)}</>;
};

// ─── Gender Toggle ─────────────────────────────────────────────────────────────
const GenderToggle = ({ selected, setSelected }) => (
  <div>
    <label className="flex items-center gap-2 font-medium text-[var(--color-text-strong)] mb-2">
      <PersonStanding size={20} /> Gender
    </label>
    <div className="flex w-full bg-[var(--color-bg-app)] rounded-full p-1 border-2 border-[var(--color-border-default)]">
      {["male", "female"].map((option) => (
        <button key={option} onClick={() => setSelected(option)}
          className="relative w-1/2 rounded-full py-2.5 text-sm font-semibold capitalize transition-colors">
          <span className={`relative z-10 transition-colors ${selected === option ? 'text-[var(--color-text-on-primary)]' : 'text-[var(--color-text-default)] hover:text-[var(--color-text-strong)]'}`}>
            {option}
          </span>
          {selected === option && (
            <motion.div layoutId="gender-toggle-highlight"
              className="absolute inset-0 rounded-full bg-[var(--color-primary)]"
              transition={{ type: "spring", stiffness: 300, damping: 30 }} />
          )}
        </button>
      ))}
    </div>
  </div>
);

// ─── Custom Slider ─────────────────────────────────────────────────────────────
const CustomSlider = ({ label, value, onChange, min, max, unit, icon }) => {
  const progress = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <label className="flex items-center justify-between font-medium text-[var(--color-text-strong)] mb-2">
        <span className="flex items-center gap-2">{icon} {label}</span>
        <span className="font-semibold text-[var(--color-text-strong)]">{value} {unit}</span>
      </label>
      <div className="relative h-2 group">
        <input type="range" min={min} max={max} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-transparent appearance-none cursor-pointer
            [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:bg-[var(--color-border-default)]
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:-mt-1.5
            [&::-webkit-slider-thumb]:bg-[var(--color-bg-surface)] [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-[var(--color-primary)] [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:duration-200 active:[&::-webkit-slider-thumb]:scale-125"
          style={{ background: `linear-gradient(to right, var(--color-primary) ${progress}%, transparent ${progress}%)` }}
        />
      </div>
    </div>
  );
};

// ─── Number Stepper ────────────────────────────────────────────────────────────
const NumberStepper = ({ label, value, onChange, icon }) => (
  <div>
    <label className="flex items-center gap-2 font-medium text-[var(--color-text-strong)] mb-2">{icon} {label}</label>
    <div className="flex items-center justify-between w-full bg-[var(--color-bg-app)] rounded-xl p-1.5 border-2 border-[var(--color-border-default)]">
      <button type="button" onClick={() => onChange(value > 1 ? value - 1 : 1)}
        className="size-8 rounded-lg text-[var(--color-text-muted)] grid place-items-center font-bold text-xl hover:bg-[var(--color-bg-interactive-subtle)] active:scale-90 transition-all">-</button>
      <span className="w-16 text-center font-bold text-lg text-[var(--color-text-strong)]">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)}
        className="size-8 rounded-lg text-[var(--color-text-muted)] grid place-items-center font-bold text-xl hover:bg-[var(--color-bg-interactive-subtle)] active:scale-90 transition-all">+</button>
    </div>
  </div>
);

// ─── General Tips ──────────────────────────────────────────────────────────────
const GeneralTips = () => {
  const tips = [
    { icon: <Droplet size={18} className="text-[var(--color-info-text)]" />, text: "Stay hydrated throughout the day for accurate results." },
    { icon: <Zap size={18} className="text-[var(--color-warning-text)]" />, text: "Measurements can vary; consistency is more important than a single number." },
    { icon: <Scale size={18} className="text-[var(--color-success-text)]" />, text: "For best results, weigh yourself in the morning before eating." },
  ];
  return (
    <div className="mt-6 space-y-3">
      {tips.map((tip, index) => (
        <div key={index} className="flex items-start gap-3 text-sm p-3 bg-[var(--color-bg-app)] rounded-lg border-2 border-[var(--color-border-default)]">
          <div className="flex-shrink-0 mt-0.5">{tip.icon}</div>
          <p className="text-[var(--color-text-default)]">{tip.text}</p>
        </div>
      ))}
    </div>
  );
};

// ─── Result Ranges Chart ───────────────────────────────────────────────────────
const ResultRangesChart = ({ gender, result }) => {
  const rangesData = {
    male:   [{ l: 'Essential', m: 6, c: 'bg-[var(--color-accent-1-bg-subtle)]' }, { l: 'Athletic', m: 13, c: 'bg-[var(--color-success-bg-subtle)]' }, { l: 'Fit', m: 17, c: 'bg-[var(--color-info-bg-subtle)]' }, { l: 'Acceptable', m: 24, c: 'bg-[var(--color-warning-bg-subtle)]' }, { l: 'Obese', m: 40, c: 'bg-[var(--color-danger-bg-subtle)]' }],
    female: [{ l: 'Essential', m: 14, c: 'bg-[var(--color-accent-1-bg-subtle)]' }, { l: 'Athletic', m: 20, c: 'bg-[var(--color-success-bg-subtle)]' }, { l: 'Fit', m: 24, c: 'bg-[var(--color-info-bg-subtle)]' }, { l: 'Acceptable', m: 31, c: 'bg-[var(--color-warning-bg-subtle)]' }, { l: 'Obese', m: 45, c: 'bg-[var(--color-danger-bg-subtle)]' }],
  };
  const ranges = rangesData[gender];
  const totalMax = ranges[ranges.length - 1].m;
  const pointerPosition = (result / totalMax) * 100;

  return (
    <motion.div className="w-full mt-6" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
      <div className="relative h-8 w-full mt-1">
        <motion.div className="absolute top-0 transform -translate-x-1/2"
          initial={{ left: '0%' }} animate={{ left: `${Math.min(pointerPosition, 100)}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 1 }}>
          <div className="font-bold text-xs text-[var(--color-text-on-primary)] bg-[var(--color-text-strong)] rounded-full px-2 py-0.5 whitespace-nowrap">You</div>
          <div className="mx-auto mt-0.5 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-[var(--color-text-strong)]" />
        </motion.div>
      </div>
      <div className="relative h-4 w-full flex rounded-full overflow-hidden border border-[var(--color-border-default)]">
        {ranges.map((range, i) => {
          const prevMax = i > 0 ? ranges[i - 1].m : 0;
          return <div key={range.l} style={{ width: `${((range.m - prevMax) / totalMax) * 100}%` }} className={`h-full ${range.c}`} title={`${range.l} (${prevMax}-${range.m}%)`} />;
        })}
      </div>
      <div className="flex justify-between mt-1">
        {ranges.map(r => <span key={r.l} className="text-xs text-[var(--color-text-muted)]">{r.l}</span>)}
      </div>
    </motion.div>
  );
};

// ─── Next Steps ────────────────────────────────────────────────────────────────
const NextSteps = () => {
  const steps = [
    { t: 'Nutrition Focus',    i: <Scale size={24} />,       d: 'Balanced meals support a healthy body.',        bg: 'bg-[var(--color-success-bg-subtle)]', text: 'text-[var(--color-success-text)]' },
    { t: 'Consistent Activity', i: <HeartPulse size={24} />, d: 'Regular exercise is key for managing fat.',      bg: 'bg-[var(--color-warning-bg-subtle)]', text: 'text-[var(--color-warning-text)]' },
    { t: 'Expert Advice',       i: <BrainCircuit size={24} />, d: 'A professional can offer personalized guidance.', bg: 'bg-[var(--color-info-bg-subtle)]',    text: 'text-[var(--color-info-text)]'    },
  ];
  return (
    <motion.div className="w-full mt-8" variants={{ visible: { transition: { staggerChildren: 0.2 } } }}>
      <h3 className="font-bold text-[var(--color-text-strong)] text-lg text-center mb-4">Recommended Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {steps.map(s => (
          <motion.div key={s.t} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className={`${s.bg} p-4 rounded-lg text-center`}>
            <div className={`${s.text} w-12 h-12 bg-white/50 rounded-full mx-auto flex items-center justify-center`}>{s.i}</div>
            <h4 className="font-semibold text-[var(--color-text-strong)] mt-3">{s.t}</h4>
            <p className="text-xs text-[var(--color-text-default)] mt-1">{s.d}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// ─── Upgrade Prompt (shown in result panel) ────────────────────────────────────
const UpgradePrompt = ({ planName, onUpgrade }) => (
  <motion.div
    key="upgrade"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.35, ease: 'backOut' }}
    className="flex flex-col items-center justify-center text-center py-10 px-4 w-full"
  >
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
      health calculators. Upgrade to see your body fat estimate.
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

// ─── Main Component ────────────────────────────────────────────────────────────
export default function FatCalculator() {
  const navigate = useNavigate();

  // form state
  const [gender, setGender]   = useState("male");
  const [height, setHeight]   = useState(170);
  const [age, setAge]         = useState(25);
  const [weight, setWeight]   = useState(70);
  const [result, setResult]   = useState(null);

  // subscription state
  const [subscription, setSubscription] = useState(null);
  const [subLoaded, setSubLoaded]       = useState(false);

  // whether to show the upgrade prompt in the result panel
  const [showUpgrade, setShowUpgrade] = useState(false);

  // ── fetch subscription once on mount ────────────────────────────────────────
  useEffect(() => {
    const fetchSub = async () => {
      try {
        const data = await getMySubscription();
        setSubscription(data);
      } catch {
        setSubscription({ plan: { name: 'Free', Fat_Calculator_allowed: false } });
      } finally {
        setSubLoaded(true);
      }
    };
    fetchSub();
  }, []);

  // ── derive access ────────────────────────────────────────────────────────────
  const hasAccess = subLoaded && subscription?.plan?.[REQUIRED_FEATURE] === true;
  const planName  = subscription?.plan?.name || 'Free';

  // ── fat category logic ───────────────────────────────────────────────────────
  const getFatCategory = (p, g) => {
    const style = (c, s) => ({ category: c, styleClasses: s });
    const styles = {
      essential: style('Essential Fat', 'text-[var(--color-accent-1-text)] bg-[var(--color-accent-1-bg-subtle)]'),
      athletic:  style('Athletic',      'text-[var(--color-success-text)] bg-[var(--color-success-bg-subtle)]'),
      fit:       style('Fit',           'text-[var(--color-info-text)] bg-[var(--color-info-bg-subtle)]'),
      acceptable:style('Acceptable',    'text-[var(--color-warning-text)] bg-[var(--color-warning-bg-subtle)]'),
      obese:     style('Obese',         'text-[var(--color-danger-text)] bg-[var(--color-danger-bg-subtle)]'),
    };
    if (g === 'male') {
      if (p < 6)  return styles.essential;
      if (p <= 13) return styles.athletic;
      if (p <= 17) return styles.fit;
      if (p <= 24) return styles.acceptable;
      return styles.obese;
    } else {
      if (p < 14)  return styles.essential;
      if (p <= 20) return styles.athletic;
      if (p <= 24) return styles.fit;
      if (p <= 31) return styles.acceptable;
      return styles.obese;
    }
  };

  // ── handle calculate click ───────────────────────────────────────────────────
  const handleCalculateClick = () => {
    if (!subLoaded) return;

    if (!hasAccess) {
      setResult(null);       // clear any previous result
      setShowUpgrade(true);  // show upgrade prompt
      return;
    }

    // has access — calculate normally
    setShowUpgrade(false);
    setResult(null);
    const bmi = weight / Math.pow(height / 100, 2);
    const fat = gender === "male"
      ? 1.2 * bmi + 0.23 * age - 16.2
      : 1.2 * bmi + 0.23 * age - 5.4;
    setTimeout(() => setResult(Math.max(0, parseFloat(fat))), 150);
  };

  const totalMaxFat      = gender === 'male' ? 40 : 45;
  const resultCategory   = result !== null ? getFatCategory(result, gender) : null;
  const itemVariants     = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };

  return (
    <div className="min-h-screen w-full bg-[var(--color-bg-app)] flex flex-col items-center font-[var(--font-secondary)] p-4 sm:p-8">

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-10 w-full max-w-2xl mx-auto"
      >
        <h1 className="text-4xl md:text-5xl font-[var(--font-primary)] font-bold text-[var(--color-text-strong)]">
          Body Composition <span className="text-[var(--color-primary)]">Estimator</span>
        </h1>
        <p className="text-lg text-[var(--color-text-default)] mt-2">
          Get a quick estimate of your body fat percentage to guide your fitness journey.
        </p>
      </motion.header>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

        {/* ── Input panel ───────────────────────────────────────────────────── */}
        <motion.div
          variants={itemVariants} initial="hidden" animate="visible"
          className="lg:col-span-2 flex flex-col bg-[var(--color-bg-surface)] p-8 rounded-2xl border-2 border-[var(--color-border-default)] shadow-xl"
        >
          <div className="space-y-6">
            <h2 className="text-2xl font-[var(--font-primary)] font-bold text-[var(--color-text-strong)] flex items-center gap-3">
              <Sparkles className="text-[var(--color-primary)]" /> Enter Your Details
            </h2>

            <GenderToggle selected={gender} setSelected={setGender} />
            <CustomSlider label="Height" value={height} onChange={setHeight} min={100} max={220} unit="cm" icon={<Ruler size={20} />} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <NumberStepper label="Age" value={age} onChange={setAge} icon={<Cake size={20} />} />
              <NumberStepper label="Weight (kg)" value={weight} onChange={setWeight} icon={<Weight size={20} />} />
            </div>

            {/* ── Calculate button ── */}
            <motion.button
              onClick={handleCalculateClick}
              disabled={!subLoaded}
              whileHover={{ y: -3, boxShadow: '0 10px 20px -5px rgba(0,0,0,0.1)' }}
              whileTap={{ scale: 0.98, y: 0 }}
              className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-text-on-primary)] font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {subLoaded && !hasAccess ? <Lock size={16} /> : <Zap />}
              Calculate Estimate
            </motion.button>

            {/* Subtle hint for free users */}
            {subLoaded && !hasAccess && (
              <motion.p
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="text-xs text-center text-[var(--color-text-muted)] -mt-3"
              >
                Upgrade your plan to unlock results
              </motion.p>
            )}
          </div>

          <div className="mt-auto pt-6">
            <GeneralTips />
          </div>
        </motion.div>

        {/* ── Result panel ──────────────────────────────────────────────────── */}
        <motion.div
          variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}
          className="lg:col-span-3 flex flex-col items-center justify-center text-center bg-[var(--color-bg-surface)] p-8 rounded-2xl border-2 border-[var(--color-border-default)] h-full shadow-xl"
        >
          <AnimatePresence mode="wait">

            {/* ── Upgrade prompt ── */}
            {showUpgrade && (
              <UpgradePrompt
                planName={planName}
                onUpgrade={() => navigate('/dashboard/plans')}
              />
            )}

            {/* ── Actual result ── */}
            {!showUpgrade && result !== null && (
              <motion.div key="result" initial="hidden" animate="visible"
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ staggerChildren: 0.2 }}
                className="flex flex-col items-center w-full"
              >
                <motion.div variants={itemVariants} className="relative size-40">
                  <svg className="w-full h-full" viewBox="0 0 100 100" transform="rotate(-90 50 50)">
                    <circle cx="50" cy="50" r="45" stroke="var(--color-border-default)" strokeWidth="10" fill="none" />
                    <motion.circle cx="50" cy="50" r="45"
                      stroke="var(--color-primary)" strokeWidth="10" fill="none" strokeLinecap="round"
                      initial={{ strokeDasharray: `0, ${2 * Math.PI * 45}` }}
                      animate={{ strokeDasharray: `${2 * Math.PI * 45 * Math.min(result / totalMaxFat, 1)}, ${2 * Math.PI * 45}` }}
                      transition={{ duration: 1.5, ease: "circOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--color-text-strong)]">
                    <span className="text-4xl font-extrabold">
                      <AnimatedNumber value={result} /><span className="text-3xl">%</span>
                    </span>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}
                  className={`font-semibold text-lg py-1 px-4 rounded-full mt-4 ${resultCategory?.styleClasses}`}>
                  {resultCategory?.category}
                </motion.div>

                <ResultRangesChart gender={gender} result={result} />
                <NextSteps />
              </motion.div>
            )}

            {/* ── Placeholder ── */}
            {!showUpgrade && result === null && (
              <motion.div key="placeholder" initial="hidden" animate="visible" exit={{ opacity: 0 }}
                variants={itemVariants}
                className="text-[var(--color-text-muted)] flex flex-col items-center gap-3"
              >
                <BarChart2 className="size-16 opacity-40" />
                <h3 className="text-xl font-semibold text-[var(--color-text-strong)]">Your Results Dashboard</h3>
                <p className="text-sm max-w-xs">Fill in your details to see your estimated body fat, visual charts, and next steps.</p>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}