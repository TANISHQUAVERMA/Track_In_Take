// src/components/FoodSuggestionsDrawer.jsx
// Full suggestions drawer — opens from the toast "View All" button
// Design: warm, professional — matches TrackIntake design system
// Fonts: Poppins (headings) + Roboto (body)
// Colors: --color-primary #FF7043, warm whites, --color-text-strong #263238

import { useEffect, useRef, useState, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// ── Meal type emoji map ──────────────────────────────────────────
const MEAL_EMOJI = {
  "breakfast":          "🌅",
  "lunch":              "☀️",
  "dinner":             "🌙",
  "snack":              "🍎",
  "mid-morning snack":  "🍎",
  "afternoon snack":    "🍊",
  "early-morning":      "🌄",
  "bedtime":            "🌛",
};

function getMealEmoji(mealType) {
  if (!mealType) return "🍽️";
  return MEAL_EMOJI[mealType.toLowerCase()] || "🍽️";
}

// ── Score → colour + label ───────────────────────────────────────
function getScoreMeta(score) {
  if (score >= 80) return { color: "#16a34a", bg: "#dcfce7", label: "Excellent" };
  if (score >= 60) return { color: "#d97706", bg: "#fef3c7", label: "Good" };
  if (score >= 40) return { color: "#ea580c", bg: "#ffedd5", label: "Fair" };
  return            { color: "#6b7280", bg: "#f3f4f6", label: "Low"  };
}

// ── Macro pill ───────────────────────────────────────────────────
function MacroPill({ label, value, unit, color }) {
  return (
    <div style={{
      display:        "flex",
      flexDirection:  "column",
      alignItems:     "center",
      background:     "#FFF9F7",
      border:         "1.5px solid #FFE0D4",
      borderRadius:   "10px",
      padding:        "6px 10px",
      minWidth:       "58px",
    }}>
      <span style={{ fontSize: "12px", fontWeight: "700", color, fontFamily: "'Poppins', sans-serif" }}>
        {typeof value === "number" ? value.toFixed(value < 10 ? 1 : 0) : value}
        <span style={{ fontSize: "9px", fontWeight: "500" }}>{unit}</span>
      </span>
      <span style={{ fontSize: "9px", color: "#94a3b8", fontFamily: "'Roboto', sans-serif", marginTop: "1px" }}>
        {label}
      </span>
    </div>
  );
}

// ── Single suggestion card ───────────────────────────────────────
function SuggestionCard({ item, index }) {
  const [expanded, setExpanded] = useState(false);
  const scoreMeta = getScoreMeta(item.score);
  const maxScore  = 120;
  const scorePct  = Math.min(100, Math.round((item.score / maxScore) * 100));

  return (
    <div style={{
      background:    "#FFFFFF",
      border:        "1.5px solid #ECEFF1",
      borderRadius:  "14px",
      borderLeft:    index === 0 ? "3px solid #FF7043" : "1.5px solid #ECEFF1",
      boxShadow:     "0 2px 8px rgba(38,50,56,0.06)",
      transition:    "box-shadow 0.2s ease",
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(255,112,67,0.12)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(38,50,56,0.06)"}
    >
      <div style={{ padding: "12px 14px" }}>

        {/* ── Row 1: emoji + name + score ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>

          {/* Emoji icon */}
          <div style={{
            width:          "40px",
            height:         "40px",
            minWidth:       "40px",
            borderRadius:   "10px",
            background:     index === 0
              ? "linear-gradient(135deg, #FF7043 0%, #FF8A65 100%)"
              : "#FFF3EE",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            fontSize:       "18px",
            boxShadow:      index === 0 ? "0 2px 6px rgba(255,112,67,0.25)" : "none",
          }}>
            {getMealEmoji(item.meal_type)}
          </div>

          {/* Name + badges */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Badges row */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "3px", flexWrap: "wrap" }}>
              {index === 0 && (
                <span style={{
                  fontSize: "9px", fontWeight: "700",
                  color: "#FF7043", background: "#FFF3EE",
                  border: "1px solid #FFCCBC", borderRadius: "4px",
                  padding: "1px 5px", fontFamily: "'Poppins', sans-serif",
                  letterSpacing: "0.06em", textTransform: "uppercase",
                }}>
                  ⭐ Top Pick
                </span>
              )}
              {item.meal_type && (
                <span style={{
                  fontSize: "9px", fontWeight: "600",
                  color: "#64748b", background: "#F1F5F9",
                  borderRadius: "4px", padding: "1px 5px",
                  fontFamily: "'Poppins', sans-serif",
                  textTransform: "uppercase", letterSpacing: "0.05em",
                }}>
                  {getMealEmoji(item.meal_type)} {item.meal_type}
                </span>
              )}
            </div>
            {/* Food name — always visible, wraps if needed */}
            <p style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize:   "13px",
              fontWeight: "600",
              color:      "#263238",
              margin:     0,
              lineHeight: "1.3",
              wordBreak:  "break-word",
            }}>
              {item.food_name}
            </p>
          </div>

          {/* Score badge */}
          <div style={{
            minWidth:      "46px",
            flexShrink:    0,
            display:       "flex",
            flexDirection: "column",
            alignItems:    "center",
            background:    scoreMeta.bg,
            borderRadius:  "8px",
            padding:       "4px 8px",
          }}>
            <span style={{
              fontSize: "13px", fontWeight: "700",
              color: scoreMeta.color,
              fontFamily: "'Poppins', sans-serif",
              lineHeight: 1,
            }}>
              {scorePct}%
            </span>
            <span style={{
              fontSize: "9px", color: scoreMeta.color,
              fontFamily: "'Roboto', sans-serif", marginTop: "2px",
            }}>
              {scoreMeta.label}
            </span>
          </div>
        </div>

        {/* ── Score bar ── */}
        <div style={{
          height: "3px", background: "#F1F5F9",
          borderRadius: "2px", marginBottom: "10px",
        }}>
          <div style={{
            height: "100%", width: `${scorePct}%`,
            background: `linear-gradient(90deg, ${scoreMeta.color}, ${scoreMeta.color}99)`,
            borderRadius: "2px",
          }} />
        </div>

        {/* ── Macros row ── */}
        <div style={{ display: "flex", gap: "5px", marginBottom: "10px", flexWrap: "wrap" }}>
          <MacroPill label="kcal"    value={item.calories} unit=""  color="#FF7043" />
          <MacroPill label="protein" value={item.protein}  unit="g" color="#16a34a" />
          <MacroPill label="carbs"   value={item.carbs}    unit="g" color="#d97706" />
          <MacroPill label="fat"     value={item.fats}     unit="g" color="#7c3aed" />
          {item.fiber > 0 && <MacroPill label="fiber" value={item.fiber} unit="g" color="#0891b2" />}
          {item.sugar > 0 && <MacroPill label="sugar" value={item.sugar} unit="g" color="#db2777" />}
        </div>

        {/* ── Expandable details ── */}
        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: "11px", color: "#FF7043", fontWeight: "600",
            fontFamily: "'Poppins', sans-serif", padding: "0",
            marginBottom: expanded ? "8px" : "0",
          }}
        >
          {expanded ? "▲ Hide details" : "▼ Show reasons & details"}
        </button>

        {expanded && (
          <>
            {/* Fills gap */}
            {item.fills_gap && Object.keys(item.fills_gap).length > 0 && (
              <div style={{
                background: "#F0FDF4", border: "1px solid #BBF7D0",
                borderRadius: "8px", padding: "8px 10px", marginBottom: "8px",
              }}>
                <p style={{
                  fontSize: "10px", fontWeight: "600", color: "#15803d",
                  margin: "0 0 4px", fontFamily: "'Poppins', sans-serif",
                  textTransform: "uppercase", letterSpacing: "0.06em",
                }}>
                  Fills your gap
                </p>
                {Object.entries(item.fills_gap).map(([key, val]) => (
                  <p key={key} style={{ fontSize: "11px", color: "#166534", margin: "2px 0 0", fontFamily: "'Roboto', sans-serif" }}>
                    • {key.charAt(0).toUpperCase() + key.slice(1)}: {val}
                  </p>
                ))}
              </div>
            )}

            {/* Reasons */}
            {item.reasons?.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginBottom: "4px" }}>
                <span style={{ fontSize: "10px", marginTop: "2px", flexShrink: 0 }}>✅</span>
                <span style={{ fontSize: "11px", color: "#374151", fontFamily: "'Roboto', sans-serif", lineHeight: "1.5" }}>{r}</span>
              </div>
            ))}

            {/* Warnings */}
            {item.warnings?.length > 0 && (
              <div style={{
                background: "#FFF7ED", border: "1px solid #FED7AA",
                borderRadius: "8px", padding: "8px 10px", marginTop: "8px",
              }}>
                {item.warnings.map((w, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginBottom: i < item.warnings.length - 1 ? "4px" : 0 }}>
                    <span style={{ fontSize: "10px", flexShrink: 0, marginTop: "2px" }}>⚠️</span>
                    <span style={{ fontSize: "11px", color: "#92400e", fontFamily: "'Roboto', sans-serif", lineHeight: "1.5" }}>{w}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


// ── Main drawer component ────────────────────────────────────────
export function FoodSuggestionsDrawer({ open, onClose, initialData }) {
  const [period,      setPeriod]      = useState(
    () => localStorage.getItem("suggestion_period") || "daily"
  );
  const [data,        setData]        = useState(initialData || null);
  const [loading,     setLoading]     = useState(false);
  const [drawerReady, setDrawerReady] = useState(false);
  const overlayRef = useRef(null);

  // Animate in/out
  useEffect(() => {
    if (open) {
      setTimeout(() => setDrawerReady(true), 10);
    } else {
      setDrawerReady(false);
    }
  }, [open]);

  // Fetch full suggestions when drawer opens or period changes
  const fetchSuggestions = useCallback(async (p) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${API_BASE}/suggest-foods/?limit=10&period=${p}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error("Suggestions fetch failed:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) fetchSuggestions(period);
  }, [open, period]);

  // Close on overlay click
  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose();
  }

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const suggestions  = data?.suggestions || [];
  const remaining    = data?.remaining_nutrients || {};
  const conditions   = data?.health_context?.active_conditions || [];
  const planReminder = data?.plan_reminder;

  return (
    <>
      <style>{`
        @keyframes drawerSlideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        @keyframes drawerSlideOut {
          from { transform: translateX(0); }
          to   { transform: translateX(100%); }
        }
        @keyframes overlayFadeIn  { from { opacity: 0; } to { opacity: 1; } }
        .drawer-panel {
          animation: drawerSlideIn 0.35s cubic-bezier(0.32, 0.72, 0, 1) forwards;
        }
        .drawer-panel.leaving {
          animation: drawerSlideOut 0.3s cubic-bezier(0.32, 0.72, 0, 1) forwards;
        }
        .period-btn {
          transition: all 0.15s ease;
        }
        .period-btn:hover {
          background: #FFF3EE !important;
        }
        .suggestion-scroll::-webkit-scrollbar { width: 4px; }
        .suggestion-scroll::-webkit-scrollbar-track { background: transparent; }
        .suggestion-scroll::-webkit-scrollbar-thumb { background: #FFD0C0; border-radius: 2px; }
      `}</style>

      {/* ── Overlay ── */}
      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        style={{
          position:   "fixed",
          inset:      0,
          background: "rgba(38, 50, 56, 0.45)",
          zIndex:     100,
          animation:  "overlayFadeIn 0.25s ease forwards",
          backdropFilter: "blur(2px)",
        }}
      />

      {/* ── Drawer panel ── */}
      <div
        className={`drawer-panel${!drawerReady ? " leaving" : ""}`}
        style={{
          position:     "fixed",
          top:          0,
          right:        0,
          bottom:       0,
          width:        "min(480px, 100vw)",
          background:   "#FAFAFA",
          zIndex:       101,
          display:      "flex",
          flexDirection:"column",
          boxShadow:    "-8px 0 40px rgba(38, 50, 56, 0.15)",
          fontFamily:   "'Poppins', sans-serif",
        }}
      >
        {/* ── Header ── */}
        <div style={{
          background:   "#FFFFFF",
          borderBottom: "1.5px solid #ECEFF1",
          padding:      "16px 20px 12px",
          flexShrink:   0,
        }}>
          {/* Top row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width:          "36px",
                height:         "36px",
                borderRadius:   "10px",
                background:     "linear-gradient(135deg, #FF7043 0%, #FF8A65 100%)",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                fontSize:       "16px",
                boxShadow:      "0 2px 8px rgba(255,112,67,0.3)",
              }}>
                💡
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#263238" }}>
                  Smart Suggestions
                </p>
                <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8", fontFamily: "'Roboto', sans-serif" }}>
                  Personalised for your goals today
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                background:   "#F1F5F9",
                border:       "none",
                borderRadius: "8px",
                width:        "32px",
                height:       "32px",
                cursor:       "pointer",
                fontSize:     "14px",
                color:        "#64748b",
                display:      "flex",
                alignItems:   "center",
                justifyContent:"center",
                transition:   "all 0.15s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#FFEDD5"; e.currentTarget.style.color = "#FF7043"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#F1F5F9"; e.currentTarget.style.color = "#64748b"; }}
            >
              ✕
            </button>
          </div>

          {/* ── Period toggle ── */}
          <div style={{
            display:       "flex",
            background:    "#F1F5F9",
            borderRadius:  "10px",
            padding:       "3px",
            gap:           "2px",
          }}>
            {["daily", "weekly"].map(p => (
              <button
                key={p}
                className="period-btn"
                onClick={() => setPeriod(p)}
                style={{
                  flex:         1,
                  padding:      "6px 0",
                  borderRadius: "8px",
                  border:       "none",
                  cursor:       "pointer",
                  fontSize:     "12px",
                  fontWeight:   period === p ? "700" : "500",
                  fontFamily:   "'Poppins', sans-serif",
                  background:   period === p ? "#FFFFFF" : "transparent",
                  color:        period === p ? "#FF7043" : "#64748b",
                  boxShadow:    period === p ? "0 1px 4px rgba(38,50,56,0.10)" : "none",
                  transition:   "all 0.15s ease",
                }}
              >
                {p === "daily" ? "📅 Daily" : "📆 Weekly avg"}
              </button>
            ))}
          </div>
        </div>

        {/* ── Remaining nutrients bar ── */}
        {remaining.calories !== undefined && (
          <div style={{
            background:   "#FFFFFF",
            borderBottom: "1.5px solid #ECEFF1",
            padding:      "10px 20px",
            flexShrink:   0,
          }}>
            <p style={{ margin: "0 0 6px", fontSize: "10px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Remaining today
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[
                { label: "Calories", value: `${Math.round(remaining.calories)} kcal`, color: "#FF7043" },
                { label: "Protein",  value: `${remaining.protein_g?.toFixed(1)}g`,    color: "#16a34a" },
                { label: "Carbs",    value: `${remaining.carbs_g?.toFixed(1)}g`,      color: "#d97706" },
                { label: "Fat",      value: `${remaining.fats_g?.toFixed(1)}g`,       color: "#7c3aed" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{
                  display:      "flex",
                  alignItems:   "center",
                  gap:          "4px",
                  background:   "#F8FAFC",
                  border:       "1px solid #E2E8F0",
                  borderRadius: "6px",
                  padding:      "3px 8px",
                }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: "11px", color: "#64748b", fontFamily: "'Roboto', sans-serif" }}>{label}</span>
                  <span style={{ fontSize: "11px", fontWeight: "700", color, fontFamily: "'Poppins', sans-serif" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Active conditions banner ── */}
        {conditions.length > 0 && (
          <div style={{
            background:   "#FFF7ED",
            borderBottom: "1.5px solid #FED7AA",
            padding:      "8px 20px",
            flexShrink:   0,
            display:      "flex",
            alignItems:   "center",
            gap:          "8px",
          }}>
            <span style={{ fontSize: "12px" }}>🏥</span>
            <span style={{
              fontSize:   "11px",
              color:      "#92400e",
              fontFamily: "'Roboto', sans-serif",
            }}>
              Personalised for: {conditions.map(c =>
                c.replace(/^(is_|has_|low_)/, "").replace(/_/g, " ")
              ).join(" · ")}
            </span>
          </div>
        )}

        {/* ── Plan reminder banner ── */}
        {planReminder && (
          <div style={{
            background:   "#EFF6FF",
            borderBottom: "1.5px solid #BFDBFE",
            padding:      "8px 20px",
            flexShrink:   0,
            display:      "flex",
            alignItems:   "flex-start",
            gap:          "8px",
          }}>
            <span style={{ fontSize: "12px", marginTop: "1px" }}>📋</span>
            <span style={{
              fontSize:   "11px",
              color:      "#1e40af",
              fontFamily: "'Roboto', sans-serif",
              lineHeight: "1.5",
            }}>
              {planReminder.message}
            </span>
          </div>
        )}

        {/* ── Suggestion list ── */}
        <div
          className="suggestion-scroll"
          style={{
            flex:       1,
            overflowY:  "auto",
            padding:    "16px",
            display:    "flex",
            flexDirection: "column",
            gap:        "12px",
          }}
        >
          {loading ? (
            <div style={{
              display:        "flex",
              flexDirection:  "column",
              alignItems:     "center",
              justifyContent: "center",
              flex:           1,
              gap:            "12px",
              color:          "#94a3b8",
            }}>
              <div style={{
                width:        "40px",
                height:       "40px",
                border:       "3px solid #FFCCBC",
                borderTop:    "3px solid #FF7043",
                borderRadius: "50%",
                animation:    "spin 0.8s linear infinite",
              }} />
              <span style={{ fontSize: "13px", fontFamily: "'Poppins', sans-serif" }}>
                Calculating your suggestions…
              </span>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : suggestions.length === 0 ? (
            <div style={{
              display:        "flex",
              flexDirection:  "column",
              alignItems:     "center",
              justifyContent: "center",
              flex:           1,
              gap:            "8px",
              color:          "#94a3b8",
              padding:        "40px 0",
            }}>
              <span style={{ fontSize: "40px" }}>🎉</span>
              <p style={{ fontSize: "14px", fontWeight: "600", color: "#263238", margin: 0, fontFamily: "'Poppins', sans-serif" }}>
                You've hit your goal!
              </p>
              <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0, fontFamily: "'Roboto', sans-serif" }}>
                No more suggestions needed for today.
              </p>
            </div>
          ) : (
            suggestions.map((item, i) => (
              <SuggestionCard key={item.food_id || i} item={item} index={i} />
            ))
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{
          background:   "#FFFFFF",
          borderTop:    "1.5px solid #ECEFF1",
          padding:      "12px 20px",
          flexShrink:   0,
          textAlign:    "center",
        }}>
          <p style={{
            margin:     0,
            fontSize:   "10px",
            color:      "#cbd5e1",
            fontFamily: "'Roboto', sans-serif",
          }}>
            Suggestions update after each meal log · Powered by TrackIntake AI
          </p>
        </div>
      </div>
    </>
  );
}