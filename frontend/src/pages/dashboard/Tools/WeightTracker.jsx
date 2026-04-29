// src/pages/dashboard/tools/WeightTracker.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ChevronsUp,
  ChevronsDown,
  Scale,
  Calendar,
  Plus,
  ArrowUp,
  ArrowDown,
  Loader,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
   
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { getWeight, postWeight } from "../../../api/Weight";
// --- ADDED: Import the updateUserProfile function ---
import { updateUserProfile } from '../../../api/userProfile';
import { targetApi } from '../../../api/reportsApi';
import { toast } from "react-toastify";





// --- Themed Helper Components ---
const Card = ({ children, className = '', delay = 0 }) => (
    <motion.div 
        className={`bg-[var(--color-bg-surface)] p-5 rounded-2xl border-2 border-[var(--color-border-default)] shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-[var(--color-primary)] ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
    >
        {children}
    </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--color-bg-surface)] p-3 border-2 border-[var(--color-primary)] rounded-lg shadow-lg">
        <p className="text-[var(--color-text-default)] text-xs font-medium mb-1">{label}</p>
        <p className="font-bold text-[var(--color-primary)]">{payload[0].value.toFixed(1)} kg</p>
      </div>
    );
  }
  return null;
};

const CurrentStatus = ({ entries }) => {
  if (!entries || entries.length === 0) {
    return (
      <Card className="text-center">
        <h3 className="text-md font-semibold text-[var(--color-text-strong)] mb-2">Welcome!</h3>
        <p className="text-sm text-[var(--color-text-default)]">Log your weight to begin.</p>
      </Card>
    );
  }

  const latestEntry = entries[0];
  const previousEntry = entries.length > 1 ? entries[1] : null;
  const change = previousEntry ? parseFloat(latestEntry.weight_kg) - parseFloat(previousEntry.weight_kg) : 0;
  const isIncrease = change > 0;
  const changeColor = isIncrease ? 'text-[var(--color-danger-text)]' : 'text-[var(--color-success-text)]';
  const changeBg = isIncrease ? 'bg-[var(--color-danger-bg-subtle)]' : 'bg-[var(--color-success-bg-subtle)]';

  return (
    <Card>
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-sm text-[var(--color-text-default)]">Current Weight</p>
          <p className="text-3xl font-bold text-[var(--color-primary)]">{parseFloat(latestEntry.weight_kg).toFixed(1)}<span className="text-xl text-[var(--color-text-default)]"> kg</span></p>
        </div>
        {change !== 0 && (
          <div className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full ${changeBg} ${changeColor}`}>
            {isIncrease ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
            <span>{Math.abs(change).toFixed(1)}</span>
          </div>
        )}
      </div>
      <p className="text-xs text-[var(--color-text-muted)]">
        Logged on {new Date(latestEntry.date).toLocaleDateString("en-GB", { day: 'numeric', month: 'long' })}
      </p>
    </Card>
  );
};

const WeightInsights = ({ entries }) => {
  const { highest, lowest, trend } = useMemo(() => {
    if (entries.length < 2) return { highest: null, lowest: null, trend: null };
    const weights = entries.map((e) => parseFloat(e.weight_kg));
    return { highest: Math.max(...weights), lowest: Math.min(...weights), trend: weights[0] - weights[weights.length - 1] };
  }, [entries]);

  if (entries.length < 2) return null;

  return (
    <Card>
      <h3 className="text-md font-semibold text-[var(--color-text-strong)] mb-4">Overall Insights</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3"><ChevronsUp className="text-[var(--color-danger-text)]" size={18} /><span className="text-[var(--color-text-default)]">Highest</span></div>
          <span className="font-semibold text-[var(--color-text-strong)]">{highest?.toFixed(1)} kg</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3"><ChevronsDown className="text-[var(--color-success-text)]" size={18} /><span className="text-[var(--color-text-default)]">Lowest</span></div>
          <span className="font-semibold text-[var(--color-text-strong)]">{lowest?.toFixed(1)} kg</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">{trend > 0 ? <TrendingUp className="text-[var(--color-danger-text)]" size={18}/> : <TrendingDown className="text-[var(--color-success-text)]" size={18}/>}<span className="text-[var(--color-text-default)]">Trend</span></div>
          <span className={`font-semibold ${trend > 0 ? 'text-[var(--color-danger-text)]' : 'text-[var(--color-success-text)]'}`}>{trend > 0 ? '+' : ''}{trend?.toFixed(1)} kg</span>
        </div>
      </div>
    </Card>
  );
};

const WeightTracker = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quickLogWeight, setQuickLogWeight] = useState("");
  const [quickLogDate, setQuickLogDate] = useState(new Date().toISOString().split("T")[0]);
  const [targetWeight , setTargetWeight] = useState(null);
  const [weightTarget, setWeightTarget] = useState(null);


  const fetchWeight = async () => {
    setLoading(true);
    try {
      const data = await getWeight();
      const sortedData = Array.isArray(data.results) ? [...data.results].sort((a, b) => new Date(b.date) - new Date(a.date)) : [];
      setEntries(sortedData);
    } catch (error) { console.error("Error fetching weight data:", error); } 
    finally { setLoading(false); }
  };

  const getLocalDateString = (date) => {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
};

  const fetchTargetWeight = async () => {
  try {
    const today = getLocalDateString(new Date());
 // format: yyyy-mm-dd
    const data = await targetApi(today);
setWeightTarget(data?.weight_target || null);

    setTargetWeight(data?.weight_target?.target_weight_kg || null);
  } catch (error) {
    console.error("Failed to fetch target weight:", error);
  }
};


  useEffect(() => { fetchWeight();
    fetchTargetWeight();
   }, []);

  // --- UPDATED: Modified handleSaveEntry function ---
  const handleSaveEntry = async () => {
    const newWeight = parseFloat(quickLogWeight);
    if (!quickLogWeight || !quickLogDate || isNaN(newWeight) || newWeight <= 0) return;
    setIsSubmitting(true);
    try {
      // First, post the new weight entry to the weight tracker
      await postWeight({ date: quickLogDate, weight_kg: newWeight });

      // Then, send a patch request to update the weight in the user's profile
      await updateUserProfile({ weight_kg: newWeight });
      
      // Finally, clear the input and refetch the weight history to update the UI
      setQuickLogWeight("");
      await fetchWeight();
    } catch (error) { 
          // 🔔 SUBSCRIPTION TOASTER
          if (
        error?.response?.status === 403 ||
        error?.status === 403
      ) {
        toast.error("Upgrade plan to avail this functionality 🚀");
        return;
      }

      toast.error("Something went wrong. Please try again.");
      console.error(error);

    } finally {
      setIsSubmitting(false);
    }
  };

  const chartData = useMemo(() => [...entries]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((entry) => ({
      date: new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      weight: parseFloat(entry.weight_kg),
    })), [entries]);

  return (
    <div className="min-h-screen bg-[var(--color-bg-app)] font-[var(--font-secondary)] text-[var(--color-text-default)]">
      <div className="max-w-6xl mx-auto p-4 lg:p-6">
        <motion.header 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="mb-8"
        >
            <h1 className="text-4xl font-[var(--font-primary)] font-extrabold text-[var(--color-text-strong)]">Weight Tracker</h1>
            <p className="text-lg mt-1">Monitor and analyze your weight trends over time.</p>
        </motion.header>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="space-y-5">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                <CurrentStatus entries={entries} />

              </motion.div>
              {targetWeight && (
  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
    <Card>
      <h3 className="text-md font-semibold text-[var(--color-text-strong)] mb-2">Your Weight Goal</h3>
      <p className="text-sm text-[var(--color-text-default)]">
         Goal: <span className="font-semibold">{weightTarget.goal}</span><br />
         Target Weight: <span className="font-bold text-[var(--color-primary)]">{targetWeight} kg</span></p>
    </Card>
  </motion.div>
)}

              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <Card>
                  <h3 className="text-md font-semibold text-[var(--color-text-strong)] mb-4">Log New Weight</h3>
                  <div className="space-y-4">
                    <div className="relative">
                      <Scale className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={16}/>
                      <input type="number" value={quickLogWeight} onChange={(e) => setQuickLogWeight(e.target.value)} 
                        className="w-full bg-[var(--color-bg-app)] text-[var(--color-text-strong)] border-2 border-[var(--color-border-default)] rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors" 
                        placeholder="Weight (kg)"/>
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={16}/>
                      <input type="date" value={quickLogDate} 
                      max={new Date().toLocaleDateString('en-CA')}onChange={(e) => setQuickLogDate(e.target.value)} 
                        className="w-full bg-[var(--color-bg-app)] text-[var(--color-text-strong)] border-2 border-[var(--color-border-default)] rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"/>
                    </div>
                    <button onClick={handleSaveEntry} disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary)] text-[var(--color-text-on-primary)] py-2.5 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:bg-[var(--color-primary-hover)] transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:transform-none disabled:shadow-md">
                      {isSubmitting ? <Loader className="animate-spin" size={18} /> : <Plus size={18} />}
                      {isSubmitting ? 'Saving...' : 'Add Entry'}
                    </button>
                  </div>
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                <WeightInsights entries={entries} />
              </motion.div>
            </div>
          </aside>

          <main className="flex-1 space-y-5">
            <Card delay={0.2}>
              <h3 className="text-md font-semibold text-[var(--color-text-strong)] mb-4">Progress Chart</h3>
              <div className="h-72">
                {loading ? ( <div className="flex items-center justify-center h-full text-[var(--color-text-muted)] gap-2"><Loader className="animate-spin"/>Loading Chart...</div> ) 
                : chartData.length > 1 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-default)" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-primary)', strokeWidth: 1, strokeDasharray: '3 3' }}/>
                      <Area type="monotone" dataKey="weight" stroke="var(--color-primary)" fill="url(#chartGradient)" strokeWidth={2.5} activeDot={{ r: 6, fill: 'var(--color-bg-surface)', stroke: 'var(--color-primary)', strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : ( <div className="flex flex-col items-center justify-center h-full text-[var(--color-text-muted)] gap-2"><Scale className="w-8 h-8"/>Log another entry to see your chart.</div> )}
              </div>
            </Card>

            <Card delay={0.3}>
              <h3 className="text-md font-semibold text-[var(--color-text-strong)] mb-4">History</h3>
              <div className="relative max-h-80 overflow-y-auto custom-scrollbar pr-2">
                <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-[var(--color-primary)]/10 rounded"></div>
                <ul className="space-y-1">
                  <AnimatePresence>
                    {entries.map((entry, index) => {
                      const prevEntry = entries[index + 1];
                      const change = prevEntry ? parseFloat(entry.weight_kg) - parseFloat(prevEntry.weight_kg) : 0;
                      const isIncrease = change > 0;
                      const changeColor = isIncrease ? 'text-[var(--color-danger-text)]' : 'text-[var(--color-success-text)]';
                      const changeBg = isIncrease ? 'bg-[var(--color-danger-bg-subtle)]' : 'bg-[var(--color-success-bg-subtle)]';
                      const key = entry.id || entry.date;
                      return (
                        <motion.li key={key} layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -10 }} transition={{duration: 0.3}} className="relative flex items-center gap-4 py-2.5 pl-8 hover:bg-[var(--color-bg-interactive-subtle)] rounded-lg transition-colors">
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 -ml-[3px] w-2.5 h-2.5 bg-[var(--color-bg-surface)] border-2 border-[var(--color-primary)] rounded-full z-10"></div>
                          <div className="flex-1 flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-[var(--color-text-strong)]">{parseFloat(entry.weight_kg).toFixed(1)} kg</p>
                              <p className="text-xs text-[var(--color-text-muted)]">{new Date(entry.date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                            </div>
                            {prevEntry && (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${changeBg} ${changeColor}`}>
                                {isIncrease ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}{Math.abs(change).toFixed(1)}</span>
                            )}
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              </div>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
};

export default WeightTracker;