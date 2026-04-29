import '../index.css';
import { useState } from "react";

/* ── JOB DATA ───────────────────────────────────────────── */
const JOBS = [
  {
    id: 1,
    summary:"Join our team as a Nutritionist & Dietitian Intern and gain hands-on experience in client nutrition assessments and personalized diet planning. Collaborate with senior dietitians, track client progress, and contribute to real cases while pursuing your nutrition degree.",
    title: "🥗 Nutritionist & Dietitian ",
    responsibilities: [
      "Assist in client nutrition assessments and consultations",
      "Prepare personalized diet plans based on health goals",
      "Track client progress and provide feedback",
      "Work with senior dietitians on live cases",
      "Maintain client records and reports",
    ],

    requirements: [
      { icon: "🎓", label: "Nutrition Degree (Pursuing/Completed)" },
      { icon: "📖", label: "Basic Diet Planning Knowledge" },
      { icon: "🗣️", label: "Communication Skills" },
      { icon: "❤️", label: "Passion for Health" },
    ],

    workTypes: [
      { key: "full", label: "Full-Time" },
      { key: "part", label: "Part-Time" },
      { key: "freelance", label: "Freelancer" },
    ],

    experienceLevels: [
      { key: "fresher", label: "Fresher (0-1 Year)"  },
      { key: "1to3", label: "Junior (1–3 Years) " },
      { key: "3plus", label: "Senior (3+ Years)" },
    ],

    location: [
   
    
      { label: "Location", value: "Remote" },

    ],

    applyLink: "https://docs.google.com/forms/d/e/1FAIpQLSfOAV47RQbEkCYt-1ukO3gQFHJFDN9xFwcOvdDbwhS_qo9chQ/viewform",
   
  },

  {
    id: 2,
    summary:"We are seeking a skilled Full Stack Python Developer to join our team. In this role, you will develop backend services using Django and Python, build RESTful APIs, and create a responsive UI with React and Tailwind CSS. You will also manage our PostgreSQL database and ensure seamless integration between frontend and backend components.",
    title: "💻 Full Stack Developer ",
    responsibilities: [
      "Develop backend services using Django and Python",
      "Build RESTful APIs and integrate with frontend",
      "Develop UI using React and Tailwind CSS",
      "Manage PostgreSQL database and queries",
      "Ensure smooth frontend-backend integration",
      "Debug and optimize application performance",
    ],

    requirements: [
      { icon: "🐍", label: "Python (Django)" },
      { icon: "⚛️", label: "React.js" },
      { icon: "🎨", label: "Tailwind CSS" },
      { icon: "🗄️", label: "PostgreSQL" },
      { icon: "🔗", label: "REST APIs" },
      { icon: "🧠", label: "Problem Solving" },
      { icon: "🗣️", label: "Communication" },
    ],

    workTypes: [
      { key: "full", label: "Full-Time" },
      { key: "part", label: "Part-Time" },
      { key: "freelance", label: "Freelancer" },
    ],

    experienceLevels: [
      { key: "fresher", label: "Fresher (0-1 Year)"  },
      { key: "1to3", label: "Junior (1–3 Years) " },
      { key: "3plus", label: "Senior (3+ Years)" },
    ],

    location: [

      { label: "Location", value: "Remote" },
      
    ],

    applyLink: "https://docs.google.com/forms/d/e/1FAIpQLSfOAV47RQbEkCYt-1ukO3gQFHJFDN9xFwcOvdDbwhS_qo9chQ/viewform",
    
  },
  
  {
  id: 3,
  title: "📈 Sales & Marketing Executive",
  
  summary:
    "We are looking for a dynamic and result-oriented Sales & Marketing Executive to drive user acquisition, onboard nutritionists, and promote the TrackIntake platform across B2B and B2C channels.",

  responsibilities: [
    "Onboard nutritionists, dieticians, and healthcare professionals",
    "Generate leads via cold calling, LinkedIn outreach, and networking",
    "Conduct product demos and explain platform benefits",
    "Convert leads into active users/clients",
    "Execute digital marketing campaigns (social media, email, WhatsApp)",
    "Promote platform through online and offline channels",
    "Create awareness in colleges, clinics, and communities",
    "Coordinate webinars, workshops, and demo sessions",
    "Maintain sales pipeline and track conversions",
    "Follow up with prospects and close deals",
    "Analyze market trends and competitors",
    "Manage client relationships and ensure engagement",
    "Drive subscription sales and revenue growth",
  ],

  requirements: [
    { icon: "🗣️", label: "Communication Skills" },
    { icon: "📊", label: "Sales & Negotiation" },
    { icon: "📢", label: "Digital Marketing Basics" },
    { icon: "🎯", label: "Target-Oriented Mindset" },
    { icon: "🤝", label: "Relationship Management" },
    { icon: "🧠", label: "Strategic Thinking" },
    { icon: "💪", label: "Self-Driven & Independent" },
  ],

  workTypes: [
    { key: "full", label: "Full-Time" },
    { key: "part", label: "Part-Time" },
    { key: "freelance", label: "Freelancer" },
  ],

  experienceLevels: [
    { key: "fresher", label: "Fresher (0–1 Year)" },
    { key: "1to3", label: "Junior (1–3 Years)" },
    { key: "3plus", label: "Senior (3+ Years)" },
  ],

  location: [
    { label: "Location", value: "Remote" },
  ],

  applyLink: "https://docs.google.com/forms/d/e/1FAIpQLSfOAV47RQbEkCYt-1ukO3gQFHJFDN9xFwcOvdDbwhS_qo9chQ/viewform",
}
];

/* ── JOB ITEM ───────────────────────────────── */
function JobItem({ job, isOpen, onToggle }) {
  return (
    <div
      className="rounded-2xl transition-all"
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        border: isOpen
          ? '1.5px solid var(--color-primary)'
          : '1px solid var(--color-border-default)',
        boxShadow: isOpen
          ? '0 8px 30px rgba(255,112,67,0.15)'
          : '0 2px 8px rgba(0,0,0,0.05)',
      }}
    >
      {/* Top */}
      <div className="p-4 pb-3 flex flex-col md:flex-row md:justify-between gap-3">
        <div>
          <h3 className="text-base font-bold" style={{ color: 'var(--color-text-strong)' }}>
            {job.title}
          </h3>

          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {job.summary} 
          </p>

        

          
        </div>

        <div className="flex items-center gap-3">
        

          <button
            onClick={onToggle}
            className="text-xs font-bold px-4 py-2 rounded-lg"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
            }}
          >
            {isOpen ? "Hide location" : "View Details"}
          </button>
        </div>
      </div>

      {/* Expanded */}
      {isOpen && (
        <div
          className="px-4 pb-4 pt-2 animate-fade-in-up"
          style={{ borderTop: '1px solid var(--color-border-default)' }}
        >
          {/* Responsibilities */}
          <div className="mb-3">
            <p className="text-xs font-bold mb-1">What You’ll Do</p>
            <ul className="text-xs space-y-1">
              {job.responsibilities.map((r) => (
                <li key={r} className="flex gap-2">
                  <span style={{ color: 'var(--color-primary)' }}>✔</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <div className="my-3 border-t" style={{ borderColor: 'var(--color-border-default)' }} />

          {/* Requirements */}
          <div className="mb-3">
            <p className="text-xs font-bold mb-1">What We’re Looking For</p>
            <div className="flex flex-wrap gap-2">
              {job.requirements.map((r) => (
                <span
                  key={r.label}
                  className="text-[10px] px-2 py-1 rounded"
                  style={{
                    backgroundColor: 'rgba(255,112,67,0.08)',
                    border: '1px solid var(--color-border-default)',
                  }}
                >
                  {r.icon} {r.label}
                </span>
              ))}
            </div>
          </div>

          {/* Work Type */}
          <div className="mb-3">
            <p className="text-xs font-bold mb-1">Work Type</p>
            <div className="flex flex-wrap gap-2">
              {job.workTypes?.map((w) => (
                <span
                  key={w.key}
                  className="text-[10px] px-2 py-1 rounded"
                  style={{
                    backgroundColor: 'var(--color-bg-surface-alt)',
                    border: '1px solid var(--color-border-default)',
                  }}
                >
                  {w.label}
                </span>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="mb-3">
            <p className="text-xs font-bold mb-1">Experience Level</p>
            <div className="flex flex-wrap gap-2">
             <ul className="pl-4">
  {job.experienceLevels?.map((e) => (
    <li key={e.key} className="mb-1">
      <span
        className="text-[10px] px-2 py-1 rounded inline-block"
        style={{
          backgroundColor: 'rgba(255,112,67,0.08)',
          border: '1px solid var(--color-border-default)',
        }}
      >
       <span style={{ color: 'var(--color-primary)' }}>✔</span> {e.label}
      </span>
    </li>
  ))}
</ul>
            </div>
          </div>

          <div className="my-3 border-t" style={{ borderColor: 'var(--color-border-default)' }} />

          {/* location */}
          <div className="mb-3">
            <p className="text-xs font-bold mb-2">Location</p>
            <div className="grid grid-cols-2 gap-3">
              {job.location.map((d) => (
                <div
                  key={d.label}
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: 'var(--color-bg-surface-alt)',
                    border: '1px solid var(--color-border-default)',
                  }}
                >
             
                  <p className="text-xs font-bold">{d.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Apply */}
          <a
            href={job.applyLink}
            target="_blank"
            rel="noreferrer"
            className="w-full mt-3 text-sm font-bold py-2.5 rounded-lg text-center block"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
            }}
          >
            Apply Now →
          </a>
        </div>
      )}
    </div>
  );
}

/* ── MAIN PAGE ───────────────────────────────── */
export default function Career() {
  const [openId, setOpenId] = useState(null);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-app)' }}>
      <div className="max-w-[900px] mx-auto px-4 py-6 space-y-5">

        {/* Banner */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary), #f08040)',
            color: '#fff',
          }}
        >
          <p className="text-xs uppercase tracking-widest">
            Careers at TrackIntake
          </p>

          <h1 className="text-2xl font-extrabold">
             Open Positions
          </h1>

          <p className="text-xs mt-1">
            Help us make nutrition simple and accessible for everyone.
          </p>
        </div>

        {/* Jobs */}
        {JOBS.map((job) => (
          <JobItem
            key={job.id}
            job={job}
            isOpen={openId === job.id}
            onToggle={() =>
              setOpenId(prev => (prev === job.id ? null : job.id))
            }
          />
        ))}

      </div>
    </div>
  );
}