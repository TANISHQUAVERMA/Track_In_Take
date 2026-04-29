import React, { useState, useEffect } from 'react';
import { ArrowRight, RefreshCw, AlertCircle, Loader2, CheckCircle2, Utensils, ThumbsUp, ThumbsDown, SkipForward } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getTodayRecommendation, generateRecommendation, submitMealFeedback, getMealFeedback } from '../../api/recommendation';
import { createMeal } from '../../api/mealLog';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 15 } },
};

const FALLBACK_IMAGES = {
  Breakfast: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?w=400',
  Lunch:     'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?w=400',
  Dinner:    'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?w=400',
};

const MEAL_TYPE_MAP = {
  Breakfast: 'Breakfast',
  Lunch:     'Lunch',
  Dinner:    'Dinner',
};

function extractMealCards(data) {
  const meals = [
    { key: 'breakfast_plan', label: 'Breakfast' },
    { key: 'lunch_plan',     label: 'Lunch' },
    { key: 'dinner_plan',    label: 'Dinner' },
  ];

  return meals.map(({ key, label }) => {
    const options = data[key] || [];

    const buildCard = (opt) => {
      const items    = opt.items || [];
      const image    = items[0]?.image_url || FALLBACK_IMAGES[label];
      const totalCal = opt.total_calories || items.reduce((s, i) => s + (i.calories || 0), 0);
      const totalPro = items.reduce((s, i) => s + (i.protein_g || 0), 0);
      return {
        label,
        title:       opt.label || label,
        description: items.map(i => i.food_name).filter(Boolean).join(', ') || 'Personalised meal',
        calories:    Math.round(totalCal),
        protein:     `${Math.round(totalPro)}g protein`,
        image,
        youtube:     items[0]?.youtube_url || null,
        foodName:    items[0]?.food_name || opt.label || label,
        quantityG:   items[0]?.quantity_g || 100,
      };
    };

    return { label, options: options.map(buildCard), allOptions: options };
  });
}

// ── Log Meal Button ──────────────────────────────────────────────
const LogMealButton = ({ meal }) => {
  const [status, setStatus] = useState('idle'); // idle | loading | done | error

  const handleLog = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (status === 'done') return;
    setStatus('loading');
    try {
      await createMeal({
        food_name:  meal.foodName,
        quantity:   meal.quantityG || 100,
        unit:       'Gram',
        meal_type:  MEAL_TYPE_MAP[meal.label] || meal.label,
        calories:   meal.calories,
        protein:    parseFloat(meal.protein) || 0,
      });
      setStatus('done');
      // Trigger HeroSection calorie refresh
      window.dispatchEvent(new Event('meal-logged'));
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  if (status === 'done') {
    return (
      <div className="mt-4 flex items-center justify-center gap-2 text-green-600 font-semibold text-sm py-2">
        <CheckCircle2 size={16} /> Logged!
      </div>
    );
  }

  return (
    <button
      onClick={handleLog}
      disabled={status === 'loading'}
      className="mt-4 w-full flex items-center justify-center gap-2 bg-[var(--color-primary)] text-[var(--color-text-on-primary)] text-sm font-semibold py-2 rounded-lg hover:bg-[var(--color-primary-hover)] transition disabled:opacity-60"
    >
      {status === 'loading' ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Utensils size={14} />
      )}
      {status === 'error' ? 'Failed — Retry' : 'Log This Meal'}
    </button>
  );
};

// ── Meal Feedback Buttons ────────────────────────────────────────
const FeedbackButtons = ({ meal, recId, existingStatus, onSkip }) => {
  const [status, setStatus] = useState(existingStatus || null);
  const [loading, setLoading] = useState(false);

  const handleFeedback = async (feedbackStatus) => {
    if (loading) return;
    const newStatus = status === feedbackStatus ? null : feedbackStatus;
    setStatus(newStatus);
    if (feedbackStatus === 'skipped' && onSkip) onSkip();
    if (!recId) return;
    setLoading(true);
    try {
      await submitMealFeedback({
        recommendation_id: recId,
        meal_type: meal.label,
        food_name: meal.foodName,
        status: newStatus || 'eaten',
      });
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 mt-3">
      <button
        onClick={() => handleFeedback('liked')}
        disabled={loading}
        title="Like"
        className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold border-2 transition ${
          status === 'liked'
            ? 'bg-green-100 border-green-500 text-green-700'
            : 'border-[var(--color-border-default)] text-[var(--color-text-default)] hover:border-green-400 hover:text-green-600'
        }`}
      >
        <ThumbsUp size={13} /> Like
      </button>
      <button
        onClick={() => handleFeedback('disliked')}
        disabled={loading}
        title="Dislike"
        className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold border-2 transition ${
          status === 'disliked'
            ? 'bg-red-100 border-red-500 text-red-700'
            : 'border-[var(--color-border-default)] text-[var(--color-text-default)] hover:border-red-400 hover:text-red-600'
        }`}
      >
        <ThumbsDown size={13} /> Dislike
      </button>
      <button
        onClick={() => handleFeedback('skipped')}
        disabled={loading}
        title="Skip"
        className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold border-2 transition ${
          status === 'skipped'
            ? 'bg-yellow-100 border-yellow-500 text-yellow-700'
            : 'border-[var(--color-border-default)] text-[var(--color-text-default)] hover:border-yellow-400 hover:text-yellow-600'
        }`}
      >
        <SkipForward size={13} /> Skip
      </button>
    </div>
  );
};

// ── Meal Option Card ─────────────────────────────────────────────
const MealOptionCard = ({ mealGroup, recId, feedbacks }) => {
  const [optionIndex, setOptionIndex] = useState(0);
  const meal = mealGroup.options[optionIndex] || mealGroup.options[0];
  const existingFeedback = feedbacks?.find(f => f.meal_type === meal.label);

  return (
    <motion.div
      variants={itemVariants}
      className="group relative bg-[var(--color-bg-surface)] rounded-xl border-2 border-[var(--color-border-default)] shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 hover:border-[var(--color-primary)] overflow-hidden"
    >
      {/* Image */}
      <div className="relative">
        <Link to="/dashboard/meals">
          <img
            src={meal.image}
            alt={meal.title}
            className="rounded-t-xl h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={e => { e.target.src = FALLBACK_IMAGES[meal.label]; }}
          />
        </Link>
        <span className="absolute top-3 left-3 bg-[var(--color-primary)] text-[var(--color-text-on-primary)] text-xs font-bold px-3 py-1 rounded-full">
          {meal.label}
        </span>
        {meal.youtube && (
          <a href={meal.youtube} target="_blank" rel="noopener noreferrer"
            className="absolute bottom-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full hover:bg-red-700 transition">
            ▶ Recipe
          </a>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col">
        <h3 className="text-xl font-[var(--font-primary)] font-semibold text-[var(--color-text-strong)] mb-1 truncate group-hover:text-[var(--color-primary)] transition-colors duration-300">
          {meal.title}
        </h3>
        <p className="text-sm text-[var(--color-text-default)] h-12 line-clamp-2">{meal.description}</p>

        <div className="flex justify-between text-base font-bold mt-4 pt-4 border-t-2 border-dashed border-[var(--color-border-default)]">
          <span className="text-[var(--color-warning-text)]">{meal.calories} Kcal</span>
          <span className="text-[var(--color-primary)]">{meal.protein}</span>
        </div>

        <LogMealButton meal={meal} />
        <FeedbackButtons
          meal={meal}
          recId={recId}
          existingStatus={existingFeedback?.status}
          onSkip={() => setOptionIndex(i => (i + 1) % mealGroup.options.length)}
        />
      </div>
    </motion.div>
  );
};

// ── Main Component ───────────────────────────────────────────────
const DietRecommendations = () => {
  const [cards, setCards]           = useState([]);
  const [summary, setSummary]       = useState('');
  const [recId, setRecId]           = useState(null);
  const [feedbacks, setFeedbacks]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError]           = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res  = await getTodayRecommendation();
      const data = res.data?.data || res.data;
      setCards(extractMealCards(data));
      setSummary(data.plan_summary || '');
      setRecId(data.id || null);
      // load existing feedbacks
      const fbRes = await getMealFeedback();
      setFeedbacks(fbRes.data?.feedbacks || []);
    } catch (err) {
      if (err.response?.status === 404) {
        await generate();
      } else {
        setError('Could not load recommendations.');
      }
    } finally {
      setLoading(false);
    }
  };

  const generate = async (force = false) => {
    setGenerating(true);
    setError('');
    try {
      const res  = await generateRecommendation(force);
      const data = res.data?.data || res.data;
      setCards(extractMealCards(data));
      setSummary(data.plan_summary || '');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate meal plan.');
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading || generating) {
    return (
      <section className="w-full bg-[var(--color-bg-surface-alt)] py-16 px-6 font-[var(--font-secondary)]">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[var(--color-text-strong)] mb-3">Personalized Diet Recommendations</h2>
          <p className="text-[var(--color-text-default)] mb-12">AI-powered meal suggestions based on your goals</p>
          <div className="flex flex-col items-center gap-4 py-16">
            <Loader2 className="w-12 h-12 animate-spin text-[var(--color-primary)]" />
            <p className="text-[var(--color-text-muted)] text-lg">
              {generating ? 'Generating your personalised meal plan...' : 'Loading...'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full bg-[var(--color-bg-surface-alt)] py-16 px-6 font-[var(--font-secondary)]">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[var(--color-text-strong)] mb-3">Personalized Diet Recommendations</h2>
          <div className="flex flex-col items-center gap-4 py-16">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <p className="text-red-500 text-lg">{error}</p>
            <button
              onClick={() => generate(false)}
              className="mt-2 bg-[var(--color-primary)] text-[var(--color-text-on-primary)] px-6 py-2 rounded-lg font-semibold hover:bg-[var(--color-primary-hover)] transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-[var(--color-bg-surface-alt)] py-16 px-6 font-[var(--font-secondary)]">
      <div className="max-w-6xl mx-auto">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h2 className="text-3xl font-[var(--font-primary)] font-bold text-center text-[var(--color-text-strong)] mb-3">
            Personalized Diet Recommendations
          </h2>
          <p className="text-center text-lg text-[var(--color-text-default)] mb-2">
            AI-powered meal suggestions based on your goals
          </p>
          {summary && (
            <p className="text-center text-sm text-[var(--color-primary)] font-medium mb-8 max-w-2xl mx-auto">
              💡 {summary}
            </p>
          )}
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
        >
          {cards.map((mealGroup, index) => (
            <MealOptionCard
              key={index}
              mealGroup={mealGroup}
              recId={recId}
              feedbacks={feedbacks}
            />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16 flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link to="/dashboard/meals">
            <button className="bg-[var(--color-primary)] text-[var(--color-text-on-primary)] font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-[var(--color-primary-hover)] transition-all duration-300 transform hover:scale-105 flex items-center gap-2">
              View Full Diet Plan
              <ArrowRight size={20} />
            </button>
          </Link>
          <button
            onClick={() => generate(true)}
            disabled={generating}
            className="border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-semibold px-6 py-3 rounded-lg hover:bg-[var(--color-primary-bg-subtle)] transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={18} className={generating ? 'animate-spin' : ''} />
            Regenerate
          </button>
        </motion.div>

      </div>
    </section>
  );
};

export default DietRecommendations;
