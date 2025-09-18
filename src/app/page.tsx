// Tabbed preview component for templates
"use client";
// Tabbed preview component for templates
type ExperienceItem = {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  details: string;
};
type SkillItem = { name: string; level: number }
type FormData = {
  name: string;
  email: string;
  phone: string;
  website: string;
  linkedin: string;
  summary: string;
  experiences: ExperienceItem[];
  education: string;
  skills: SkillItem[];
  certifications: string;
  projects: string;
  profilePicture?: File;
  profilePictureUrl: string;
};
type TabsPreviewProps = {
  formData: FormData;
  onExport: (tpl: string) => void | Promise<void>;
  onEdit: () => void;
  isExporting?: boolean;
};
function TabsPreview({ formData, onExport, onEdit, isExporting = false }: TabsPreviewProps) {
  const TEMPLATES = [
    { id: "minimalist", label: "Minimalist", color: "bg-green-500", score: normalizeCarbonScore(computeCarbonScore("minimalist")), Component: MinimalistTemplate },
    { id: "onyx", label: "Onyx", color: "bg-yellow-400", score: normalizeCarbonScore(computeCarbonScore("onyx")), Component: OnyxTemplate },
    { id: "awesomecv", label: "AwesomeCV", color: "bg-red-500", score: normalizeCarbonScore(computeCarbonScore("awesomecv")), Component: AwesomeCVTemplate },
    { id: "subtleelegant", label: "Subtle & Elegant", color: "bg-gray-500", score: normalizeCarbonScore(computeCarbonScore("subtleelegant")), Component: SubtleElegantTemplate },
  ];
  const [tab, setTab] = useState("minimalist");
  const tpl = TEMPLATES.find((t) => t.id === tab) || TEMPLATES[0];
  const TemplateComponent = tpl.Component;
  return (
    <div className="z-10 w-full max-w-4xl">
      <div className="flex gap-2 mb-0 -translate-y-px">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            className={`px-4 py-2.5 rounded-t-lg font-semibold text-sm transition-all duration-200 ${tab === t.id ? "bg-white/80 dark:bg-neutral-900/80 border-gray-200/80 dark:border-neutral-800 border-t border-x" : "bg-white/40 dark:bg-neutral-950/40 text-gray-600 dark:text-gray-400 border-transparent border-b"}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="p-6 md:p-8 rounded-xl rounded-tl-none border border-gray-200/80 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white ${tpl.color}`}>Carbon Score: {tpl.score}/10</span>
            <span title="Lower = less ink, less energy, more eco-friendly. Score is based on template color, graphics, and print area." className="text-gray-500 dark:text-gray-400 cursor-help text-lg">&#9432;</span>
          </div>
          <div className="flex gap-3">
            <button
              className="bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 font-semibold px-6 py-2 rounded-lg transition"
              onClick={onEdit}
            >
              Edit Details
            </button>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition print:hidden disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:scale-105"
              onClick={() => onExport(tpl.id)}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating PDF...
                </>
              ) : (
                'Download PDF'
              )}
            </button>
          </div>
        </div>
        <div className="bg-white dark:bg-white/90 p-4 rounded-lg shadow-inner">
          <TemplateComponent {...formData} />
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Confetti from "react-confetti";

import MinimalistTemplate from "../components/MinimalistTemplate";
import OnyxTemplate from "../components/OnyxTemplate";
import AwesomeCVTemplate from "../components/AwesomeCVTemplate";
import SubtleElegantTemplate from "../components/SubtleElegantTemplate";
import ResumeTemplates from "../components/ResumeTemplates";
import BuyMeCoffee from "../components/BuyMeCoffee";

// Carbon footprint scoring function based on template color usage
function computeCarbonScore(templateId: string): number {
  // Base scores based on visual analysis of dark color coverage
  const baseScores: Record<string, number> = {
    minimalist: 2,    // Mostly white background, minimal dark elements
    onyx: 6,         // Light gray sidebar, some blue accents
    awesomecv: 10,   // Dark sidebar covering 1/3 of page, white text
    subtleelegant: 3 // White background, subtle gray borders and text
  };

  return baseScores[templateId] || 5; // Default fallback
}

// Normalize scores to a scale of 10 (where 10 is most eco-friendly/lowest carbon)
function normalizeCarbonScore(rawScore: number, maxRawScore: number = 10): number {
  // Invert the score: higher raw score (more ink) = lower normalized score (less eco-friendly)
  return Math.round((1 - rawScore / maxRawScore) * 10);
}

// Future-proof features list for the homepage tile (easy to extend)
type Feature = { id: string; title: string; description: string; icon?: string }
const FEATURES: Feature[] = [
  { id: "privacy", title: "Privacy‑first", description: "No ads or trackers. Your data stays yours; PDFs render on your client only when you export.", icon: "🔒" },
  { id: "free", title: "Forever Free", description: "All core features at no cost—no trials, no paywalls.", icon: "🆓" },
  { id: "templates", title: "4 Pro Templates", description: "Minimalist, Onyx, AwesomeCV, and SubtleElegant—pick any or all the styles that fits you.", icon: "🎨" },
  { id: "structured-data", title: "Structured Experience + Skills", description: "Work history with dates, and slider-based skill levels.", icon: "🧩" },
  { id: "pdf", title: "PDF Export", description: "One‑click PDF export, optimized for fast and reliable results.", icon: "🖨️" },
  { id: "carbon", title: "Carbon Footprint Score", description: "Choose eco‑friendlier templates with lower print impact.", icon: "🌱" },
  { id: "gamification", title: "Gamified Builder", description: "Score, badges, and challenges to guide better resumes.", icon: "🏅" },
];

// Base challenges for gamification
type Challenge = { id: string; text: string; completed: boolean }
const BASE_CHALLENGES: Challenge[] = [
  { id: "ats", text: "Complete all required fields for ATS compatibility", completed: false },
  { id: "achievements", text: "Include quantifiable achievements (numbers) in experience", completed: false },
  { id: "creativity", text: "Mention creative projects", completed: false },
];

export default function Home() {
  const [session, setSession] = useState<{ email: string } | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  // Captcha state
  const [captchaQuestion, setCaptchaQuestion] = useState<string>("");
  const [captchaExpected, setCaptchaExpected] = useState<number | null>(null);
  const [captchaInput, setCaptchaInput] = useState<string>("");
  const [captchaError, setCaptchaError] = useState<string>("");
  const [isSendingLoginLink, setIsSendingLoginLink] = useState(false);
  // TODO(future): Add in-memory rate limiting for login link requests (env configurable)
  // TODO(future): Swap math captcha with Turnstile/hCaptcha behind CAPTCHA_PROVIDER env
  // TODO(future): Add aria-live polite region for captcha errors & new challenge announcements
  // TODO(future): Persist last email (localStorage) with opt-in remember checkbox

  function generateCaptcha() {
    const a = Math.floor(Math.random() * 6) + 2; // 2..7
    const b = Math.floor(Math.random() * 6) + 2; // 2..7
    setCaptchaQuestion(`${a} + ${b} = ?`);
    setCaptchaExpected(a + b);
    setCaptchaInput("");
    setCaptchaError("");
  }

  useEffect(() => {
    if (showLogin) {
      generateCaptcha();
    }
  }, [showLogin]);

  const handleLogin = async () => {
    if (isSendingLoginLink) return;
    const emailInput = document.getElementById('login-email') as HTMLInputElement | null;
    if (!emailInput || !emailInput.value) return;
    if (captchaExpected === null) {
      generateCaptcha();
      return;
    }
    const numeric = Number(captchaInput.trim());
    if (Number.isNaN(numeric) || numeric !== captchaExpected) {
      setCaptchaError("Incorrect answer. Try again.");
      generateCaptcha();
      return;
    }
    setCaptchaError("");
    try {
      setIsSendingLoginLink(true);
      await fetch("/api/send-login-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.value }),
      });
      setShowLogin(false);
      alert("A login link has been sent to your email (check smtp4dev).");
    } finally {
      setIsSendingLoginLink(false);
    }
  };
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: session?.email || "",
    phone: "",
    website: "",
    linkedin: "",
    summary: "",
    experiences: [
      { company: "", title: "", startDate: "", endDate: "", current: false, details: "" },
    ] as ExperienceItem[],
    education: "",
    skills: [
      // example initial row for UX; can be removed by user
      { name: "", level: 60 },
    ] as SkillItem[],
    certifications: "",
    projects: "",
    profilePicture: undefined as File | undefined,
    profilePictureUrl: "",
  });
  const [showPreview, setShowPreview] = useState(false);
  // Metrics state
  const [metrics, setMetrics] = useState<{ page_hits: number; resume_downloads: number }>({ page_hits: 0, resume_downloads: 0 });
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [pulseViews, setPulseViews] = useState(false);
  const [pulseDownloads, setPulseDownloads] = useState(false);
  const prevMetrics = useRef<{ page_hits: number; resume_downloads: number } | null>(null);

  // Export loading state
  const [isExporting, setIsExporting] = useState(false);

  // Gamification state
  const [score, setScore] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [challenges, setChallenges] = useState(BASE_CHALLENGES);

  // Handle login via query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const loginEmail = params.get("login");
    if (loginEmail) {
      setSession({ email: loginEmail });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Fire a page hit and pull current metrics on mount
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_METRICS === "false") return;
    const fire = async () => {
      // Guard: only count once per session/tab
      const key = "rb_page_hit_once";
      if (!sessionStorage.getItem(key)) {
        try {
          await fetch("/api/metrics", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "page_hit" }),
          });
          sessionStorage.setItem(key, "1");
        } catch {}
      }
      try {
        const res = await fetch("/api/metrics");
        if (res.ok) {
          const data = await res.json();
          setMetrics({ page_hits: data.page_hits ?? 0, resume_downloads: data.resume_downloads ?? 0 });
          setLastUpdated(Date.now());
        }
      } catch {}
    };
    fire();
  }, []);

  // Trigger a subtle pulse when metrics values change
  useEffect(() => {
    const prev = prevMetrics.current;
    if (prev) {
      if (metrics.page_hits !== prev.page_hits) {
        setPulseViews(true);
        setTimeout(() => setPulseViews(false), 600);
      }
      if (metrics.resume_downloads !== prev.resume_downloads) {
        setPulseDownloads(true);
        setTimeout(() => setPulseDownloads(false), 600);
      }
    }
    prevMetrics.current = metrics;
  }, [metrics]);

  // Sync email into form once session established
  useEffect(() => {
    if (session?.email) {
      setFormData((prev) => ({ ...prev, email: prev.email || session.email }));
    }
  }, [session]);

  // Logout handler
  const handleLogout = () => {
    setSession(null);
    setSelectedTemplate(null);
  };

  // Handle form field changes
  // Gamified scoring logic
  useEffect(() => {
    let newScore = 0;
    // Clone base challenges and mutate completion status
    let newChallenges = BASE_CHALLENGES.map((c) => ({ ...c }));

    // Heuristics: +10 for each filled section, +10 for >100 words across experience details, +20 for 3+ numbers in experience details
    if (formData.name) newScore += 10;
    if (formData.email) newScore += 10;
    if (formData.summary && formData.summary.split(" ").length > 20) newScore += 10;

    const combinedDetails = formData.experiences.map(e => `${e.title} ${e.company} ${e.details}`).join(" ");
    const hasExperience = formData.experiences.some(e => e.title || e.company || e.details);
    if (hasExperience) {
      newScore += 10;
      if (combinedDetails.split(" ").filter(Boolean).length > 100) newScore += 10;
      const numCount = (combinedDetails.match(/\d+/g) || []).length;
      newChallenges = newChallenges.map(c => c.id === "achievements" ? { ...c, completed: numCount >= 3 } : c);
      if (numCount >= 3) newScore += 20;
    }

  if (formData.education) newScore += 10;
  if (formData.skills && formData.skills.filter(s => s.name.trim()).length >= 5) newScore += 10;

    const targetBadges: string[] = [];
    if (formData.projects && formData.projects.toLowerCase().includes("creative")) {
      newScore += 10;
      newChallenges = newChallenges.map(c => c.id === "creativity" ? { ...c, completed: true } : c);
      targetBadges.push("Creativity");
    } else {
      newChallenges = newChallenges.map(c => c.id === "creativity" ? { ...c, completed: false } : c);
    }

  if (formData.name && formData.email && formData.phone && formData.skills.filter(s => s.name.trim()).length > 0 && hasExperience && formData.education) {
      newChallenges = newChallenges.map(c => c.id === "ats" ? { ...c, completed: true } : c);
      targetBadges.push("ATS Pro");
    } else {
      newChallenges = newChallenges.map(c => c.id === "ats" ? { ...c, completed: false } : c);
    }

    setScore(Math.min(newScore, 100));
    setChallenges(newChallenges);
    setBadges((prev) => {
      const newlyAdded = targetBadges.filter((b) => !prev.includes(b));
      if (newlyAdded.length > 0) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
      return targetBadges;
    });
  }, [formData]);

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, files } = e.target as HTMLInputElement;
    if (type === "file" && files && files[0]) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, profilePicture: file }));
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormData((prev) => ({ ...prev, profilePictureUrl: ev.target?.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Skills handlers
  const addSkill = () => {
    setFormData((prev) => ({ ...prev, skills: [...prev.skills, { name: "", level: 60 }] }));
  };
  const removeSkill = (index: number) => {
    setFormData((prev) => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));
  };
  const updateSkill = (index: number, field: keyof SkillItem, value: string | number) => {
    setFormData((prev) => {
      const next = [...prev.skills];
      next[index] = { ...next[index], [field]: value } as SkillItem;
      return { ...prev, skills: next };
    });
  };

  // Experience list handlers
  const handleExperienceChange = (
    index: number,
    field: keyof ExperienceItem,
    value: string | boolean
  ) => {
    setFormData((prev) => {
      const experiences = [...prev.experiences];
      const updated: ExperienceItem = { ...experiences[index], [field]: value } as ExperienceItem;
      // If current is set, clear endDate
      if (field === "current" && value === true) {
        updated.endDate = "";
      }
      experiences[index] = updated;
      return { ...prev, experiences };
    });
  };

  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        { company: "", title: "", startDate: "", endDate: "", current: false, details: "" },
      ],
    }));
  };

  const removeExperience = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index),
    }));
  };

  // Handle form submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPreview(true);
  };



  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-black flex flex-col items-center py-12 px-4">
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={300} />}
      {/* Top bar with email after login and logout button */}
      {session && (
        <div className="fixed top-0 right-0 p-4 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 z-40">
          <BuyMeCoffee />
          <span>{session.email}</span>
          <button
            onClick={handleLogout}
            className="ml-2 px-3 py-1 rounded bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 transition"
          >
            Logout
          </button>
        </div>
      )}
      <main className="w-full max-w-6xl flex flex-col items-center gap-10">
        {/* Trust + Metrics summary */}
        <div className="w-full mt-2 flex items-center justify-end">
          <div
            aria-label="Site metrics"
            className="inline-flex items-center gap-3 px-3 py-2 rounded-full border border-gray-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm shadow-sm text-gray-700 dark:text-gray-200 text-sm"
            title={`Counts since launch. Last updated: ${lastUpdated ? new Date(lastUpdated).toLocaleString() : "—"}`}
          >
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden>👁</span>
              <span className={`font-semibold transition ${pulseViews ? "animate-pulse text-blue-600 dark:text-blue-300" : ""}`}>{metrics.page_hits}</span>
              <span className="hidden sm:inline text-[11px] text-gray-500 dark:text-gray-400">views</span>
            </span>
            <span className="h-4 w-px bg-gray-300/70 dark:bg-neutral-700/70" aria-hidden="true"></span>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden>⬇️</span>
              <span className={`font-semibold transition ${pulseDownloads ? "animate-pulse text-green-600 dark:text-green-300" : ""}`}>{metrics.resume_downloads}</span>
              <span className="hidden sm:inline text-[11px] text-gray-500 dark:text-gray-400">downloads</span>
            </span>
          </div>
        </div>
        {/* Show hero section if not logged in */}
        {!session && (
          <div className="z-10 flex flex-col items-center text-center mt-10">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white !leading-tight">
              Build a <span className="text-blue-600">Professional</span> Resume <br /> in Minutes
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
              Choose a template, fill in your details, and get a polished, professional resume ready for your next job application. No hidden fees, no data selling.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <button
                aria-label="Get started building your resume"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-transform transform hover:scale-105"
                onClick={() => setShowLogin(true)}
              >
                Get Started for Free
              </button>
              <BuyMeCoffee />
            </div>
            <div className="mt-16 w-full max-w-5xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {FEATURES.slice(0, 3).map((f) => (
                  <div key={f.id} className="p-6 rounded-xl border border-gray-200/80 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
                    <div className="text-2xl mb-3">{f.icon ?? "✔️"}</div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">{f.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{f.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* After login: show template selection */}
        {session && !selectedTemplate && (
          <ResumeTemplates onSelect={setSelectedTemplate} />
        )}

        {/* After template selection: show placeholder for form */}
        
{session && selectedTemplate && !showPreview && (
  <div className="z-10 w-full max-w-4xl flex flex-col items-center gap-8">
    {/* Combined Form, Gamification, and Disclaimer Card */}
    <div className="w-full p-6 md:p-8 rounded-xl border border-gray-200/80 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Gamification & Disclaimer */}
        <div className="md:col-span-1 flex flex-col gap-6">
          {/* Gamified Score */}
          <div className="p-4 rounded-lg bg-white/50 dark:bg-black/20 border border-gray-200/50 dark:border-neutral-800/50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Resume Score</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{score}/100</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-neutral-700 rounded-full h-2.5 mb-2">
              <div className="bg-blue-500 h-2.5 rounded-full transition-all" style={{ width: `${score}%` }}></div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {badges.map(badge => (
                <span key={badge} className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-300/50 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700/50">🏅 {badge}</span>
              ))}
            </div>
          </div>
          {/* Challenges */}
          <div className="p-4 rounded-lg bg-white/50 dark:bg-black/20 border border-gray-200/50 dark:border-neutral-800/50">
            <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Challenges</span>
            <ul className="list-none text-sm mt-2 space-y-1">
              {challenges.map(c => (
                <li key={c.id} className={`flex items-center gap-2 ${c.completed ? "text-green-600 dark:text-green-400 font-medium" : "text-gray-600 dark:text-gray-400"}`}>
                  <span className="text-lg">{c.completed ? "✅" : "⬜️"}</span>
                  <span>{c.text}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* Disclaimer */}
          <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-lg dark:bg-amber-900/30 dark:border-amber-800/50">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">Quick Tip</h3>
                <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                  Our resume templates are designed for single-page resumes. To ensure the best results, please keep your details concise.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Enter Your Details</h2>
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" name="name" placeholder="Full Name" className="bg-white/50 dark:bg-black/20 border border-gray-300/50 dark:border-neutral-700/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none" required value={formData.name} onChange={handleFieldChange} />
              <input type="email" name="email" placeholder="Email" className="bg-white/50 dark:bg-black/20 border border-gray-300/50 dark:border-neutral-700/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none" required value={formData.email} onChange={handleFieldChange} />
              <input type="tel" name="phone" placeholder="Phone Number" className="bg-white/50 dark:bg-black/20 border border-gray-300/50 dark:border-neutral-700/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none" value={formData.phone} onChange={handleFieldChange} />
              <input type="url" name="website" placeholder="Website URL" className="bg-white/50 dark:bg-black/20 border border-gray-300/50 dark:border-neutral-700/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none" value={formData.website} onChange={handleFieldChange} />
              <input type="url" name="linkedin" placeholder="LinkedIn URL" className="sm:col-span-2 bg-white/50 dark:bg-black/20 border border-gray-300/50 dark:border-neutral-700/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none" value={formData.linkedin} onChange={handleFieldChange} />
            </div>
            <textarea name="summary" placeholder="Professional Summary" className="bg-white/50 dark:bg-black/20 border border-gray-300/50 dark:border-neutral-700/50 rounded-lg px-4 py-2 min-h-[80px] focus:ring-2 focus:ring-blue-400 outline-none" value={formData.summary} onChange={handleFieldChange} />

            {/* Work Experience */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Work Experience</h3>
                <button type="button" onClick={addExperience} className="text-sm px-3 py-1.5 rounded-md bg-blue-100/80 text-blue-700 hover:bg-blue-200/80 border border-blue-200/80 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/80 dark:border-blue-800/80">Add Job</button>
              </div>
              <div className="flex flex-col gap-4">
                {formData.experiences.map((exp, idx) => (
                  <div key={idx} className="p-4 border border-gray-200/80 dark:border-neutral-800/80 rounded-lg bg-white/30 dark:bg-black/10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input type="text" placeholder="Title (e.g., Senior Developer)" className="bg-white/50 dark:bg-black/20 border-gray-300/50 dark:border-neutral-700/50 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none" value={exp.title} onChange={(e) => handleExperienceChange(idx, "title", (e.target as HTMLInputElement).value)} />
                      <input type="text" placeholder="Company" className="bg-white/50 dark:bg-black/20 border-gray-300/50 dark:border-neutral-700/50 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none" value={exp.company} onChange={(e) => handleExperienceChange(idx, "company", (e.target as HTMLInputElement).value)} />
                      <input type="text" placeholder="Start Date (e.g., Jan 2021)" className="bg-white/50 dark:bg-black/20 border-gray-300/50 dark:border-neutral-700/50 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none" value={exp.startDate} onChange={(e) => handleExperienceChange(idx, "startDate", (e.target as HTMLInputElement).value)} />
                      <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                        <input type="text" placeholder="End Date (e.g., May 2023)" className="sm:col-span-2 bg-white/50 dark:bg-black/20 border-gray-300/50 dark:border-neutral-700/50 rounded-md px-3 py-2 text-sm disabled:opacity-50 focus:ring-2 focus:ring-blue-400 outline-none" value={exp.endDate || ""} onChange={(e) => handleExperienceChange(idx, "endDate", (e.target as HTMLInputElement).value)} disabled={!!exp.current} />
                        <label className="flex items-center gap-2 text-xs select-none text-gray-700 dark:text-gray-300">
                          <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={!!exp.current} onChange={(e) => handleExperienceChange(idx, "current", (e.target as HTMLInputElement).checked)} />
                          <span>Current role</span>
                        </label>
                      </div>
                      <textarea placeholder={"2-3 bullet lines (use line breaks). Include quantifiable impact, e.g., 'Increased X by 25%'."} className="sm:col-span-2 bg-white/50 dark:bg-black/20 border-gray-300/50 dark:border-neutral-700/50 rounded-md px-3 py-2 text-sm min-h-[60px] focus:ring-2 focus:ring-blue-400 outline-none" value={exp.details} onChange={(e) => handleExperienceChange(idx, "details", (e.target as HTMLTextAreaElement).value)} />
                    </div>
                    <div className="mt-2 flex justify-end">
                      <button type="button" onClick={() => removeExperience(idx)} className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 font-medium">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <textarea name="education" placeholder="Education" className="mt-2 bg-white/50 dark:bg-black/20 border border-gray-300/50 dark:border-neutral-700/50 rounded-lg px-4 py-2 min-h-[60px] focus:ring-2 focus:ring-blue-400 outline-none" value={formData.education} onChange={handleFieldChange} />

            {/* Skills */}
            <div className="mt-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Skills</h3>
                <button type="button" onClick={addSkill} className="text-sm px-3 py-1.5 rounded-md bg-blue-100/80 text-blue-700 hover:bg-blue-200/80 border border-blue-200/80 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/80 dark:border-blue-800/80">Add Skill</button>
              </div>
              <div className="flex flex-col gap-3">
                {formData.skills.map((skill, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                    <input type="text" placeholder="Skill (e.g., React, SQL)" className="bg-white/50 dark:bg-black/20 border-gray-300/50 dark:border-neutral-700/50 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none" value={skill.name} onChange={(e) => updateSkill(idx, "name", (e.target as HTMLInputElement).value)} />
                    <div className="sm:col-span-2 flex items-center gap-3">
                      <input type="range" min={0} max={100} step={5} className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-neutral-700" value={skill.level} onChange={(e) => updateSkill(idx, "level", Number((e.target as HTMLInputElement).value))} />
                      <span className="text-xs w-10 text-right text-gray-600 dark:text-gray-400">{skill.level}%</span>
                      <button type="button" onClick={() => removeSkill(idx)} className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 font-medium">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Optional Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <textarea name="certifications" placeholder="Certifications (optional)" className="bg-white/50 dark:bg-black/20 border border-gray-300/50 dark:border-neutral-700/50 rounded-lg px-4 py-2 min-h-[40px] focus:ring-2 focus:ring-blue-400 outline-none" value={formData.certifications} onChange={handleFieldChange} />
              <textarea name="projects" placeholder="Projects (optional)" className="bg-white/50 dark:bg-black/20 border border-gray-300/50 dark:border-neutral-700/50 rounded-lg px-4 py-2 min-h-[40px] focus:ring-2 focus:ring-blue-400 outline-none" value={formData.projects} onChange={handleFieldChange} />
            </div>
            <div>
              <label className="block mb-1 font-medium text-sm text-gray-800 dark:text-gray-200">Profile Picture</label>
              <input type="file" name="profilePicture" accept="image/*" className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100/80 file:text-blue-700 hover:file:bg-blue-200/80 dark:file:bg-blue-900/50 dark:file:text-blue-300 dark:hover:file:bg-blue-900/80" onChange={handleFieldChange} />
            </div>
            <button type="submit" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-transform transform hover:scale-105 shadow-lg">Generate Resume</button>
          </form>
        </div>
      </div>
    </div>
  </div>
)}

{/* Show resume preview after form submit */}
{session && selectedTemplate && showPreview && (
  <div className="w-full mt-8 flex flex-col items-center">
    <TabsPreview
      formData={formData}
      onExport={async (tpl: string) => {
        setIsExporting(true);
        try {
          const payload = {
            selectedTemplate: tpl,
            ...formData,
          };
          const res = await fetch("/api/export-pdf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `resume-${tpl}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
          } else {
            alert("Failed to export PDF.");
          }
        } finally {
          setIsExporting(false);
        }
      }}
      onEdit={() => setShowPreview(false)}
      isExporting={isExporting}
    />
  </div>
)}


      </main>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex bg-black/40 items-center justify-center">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-8 w-full max-w-sm flex flex-col gap-4">
            <input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              className="border border-gray-300 dark:border-neutral-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="flex flex-col gap-2 mt-2">
              <label className="text-xs text-gray-600 dark:text-gray-300 font-medium">Quick Check</label>
              <div className="flex items-center justify-between text-sm bg-gray-100 dark:bg-neutral-800 px-3 py-2 rounded">
                <span className="font-mono select-none">{captchaQuestion}</span>
                <button type="button" onClick={generateCaptcha} className="text-xs text-blue-600 hover:underline">Refresh</button>
              </div>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Answer"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                className="border border-gray-300 dark:border-neutral-700 rounded px-3 py-2 text-sm"
              />
              {captchaError && <p className="text-xs text-red-600">{captchaError}</p>}
            </div>
            <button
              className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded transition flex items-center justify-center gap-2"
              onClick={handleLogin}
              disabled={isSendingLoginLink || !captchaInput}
            >
              {isSendingLoginLink ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                'Continue'
              )}
            </button>
            <button
              className="mt-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
              onClick={() => setShowLogin(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <footer className="mt-16 w-full max-w-6xl flex items-center justify-center gap-4 text-gray-500 dark:text-gray-400 text-xs py-8">
        <span className="text-sm">Made with ❤️ by Seva</span>
        <span className="text-sm">|</span>
        <Link href="/privacy" className="text-sm hover:underline">Privacy & Transparency</Link>
      </footer>
    </div>
  );
}