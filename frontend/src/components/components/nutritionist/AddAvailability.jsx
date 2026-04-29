// import React, { useEffect, useState } from "react";
// import toast, { Toaster } from "react-hot-toast";
// import {
//   CalendarDays, Trash2, Plus, Lock, Home, ChevronRight,
//   Search, X, User, Mail, Phone, Video, Copy, ExternalLink,
//   Clock, Calendar, FileText, Activity,
//   Sparkles, Zap, ArrowRight, ChevronDown,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import axiosInstance from "../../../api/axiosInstance";

// /* ─── Scoped styles (uses app font variables) ───────────────── */
// const STYLES = `
//   .av-root {
//     font-family: var(--font-secondary); /* Roboto */
//   }
//   .av-heading {
//     font-family: var(--font-primary); /* Poppins */
//     font-weight: 700;
//   }
//   .av-subheading {
//     font-family: var(--font-primary);
//     font-weight: 600;
//   }

//   @keyframes av-shimmer {
//     0%   { background-position: -400px 0; }
//     100% { background-position:  400px 0; }
//   }
//   @keyframes av-slide-up {
//     from { opacity: 0; transform: translateY(36px) scale(0.97); }
//     to   { opacity: 1; transform: translateY(0)    scale(1);    }
//   }
//   @keyframes av-stagger-in {
//     from { opacity: 0; transform: translateY(16px); }
//     to   { opacity: 1; transform: translateY(0);    }
//   }
//   @keyframes av-fade-in {
//     from { opacity: 0; }
//     to   { opacity: 1; }
//   }
//   @keyframes av-morph {
//     0%,100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
//     50%      { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
//   }
//   @keyframes av-spin-slow {
//     from { transform: rotate(0deg); }
//     to   { transform: rotate(360deg); }
//   }
//   @keyframes av-pulse-dot {
//     0%, 100% { transform: scale(1);   opacity: 1; }
//     50%       { transform: scale(1.4); opacity: 0.7; }
//   }

//   .av-morph     { animation: av-morph     8s ease-in-out infinite; }
//   .av-spin-slow { animation: av-spin-slow 20s linear     infinite; }
//   .av-pulse-dot { animation: av-pulse-dot 1.8s ease-in-out infinite; }

//   /* Shimmer CTA button */
//   .av-shimmer-btn {
//     background: linear-gradient(90deg, var(--color-primary) 0%, #ff9a6c 40%, var(--color-primary) 100%);
//     background-size: 400px 100%;
//     animation: av-shimmer 2.5s infinite;
//     transition: transform 0.2s, box-shadow 0.2s;
//     color: #fff;
//   }
//   .av-shimmer-btn:hover {
//     transform: translateY(-2px);
//     box-shadow: 0 8px 24px -4px rgba(255,112,67,0.45);
//   }
//   .av-shimmer-btn:active { transform: scale(0.97); }

//   /* Modal */
//   .av-modal-overlay { animation: av-fade-in 0.25s ease forwards; }
//   .av-modal-card    { animation: av-slide-up 0.4s cubic-bezier(.34,1.56,.64,1) forwards; }

//   /* Cards */
//   .av-card {
//     transition: transform 0.28s cubic-bezier(.34,1.56,.64,1), box-shadow 0.28s ease;
//   }
//   .av-card:hover {
//     transform: translateY(-4px) scale(1.012);
//     box-shadow: 0 18px 36px -10px rgba(255,112,67,0.14);
//   }
//   .av-booked-card {
//     cursor: pointer;
//     transition: transform 0.28s cubic-bezier(.34,1.56,.64,1), box-shadow 0.28s ease;
//   }
//   .av-booked-card:hover {
//     transform: translateY(-5px) scale(1.018);
//     box-shadow: 0 24px 48px -12px rgba(255,112,67,0.22);
//   }
//   .av-booked-card:hover .av-view-hint {
//     opacity: 1;
//     transform: translateX(0);
//   }
//   .av-view-hint {
//     opacity: 0;
//     transform: translateX(-6px);
//     transition: opacity 0.22s, transform 0.22s;
//   }

//   /* Section collapse */
//   .av-section-body {
//     overflow: hidden;
//     transition: max-height 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.28s ease;
//   }
//   .av-section-body.open  { max-height: 4000px; opacity: 1; }
//   .av-section-body.closed { max-height: 0;     opacity: 0; }

//   .av-chevron {
//     transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
//   }
//   .av-chevron.closed { transform: rotate(-90deg); }

//   /* Input */
//   .av-input {
//     font-family: var(--font-secondary);
//     border: 1.5px solid var(--color-border-default);
//     border-radius: 12px;
//     padding: 10px 14px;
//     font-size: 14px;
//     color: var(--color-text-strong);
//     background: var(--color-bg-surface);
//     outline: none;
//     transition: border-color 0.2s, box-shadow 0.2s;
//     width: 100%;
//   }
//   .av-input:focus {
//     border-color: var(--color-primary);
//     box-shadow: 0 0 0 3px rgba(255,112,67,0.11);
//   }
//   .av-input::placeholder { color: var(--color-text-subtle); }

//   /* Tag pill */
//   .av-tag {
//     display: inline-flex;
//     align-items: center;
//     gap: 4px;
//     padding: 3px 10px;
//     border-radius: 100px;
//     font-size: 11px;
//     font-weight: 600;
//     white-space: nowrap;
//     font-family: var(--font-secondary);
//   }

//   /* Today badge */
//   .av-today-badge {
//     display: inline-block;
//     padding: 1px 7px;
//     border-radius: 100px;
//     font-size: 9px;
//     font-weight: 700;
//     text-transform: uppercase;
//     letter-spacing: 0.4px;
//     background: var(--color-primary);
//     color: #fff;
//     margin-left: 6px;
//     vertical-align: middle;
//     font-family: var(--font-secondary);
//   }

//   /* Divider */
//   .av-divider {
//     height: 1px;
//     background: linear-gradient(to right, transparent, var(--color-border-default), transparent);
//     margin: 10px 0;
//   }

//   /* Orb */
//   .av-orb {
//     position: absolute;
//     border-radius: 50%;
//     filter: blur(38px);
//     pointer-events: none;
//   }

//   /* Stagger animation helper */
//   .av-stagger-item {
//     opacity: 0;
//   }

//   /* Scrollbar */
//   .av-scroll::-webkit-scrollbar { width: 4px; }
//   .av-scroll::-webkit-scrollbar-track { background: transparent; }
//   .av-scroll::-webkit-scrollbar-thumb {
//     background: var(--color-primary);
//     border-radius: 99px;
//   }
// `;

// /* ─── Helpers ──────────────────────────────────────────────── */
// const today = new Date().toISOString().split("T")[0];
// const isToday         = (d) => d === today;
// const isFutureOrToday = (d) => d >= today;
// const fmtDate         = (d) =>
//   new Date(d).toLocaleDateString(undefined, { weekday:"short", day:"2-digit", month:"short", year:"numeric" });

// /* ─── Stats Bar ─────────────────────────────────────────────── */
// const StatsBar = ({ booked, available }) => (
//   <div className="grid grid-cols-3 gap-4 mb-10">
//     {[
//       { label:"Booked",    val:booked,            emoji:"🔴", color:"var(--color-primary)",      bg:"var(--color-warning-bg-subtle)" },
//       { label:"Available", val:available,          emoji:"🟢", color:"var(--color-success-text)", bg:"var(--color-success-bg-subtle)" },
//       { label:"Total",     val:booked + available, emoji:"📅", color:"var(--color-info-text)",    bg:"var(--color-info-bg-subtle)"    },
//     ].map(({ label, val, emoji, color, bg }) => (
//       <div key={label} className="rounded-2xl p-5 flex items-center gap-4"
//         style={{ background:bg, border:"1.5px solid var(--color-border-default)" }}>
//         <span className="text-2xl">{emoji}</span>
//         <div>
//           <p className="av-heading text-4xl" style={{ color, lineHeight:1 }}>{val}</p>
//           <p className="text-xs font-medium mt-1" style={{ color:"var(--color-text-muted)", fontFamily:"var(--font-secondary)" }}>
//             {label} Slots
//           </p>
//         </div>
//       </div>
//     ))}
//   </div>
// );

// /* ─── Patient Modal ─────────────────────────────────────────── */
// const PatientModal = ({ slot, onClose }) => {
//   if (!slot) return null;
//   const p    = slot.patient || {};
//   const link = slot.meeting_link || slot.video_call_link || null;
//   const copy = () => { navigator.clipboard.writeText(link); toast.success("Link copied!"); };

//   const InfoRow = ({ icon: Icon, label, val }) =>
//     val ? (
//       <div className="flex items-center gap-3 py-3"
//         style={{ borderBottom:"1px solid var(--color-border-default)" }}>
//         <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
//           style={{ background:"var(--color-bg-surface-alt)" }}>
//           <Icon size={14} style={{ color:"var(--color-primary)" }} />
//         </div>
//         <div>
//           <p className="text-[10px] font-bold uppercase tracking-widest"
//             style={{ color:"var(--color-text-subtle)", fontFamily:"var(--font-secondary)" }}>{label}</p>
//           <p className="text-sm font-semibold mt-0.5"
//             style={{ color:"var(--color-text-strong)", fontFamily:"var(--font-secondary)" }}>{val}</p>
//         </div>
//       </div>
//     ) : null;

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center p-4 av-modal-overlay"
//       style={{ background:"rgba(8,12,18,0.58)", backdropFilter:"blur(14px)" }}
//       onClick={onClose}
//     >
//       <div
//         className="relative w-full max-w-lg rounded-3xl overflow-hidden av-modal-card av-scroll"
//         style={{
//           background:"var(--color-bg-surface)",
//           boxShadow:"0 50px 100px -24px rgba(0,0,0,0.38), 0 0 0 1px rgba(255,255,255,0.06)",
//           maxHeight:"90vh",
//           overflowY:"auto",
//         }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Decorative orbs */}
//         <div className="av-orb w-44 h-44 -top-10 -right-10"
//           style={{ background:"var(--color-primary)", opacity:0.18 }} />
//         <div className="av-orb w-32 h-32 top-24 -left-8"
//           style={{ background:"#fbbf24", opacity:0.12 }} />

//         {/* Gradient header */}
//         <div className="relative px-8 pt-8 pb-20 overflow-hidden"
//           style={{ background:"linear-gradient(135deg, var(--color-primary) 0%, #f4511e 55%, #ff9a6c 100%)" }}>
//           <div className="absolute -bottom-14 -right-14 w-44 h-44 rounded-full border-2 border-white/10 av-spin-slow" />
//           <div className="absolute -bottom-7  -right-7  w-26 h-26 rounded-full border   border-white/15 av-spin-slow"
//             style={{ animationDirection:"reverse", width:104, height:104 }} />

//           <button onClick={onClose}
//             className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-white/30"
//             style={{ background:"rgba(255,255,255,0.18)" }}>
//             <X size={16} color="white" />
//           </button>

//           <div className="flex items-end gap-5">
//             <div className="relative">
//               <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-2xl av-morph"
//                 style={{ background:"rgba(255,255,255,0.22)", color:"white", backdropFilter:"blur(8px)",
//                   fontFamily:"var(--font-primary)" }}>
//                 {(p.name || "P").charAt(0).toUpperCase()}
//               </div>
//               <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white av-pulse-dot"
//                 style={{ background:"#22c55e" }} />
//             </div>
//             <div className="pb-1">
//               <p className="text-white/65 text-xs font-semibold tracking-widest uppercase mb-1"
//                 style={{ fontFamily:"var(--font-secondary)" }}>Patient</p>
//               <h2 className="text-white text-2xl av-heading">{p.name || "Unknown Patient"}</h2>
//               {p.email && <p className="text-white/75 text-sm mt-0.5" style={{ fontFamily:"var(--font-secondary)" }}>{p.email}</p>}
//             </div>
//           </div>
//         </div>

//         {/* Time ribbon */}
//         <div className="relative -mt-7 mx-6 z-10">
//           <div className="rounded-2xl px-5 py-3.5 flex items-center justify-between"
//             style={{
//               background:"var(--color-bg-surface)",
//               border:"2px solid var(--color-border-default)",
//               boxShadow:"0 12px 32px -8px rgba(0,0,0,0.13)",
//             }}>
//             <div className="flex items-center gap-2.5">
//               <Clock size={15} style={{ color:"var(--color-primary)" }} />
//               <span className="av-subheading text-lg" style={{ color:"var(--color-text-strong)" }}>
//                 {slot.start_time} – {slot.end_time}
//               </span>
//             </div>
//             <div className="flex items-center gap-1.5">
//               <Calendar size={13} style={{ color:"var(--color-text-muted)" }} />
//               <span className="text-sm font-medium" style={{ color:"var(--color-text-muted)", fontFamily:"var(--font-secondary)" }}>
//                 {fmtDate(slot.date)}
//                 {isToday(slot.date) && <span className="av-today-badge">Today</span>}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Body */}
//         <div className="px-8 pt-6 pb-8">
//           <p className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2"
//             style={{ color:"var(--color-text-subtle)", fontFamily:"var(--font-secondary)" }}>
//             <User size={11} /> Patient Details
//           </p>

//           <div className="mb-6">
//             <InfoRow icon={User}     label="Full Name" val={p.name} />
//             <InfoRow icon={Mail}     label="Email"     val={p.email} />
//             <InfoRow icon={Phone}    label="Phone"     val={p.phone || p.phone_number} />
//             <InfoRow icon={Activity} label="Age"       val={p.age ? `${p.age} years` : null} />
//             <InfoRow icon={FileText} label="Notes"     val={p.notes} />
//           </div>

//           {/* Status */}
//           <div className="flex items-center gap-2.5 mb-6">
//             <div className="w-2 h-2 rounded-full av-pulse-dot" style={{ background:"#22c55e" }} />
//             <span className="av-tag"
//               style={{ background:"var(--color-success-bg-subtle)", color:"var(--color-success-text)" }}>
//               ✓ Appointment Confirmed
//             </span>
//           </div>

//           {/* Meeting link */}
//           {link ? (
//             <div className="rounded-2xl p-5 relative overflow-hidden"
//               style={{
//                 background:"linear-gradient(135deg, var(--color-info-bg-subtle), rgba(224,242,254,0.22))",
//                 border:"1.5px solid var(--color-border-default)",
//               }}>
//               <div className="av-orb w-24 h-24 -bottom-6 -right-6"
//                 style={{ background:"#0ea5e9", opacity:0.12 }} />
//               <div className="flex items-center gap-2 mb-3">
//                 <Video size={14} style={{ color:"var(--color-info-text)" }} />
//                 <p className="text-xs font-bold uppercase tracking-widest"
//                   style={{ color:"var(--color-info-text)", fontFamily:"var(--font-secondary)" }}>
//                   Meeting Link
//                 </p>
//               </div>
//               <p className="text-xs font-mono break-all mb-4 px-3 py-2 rounded-xl"
//                 style={{ background:"rgba(255,255,255,0.65)", color:"var(--color-text-muted)" }}>
//                 {link}
//               </p>
//               <div className="flex gap-3">
//                 <button onClick={copy}
//                   className="av-shimmer-btn flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold">
//                   <Copy size={13} /> Copy
//                 </button>
//                 <a href={link} target="_blank" rel="noopener noreferrer"
//                   className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold border transition-all hover:opacity-80"
//                   style={{ color:"var(--color-info-text)", borderColor:"var(--color-info-text)", background:"transparent",
//                     fontFamily:"var(--font-secondary)" }}>
//                   <ExternalLink size={13} /> Join
//                 </a>
//               </div>
//             </div>
//           ) : (
//             <div className="rounded-2xl p-6 text-center"
//               style={{ background:"var(--color-bg-surface-alt)", border:"1.5px dashed var(--color-border-default)" }}>
//               <Video size={26} className="mx-auto mb-2 opacity-20" style={{ color:"var(--color-text-muted)" }} />
//               <p className="text-sm font-medium" style={{ color:"var(--color-text-muted)", fontFamily:"var(--font-secondary)" }}>
//                 No meeting link yet
//               </p>
//               <p className="text-xs mt-0.5" style={{ color:"var(--color-text-subtle)", fontFamily:"var(--font-secondary)" }}>
//                 Will appear once generated
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// /* ─── Booked Card ───────────────────────────────────────────── */
// const BookedCard = ({ slot, onClick, idx }) => (
//   <div
//     className="av-booked-card rounded-2xl overflow-hidden av-stagger-item"
//     style={{
//       background:"var(--color-bg-surface)",
//       border:"1.5px solid var(--color-border-default)",
//       animation:`av-stagger-in 0.45s ease ${idx * 0.07}s forwards`,
//     }}
//     onClick={() => onClick(slot)}
//   >
//     <div style={{ height:3, background:"linear-gradient(90deg, var(--color-primary), #ff9a6c, #fbbf24)" }} />
//     <div className="p-5">
//       <div className="flex items-start justify-between mb-3">
//         <div className="flex items-center gap-3">
//           <div className="w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold shadow-md"
//             style={{ background:"linear-gradient(135deg, var(--color-primary), #ff9a6c)", color:"white",
//               fontFamily:"var(--font-primary)" }}>
//             {(slot.patient?.name || "P").charAt(0).toUpperCase()}
//           </div>
//           <div>
//             <p className="font-semibold text-sm leading-tight"
//               style={{ color:"var(--color-text-strong)", fontFamily:"var(--font-primary)" }}>
//               {slot.patient?.name || "Patient"}
//             </p>
//             <p className="text-xs mt-0.5 truncate max-w-[130px]"
//               style={{ color:"var(--color-text-subtle)", fontFamily:"var(--font-secondary)" }}>
//               {slot.patient?.email || "—"}
//             </p>
//           </div>
//         </div>
//         <div className="flex flex-col items-end gap-1.5">
//           <Lock size={13} style={{ color:"var(--color-primary)" }} />
//           <span className="av-tag"
//             style={{ background:"var(--color-warning-bg-subtle)", color:"var(--color-warning-text)" }}>
//             Booked
//           </span>
//         </div>
//       </div>

//       <div className="av-divider" />

//       <div className="flex items-center justify-between">
//         <div>
//           <p className="font-semibold text-base" style={{ color:"var(--color-text-strong)", fontFamily:"var(--font-primary)" }}>
//             {slot.start_time} – {slot.end_time}
//           </p>
//           <p className="text-xs mt-0.5" style={{ color:"var(--color-text-muted)", fontFamily:"var(--font-secondary)" }}>
//             {fmtDate(slot.date)}
//             {isToday(slot.date) && <span className="av-today-badge">Today</span>}
//           </p>
//         </div>
//         <div className="av-view-hint flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl"
//           style={{ background:"var(--color-bg-surface-alt)", color:"var(--color-primary)",
//             fontFamily:"var(--font-secondary)" }}>
//           Details <ArrowRight size={11} />
//         </div>
//       </div>
//     </div>
//   </div>
// );

// /* ─── Available Card ────────────────────────────────────────── */
// const AvailableCard = ({ slot, onDelete, idx }) => (
//   <div
//     className="av-card rounded-2xl overflow-hidden av-stagger-item"
//     style={{
//       background:"var(--color-bg-surface)",
//       border:"1.5px solid var(--color-border-default)",
//       animation:`av-stagger-in 0.45s ease ${idx * 0.07}s forwards`,
//     }}
//   >
//     <div style={{ height:3, background:"linear-gradient(90deg, #22c55e, #86efac, #4ade80)" }} />
//     <div className="p-5">
//       <div className="flex items-start justify-between">
//         <div>
//           <p className="font-semibold text-base" style={{ color:"var(--color-text-strong)", fontFamily:"var(--font-primary)" }}>
//             {slot.start_time} – {slot.end_time}
//           </p>
//           <p className="text-xs mt-1" style={{ color:"var(--color-text-muted)", fontFamily:"var(--font-secondary)" }}>
//             {fmtDate(slot.date)}
//             {isToday(slot.date) && <span className="av-today-badge">Today</span>}
//           </p>
//         </div>
//         <div className="flex flex-col items-end gap-2">
//           <span className="av-tag"
//             style={{ background:"var(--color-success-bg-subtle)", color:"var(--color-success-text)" }}>
//             Open
//           </span>
//           <button
//             onClick={() => onDelete(slot.id)}
//             className="p-1.5 rounded-lg transition-all hover:scale-110 active:scale-95"
//             style={{ color:"var(--color-danger-text)", background:"var(--color-danger-bg-subtle)" }}>
//             <Trash2 size={13} />
//           </button>
//         </div>
//       </div>
//     </div>
//   </div>
// );

// /* ─── Section Header with Collapse Button ───────────────────── */
// const SectionHeader = ({ emoji, title, count, color, open, onToggle }) => (
//   <div className="flex items-center justify-between mb-4">
//     <div className="flex items-center gap-3">
//       <span className="text-xl">{emoji}</span>
//       <h2 className="av-subheading text-lg" style={{ color:"var(--color-text-strong)" }}>{title}</h2>
//       <span className="av-tag font-bold" style={{ background:`${color}20`, color }}>{count}</span>
//     </div>

//     {/* Collapse toggle button */}
//     <button
//       onClick={onToggle}
//       className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80 active:scale-95"
//       style={{
//         background: open ? "var(--color-bg-surface-alt)" : "var(--color-primary)",
//         color:      open ? "var(--color-text-muted)"     : "#fff",
//         border:     "1.5px solid var(--color-border-default)",
//         fontFamily: "var(--font-secondary)",
//       }}
//     >
//       <ChevronDown
//         size={14}
//         className="av-chevron"
//         style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition:"transform 0.3s" }}
//       />
//       {open ? "Collapse" : "Expand"}
//     </button>
//   </div>
// );

// /* ═══════════════════════════════════════════════════════════════
//    MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════ */
// const AddAvailability = () => {
//   const navigate = useNavigate();

//   /* Inject styles once */
//   useEffect(() => {
//     if (!document.getElementById("av-styles")) {
//       const el = document.createElement("style");
//       el.id = "av-styles";
//       el.textContent = STYLES;
//       document.head.appendChild(el);
//     }
//   }, []);

//   /* State */
//   const [date, setDate]           = useState("");
//   const [startTime, setStartTime] = useState("");
//   const [endTime, setEndTime]     = useState("");
//   const [duration, setDuration]   = useState(30);
//   const [generatedSlots, setGeneratedSlots] = useState([]);

//   const [unbookedSlots, setUnbookedSlots] = useState([]);
//   const [bookedSlots, setBookedSlots]     = useState([]);
//   const [selectedSlot, setSelectedSlot]   = useState(null);
//   const [loading, setLoading]             = useState(false);

//   const [search, setSearch]         = useState("");
//   const [filterDate, setFilterDate] = useState("");
//   const [status, setStatus]         = useState("");

//   const [showBooked,   setShowBooked]   = useState(true);
//   const [showUnbooked, setShowUnbooked] = useState(true);
//   const [createOpen,   setCreateOpen]   = useState(false);

//   const filteredAvailable = unbookedSlots.filter((s) => isFutureOrToday(s.date));

//   /* Fetch */
//   const fetchMySlots = async () => {
//     try {
//       const res = await axiosInstance.get("/appointments/nutritionist/my-slots/", {
//         params: { search: search || undefined, date: filterDate || undefined, status: status || undefined },
//       });
//       setUnbookedSlots(res.data?.unbooked_slots || []);
//       setBookedSlots(res.data?.booked_slots     || []);
//     } catch {
//       toast.error("Failed to load slots");
//     }
//   };

//   useEffect(() => { fetchMySlots(); }, []);
//   useEffect(() => {
//     const t = setTimeout(fetchMySlots, 400);
//     return () => clearTimeout(t);
//   }, [search, filterDate, status]);

//   /* Generate */
//   const generateSlots = () => {
//     if (!date || !startTime || !endTime) { toast.error("Fill all fields first"); return; }
//     if (startTime >= endTime) { toast.error("End must be after start time"); return; }
//     const temp = [];
//     let s = new Date(`${date}T${startTime}`);
//     const e = new Date(`${date}T${endTime}`);
//     while (s < e) {
//       const n = new Date(s.getTime() + duration * 60000);
//       if (n > e) break;
//       temp.push({ date, start_time: s.toTimeString().slice(0,5), end_time: n.toTimeString().slice(0,5) });
//       s = n;
//     }
//     if (!temp.length) { toast.error("No slots fit in that range"); return; }
//     setGeneratedSlots(temp);
//     toast.success(`${temp.length} slot${temp.length > 1 ? "s" : ""} generated!`);
//   };

//   /* Save */
//   const saveSlot = async (slot) => {
//     setLoading(true);
//     try {
//       await axiosInstance.post("/appointments/nutritionist/add-availability/", slot);
//       toast.success("Slot saved ✓");
//       setGeneratedSlots((p) => p.filter((s) => s.start_time !== slot.start_time || s.end_time !== slot.end_time));
//       fetchMySlots();
//     } catch { toast.error("Slot already exists"); }
//     finally { setLoading(false); }
//   };

//   /* Delete */
//   const deleteSlot = async (id) => {
//     if (!confirm("Delete this slot?")) return;
//     try {
//       await axiosInstance.delete(`/appointments/nutritionist/slots/${id}/delete/`);
//       toast.success("Slot removed");
//       fetchMySlots();
//     } catch { toast.error("Cannot delete a booked slot"); }
//   };

//   /* ── Render ── */
//   return (
//     <div className="min-h-screen av-root" style={{ background:"var(--color-bg-app)" }}>
//       <Toaster position="top-right"
//         toastOptions={{ style: { fontFamily:"var(--font-secondary)", borderRadius:14 } }} />

//       {selectedSlot && <PatientModal slot={selectedSlot} onClose={() => setSelectedSlot(null)} />}

//       {/* Sticky top bar */}
//       <div className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between"
//         style={{
//           background:"rgba(255,253,249,0.88)",
//           backdropFilter:"blur(18px)",
//           borderBottom:"1px solid var(--color-border-default)",
//         }}>
//         <div className="flex items-center gap-2 text-sm" style={{ color:"var(--color-text-muted)" }}>
//           <button onClick={() => navigate("/nutritionist")}
//             className="flex items-center gap-1.5 font-medium transition-colors hover:text-[var(--color-primary)]"
//             style={{ fontFamily:"var(--font-secondary)" }}>
//             <Home size={15} /> Home
//           </button>
//           <ChevronRight size={14} />
//           <span className="font-semibold" style={{ color:"var(--color-text-strong)", fontFamily:"var(--font-primary)" }}>
//             Availability
//           </span>
//         </div>
//         <div className="flex items-center gap-2.5">
//           <div className="w-8 h-8 rounded-xl flex items-center justify-center av-shimmer-btn">
//             <CalendarDays size={15} color="white" />
//           </div>
//           <span className="av-subheading text-base" style={{ color:"var(--color-text-strong)" }}>
//             Availability Manager
//           </span>
//         </div>
//       </div>

//       <div className="max-w-5xl mx-auto px-6 py-10">

//         {/* Hero heading */}
//         <div className="mb-10 relative overflow-hidden">
//           <div className="av-orb w-72 h-72 -top-24 -right-24"
//             style={{ background:"var(--color-primary)", opacity:0.07 }} />
//           <p className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5"
//             style={{ color:"var(--color-primary)", fontFamily:"var(--font-secondary)" }}>
//             <Sparkles size={11} /> Nutritionist Dashboard
//           </p>
//           <h1 className="av-heading text-4xl leading-tight" style={{ color:"var(--color-text-strong)" }}>
//             Manage Your{" "}
//             <span style={{ color:"var(--color-primary)" }}>Schedule</span>
//           </h1>
//         </div>

//         {/* Stats */}
//         <StatsBar booked={bookedSlots.length} available={filteredAvailable.length} />

//         {/* Create section */}
//         <div className="rounded-3xl overflow-hidden mb-10"
//           style={{ border:"1.5px solid var(--color-border-default)", background:"var(--color-bg-surface)" }}>
//           <button
//             onClick={() => setCreateOpen((v) => !v)}
//             className="w-full flex items-center justify-between px-6 py-5 transition-colors hover:bg-[var(--color-bg-interactive-subtle)]">
//             <div className="flex items-center gap-3">
//               <div className="w-8 h-8 rounded-xl flex items-center justify-center av-shimmer-btn">
//                 <Plus size={15} color="white" />
//               </div>
//               <span className="av-subheading text-base" style={{ color:"var(--color-text-strong)" }}>
//                 Create New Slots
//               </span>
//             </div>
//             <ChevronDown size={18}
//               style={{
//                 color:"var(--color-text-muted)",
//                 transform: createOpen ? "rotate(0deg)" : "rotate(-90deg)",
//                 transition:"transform 0.3s",
//               }} />
//           </button>

//           {createOpen && (
//             <div className="px-6 pb-6 border-t" style={{ borderColor:"var(--color-border-default)" }}>
//               <div className="grid md:grid-cols-4 gap-4 mt-5 mb-5">
//                 {[
//                   { label:"Date",
//                     el: <input type="date" min={today} value={date} onChange={(e)=>setDate(e.target.value)} className="av-input" /> },
//                   { label:"Start Time",
//                     el: <input type="time" value={startTime} onChange={(e)=>setStartTime(e.target.value)} className="av-input" /> },
//                   { label:"End Time",
//                     el: <input type="time" value={endTime} onChange={(e)=>setEndTime(e.target.value)} className="av-input" /> },
//                   { label:"Duration",
//                     el: <select value={duration} onChange={(e)=>setDuration(Number(e.target.value))} className="av-input">
//                           <option value={30}>30 mins</option>
//                           <option value={45}>45 mins</option>
//                           <option value={60}>60 mins</option>
//                         </select> },
//                 ].map(({ label, el }) => (
//                   <div key={label}>
//                     <label className="text-xs font-semibold block mb-1.5"
//                       style={{ color:"var(--color-text-muted)", fontFamily:"var(--font-secondary)" }}>{label}</label>
//                     {el}
//                   </div>
//                 ))}
//               </div>
//               <button onClick={generateSlots}
//                 className="av-shimmer-btn px-7 py-2.5 rounded-xl font-semibold flex items-center gap-2 text-sm"
//                 style={{ fontFamily:"var(--font-primary)" }}>
//                 <Zap size={14} /> Generate Slots
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Generated slots preview */}
//         {generatedSlots.length > 0 && (
//           <div className="mb-10">
//             <p className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2"
//               style={{ color:"var(--color-primary)", fontFamily:"var(--font-secondary)" }}>
//               <Sparkles size={11} />
//               {generatedSlots.length} slot{generatedSlots.length > 1 ? "s" : ""} ready to save
//             </p>
//             <div className="grid md:grid-cols-3 gap-3">
//               {generatedSlots.map((slot, i) => (
//                 <div key={i}
//                   className="av-stagger-item flex items-center justify-between px-5 py-4 rounded-2xl"
//                   style={{
//                     background:"var(--color-success-bg-subtle)",
//                     border:"1.5px dashed #86efac",
//                     animation:`av-stagger-in 0.4s ease ${i * 0.05}s forwards`,
//                   }}>
//                   <div>
//                     <p className="font-semibold text-sm" style={{ color:"var(--color-text-strong)", fontFamily:"var(--font-primary)" }}>
//                       {slot.start_time} – {slot.end_time}
//                     </p>
//                     <p className="text-xs mt-0.5" style={{ color:"var(--color-text-muted)", fontFamily:"var(--font-secondary)" }}>
//                       {slot.date}
//                     </p>
//                   </div>
//                   <button disabled={loading} onClick={() => saveSlot(slot)}
//                     className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all hover:scale-105 disabled:opacity-50"
//                     style={{ background:"var(--color-success-text)", color:"white", fontFamily:"var(--font-secondary)" }}>
//                     <Plus size={12} /> Save
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Search & Filter */}
//         <div className="rounded-2xl p-4 mb-10"
//           style={{ background:"var(--color-bg-surface)", border:"1.5px solid var(--color-border-default)" }}>
//           <div className="grid md:grid-cols-4 gap-3">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={14}
//                 style={{ color:"var(--color-text-subtle)" }} />
//               <input type="text" placeholder="Search patient…"
//                 value={search} onChange={(e) => setSearch(e.target.value)}
//                 className="av-input" style={{ paddingLeft:36 }} />
//             </div>
//             <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="av-input" />
//             <select value={status} onChange={(e) => setStatus(e.target.value)} className="av-input">
//               <option value="">All Slots</option>
//               <option value="booked">Booked</option>
//               <option value="unbooked">Available</option>
//             </select>
//             <button
//               onClick={() => { setSearch(""); setFilterDate(""); setStatus(""); }}
//               className="rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:opacity-80"
//               style={{
//                 background:"var(--color-bg-surface-alt)",
//                 color:"var(--color-text-muted)",
//                 border:"1.5px solid var(--color-border-default)",
//                 fontFamily:"var(--font-secondary)",
//               }}>
//               Reset
//             </button>
//           </div>
//         </div>

//         {/* ══ BOOKED FIRST ══ */}
//         <SectionHeader
//           emoji="🔴" title="Booked Appointments"
//           count={bookedSlots.length} color="var(--color-primary)"
//           open={showBooked} onToggle={() => setShowBooked((v) => !v)}
//         />

//         <div className={`av-section-body ${showBooked ? "open" : "closed"}`}>
//           {bookedSlots.length === 0 ? (
//             <div className="text-center py-14 mb-10 rounded-2xl"
//               style={{ border:"1.5px dashed var(--color-border-default)" }}>
//               <p className="text-4xl mb-3">📭</p>
//               <p className="font-medium" style={{ color:"var(--color-text-muted)", fontFamily:"var(--font-secondary)" }}>
//                 No booked appointments yet
//               </p>
//             </div>
//           ) : (
//             <div className="grid md:grid-cols-3 gap-4 mb-12">
//               {bookedSlots.map((slot, i) => (
//                 <BookedCard key={slot.id} slot={slot} onClick={setSelectedSlot} idx={i} />
//               ))}
//             </div>
//           )}
//         </div>

//         {/* ══ AVAILABLE (today + future only) ══ */}
//         <SectionHeader
//           emoji="🟢" title="Available Slots"
//           count={filteredAvailable.length} color="var(--color-success-text)"
//           open={showUnbooked} onToggle={() => setShowUnbooked((v) => !v)}
//         />

//         <div className={`av-section-body ${showUnbooked ? "open" : "closed"}`}>
//           {filteredAvailable.length === 0 ? (
//             <div className="text-center py-14 rounded-2xl"
//               style={{ border:"1.5px dashed var(--color-border-default)" }}>
//               <p className="text-4xl mb-3">📅</p>
//               <p className="font-medium" style={{ color:"var(--color-text-muted)", fontFamily:"var(--font-secondary)" }}>
//                 No upcoming available slots
//               </p>
//               <p className="text-sm mt-1" style={{ color:"var(--color-text-subtle)", fontFamily:"var(--font-secondary)" }}>
//                 Open "Create New Slots" above to add some
//               </p>
//             </div>
//           ) : (
//             <div className="grid md:grid-cols-3 gap-4 pb-10">
//               {filteredAvailable.map((slot, i) => (
//                 <AvailableCard key={slot.id} slot={slot} onDelete={deleteSlot} idx={i} />
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddAvailability;
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  CalendarDays, Trash2, Plus, Lock, Home, ChevronRight,
  Search, X, User, Mail, Phone, Video, Copy, ExternalLink,
  Clock, Calendar, FileText, Activity,
  Sparkles, Zap, ArrowRight, ChevronDown,
  WifiOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";

/* ─── Scoped styles (uses app font variables) ───────────────── */
const STYLES = `
  .av-root {
    font-family: var(--font-secondary); /* Roboto */
  }
  .av-heading {
    font-family: var(--font-primary); /* Poppins */
    font-weight: 700;
  }
  .av-subheading {
    font-family: var(--font-primary);
    font-weight: 600;
  }

  @keyframes av-shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }
  @keyframes av-slide-up {
    from { opacity: 0; transform: translateY(36px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
  }
  @keyframes av-stagger-in {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes av-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes av-morph {
    0%,100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
    50%      { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
  }
  @keyframes av-spin-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes av-pulse-dot {
    0%, 100% { transform: scale(1);   opacity: 1; }
    50%       { transform: scale(1.4); opacity: 0.7; }
  }
  @keyframes av-zoom-glow {
    0%, 100% { box-shadow: 0 0 0 0   rgba(59,130,246,0.25); }
    50%       { box-shadow: 0 0 0 8px rgba(59,130,246,0); }
  }
  @keyframes av-link-shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }

  .av-morph     { animation: av-morph     8s ease-in-out infinite; }
  .av-spin-slow { animation: av-spin-slow 20s linear     infinite; }
  .av-pulse-dot { animation: av-pulse-dot 1.8s ease-in-out infinite; }

  /* Shimmer CTA button */
  .av-shimmer-btn {
    background: linear-gradient(90deg, var(--color-primary) 0%, #ff9a6c 40%, var(--color-primary) 100%);
    background-size: 400px 100%;
    animation: av-shimmer 2.5s infinite;
    transition: transform 0.2s, box-shadow 0.2s;
    color: #fff;
  }
  .av-shimmer-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px -4px rgba(255,112,67,0.45);
  }
  .av-shimmer-btn:active { transform: scale(0.97); }

  /* Modal */
  .av-modal-overlay { animation: av-fade-in 0.25s ease forwards; }
  .av-modal-card    { animation: av-slide-up 0.4s cubic-bezier(.34,1.56,.64,1) forwards; }

  /* Cards */
  .av-card {
    transition: transform 0.28s cubic-bezier(.34,1.56,.64,1), box-shadow 0.28s ease;
  }
  .av-card:hover {
    transform: translateY(-4px) scale(1.012);
    box-shadow: 0 18px 36px -10px rgba(255,112,67,0.14);
  }
  .av-booked-card {
    cursor: pointer;
    transition: transform 0.28s cubic-bezier(.34,1.56,.64,1), box-shadow 0.28s ease;
  }
  .av-booked-card:hover {
    transform: translateY(-5px) scale(1.018);
    box-shadow: 0 24px 48px -12px rgba(255,112,67,0.22);
  }
  .av-booked-card:hover .av-view-hint {
    opacity: 1;
    transform: translateX(0);
  }
  .av-view-hint {
    opacity: 0;
    transform: translateX(-6px);
    transition: opacity 0.22s, transform 0.22s;
  }

  /* Section collapse */
  .av-section-body {
    overflow: hidden;
    transition: max-height 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.28s ease;
  }
  .av-section-body.open   { max-height: 4000px; opacity: 1; }
  .av-section-body.closed { max-height: 0;      opacity: 0; }

  .av-chevron { transition: transform 0.3s cubic-bezier(0.4,0,0.2,1); }
  .av-chevron.closed { transform: rotate(-90deg); }

  /* Input */
  .av-input {
    font-family: var(--font-secondary);
    border: 1.5px solid var(--color-border-default);
    border-radius: 12px;
    padding: 10px 14px;
    font-size: 14px;
    color: var(--color-text-strong);
    background: var(--color-bg-surface);
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    width: 100%;
  }
  .av-input:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(255,112,67,0.11);
  }
  .av-input::placeholder { color: var(--color-text-subtle); }

  /* Tag pill */
  .av-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
    font-family: var(--font-secondary);
  }

  /* Today badge */
  .av-today-badge {
    display: inline-block;
    padding: 1px 7px;
    border-radius: 100px;
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    background: var(--color-primary);
    color: #fff;
    margin-left: 6px;
    vertical-align: middle;
    font-family: var(--font-secondary);
  }

  /* Divider */
  .av-divider {
    height: 1px;
    background: linear-gradient(to right, transparent, var(--color-border-default), transparent);
    margin: 10px 0;
  }

  /* Orb */
  .av-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(38px);
    pointer-events: none;
  }

  /* Stagger animation helper */
  .av-stagger-item { opacity: 0; }

  /* Scrollbar */
  .av-scroll::-webkit-scrollbar { width: 4px; }
  .av-scroll::-webkit-scrollbar-track { background: transparent; }
  .av-scroll::-webkit-scrollbar-thumb {
    background: var(--color-primary);
    border-radius: 99px;
  }

  /* ── Zoom block inside modal ── */
  .av-zoom-block {
    background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 60%, #e0f2fe 100%);
    border: 1.5px solid #93c5fd;
    border-radius: 16px;
    padding: 16px;
    position: relative;
    overflow: hidden;
    animation: av-zoom-glow 3s ease-in-out infinite;
  }
  .av-zoom-block::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%);
    background-size: 600px 100%;
    animation: av-link-shimmer 3s infinite;
    pointer-events: none;
  }
  .av-zoom-join-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 700;
    font-family: var(--font-secondary);
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    text-decoration: none;
    transition: transform 0.18s, box-shadow 0.18s;
  }
  .av-zoom-join-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px -4px rgba(59,130,246,0.45);
  }
  .av-zoom-copy-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 700;
    font-family: var(--font-secondary);
    background: white;
    color: #3b82f6;
    border: 1.5px solid #93c5fd;
    cursor: pointer;
    transition: transform 0.18s, background 0.18s;
  }
  .av-zoom-copy-btn:hover {
    background: #eff6ff;
    transform: translateY(-1px);
  }

  /* Live pulse dot */
  .av-live-dot {
    position: relative;
    display: inline-block;
    width: 8px; height: 8px;
  }
  .av-live-dot span {
    display: block;
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #22c55e;
  }
  .av-live-dot::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: #22c55e;
    animation: av-pulse-dot 1.6s ease-out infinite;
  }
`;

/* ─── Helpers ──────────────────────────────────────────────── */
const today           = new Date().toISOString().split("T")[0];
const isToday         = (d) => d === today;
const isFutureOrToday = (d) => d >= today;
const fmtDate         = (d) =>
  new Date(d).toLocaleDateString(undefined, {
    weekday: "short", day: "2-digit", month: "short", year: "numeric",
  });

/* ─── Stats Bar ─────────────────────────────────────────────── */
const StatsBar = ({ booked, available }) => (
  <div className="grid grid-cols-3 gap-4 mb-10">
    {[
      { label:"Booked",    val:booked,            emoji:"🔴", color:"var(--color-primary)",      bg:"var(--color-warning-bg-subtle)" },
      { label:"Available", val:available,          emoji:"🟢", color:"var(--color-success-text)", bg:"var(--color-success-bg-subtle)" },
      { label:"Total",     val:booked + available, emoji:"📅", color:"var(--color-info-text)",    bg:"var(--color-info-bg-subtle)"    },
    ].map(({ label, val, emoji, color, bg }) => (
      <div key={label} className="rounded-2xl p-5 flex items-center gap-4"
        style={{ background: bg, border: "1.5px solid var(--color-border-default)" }}>
        <span className="text-2xl">{emoji}</span>
        <div>
          <p className="av-heading text-4xl" style={{ color, lineHeight: 1 }}>{val}</p>
          <p className="text-xs font-medium mt-1"
            style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-secondary)" }}>
            {label} Slots
          </p>
        </div>
      </div>
    ))}
  </div>
);

/* ─── Zoom Block (inside modal) ─────────────────────────────── */
const ZoomBlock = ({ link }) => {
  const copy = () => {
    navigator.clipboard.writeText(link);
    toast.success("Meeting link copied!", { icon: "📋" });
  };

  return (
    <div className="av-zoom-block">
      {/* Header row */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "#2563eb" }}>
            <Video size={13} color="white" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "#1d4ed8", fontFamily: "var(--font-secondary)" }}>
            Zoom Meeting
          </span>
        </div>
        <div className="av-live-dot"><span /></div>
      </div>

      {/* Link preview */}
      <p className="text-xs font-mono break-all mb-3 px-3 py-2 rounded-xl"
        style={{ background: "rgba(255,255,255,0.7)", color: "#3b82f6" }}>
        {link}
      </p>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <a href={link} target="_blank" rel="noopener noreferrer"
          className="av-zoom-join-btn">
          <ExternalLink size={12} /> Join Meeting
        </a>
        <button onClick={copy} className="av-zoom-copy-btn">
          <Copy size={12} /> Copy Link
        </button>
      </div>
    </div>
  );
};

/* ─── Patient Modal ─────────────────────────────────────────── */
const PatientModal = ({ slot, onClose }) => {
  if (!slot) return null;

  const p    = slot.patient || {};

  // ✅ FIXED: meeting_link lives inside slot.appointment, not slot directly
  const appt = slot.appointment || {};
  const link = appt.meeting_link || null;
  const isVirtual = appt.type === "VIRTUAL";

  const InfoRow = ({ icon: Icon, label, val }) =>
    val ? (
      <div className="flex items-center gap-3 py-3"
        style={{ borderBottom: "1px solid var(--color-border-default)" }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--color-bg-surface-alt)" }}>
          <Icon size={14} style={{ color: "var(--color-primary)" }} />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "var(--color-text-subtle)", fontFamily: "var(--font-secondary)" }}>
            {label}
          </p>
          <p className="text-sm font-semibold mt-0.5"
            style={{ color: "var(--color-text-strong)", fontFamily: "var(--font-secondary)" }}>
            {val}
          </p>
        </div>
      </div>
    ) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 av-modal-overlay"
      style={{ background: "rgba(8,12,18,0.58)", backdropFilter: "blur(14px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl overflow-hidden av-modal-card av-scroll"
        style={{
          background: "var(--color-bg-surface)",
          boxShadow: "0 50px 100px -24px rgba(0,0,0,0.38), 0 0 0 1px rgba(255,255,255,0.06)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative orbs */}
        <div className="av-orb w-44 h-44 -top-10 -right-10"
          style={{ background: "var(--color-primary)", opacity: 0.18 }} />
        <div className="av-orb w-32 h-32 top-24 -left-8"
          style={{ background: "#fbbf24", opacity: 0.12 }} />

        {/* Gradient header */}
        <div className="relative px-8 pt-8 pb-20 overflow-hidden"
          style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, #f4511e 55%, #ff9a6c 100%)" }}>
          <div className="absolute -bottom-14 -right-14 w-44 h-44 rounded-full border-2 border-white/10 av-spin-slow" />
          <div className="absolute -bottom-7 -right-7 w-26 h-26 rounded-full border border-white/15 av-spin-slow"
            style={{ animationDirection: "reverse", width: 104, height: 104 }} />

          <button onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-white/30"
            style={{ background: "rgba(255,255,255,0.18)" }}>
            <X size={16} color="white" />
          </button>

          <div className="flex items-end gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-2xl av-morph"
                style={{ background: "rgba(255,255,255,0.22)", color: "white",
                  backdropFilter: "blur(8px)", fontFamily: "var(--font-primary)" }}>
                {(p.name || "P").charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white av-pulse-dot"
                style={{ background: "#22c55e" }} />
            </div>
            <div className="pb-1">
              <p className="text-white/65 text-xs font-semibold tracking-widest uppercase mb-1"
                style={{ fontFamily: "var(--font-secondary)" }}>
                Patient
              </p>
              <h2 className="text-white text-2xl av-heading">{p.name || "Unknown Patient"}</h2>
              {p.email && (
                <p className="text-white/75 text-sm mt-0.5"
                  style={{ fontFamily: "var(--font-secondary)" }}>
                  {p.email}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Time ribbon */}
        <div className="relative -mt-7 mx-6 z-10">
          <div className="rounded-2xl px-5 py-3.5 flex items-center justify-between"
            style={{
              background: "var(--color-bg-surface)",
              border: "2px solid var(--color-border-default)",
              boxShadow: "0 12px 32px -8px rgba(0,0,0,0.13)",
            }}>
            <div className="flex items-center gap-2.5">
              <Clock size={15} style={{ color: "var(--color-primary)" }} />
              <span className="av-subheading text-lg" style={{ color: "var(--color-text-strong)" }}>
                {slot.start_time} – {slot.end_time}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={13} style={{ color: "var(--color-text-muted)" }} />
              <span className="text-sm font-medium"
                style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-secondary)" }}>
                {fmtDate(slot.date)}
                {isToday(slot.date) && <span className="av-today-badge">Today</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 pt-6 pb-8">

          {/* Appointment type badge */}
          {appt.type && (
            <div className="flex items-center gap-2 mb-5">
              <span className="av-tag"
                style={
                  isVirtual
                    ? { background: "#dbeafe", color: "#2563eb" }
                    : { background: "var(--color-warning-bg-subtle)", color: "var(--color-warning-text)" }
                }>
                {isVirtual ? <Video size={10} /> : null}
                {isVirtual ? "Virtual Appointment" : "In-Person Appointment"}
              </span>
              {appt.category && (
                <span className="av-tag"
                  style={{ background: "var(--color-info-bg-subtle)", color: "var(--color-info-text)" }}>
                  {appt.category === "IN_HOUSE" ? "In-House" : "Expert"}
                </span>
              )}
            </div>
          )}

          {/* Patient details */}
          <p className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2"
            style={{ color: "var(--color-text-subtle)", fontFamily: "var(--font-secondary)" }}>
            <User size={11} /> Patient Details
          </p>

          <div className="mb-6">
            <InfoRow icon={User}     label="Full Name" val={p.name} />
            <InfoRow icon={Mail}     label="Email"     val={p.email} />
            <InfoRow icon={Phone}    label="Phone"     val={p.phone || p.phone_number} />
            <InfoRow icon={Activity} label="Age"       val={p.age ? `${p.age} years` : null} />
            <InfoRow icon={FileText} label="Notes"     val={p.notes} />
          </div>

          {/* Status */}
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-2 h-2 rounded-full av-pulse-dot" style={{ background: "#22c55e" }} />
            <span className="av-tag"
              style={{ background: "var(--color-success-bg-subtle)", color: "var(--color-success-text)" }}>
              ✓ Appointment Confirmed
            </span>
          </div>

          {/* ── ZOOM MEETING LINK ── */}
          {/* ✅ FIXED: reads from appt.meeting_link (slot.appointment.meeting_link) */}
          {isVirtual && (
            link ? (
              <ZoomBlock link={link} />
            ) : (
              <div className="rounded-2xl p-6 text-center"
                style={{
                  background: "var(--color-bg-surface-alt)",
                  border: "1.5px dashed var(--color-border-default)",
                }}>
                <WifiOff size={26} className="mx-auto mb-2 opacity-20"
                  style={{ color: "var(--color-text-muted)" }} />
                <p className="text-sm font-medium"
                  style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-secondary)" }}>
                  No meeting link yet
                </p>
                <p className="text-xs mt-0.5"
                  style={{ color: "var(--color-text-subtle)", fontFamily: "var(--font-secondary)" }}>
                  Will appear once generated
                </p>
              </div>
            )
          )}

          {/* For in-person: show no virtual section at all */}
          {!isVirtual && appt.type && (
            <div className="rounded-2xl p-4 flex items-center gap-3"
              style={{
                background: "var(--color-warning-bg-subtle)",
                border: "1.5px solid var(--color-border-default)",
              }}>
              <span className="text-xl">🏥</span>
              <p className="text-sm font-medium"
                style={{ color: "var(--color-warning-text)", fontFamily: "var(--font-secondary)" }}>
                In-person appointment — patient visits clinic
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Booked Card ───────────────────────────────────────────── */
const BookedCard = ({ slot, onClick, idx }) => {
  // ✅ FIXED: read type from slot.appointment.type
  const isVirtual = slot.appointment?.type === "VIRTUAL";

  return (
    <div
      className="av-booked-card rounded-2xl overflow-hidden av-stagger-item"
      style={{
        background: "var(--color-bg-surface)",
        border: "1.5px solid var(--color-border-default)",
        animation: `av-stagger-in 0.45s ease ${idx * 0.07}s forwards`,
      }}
      onClick={() => onClick(slot)}
    >
      {/* Top accent — blue for virtual, orange for in-person */}
      <div style={{
        height: 3,
        background: isVirtual
          ? "linear-gradient(90deg, #3b82f6, #06b6d4, #8b5cf6)"
          : "linear-gradient(90deg, var(--color-primary), #ff9a6c, #fbbf24)",
      }} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold shadow-md"
              style={{
                background: isVirtual
                  ? "linear-gradient(135deg, #3b82f6, #06b6d4)"
                  : "linear-gradient(135deg, var(--color-primary), #ff9a6c)",
                color: "white",
                fontFamily: "var(--font-primary)",
              }}>
              {(slot.patient?.name || "P").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight"
                style={{ color: "var(--color-text-strong)", fontFamily: "var(--font-primary)" }}>
                {slot.patient?.name || "Patient"}
              </p>
              <p className="text-xs mt-0.5 truncate max-w-[130px]"
                style={{ color: "var(--color-text-subtle)", fontFamily: "var(--font-secondary)" }}>
                {slot.patient?.email || "—"}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Lock size={13} style={{ color: "var(--color-primary)" }} />
            <div className="flex flex-col gap-1 items-end">
              <span className="av-tag"
                style={{ background: "var(--color-warning-bg-subtle)", color: "var(--color-warning-text)" }}>
                Booked
              </span>
              {/* ✅ Virtual indicator on card */}
              {isVirtual && (
                <span className="av-tag" style={{ background: "#dbeafe", color: "#2563eb" }}>
                  <Video size={9} /> Virtual
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="av-divider" />

        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-base"
              style={{ color: "var(--color-text-strong)", fontFamily: "var(--font-primary)" }}>
              {slot.start_time} – {slot.end_time}
            </p>
            <p className="text-xs mt-0.5"
              style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-secondary)" }}>
              {fmtDate(slot.date)}
              {isToday(slot.date) && <span className="av-today-badge">Today</span>}
            </p>
          </div>
          <div className="av-view-hint flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl"
            style={{ background: "var(--color-bg-surface-alt)", color: "var(--color-primary)",
              fontFamily: "var(--font-secondary)" }}>
            Details <ArrowRight size={11} />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Available Card ────────────────────────────────────────── */
const AvailableCard = ({ slot, onDelete, idx }) => (
  <div
    className="av-card rounded-2xl overflow-hidden av-stagger-item"
    style={{
      background: "var(--color-bg-surface)",
      border: "1.5px solid var(--color-border-default)",
      animation: `av-stagger-in 0.45s ease ${idx * 0.07}s forwards`,
    }}
  >
    <div style={{ height: 3, background: "linear-gradient(90deg, #22c55e, #86efac, #4ade80)" }} />
    <div className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-base"
            style={{ color: "var(--color-text-strong)", fontFamily: "var(--font-primary)" }}>
            {slot.start_time} – {slot.end_time}
          </p>
          <p className="text-xs mt-1"
            style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-secondary)" }}>
            {fmtDate(slot.date)}
            {isToday(slot.date) && <span className="av-today-badge">Today</span>}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="av-tag"
            style={{ background: "var(--color-success-bg-subtle)", color: "var(--color-success-text)" }}>
            Open
          </span>
          <button
            onClick={() => onDelete(slot.id)}
            className="p-1.5 rounded-lg transition-all hover:scale-110 active:scale-95"
            style={{ color: "var(--color-danger-text)", background: "var(--color-danger-bg-subtle)" }}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  </div>
);

/* ─── Section Header with Collapse Button ───────────────────── */
const SectionHeader = ({ emoji, title, count, color, open, onToggle }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
      <span className="text-xl">{emoji}</span>
      <h2 className="av-subheading text-lg" style={{ color: "var(--color-text-strong)" }}>{title}</h2>
      <span className="av-tag font-bold" style={{ background: `${color}20`, color }}>{count}</span>
    </div>
    <button
      onClick={onToggle}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80 active:scale-95"
      style={{
        background: open ? "var(--color-bg-surface-alt)" : "var(--color-primary)",
        color:      open ? "var(--color-text-muted)"     : "#fff",
        border: "1.5px solid var(--color-border-default)",
        fontFamily: "var(--font-secondary)",
      }}
    >
      <ChevronDown size={14}
        style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.3s" }} />
      {open ? "Collapse" : "Expand"}
    </button>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
const AddAvailability = () => {
  const navigate = useNavigate();

  /* Inject styles once */
  useEffect(() => {
    if (!document.getElementById("av-styles")) {
      const el = document.createElement("style");
      el.id = "av-styles";
      el.textContent = STYLES;
      document.head.appendChild(el);
    }
  }, []);

  /* State */
  const [date, setDate]           = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime]     = useState("");
  const [duration, setDuration]   = useState(30);
  const [generatedSlots, setGeneratedSlots] = useState([]);

  const [unbookedSlots, setUnbookedSlots] = useState([]);
  const [bookedSlots, setBookedSlots]     = useState([]);
  const [selectedSlot, setSelectedSlot]   = useState(null);
  const [loading, setLoading]             = useState(false);

  const [search, setSearch]         = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [slotStatus, setSlotStatus] = useState("");   // ✅ renamed from "status" to avoid shadowing

  const [showBooked,   setShowBooked]   = useState(true);
  const [showUnbooked, setShowUnbooked] = useState(true);
  const [createOpen,   setCreateOpen]   = useState(false);

  const filteredAvailable = unbookedSlots.filter((s) => isFutureOrToday(s.date));

  /* Fetch */
  const fetchMySlots = async () => {
    try {
      const res = await axiosInstance.get("/appointments/nutritionist/my-slots/", {
        params: {
          search:     search     || undefined,
          date:       filterDate || undefined,
          status:     slotStatus || undefined,
        },
      });
      setUnbookedSlots(res.data?.unbooked_slots || []);
      setBookedSlots(res.data?.booked_slots     || []);
    } catch {
      toast.error("Failed to load slots");
    }
  };

  useEffect(() => { fetchMySlots(); }, []);
  useEffect(() => {
    const t = setTimeout(fetchMySlots, 400);
    return () => clearTimeout(t);
  }, [search, filterDate, slotStatus]);

  /* Generate */
  const generateSlots = () => {
    if (!date || !startTime || !endTime) { toast.error("Fill all fields first"); return; }
    if (startTime >= endTime) { toast.error("End must be after start time"); return; }
    const temp = [];
    let s = new Date(`${date}T${startTime}`);
    const e = new Date(`${date}T${endTime}`);
    while (s < e) {
      const n = new Date(s.getTime() + duration * 60000);
      if (n > e) break;
      temp.push({
        date,
        start_time: s.toTimeString().slice(0, 5),
        end_time:   n.toTimeString().slice(0, 5),
      });
      s = n;
    }
    if (!temp.length) { toast.error("No slots fit in that range"); return; }
    setGeneratedSlots(temp);
    toast.success(`${temp.length} slot${temp.length > 1 ? "s" : ""} generated!`);
  };

  /* Save */
  const saveSlot = async (slot) => {
    setLoading(true);
    try {
      await axiosInstance.post("/appointments/nutritionist/add-availability/", slot);
      toast.success("Slot saved ✓");
      setGeneratedSlots((p) =>
        p.filter((s) => s.start_time !== slot.start_time || s.end_time !== slot.end_time)
      );
      fetchMySlots();
    } catch {
      toast.error("Slot already exists");
    } finally {
      setLoading(false);
    }
  };

  /* Delete */
  const deleteSlot = async (id) => {
    if (!confirm("Delete this slot?")) return;
    try {
      await axiosInstance.delete(`/appointments/nutritionist/slots/${id}/delete/`);
      toast.success("Slot removed");
      fetchMySlots();
    } catch {
      toast.error("Cannot delete a booked slot");
    }
  };

  /* ── Render ── */
  return (
    <div className="min-h-screen av-root" style={{ background: "var(--color-bg-app)" }}>
      <Toaster position="top-right"
        toastOptions={{ style: { fontFamily: "var(--font-secondary)", borderRadius: 14 } }} />

      {selectedSlot && (
        <PatientModal slot={selectedSlot} onClose={() => setSelectedSlot(null)} />
      )}

      {/* Sticky top bar */}
      <div className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between"
        style={{
          background: "rgba(255,253,249,0.88)",
          backdropFilter: "blur(18px)",
          borderBottom: "1px solid var(--color-border-default)",
        }}>
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
          <button onClick={() => navigate("/nutritionist")}
            className="flex items-center gap-1.5 font-medium transition-colors hover:text-[var(--color-primary)]"
            style={{ fontFamily: "var(--font-secondary)" }}>
            <Home size={15} /> Home
          </button>
          <ChevronRight size={14} />
          <span className="font-semibold"
            style={{ color: "var(--color-text-strong)", fontFamily: "var(--font-primary)" }}>
            Availability
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center av-shimmer-btn">
            <CalendarDays size={15} color="white" />
          </div>
          <span className="av-subheading text-base" style={{ color: "var(--color-text-strong)" }}>
            Availability Manager
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Hero heading */}
        <div className="mb-10 relative overflow-hidden">
          <div className="av-orb w-72 h-72 -top-24 -right-24"
            style={{ background: "var(--color-primary)", opacity: 0.07 }} />
          <p className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5"
            style={{ color: "var(--color-primary)", fontFamily: "var(--font-secondary)" }}>
            <Sparkles size={11} /> Nutritionist Dashboard
          </p>
          <h1 className="av-heading text-4xl leading-tight" style={{ color: "var(--color-text-strong)" }}>
            Manage Your{" "}
            <span style={{ color: "var(--color-primary)" }}>Schedule</span>
          </h1>
        </div>

        {/* Stats */}
        <StatsBar booked={bookedSlots.length} available={filteredAvailable.length} />

        {/* Create section */}
        <div className="rounded-3xl overflow-hidden mb-10"
          style={{ border: "1.5px solid var(--color-border-default)", background: "var(--color-bg-surface)" }}>
          <button
            onClick={() => setCreateOpen((v) => !v)}
            className="w-full flex items-center justify-between px-6 py-5 transition-colors hover:bg-[var(--color-bg-interactive-subtle)]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center av-shimmer-btn">
                <Plus size={15} color="white" />
              </div>
              <span className="av-subheading text-base" style={{ color: "var(--color-text-strong)" }}>
                Create New Slots
              </span>
            </div>
            <ChevronDown size={18}
              style={{
                color: "var(--color-text-muted)",
                transform: createOpen ? "rotate(0deg)" : "rotate(-90deg)",
                transition: "transform 0.3s",
              }} />
          </button>

          {createOpen && (
            <div className="px-6 pb-6 border-t" style={{ borderColor: "var(--color-border-default)" }}>
              <div className="grid md:grid-cols-4 gap-4 mt-5 mb-5">
                {[
                  { label: "Date",
                    el: <input type="date" min={today} value={date}
                          onChange={(e) => setDate(e.target.value)} className="av-input" /> },
                  { label: "Start Time",
                    el: <input type="time" value={startTime}
                          onChange={(e) => setStartTime(e.target.value)} className="av-input" /> },
                  { label: "End Time",
                    el: <input type="time" value={endTime}
                          onChange={(e) => setEndTime(e.target.value)} className="av-input" /> },
                  { label: "Duration",
                    el: <select value={duration}
                          onChange={(e) => setDuration(Number(e.target.value))} className="av-input">
                          <option value={30}>30 mins</option>
                          <option value={45}>45 mins</option>
                          <option value={60}>60 mins</option>
                        </select> },
                ].map(({ label, el }) => (
                  <div key={label}>
                    <label className="text-xs font-semibold block mb-1.5"
                      style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-secondary)" }}>
                      {label}
                    </label>
                    {el}
                  </div>
                ))}
              </div>
              <button onClick={generateSlots}
                className="av-shimmer-btn px-7 py-2.5 rounded-xl font-semibold flex items-center gap-2 text-sm"
                style={{ fontFamily: "var(--font-primary)" }}>
                <Zap size={14} /> Generate Slots
              </button>
            </div>
          )}
        </div>

        {/* Generated slots preview */}
        {generatedSlots.length > 0 && (
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2"
              style={{ color: "var(--color-primary)", fontFamily: "var(--font-secondary)" }}>
              <Sparkles size={11} />
              {generatedSlots.length} slot{generatedSlots.length > 1 ? "s" : ""} ready to save
            </p>
            <div className="grid md:grid-cols-3 gap-3">
              {generatedSlots.map((slot, i) => (
                <div key={i}
                  className="av-stagger-item flex items-center justify-between px-5 py-4 rounded-2xl"
                  style={{
                    background: "var(--color-success-bg-subtle)",
                    border: "1.5px dashed #86efac",
                    animation: `av-stagger-in 0.4s ease ${i * 0.05}s forwards`,
                  }}>
                  <div>
                    <p className="font-semibold text-sm"
                      style={{ color: "var(--color-text-strong)", fontFamily: "var(--font-primary)" }}>
                      {slot.start_time} – {slot.end_time}
                    </p>
                    <p className="text-xs mt-0.5"
                      style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-secondary)" }}>
                      {slot.date}
                    </p>
                  </div>
                  <button disabled={loading} onClick={() => saveSlot(slot)}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all hover:scale-105 disabled:opacity-50"
                    style={{ background: "var(--color-success-text)", color: "white",
                      fontFamily: "var(--font-secondary)" }}>
                    <Plus size={12} /> Save
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search & Filter */}
        <div className="rounded-2xl p-4 mb-10"
          style={{ background: "var(--color-bg-surface)", border: "1.5px solid var(--color-border-default)" }}>
          <div className="grid md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={14}
                style={{ color: "var(--color-text-subtle)" }} />
              <input type="text" placeholder="Search patient…"
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="av-input" style={{ paddingLeft: 36 }} />
            </div>
            <input type="date" value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)} className="av-input" />
            <select value={slotStatus} onChange={(e) => setSlotStatus(e.target.value)} className="av-input">
              <option value="">All Slots</option>
              <option value="booked">Booked</option>
              <option value="unbooked">Available</option>
            </select>
            <button
              onClick={() => { setSearch(""); setFilterDate(""); setSlotStatus(""); }}
              className="rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:opacity-80"
              style={{
                background: "var(--color-bg-surface-alt)",
                color: "var(--color-text-muted)",
                border: "1.5px solid var(--color-border-default)",
                fontFamily: "var(--font-secondary)",
              }}>
              Reset
            </button>
          </div>
        </div>

        {/* ══ BOOKED FIRST ══ */}
        <SectionHeader
          emoji="🔴" title="Booked Appointments"
          count={bookedSlots.length} color="var(--color-primary)"
          open={showBooked} onToggle={() => setShowBooked((v) => !v)}
        />

        <div className={`av-section-body ${showBooked ? "open" : "closed"}`}>
          {bookedSlots.length === 0 ? (
            <div className="text-center py-14 mb-10 rounded-2xl"
              style={{ border: "1.5px dashed var(--color-border-default)" }}>
              <p className="text-4xl mb-3">📭</p>
              <p className="font-medium"
                style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-secondary)" }}>
                No booked appointments yet
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4 mb-12">
              {bookedSlots.map((slot, i) => (
                <BookedCard key={slot.id} slot={slot} onClick={setSelectedSlot} idx={i} />
              ))}
            </div>
          )}
        </div>

        {/* ══ AVAILABLE (today + future only) ══ */}
        <SectionHeader
          emoji="🟢" title="Available Slots"
          count={filteredAvailable.length} color="var(--color-success-text)"
          open={showUnbooked} onToggle={() => setShowUnbooked((v) => !v)}
        />

        <div className={`av-section-body ${showUnbooked ? "open" : "closed"}`}>
          {filteredAvailable.length === 0 ? (
            <div className="text-center py-14 rounded-2xl"
              style={{ border: "1.5px dashed var(--color-border-default)" }}>
              <p className="text-4xl mb-3">📅</p>
              <p className="font-medium"
                style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-secondary)" }}>
                No upcoming available slots
              </p>
              <p className="text-sm mt-1"
                style={{ color: "var(--color-text-subtle)", fontFamily: "var(--font-secondary)" }}>
                Open "Create New Slots" above to add some
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4 pb-10">
              {filteredAvailable.map((slot, i) => (
                <AvailableCard key={slot.id} slot={slot} onDelete={deleteSlot} idx={i} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AddAvailability;