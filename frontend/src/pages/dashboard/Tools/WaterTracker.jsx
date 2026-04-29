import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { Droplet, Target, GlassWater, TrendingUp, Lightbulb, Wind, CheckCircle2, PlusCircle, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

// --- API & Hook Imports ---
import useWaterTracker from '../../../components/components/WaterTracker/UseWaterTracker'; // Your custom hook
import { targetApi } from '../../../api/reportsApi';         // To get the daily goal
import { getWaterHistory } from '../../../api/WaterTracker';   // For the history chart

// --- Motivational & Helper Data ---
const motivationalTips = [
    "A single glass can start a wave of wellness.",
    "Hydration is the simplest path to a sharper mind.",
    "Your body is a temple. Keep it pristine with water.",
    "Small sips lead to big changes. Keep going!",
    "Feel that energy? That's the power of proper hydration.",
    "Drink to your health, one glass at a time."
];

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
};

// --- Helper & Sub-Components ---

const AnimatedNumber = ({ value, className = "" }) => {
    const [displayValue, setDisplayValue] = useState(0);
    useEffect(() => {
        const animation = animate(displayValue, value, {
            type: "spring", mass: 0.8, stiffness: 75, damping: 15,
            onUpdate: (v) => setDisplayValue(v)
        });
        return animation.stop;
    }, [value]);
    return <span className={className}>{Math.round(displayValue)}</span>;
};

const LogButton = ({ amount, onLog, isLogging }) => (
    <motion.button
        onClick={() => onLog(amount)}
        disabled={isLogging}
        whileHover={{ scale: isLogging ? 1 : 1.05 }}
        whileTap={{ scale: isLogging ? 1 : 0.95 }}
        className="flex items-center gap-2 px-4 sm:px-5 py-3 bg-[var(--color-bg-interactive)] text-[var(--color-text-on-interactive)] font-bold rounded-full shadow-lg transition-colors hover:bg-[var(--color-bg-interactive-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
    >
        <GlassWater size={20} />
        <span>+ {amount} ml</span>
    </motion.button>
);


const WaterDropletConfetti = () => (
    <div className="absolute top-0 left-0 w-full h-full z-50 pointer-events-none overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
                key={i}
                initial={{ x: `${Math.random() * 100}vw`, y: -50, opacity: 1 }}
                animate={{ y: '110vh', rotate: Math.random() * 360 }}
                transition={{ duration: 3 + Math.random() * 2, ease: "linear", delay: Math.random() * 1.5, repeat: Infinity, repeatType: "loop" }}
                style={{ position: 'absolute' }}
            >
                <Droplet
                    size={15 + Math.random() * 15}
                    className="text-[var(--color-primary)]"
                    strokeWidth={1.5}
                    style={{ opacity: 0.2 + Math.random() * 0.5 }}
                />
            </motion.div>
        ))}
    </div>
);

const CustomChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[var(--color-bg-surface-glass)] backdrop-blur-sm p-3 shadow-lg rounded-xl border-2 border-[var(--color-border-default)]">
                <p className="text-xs font-semibold text-[var(--color-text-muted)]">{label}</p>
                <p className="font-bold text-lg text-[var(--color-primary)]">{payload[0].value} ml</p>
            </div>
        );
    }
    return null;
};

// --- NEW: Custom Shape for the Hovered Bar in Chart for a "glow" effect ---
const CustomActiveBar = (props) => {
    const { x, y, width, height, fill } = props;
    return (
        <g>
            <rect x={x} y={y} width={width} height={height} fill={fill} filter="url(#glow)" />
        </g>
    );
};

// --- NEW: Custom Label for the Goal Line in Chart ---
// --- NEW: Custom Label for the Goal Line in Chart ---
const GoalLineLabel = ({ viewBox }) => {
    // Destructure x, y, and width from the viewBox prop
    const { x, y, width } = viewBox;

    // Calculate the position from the RIGHT side of the chart for proper alignment.
    // We take the full width, and pull back by the label's width (75px) and some padding (10px).
    const labelX = x + width - 85; 
    
    // Position it vertically, slightly above the line.
    const labelY = y - 12;

    return (
        <foreignObject x={labelX} y={labelY} width="75" height="25">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[var(--color-success-text)] bg-[var(--color-success-bg-subtle)] px-2 py-1 rounded-full border border-[var(--color-success-text)]/30">
                <Target size={12} />
                <span>Goal</span>
            </div>
        </foreignObject>
    );
};

// --- Main Component ---
export default function WaterTracker() {
    const { totalIntakeMl, logWater, selectedDate } = useWaterTracker();
    const [dailyGoalMl, setDailyGoalMl] = useState(2000);
    const [historyData, setHistoryData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLogging, setIsLogging] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [customAmount, setCustomAmount] = useState('');
    const [showBubble, setShowBubble] = useState(false);

    const progress = useMemo(() => dailyGoalMl > 0 ? Math.min(totalIntakeMl / dailyGoalMl, 1) : 0, [totalIntakeMl, dailyGoalMl]);
    const isGoalReached = useMemo(() => totalIntakeMl >= dailyGoalMl, [totalIntakeMl, dailyGoalMl]);
    const goalSurpassed = useMemo(() => totalIntakeMl > dailyGoalMl, [totalIntakeMl, dailyGoalMl]);
    const totalGoalGlasses = useMemo(() => Math.ceil(dailyGoalMl / 250), [dailyGoalMl]);
    const greeting = useMemo(getGreeting, []);
    const motivationalTip = useMemo(() => motivationalTips[Math.floor(Math.random() * motivationalTips.length)], []);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const formatDateForAPI = (date) => {
                const d = new Date(date);
                const adjustedDate = new Date(d.getTime() - (d.getTimezoneOffset() * -60000));
                return adjustedDate.toISOString().split('T')[0];
            };
            const apiDate = formatDateForAPI(selectedDate);
            const [goalRes, historyRes] = await Promise.all([targetApi(apiDate), getWaterHistory()]);
            setDailyGoalMl(goalRes.water?.recommended_ml || 2000);
            if (Array.isArray(historyRes.results)) {
                const formatted = historyRes.results.slice(0, 7).reverse().map(item => ({ name: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }), intake: item.amount_ml || 0 }));
                setHistoryData(formatted);
            }
        } catch (error) {
            console.error("Failed to fetch water tracker data:", error);
            setDailyGoalMl(2000);
            setHistoryData([]);
        } finally {
            setIsLoading(false);
        }
    }, [selectedDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleLogWater = async (amount) => {
        const numericAmount = parseInt(amount, 10);
        if (isLogging || !numericAmount || numericAmount <= 0) return;
        setIsLogging(true);

        setShowBubble(true);
        setTimeout(() => setShowBubble(false), 2000);

        const intakeBeforeLog = totalIntakeMl;
        const success = await logWater(numericAmount);
        if (success) {
            setCustomAmount('');
            const intakeAfterLog = intakeBeforeLog + numericAmount;
            if (intakeAfterLog >= dailyGoalMl && intakeBeforeLog < dailyGoalMl) {
                setShowCelebration(true);
                setTimeout(() => setShowCelebration(false), 6000);
            }
        }
        setIsLogging(false);
    };

    const pageVariants = { initial: { opacity: 0 }, animate: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } };
    const itemVariants = { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } } };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg-app)] to-[var(--color-bg-surface-alt)] p-4 sm:p-6 lg:p-8 font-[var(--font-secondary)] relative overflow-hidden">
            <AnimatePresence>{isGoalReached && showCelebration && <WaterDropletConfetti />}</AnimatePresence>
            
            <motion.main variants={pageVariants} initial="initial" animate="animate" className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div variants={itemVariants} className="lg:col-span-2 bg-[var(--color-bg-surface)] rounded-3xl shadow-2xl border-2 border-[var(--color-border-default)] p-6 sm:p-8 flex flex-col">
                    <header>
                        <h1 className="text-3xl sm:text-4xl font-bold font-[var(--font-primary)] text-[var(--color-text-strong)]">{greeting}</h1>
                        <p className="text-md text-[var(--color-text-muted)] mt-1">Ready to hydrate and conquer the day?</p>
                    </header>

                    <AnimatePresence>
                        {goalSurpassed && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[var(--color-success-bg-subtle)] to-transparent border border-[var(--color-success-text)]/20"
                            >
                                <Award className="text-[var(--color-success-text)]" size={24} />
                                <p className="font-semibold text-sm text-[var(--color-success-text)]">Goal Surpassed! Keep the hydration flowing!</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    <div className="flex-grow flex items-center justify-center my-8">
                        <motion.div
                            animate={{ scale: [1, 1.02, 1] }}
                            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                            className="relative w-64 h-64 sm:w-72 sm:h-72"
                        >
                            <div className="absolute inset-0 rounded-full border-8 border-[var(--color-border-default)] bg-[var(--color-bg-interactive-subtle)] overflow-hidden">
                                <motion.div
                                    className="absolute bottom-0 left-0 w-full h-full"
                                    style={{ background: isGoalReached ? 'linear-gradient(to top, #2dd4bf, #67e8f9)' : 'linear-gradient(to top, var(--color-primary-hover), var(--color-primary))' }}
                                    animate={{ y: `${100 - progress * 100}%` }}
                                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                >
                                    <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 80" preserveAspectRatio="none">
                                        <motion.path fill={isGoalReached ? '#2dd4bf' : 'var(--color-primary-hover)'} opacity="0.6" d="M0,32L40,32C80,32,160,32,240,37.3C320,43,400,53,480,53.3C560,53,640,43,720,42.7C800,43,880,53,960,56C1040,59,1120,53,1200,48C1280,43,1360,37,1400,34.7L1440,32L1440,81L1400,81C1360,81,1280,81,1200,81C1120,81,1040,81,960,81C880,81,800,81,720,81C640,81,560,81,480,81C400,81,320,81,240,81C160,81,80,81,40,81L0,81Z" animate={{ x: ['-200px', '0px'] }} transition={{ duration: 9, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}></motion.path>
                                        <motion.path fill={isGoalReached ? '#67e8f9' : 'var(--color-primary)'} opacity="0.4" d="M0,50L48,42.7C96,35,192,20,288,24.7C384,29,480,53,576,62.7C672,72,768,68,864,62.7C960,57,1056,50,1152,55C1248,60,1344,75,1392,82.3L1440,90L1440,101L1392,101C1344,101,1248,101,1152,101C1056,101,960,101,864,101C768,101,672,101,576,101C480,101,384,101,288,101C192,101,96,101,48,101L0,101Z" animate={{ x: ['0px', '-200px'] }} transition={{ duration: 12, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}></motion.path>
                                    </svg>
                                </motion.div>
                                <AnimatePresence>
                                    {showBubble && <motion.div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-white/30 rounded-full" initial={{ y: 0, opacity: 0.7 }} animate={{ y: -250, opacity: 0 }} transition={{ duration: 2, ease: "easeOut" }} />}
                                </AnimatePresence>
                            </div>
                            <motion.div layout className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <motion.div animate={{ scale: isGoalReached ? 1.2 : 1 }} transition={{ type: 'spring' }}>{isGoalReached ? <CheckCircle2 size={48} className="text-white drop-shadow-lg"/> : <Droplet size={48} className="text-[var(--color-text-strong)]"/>}</motion.div>
                                <div className="text-5xl sm:text-6xl font-bold tracking-tight text-[var(--color-text-strong)] mt-2"><AnimatedNumber value={totalIntakeMl} /><span className="text-2xl ml-1 opacity-50">ml</span></div>
                                <p className="font-semibold text-[var(--color-text-muted)]">Goal: {dailyGoalMl}ml</p>
                            </motion.div>
                        </motion.div>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                        <h3 className="font-bold text-lg text-center text-[var(--color-text-strong)] mb-2">Log Your Intake</h3>
                        {isLoading ? <Wind className="animate-spin text-[var(--color-primary)]"/> : (
                            <div className='flex flex-col items-center gap-4 w-full max-w-lg'>
                                <div className="flex items-center justify-center gap-3 sm:gap-4 w-full">
                                    <LogButton amount={250} onLog={handleLogWater} isLogging={isLogging} />
                                    <LogButton amount={500} onLog={handleLogWater} isLogging={isLogging} />
                                    <LogButton amount={750} onLog={handleLogWater} isLogging={isLogging} />
                                </div>
                                <div className='flex items-center gap-2 w-full p-1 bg-[var(--color-bg-app)] rounded-2xl border-2 border-transparent focus-within:border-[var(--color-primary)] transition-colors'>
                                    <input type="number" placeholder='Custom ml' value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleLogWater(customAmount)} className='w-full p-3 bg-transparent border-none rounded-xl focus:outline-none focus:ring-0 text-center font-bold text-[var(--color-text-strong)] placeholder:text-[var(--color-text-muted)]' />
                                    <motion.button onClick={() => handleLogWater(customAmount)} disabled={isLogging || !customAmount} whileTap={{ scale: 0.9 }} className='p-3 bg-[var(--color-primary)] text-[var(--color-text-on-primary)] rounded-[14px] transition-colors hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed'><PlusCircle size={24} /></motion.button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
                        <StatCard icon={<Target />} label="Goal" value={`${dailyGoalMl} ml`} />
                        <StatCard icon={<GlassWater />} label="Glasses" value={`${Math.floor(totalIntakeMl / 250)} `} />
                        <StatCard icon={<TrendingUp />} label="Progress" value={`${Math.round((totalIntakeMl / dailyGoalMl) * 100)}%`} />
                    </motion.div>
                    <motion.div variants={itemVariants} className="bg-[var(--color-accent-1-bg-subtle)] p-5 rounded-2xl flex items-center gap-4 border-2 border-[var(--color-accent-1-text)]/20">
                        <div className="w-12 h-12 flex items-center justify-center rounded-full shrink-0 bg-white/50"><Lightbulb size={24} className='text-[var(--color-accent-1-text)]'/></div>
                        <div>
                            <p className="font-[var(--font-primary)] font-bold text-[var(--color-accent-1-text)]">Quick Tip</p>
                            <p className="text-sm text-[var(--color-text-default)]">{motivationalTip}</p>
                        </div>
                    </motion.div>
                    <motion.div variants={itemVariants} className="bg-[var(--color-bg-surface)] p-5 rounded-2xl border-2 border-[var(--color-border-default)] shadow-lg flex-grow flex flex-col">
                        <h3 className="text-lg font-[var(--font-primary)] font-bold mb-4 shrink-0 text-[var(--color-text-strong)]">Weekly Overview</h3>
                        <div className="flex-grow h-60">
                            {isLoading ? (
                                <div className="flex h-full w-full items-center justify-center text-[var(--color-text-muted)]"><Wind className="animate-spin text-[var(--color-primary)]" /></div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={historyData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.9}/>
                                                <stop offset="95%" stopColor="var(--color-primary-hover)" stopOpacity={0.2}/>
                                            </linearGradient>
                                            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                                                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                                <feMerge>
                                                    <feMergeNode in="coloredBlur" />
                                                    <feMergeNode in="SourceGraphic" />
                                                </feMerge>
                                            </filter>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="var(--color-border-default)" />
                                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{ fill: 'var(--color-bg-interactive-subtle)' }} content={<CustomChartTooltip />} />
                                        <ReferenceLine y={dailyGoalMl} stroke="var(--color-success-text)" strokeDasharray="4 4" strokeWidth={1.5} label={<GoalLineLabel />} />
                                        <Bar dataKey="intake" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={20} activeBar={<CustomActiveBar />} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </motion.div>
                </div>
            </motion.main>
        </div>
    );
}

const StatCard = ({ icon, label, value }) => (
    <motion.div
        whileHover={{ scale: 1.03, y: -5, borderColor: 'var(--color-primary)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        className="bg-[var(--color-bg-surface)] p-4 rounded-2xl border-2 border-[var(--color-border-default)] text-center flex flex-col items-center justify-center shadow-lg cursor-pointer"
    >
        <div className="text-[var(--color-primary)] mb-2">{React.cloneElement(icon, { size: 24, strokeWidth: 2 })}</div>
        <p className="text-sm font-semibold text-[var(--color-text-muted)] leading-tight">{label}</p>
        <p className="text-lg font-bold text-[var(--color-text-strong)]">{value}</p>
    </motion.div>
);