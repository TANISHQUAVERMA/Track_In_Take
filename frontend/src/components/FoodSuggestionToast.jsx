// components/FoodSuggestionToast.jsx
// Matches TrackIntake design system exactly:
// Font: Poppins (primary) + Roboto (secondary)
// Colors: --color-primary #FF7043, warm whites, --color-text-strong #263238
// Style: light, warm, professional — consistent with the app's card/surface aesthetic

import { useEffect, useRef, useState } from "react";

const AUTO_DISMISS_MS = 12000; // 12 seconds — long enough to read

export function FoodSuggestionToast({ suggestion, onDismiss, onViewAll }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const timerRef              = useRef(null);
  const progressRef           = useRef(null);

  useEffect(() => {
    if (!suggestion) return;

    setLeaving(false);
    setVisible(true);

    // Animate progress bar
    if (progressRef.current) {
      progressRef.current.style.transition = "none";
      progressRef.current.style.width      = "100%";
      void progressRef.current.offsetWidth;
      progressRef.current.style.transition = `width ${AUTO_DISMISS_MS}ms linear`;
      progressRef.current.style.width      = "0%";
    }

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(handleDismiss, AUTO_DISMISS_MS);

    return () => clearTimeout(timerRef.current);
  }, [suggestion?.receivedAt]);

  function handleDismiss() {
    clearTimeout(timerRef.current);
    setLeaving(true);
    setTimeout(() => {
      setVisible(false);
      setLeaving(false);
      onDismiss?.();
    }, 350);
  }

  if (!visible || !suggestion) return null;

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(0);    opacity: 1; }
          to   { transform: translateY(20px); opacity: 0; }
        }
        .tip-enter { animation: slideUp 0.4s cubic-bezier(0.34, 1.4, 0.64, 1) forwards; }
        .tip-leave  { animation: slideDown 0.3s ease-in forwards; }

        .tip-food-card {
          background: linear-gradient(135deg, #FFF9F7 0%, #FFF3EE 100%);
        }
        .tip-dismiss-btn:hover {
          background-color: #f3f4f6;
          color: #263238;
        }
      `}</style>

      {/* ── Positioned: bottom-right, above FAB ── */}
      <div
        role="alert"
        aria-live="polite"
        className={`fixed bottom-24 right-5 z-50 w-[340px] max-w-[calc(100vw-1.25rem)] ${leaving ? "tip-leave" : "tip-enter"}`}
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        {/* ── Card shell — matches app's .Toastify__toast card style ── */}
        <div
          style={{
            background:   "var(--color-bg-surface, #FFFFFF)",
            border:       "2px solid var(--color-border-default, #ECEFF1)",
            borderRadius: "16px",
            boxShadow:    "0 8px 32px rgba(38, 50, 56, 0.12), 0 2px 8px rgba(255, 112, 67, 0.08)",
            overflow:     "hidden",
          }}
        >
          {/* ── Top accent stripe — brand orange ── */}
          <div style={{
            height:     "3px",
            background: "linear-gradient(90deg, #FF7043 0%, #FF8A65 60%, #FFCCBC 100%)",
          }} />

          {/* ── Content ── */}
          <div style={{ padding: "14px 16px 12px" }}>

            {/* Header row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                {/* Pulsing dot */}
                <span style={{ position: "relative", display: "inline-flex", width: "8px", height: "8px" }}>
                  <span style={{
                    position: "absolute", inset: 0,
                    borderRadius: "50%",
                    backgroundColor: "#FF7043",
                    opacity: 0.4,
                    animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite",
                  }} />
                  <span style={{
                    position: "relative", width: "8px", height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#FF7043",
                    display: "inline-block",
                  }} />
                </span>
                <span style={{
                  fontSize:      "10px",
                  fontWeight:    "700",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color:         "#FF7043",
                  fontFamily:    "'Poppins', sans-serif",
                }}>
                  Nutrition Tip
                </span>
              </div>

              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="tip-dismiss-btn"
                aria-label="Dismiss"
                style={{
                  border:       "none",
                  background:   "transparent",
                  cursor:       "pointer",
                  padding:      "3px 5px",
                  borderRadius: "6px",
                  color:        "var(--color-text-muted, #6b7281)",
                  transition:   "all 0.15s ease",
                  lineHeight:   1,
                  fontSize:     "15px",
                }}
              >
                ✕
              </button>
            </div>

            {/* Message */}
            <p style={{
              fontFamily:  "'Poppins', sans-serif",
              fontSize:    "13px",
              fontWeight:  "500",
              color:       "var(--color-text-strong, #263238)",
              lineHeight:  "1.5",
              marginBottom:"10px",
            }}>
              {suggestion.message}
            </p>

            {/* Food suggestion card */}
            <div
              className="tip-food-card"
              style={{
                borderRadius: "10px",
                border:       "1.5px solid #FFE0D4",
                padding:      "10px 12px",
                display:      "flex",
                alignItems:   "center",
                gap:          "11px",
              }}
            >
              {/* Icon */}
              <div style={{
                width:          "40px",
                height:         "40px",
                borderRadius:   "10px",
                background:     "linear-gradient(135deg, #FF7043 0%, #FF8A65 100%)",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                fontSize:       "18px",
                flexShrink:     0,
                boxShadow:      "0 2px 8px rgba(255, 112, 67, 0.3)",
              }}>
                🥗
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{
                  fontFamily:   "'Poppins', sans-serif",
                  fontSize:     "13px",
                  fontWeight:   "600",
                  color:        "var(--color-text-strong, #263238)",
                  margin:       0,
                  overflow:     "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace:   "nowrap",
                }}>
                  {suggestion.topSuggestion}
                </p>
                <p style={{
                  fontFamily: "'Roboto', sans-serif",
                  fontSize:   "11.5px",
                  color:      "var(--color-text-muted, #6b7281)",
                  margin:     "2px 0 0",
                  lineHeight: "1.4",
                  display:    "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow:   "hidden",
                }}>
                  {suggestion.reason}
                </p>
              </div>
            </div>

            {/* Calories remaining + View All row */}
            <div style={{ marginTop: "10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {suggestion.caloriesLeft > 0 ? (
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ fontSize: "13px" }}>🔥</span>
                <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: "11.5px", fontWeight: "500", color: "var(--color-warning-text, #c2410c)" }}>
                    {Math.round(suggestion.caloriesLeft)} kcal remaining today
                </span>
                </div>
            ) : <span />}

            <button
                onClick={() => { handleDismiss(); onViewAll?.(); }}
                style={{
                background: "linear-gradient(135deg, #FF7043 0%, #FF8A65 100%)",
                border: "none", borderRadius: "7px", padding: "5px 10px",
                cursor: "pointer", fontSize: "11px", fontWeight: "600",
                color: "#FFFFFF", fontFamily: "'Poppins', sans-serif",
                whiteSpace: "nowrap", boxShadow: "0 2px 6px rgba(255,112,67,0.3)",
                }}
            >
                View All →
            </button>
            </div>
          </div>

          {/* ── Progress bar ── */}
          <div style={{ height: "3px", background: "var(--color-border-default, #ECEFF1)" }}>
            <div
              ref={progressRef}
              style={{
                height:     "100%",
                width:      "100%",
                background: "linear-gradient(90deg, #FF7043, #FF8A65)",
              }}
            />
          </div>
        </div>

        {/* Ping keyframe injected inline for the pulse dot */}
        <style>{`
          @keyframes ping {
            75%, 100% { transform: scale(2); opacity: 0; }
          }
        `}</style>
      </div>
    </>
  );
}