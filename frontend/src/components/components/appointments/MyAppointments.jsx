import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import axiosInstance from "../../../api/axiosInstance";
import { motion, AnimatePresence } from "framer-motion";
import useWebSockets from "../../../api/useWebSockets";
import {
  Calendar, Clock, XCircle, CheckCircle, AlertCircle,
  CalendarDays, Video, Building2, Copy, ExternalLink,
  WifiOff,
} from "lucide-react";

/* ─── Scoped styles ─────────────────────────────────────────── */
const STYLES = `
  .ma-root { font-family: var(--font-secondary); }
  .ma-heading { font-family: var(--font-primary); font-weight: 700; }
  .ma-subheading { font-family: var(--font-primary); font-weight: 600; }

  @keyframes ma-spin { to { transform: rotate(360deg); } }
  @keyframes ma-pulse-ring {
    0%   { transform: scale(1);   opacity: 0.8; }
    100% { transform: scale(1.6); opacity: 0; }
  }
  @keyframes ma-shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  @keyframes ma-zoom-glow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.25); }
    50%       { box-shadow: 0 0 0 8px rgba(59,130,246,0); }
  }

  .ma-spinner {
    width: 44px; height: 44px;
    border: 3px solid var(--color-border-default);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: ma-spin 0.9s linear infinite;
  }
  .ma-card {
    transition: transform 0.28s cubic-bezier(.34,1.56,.64,1), box-shadow 0.28s ease;
  }
  .ma-card:hover {
    transform: translateY(-5px) scale(1.012);
    box-shadow: 0 24px 48px -12px rgba(0,0,0,0.12);
  }
  .ma-zoom-block {
    background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 60%, #e0f2fe 100%);
    border: 1.5px solid #93c5fd;
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 14px;
    position: relative;
    overflow: hidden;
    animation: ma-zoom-glow 3s ease-in-out infinite;
  }
  .ma-zoom-block::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%);
    background-size: 600px 100%;
    animation: ma-shimmer 3s infinite;
    pointer-events: none;
  }
  .ma-join-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 10px;
    font-size: 12px; font-weight: 700; font-family: var(--font-secondary);
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white; border: none; cursor: pointer;
    transition: transform 0.18s, box-shadow 0.18s;
  }
  .ma-join-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px -4px rgba(59,130,246,0.45); }
  .ma-copy-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 10px;
    font-size: 12px; font-weight: 700; font-family: var(--font-secondary);
    background: white; color: #3b82f6; border: 1.5px solid #93c5fd; cursor: pointer;
    transition: transform 0.18s, background 0.18s;
  }
  .ma-copy-btn:hover { background: #eff6ff; transform: translateY(-1px); }
  .ma-status {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 100px;
    font-size: 11px; font-weight: 700; font-family: var(--font-secondary); border: 1.5px solid;
  }
  .ma-live-dot { position: relative; display: inline-block; width: 8px; height: 8px; }
  .ma-live-dot span { display: block; width: 8px; height: 8px; border-radius: 50%; background: #22c55e; }
  .ma-live-dot::after {
    content: ""; position: absolute; inset: 0; border-radius: 50%;
    background: #22c55e; animation: ma-pulse-ring 1.6s ease-out infinite;
  }
  .ma-cancel-btn {
    width: 100%; padding: 11px; border-radius: 12px; font-size: 13px; font-weight: 600;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    cursor: pointer; transition: all 0.2s; font-family: var(--font-secondary);
    background: #fff1f2; color: #e11d48; border: 1.5px solid #fecdd3;
  }
  .ma-cancel-btn:hover:not(:disabled) { background: #ffe4e6; border-color: #fda4af; transform: translateY(-1px); }
  .ma-cancel-btn:disabled { background: var(--color-bg-surface-alt); color: var(--color-text-subtle); border-color: var(--color-border-default); cursor: not-allowed; }
  .ma-type-pill { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; font-family: var(--font-secondary); }
  .ma-empty { text-align: center; padding: 60px 20px; border-radius: 24px; border: 2px dashed var(--color-border-default); background: var(--color-bg-surface); max-width: 400px; margin: 0 auto; }
`;

/* ─── Helpers ───────────────────────────────────────────────── */
const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
const fmtDateTime = (v) => new Date(v).toLocaleString(undefined, { weekday: "short", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const canCancel = (date, time) => new Date() < new Date(`${date}T${time}`);

/* ─── Status config ─────────────────────────────────────────── */
const STATUS_CONFIG = {
  CONFIRMED:  { color: "#16a34a", bg: "#f0fdf4", border: "#86efac", icon: <CheckCircle size={13} /> },
  PENDING:    { color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: <AlertCircle  size={13} /> },
  CANCELLED:  { color: "#dc2626", bg: "#fff1f2", border: "#fecdd3", icon: <XCircle      size={13} /> },
  COMPLETED:  { color: "#2563eb", bg: "#dbeafe", border: "#93c5fd", icon: <CheckCircle  size={13} /> },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  return <span className="ma-status" style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}>{cfg.icon} {status}</span>;
};

/* ─── Zoom Block ─────────────────────────────────────────────── */
const ZoomBlock = ({ link, onJoin }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    toast.success("Meeting link copied!", { icon: "📋", style: { fontFamily: "var(--font-secondary)" } });
  };
  return (
    <div className="ma-zoom-block">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#2563eb" }}>
            <Video size={13} color="white" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#1d4ed8", fontFamily: "var(--font-secondary)" }}>Virtual Meeting</span>
        </div>
        <div className="ma-live-dot"><span /></div>
      </div>
      <div className="px-3 py-2 rounded-xl mb-3 text-xs font-mono break-all" style={{ background: "rgba(255,255,255,0.7)", color: "#3b82f6" }}>{link}</div>
      <div className="flex gap-2 flex-wrap">
        <button onClick={onJoin} className="ma-join-btn"><ExternalLink size={12} /> Join Meeting</button>
        <button onClick={handleCopy} className="ma-copy-btn"><Copy size={12} /> Copy Link</button>
      </div>
    </div>
  );
};

/* ─── No Meeting Placeholder ─────────────────────────────────── */
const NoMeetingPlaceholder = () => (
  <div className="rounded-2xl p-4 mb-4 flex items-center gap-3" style={{ background: "var(--color-bg-surface-alt)", border: "1.5px dashed var(--color-border-default)" }}>
    <WifiOff size={18} style={{ color: "var(--color-text-subtle)" }} />
    <div>
      <p className="text-sm font-semibold" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-secondary)" }}>No meeting link yet</p>
      <p className="text-xs mt-0.5" style={{ color: "var(--color-text-subtle)", fontFamily: "var(--font-secondary)" }}>Link will appear here once generated</p>
    </div>
  </div>
);

/* ─── Appointment Card ──────────────────────────────────────── */
const AppointmentCard = ({ a, onCancel, onJoin, idx }) => {
  const isVirtual   = a.appointment_type === "VIRTUAL";
  const isConfirmed = a.status === "CONFIRMED";
  const ablToCancel = canCancel(a.slot.date, a.slot.start_time);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.07, type: "spring", stiffness: 160, damping: 18 }}
      className="ma-card rounded-3xl overflow-hidden"
      style={{ background: "var(--color-bg-surface)", border: "1.5px solid var(--color-border-default)" }}
    >
      <div style={{ height: 4, background: isVirtual ? "linear-gradient(90deg, #3b82f6, #06b6d4, #8b5cf6)" : "linear-gradient(90deg, var(--color-primary), #ff9a6c, #fbbf24)" }} />
      <div className="p-6">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-lg shadow-md"
              style={{ background: isVirtual ? "linear-gradient(135deg, #3b82f6, #06b6d4)" : "linear-gradient(135deg, var(--color-primary), #ff9a6c)", color: "white", fontFamily: "var(--font-primary)" }}>
              {(a.nutritionist_name || "N").charAt(0)}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--color-text-subtle)", fontFamily: "var(--font-secondary)" }}>Nutritionist</p>
              <p className="font-semibold text-sm" style={{ color: "var(--color-text-strong)", fontFamily: "var(--font-primary)" }}>{a.nutritionist_name}</p>
            </div>
          </div>
          <StatusBadge status={a.status} />
        </div>

        <div className="rounded-2xl p-4 mb-4" style={{ background: "var(--color-bg-surface-alt)", border: "1.5px solid var(--color-border-default)" }}>
          <div className="flex items-center gap-2.5 mb-2">
            <Clock size={14} style={{ color: "var(--color-primary)" }} />
            <p className="font-bold text-base" style={{ color: "var(--color-text-strong)", fontFamily: "var(--font-primary)" }}>{a.slot.start_time} – {a.slot.end_time}</p>
          </div>
          <div className="flex items-center gap-2.5">
            <Calendar size={13} style={{ color: "var(--color-text-muted)" }} />
            <p className="text-sm" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-secondary)" }}>{fmtDate(a.slot.date)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl p-3" style={{ background: "var(--color-bg-surface-alt)", border: "1.5px solid var(--color-border-default)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--color-text-subtle)", fontFamily: "var(--font-secondary)" }}>Type</p>
            <span className="ma-type-pill" style={isVirtual ? { background: "#dbeafe", color: "#2563eb" } : { background: "var(--color-warning-bg-subtle)", color: "var(--color-warning-text)" }}>
              {isVirtual ? <Video size={11} /> : <Building2 size={11} />}
              {isVirtual ? "Virtual" : "In Person"}
            </span>
          </div>
          <div className="rounded-xl p-3" style={{ background: "var(--color-bg-surface-alt)", border: "1.5px solid var(--color-border-default)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--color-text-subtle)", fontFamily: "var(--font-secondary)" }}>Booked On</p>
            <p className="text-xs font-semibold" style={{ color: "var(--color-text-strong)", fontFamily: "var(--font-secondary)" }}>{fmtDateTime(a.created_at)}</p>
          </div>
        </div>

        {isVirtual && (a.meeting_link ? <ZoomBlock link={a.meeting_link} onJoin={() => onJoin(a.meeting_link, a.id, a.nutritionist_name)} /> : <NoMeetingPlaceholder />)}

        {isConfirmed && (
          <button disabled={!ablToCancel} onClick={() => onCancel(a.id)} className="ma-cancel-btn">
            <XCircle size={16} />
            {ablToCancel ? "Cancel Appointment" : "Cannot Cancel (Past)"}
          </button>
        )}
      </div>
    </motion.div>
  );
};

/* ─── Stats Bar ─────────────────────────────────────────────── */
const StatsBar = ({ appointments }) => {
  const total     = appointments.length;
  const confirmed = appointments.filter((a) => a.status === "CONFIRMED").length;
  const virtual   = appointments.filter((a) => a.appointment_type === "VIRTUAL").length;
  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {[
        { label: "Total",     val: total,     emoji: "📅", color: "var(--color-info-text)",    bg: "var(--color-info-bg-subtle)"    },
        { label: "Confirmed", val: confirmed, emoji: "✅", color: "var(--color-success-text)", bg: "var(--color-success-bg-subtle)" },
        { label: "Virtual",   val: virtual,   emoji: "🎥", color: "#2563eb",                   bg: "#dbeafe"                        },
      ].map(({ label, val, emoji, color, bg }) => (
        <div key={label} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: bg, border: "1.5px solid var(--color-border-default)" }}>
          <span className="text-xl">{emoji}</span>
          <div>
            <p className="ma-heading text-3xl" style={{ color, lineHeight: 1 }}>{val}</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-secondary)" }}>{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [reviewPopup, setReviewPopup]   = useState(null);
  const [rating, setRating]             = useState(0);
  const [hover, setHover]               = useState(0);
  const [comment, setComment]           = useState("");
  const [submitting, setSubmitting]     = useState(false);

  useEffect(() => {
    if (!document.getElementById("ma-styles")) {
      const el = document.createElement("style");
      el.id = "ma-styles";
      el.textContent = STYLES;
      document.head.appendChild(el);
    }
  }, []);

  const fetchAppointments = async () => {
    try {
      const res  = await axiosInstance.get("/appointments/my/");
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setAppointments(data);

      for (const a of data) {
        if (a.status !== "COMPLETED") continue;
        try {
          const r = await axiosInstance.get(`/reviews/check/${a.id}/`);
          if (!r.data.reviewed) {
            setReviewPopup({ appointmentId: a.id, nutritionistName: a.nutritionist_name });
            break;
          }
        } catch {}
      }
    } catch {
      toast.error("Failed to load appointments");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  useEffect(() => {
    const onFocus = () => fetchAppointments();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  /* WebSocket — meeting_ended se real-time popup */
  useWebSockets({
    onMeetingEnded: (data) => {
      setReviewPopup({ appointmentId: data.appointment_id, nutritionistName: data.nutritionist_name });
    },
  });

  const cancelAppointment = async (id) => {
    if (!confirm("Cancel this appointment?")) return;
    try {
      await axiosInstance.post(`/appointments/appointments/${id}/cancel/`);
      toast.success("Appointment cancelled");
      fetchAppointments();
    } catch {
      toast.error("Failed to cancel appointment");
    }
  };

  const handleJoin = (link, appointmentId, nutritionistName) => {
    window.open(link, "_blank");
    const checkAndShowPopup = async () => {
      try { await axiosInstance.post(`/appointments/appointments/${appointmentId}/complete/`); } catch {}
      try {
        const r = await axiosInstance.get(`/reviews/check/${appointmentId}/`);
        if (!r.data.reviewed) setReviewPopup({ appointmentId, nutritionistName });
      } catch {}
    };
    const onFocus = () => {
      window.removeEventListener("focus", onFocus);
      checkAndShowPopup();
    };
    window.addEventListener("focus", onFocus);
  };

  const submitReview = async () => {
    if (rating === 0) { toast.error("Please select a rating"); return; }
    setSubmitting(true);
    try {
      await axiosInstance.post("/reviews/submit/", {
        appointment_id: reviewPopup.appointmentId,
        rating,
        comment,
      });
      toast.success("Review submitted! Thank you ❤️");
      setReviewPopup(null);
      setRating(0);
      setComment("");
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen ma-root" style={{ background: "var(--color-bg-app)" }}>
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: "var(--font-secondary)", borderRadius: 14 } }} />

      {/* ★ Rating Popup */}
      <AnimatePresence>
        {reviewPopup && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
          >
            <motion.div
              initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 30 }}
              className="w-full max-w-sm rounded-3xl p-7 shadow-2xl"
              style={{ background: "var(--color-bg-surface)", border: "1.5px solid var(--color-border-default)" }}
            >
              <div className="text-center mb-5">
                <div className="text-4xl mb-2">⭐</div>
                <h2 className="text-xl font-bold" style={{ color: "var(--color-text-strong)", fontFamily: "var(--font-primary)" }}>Rate Your Session</h2>
                <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-secondary)" }}>
                  How was your consultation with <strong>{reviewPopup.nutritionistName}</strong>?
                </p>
              </div>

              <div className="flex justify-center gap-2 mb-5">
                {[1,2,3,4,5].map((star) => (
                  <button key={star} onClick={() => setRating(star)} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)}
                    style={{ fontSize: 36, color: star <= (hover || rating) ? "#FFD700" : "#d1d5db", transition: "color 0.15s", background: "none", border: "none", cursor: "pointer" }}>
                    ★
                  </button>
                ))}
              </div>

              <textarea
                rows={3} placeholder="Write your feedback (optional)..." value={comment} onChange={(e) => setComment(e.target.value)}
                className="w-full rounded-xl p-3 text-sm resize-none mb-4"
                style={{ border: "1.5px solid var(--color-border-default)", background: "var(--color-bg-surface-alt)", color: "var(--color-text-strong)", fontFamily: "var(--font-secondary)", outline: "none" }}
              />

              <div className="flex gap-3">
                <button onClick={() => setReviewPopup(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: "var(--color-bg-surface-alt)", color: "var(--color-text-muted)", border: "1.5px solid var(--color-border-default)", fontFamily: "var(--font-secondary)" }}>
                  Skip
                </button>
                <button onClick={submitReview} disabled={submitting || rating === 0} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: "var(--color-primary)", fontFamily: "var(--font-secondary)" }}>
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto py-10">
        <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 140, damping: 16 }} className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, var(--color-primary), #ff9a6c)" }}>
            <CalendarDays size={24} color="white" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--color-primary)", fontFamily: "var(--font-secondary)" }}>Patient Dashboard</p>
            <h1 className="ma-heading text-3xl" style={{ color: "var(--color-text-strong)" }}>My Appointments</h1>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="ma-spinner" />
            <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-secondary)" }}>Loading your appointments…</p>
          </div>
        ) : appointments.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 160, damping: 20 }} className="ma-empty">
            <Calendar size={48} className="mx-auto mb-4 opacity-20" style={{ color: "var(--color-text-muted)" }} />
            <h3 className="ma-subheading text-lg mb-1" style={{ color: "var(--color-text-strong)" }}>No Appointments Yet</h3>
            <p className="text-sm" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-secondary)" }}>Book a consultation to get started</p>
          </motion.div>
        ) : (
          <>
            <StatsBar appointments={appointments} />
            <div className="grid md:grid-cols-2 gap-6">
              {appointments.map((a, i) => (
                <AppointmentCard key={a.id} a={a} idx={i} onCancel={cancelAppointment} onJoin={handleJoin} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
