import React, { useEffect, useState, useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, UserPlus, Activity, DollarSign, Calendar, Star, MoreVertical, ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

// Import the API function
import { getOwner } from '../api/owner';

// 1. Import your custom LogoutButton component
//    (Adjust the path if your file structure is different)
import LogoutButton from '../components/LogoutButton';

// Animation Variants for Framer Motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

// Helper to format large numbers
const formatNumber = (num) => {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

// Reusable Card Component
const Card = ({ children, className }) => (
  <motion.div
    variants={itemVariants}
    className={clsx(
      "bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg",
      className
    )}
  >
    {children}
  </motion.div>
);

// Modern Metric Card Component
const MetricCard = ({ title, value, change, Icon, trend = 'neutral' }) => {
  const trendColor = trend === 'up' ? 'text-emerald-400' : 'text-red-400';
  const TrendIcon = trend === 'up' ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="p-5">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <p className="text-sm text-slate-400 uppercase tracking-wider">{title}</p>
          <span className="text-3xl font-bold text-slate-50 mt-1">{value}</span>
        </div>
        <div className="p-2 bg-slate-700/50 rounded-lg">
          <Icon className="w-6 h-6 text-slate-300" />
        </div>
      </div>
      {change && (
        <div className={`flex items-center text-sm mt-2 ${trendColor}`}>
          <TrendIcon className="w-4 h-4 mr-1" />
          <span>{change} vs last month</span>
        </div>
      )}
    </Card>
  );
};

// Styled Tab Button Component
const TabButton = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={clsx(
        "px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900",
        active ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-700/50'
      )}
    >
      {children}
    </button>
  );

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-700/80 backdrop-blur-sm text-slate-200 p-3 rounded-lg border border-slate-600 shadow-xl">
        <p className="label font-bold mb-1">{`${label}`}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="intro">{`${p.name}: ${p.value.toLocaleString()}`}</p>
        ))}
      </div>
    );
  }
  return null;
};

// Main Dashboard Component
const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userStatsView, setUserStatsView] = useState('Weekly');
  const [mealsView, setMealsView] = useState('Weekly');

  // useEffect now fetches data from the API on component mount.
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Call the imported API function
        const responseData = await getOwner();
        
        // Assuming the API returns the data object directly.
        if (responseData && responseData.user_stats) {
            setData(responseData);
        } else {
            throw new Error("Received invalid data from the server.");
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // The empty dependency array ensures this runs only once.

  // Memoized calculations to prevent re-computing on every render
  const processedData = useMemo(() => {
    if (!data) return null;

    // User Stats Chart Data (Approximated from totals)
    const generateChartData = (total, period) => {
      const days = period === 'Weekly' ? 7 : 30;
      const labels = period === 'Weekly' 
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : Array.from({ length: 4 }, (_, i) => `Week ${i + 1}`);
      const baseValue = total / (period === 'Weekly' ? 7 : 4);
      return labels.map(label => ({
        name: label,
        value: Math.round(baseValue + (Math.random() - 0.5) * baseValue * 0.5),
      }));
    };

    const userStatsChartData = generateChartData(
        userStatsView === 'Weekly' ? data.user_stats.new_users_week : data.user_stats.new_users_month,
        userStatsView
    );

    const mealsChartData = generateChartData(
        mealsView === 'Weekly' ? data.usage.meals_logged_week : data.usage.meals_logged_month,
        mealsView
    );

    // Country Pie Chart Data
    const countryColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f97316', '#ec4899'];
    const usersByCountry = data.users_by_country.map((c, i) => ({
      ...c,
      fill: countryColors[i % countryColors.length],
    }));

    // Feedback Analysis
    const feedbacks = data.feedback_summary.latest_feedbacks;
    const totalReviews = data.feedback_summary.feedback_collected;
    const averageRating = feedbacks.length > 0
        ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)
        : 0;
    
    const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
        const count = feedbacks.filter(f => f.rating === star).length;
        return { star, count, percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0 };
    });

    return { userStatsChartData, mealsChartData, usersByCountry, averageRating, totalReviews, ratingDistribution };
  }, [data, userStatsView, mealsView]);


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-300 mt-4 text-lg">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return <div className="min-h-screen bg-slate-900 text-center text-red-400 p-8">{error || "Failed to load dashboard data."}</div>;
  }
  
  const { user_stats, revenue } = data;
  const { userStatsChartData, mealsChartData, usersByCountry, averageRating, totalReviews, ratingDistribution } = processedData;

  return (
    <AnimatePresence>
      <div className="min-h-screen bg-slate-900 text-slate-300 p-4 sm:p-6 lg:p-8 font-sans">
        <motion.div 
          className="max-w-7xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-50">Dashboard</h1>
              <p className="text-slate-400 mt-1 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(data.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input type="text" placeholder="Search..." className="bg-slate-800 border border-slate-700 rounded-full w-full sm:w-64 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              {/* 2. Add the imported LogoutButton component here */}
              <LogoutButton />
            </div>
          </motion.div>

          {/* Metric Cards Grid */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            variants={containerVariants}
          >
            <MetricCard title="Total Users" value={formatNumber(user_stats.total_users)} Icon={Users} />
            <MetricCard title="Revenue" value={revenue} Icon={DollarSign} />
            <MetricCard title="New Users (Weekly)" value={formatNumber(user_stats.new_users_week)} Icon={UserPlus} change={`${((user_stats.new_users_week / (user_stats.new_users_month / 4)) * 100 - 100).toFixed(1)}%`} trend="up" />
            <MetricCard title="Active Patients (Weekly)" value={formatNumber(user_stats.active_patients_week)} Icon={Activity} change="-2.1%" trend="down"/>
          </motion.div>
          
          {/* Main Chart Grid */}
          <motion.div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8" variants={containerVariants}>
            {/* User Statistics Chart */}
            <Card className="lg:col-span-3 p-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-100">User Growth</h3>
                <div className="flex space-x-2 mt-2 sm:mt-0">
                  <TabButton active={userStatsView === 'Weekly'} onClick={() => setUserStatsView('Weekly')}>Weekly</TabButton>
                  <TabButton active={userStatsView === 'Monthly'} onClick={() => setUserStatsView('Monthly')}>Monthly</TabButton>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userStatsChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
                    <Bar dataKey="value" name="New Users" fill="url(#colorUv)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Meals Logged Chart */}
            <Card className="lg:col-span-2 p-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-100">Meals Logged</h3>
                <div className="flex space-x-2 mt-2 sm:mt-0">
                  <TabButton active={mealsView === 'Weekly'} onClick={() => setMealsView('Weekly')}>Weekly</TabButton>
                  <TabButton active={mealsView === 'Monthly'} onClick={() => setMealsView('Monthly')}>Monthly</TabButton>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mealsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorMeals" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" vertical={false}/>
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="value" name="Meals" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorMeals)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          {/* Demographics & Feedback Grid */}
          <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8" variants={containerVariants}>
            {/* Users by Country */}
            <Card className="p-5">
              <h3 className="text-lg font-semibold text-slate-100 mb-4">Users by Country</h3>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-full md:w-1/2 h-52">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={usersByCountry} dataKey="user_count" nameKey="country" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2}>
                        {usersByCountry.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 space-y-3">
                  {usersByCountry.map(c => (
                    <div key={c.country} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: c.fill }}></span>
                        <span className="text-slate-300">{c.country}</span>
                      </div>
                      <span className="font-medium text-slate-100">{formatNumber(c.user_count)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
            
            {/* User Feedback */}
            <Card className="p-5">
              <h3 className="text-lg font-semibold text-slate-100 mb-4">Feedback Summary</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl font-bold text-slate-50">{averageRating}</div>
                <div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={clsx("w-5 h-5", i < Math.round(averageRating) ? "text-amber-400" : "text-slate-600")} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-400 mt-1">Based on {totalReviews} reviews</p>
                </div>
              </div>
              <div className="space-y-2">
                {ratingDistribution.map(r => (
                  <div key={r.star} className="flex items-center gap-3 text-sm">
                    <span className="text-slate-400 w-12">{r.star} star</span>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <motion.div
                        className="bg-amber-400 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${r.percentage}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                    <span className="text-slate-300 font-medium w-8 text-right">{r.percentage.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Latest Feedback & Promotions */}
          <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6" variants={containerVariants}>
            <Card className="p-5">
              <h3 className="text-lg font-semibold text-slate-100 mb-4">Latest Feedback</h3>
              <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                {data.feedback_summary.latest_feedbacks.map(fb => (
                  <div key={fb.id} className="p-4 rounded-lg bg-slate-800/70 border border-slate-700 hover:border-slate-600 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-slate-200">{fb.user_email}</p>
                        <p className="text-sm text-slate-400 mt-2">{fb.message}</p>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400 text-sm font-bold shrink-0 ml-4">
                        {fb.rating}
                        <Star className="w-4 h-4 fill-current" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
                <h3 className="text-lg font-semibold text-slate-100 mb-4">Active Promotions</h3>
                <div className="space-y-4">
                  {data.promotions.map((promo, i) => {
                      const statusConfig = {
                          'Running': { color: 'bg-green-500/20 text-green-300 border-green-500/30' },
                          'Ended': { color: 'bg-slate-600/20 text-slate-400 border-slate-600/30' }
                      };
                      return (
                          <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/70 border border-slate-700">
                              <div>
                                  <p className="font-semibold text-slate-200">{promo.campaign}</p>
                                  <p className="text-sm text-slate-400">Reach: {promo.reach}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                  <span className={clsx('px-3 py-1 text-xs font-medium rounded-full border', statusConfig[promo.status]?.color)}>
                                    {promo.status}
                                  </span>
                                  <button className="text-slate-400 hover:text-white transition-colors">
                                    <MoreVertical size={20} />
                                  </button>
                              </div>
                          </div>
                      );
                  })}
                </div>
            </Card>
          </motion.div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Dashboard;