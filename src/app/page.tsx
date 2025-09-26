// Tabbed preview component for templates
"use client";
import type { ResumeFormData, ExperienceItem, SkillItem, TabsPreviewProps, Challenge } from "@/types/resume";
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
          <Suspense fallback={<div className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded h-96 w-full"></div>}>
            <TemplateComponent {...formData} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState, useRef, Suspense, lazy } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Lazy load heavy components
const Confetti = lazy(() => import("react-confetti"));
const MinimalistTemplate = lazy(() => import("../components/MinimalistTemplate"));
const OnyxTemplate = lazy(() => import("../components/OnyxTemplate"));
const AwesomeCVTemplate = lazy(() => import("../components/AwesomeCVTemplate"));
const SubtleElegantTemplate = lazy(() => import("../components/SubtleElegantTemplate"));
const ResumeForm = lazy(() => import("../components/ResumeForm"));

// Dynamic imports with no SSR for client-only components
const ResumeTemplates = dynamic(() => import("../components/ResumeTemplates"), {
  loading: () => <div className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg h-64 w-full"></div>,
});
const BuyMeCoffee = dynamic(() => import("../components/BuyMeCoffee"), { 
  ssr: false 
});
const TurnstileWrapper = dynamic(() => import("../components/Turnstile"), {
  loading: () => <div className="h-16 w-full bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>,
});

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
  { id: "ai-rewrite", title: "AI Rewrite Capabilities", description: "Enhance your resume content with AI-powered text rewriting for professional summary, experience, and projects.", icon: "🤖" },
  { id: "carbon-calculator", title: "Carbon Score Calculator", description: "Make eco-conscious choices with real-time carbon footprint scoring for each resume template.", icon: "🌱" },
  { id: "structured-data", title: "Structured Experience + Skills", description: "Work history with dates, and slider-based skill levels.", icon: "🧩" },
  { id: "pdf", title: "PDF Export", description: "One‑click PDF export, optimized for fast and reliable results.", icon: "🖨️" },
  { id: "gamification", title: "Gamified Builder", description: "Score, badges, and challenges to guide better resumes.", icon: "🏅" },
];

// Base challenges for gamification
const BASE_CHALLENGES: Challenge[] = [
  { id: "ats", text: "Complete all required fields for ATS compatibility", completed: false },
  { id: "achievements", text: "Include quantifiable achievements (numbers) in experience", completed: false },
  { id: "creativity", text: "Mention creative projects", completed: false },
];

export default function Home() {
  const [session, setSession] = useState<{ email: string } | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  // Turnstile state
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [turnstileError, setTurnstileError] = useState<string>("");
  const [isSendingLoginLink, setIsSendingLoginLink] = useState(false);
  // TODO(future): Add in-memory rate limiting for login link requests (env configurable)
  // TODO(future): Add aria-live polite region for turnstile errors & new challenge announcements
  // TODO(future): Persist last email (localStorage) with opt-in remember checkbox

  const handleTurnstileVerify = (token: string) => {
    setTurnstileToken(token);
    setTurnstileError("");
  };

  const handleTurnstileError = () => {
    setTurnstileError("Security verification failed. Please try again.");
    setTurnstileToken("");
  };

  useEffect(() => {
    if (showLogin) {
      setTurnstileToken("");
      setTurnstileError("");
    }
  }, [showLogin]);

  const handleLogin = async () => {
    if (isSendingLoginLink) return;
    const emailInput = document.getElementById('login-email') as HTMLInputElement | null;
    if (!emailInput || !emailInput.value) return;
    
    if (!turnstileToken) {
      setTurnstileError("Please complete the security verification.");
      return;
    }

    try {
      setIsSendingLoginLink(true);
      setTurnstileError("");

      // First verify the Turnstile token
      const verifyResponse = await fetch("/api/verify-turnstile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: turnstileToken }),
      });

      if (!verifyResponse.ok) {
        setTurnstileError("Security verification failed. Please try again.");
        return;
      }

      // If verification successful, send login link
      await fetch("/api/send-login-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.value }),
      });
      
      setShowLogin(false);
      alert("A login link has been sent to your email.");
    } catch {
      setTurnstileError("An error occurred. Please try again.");
    } finally {
      setIsSendingLoginLink(false);
    }
  };
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [formData, setFormData] = useState<ResumeFormData>({
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

  // Initialize session from localStorage (set by /verify page after token exchange)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('rb_email');
      if (stored && !session) {
        setSession({ email: stored });
      }
      const dismissed = localStorage.getItem('rb_support_dismissed_v1');
      if (!dismissed) setShowSupport(true);
    } catch {}
  }, [session]);

  // Fire a page hit and pull current metrics on mount
  useEffect(() => {
    const metricsDisabled =
      process.env.ENABLE_METRICS === "false" ||
      process.env.NEXT_PUBLIC_ENABLE_METRICS === "false";
    if (metricsDisabled) return;
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
    try { localStorage.removeItem('rb_email'); } catch {}
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
          <Link href="/privacy" className="hover:underline">Privacy</Link>
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
              <span className={`font-semibold transition ${pulseViews ? "animate-pulse text-blue-600 dark:text-blue-300 scale-110" : ""}`}>{metrics.page_hits}</span>
              <span className="hidden sm:inline text-[11px] text-gray-500 dark:text-gray-400">views</span>
            </span>
            <span className="h-4 w-px bg-gray-300/70 dark:bg-neutral-700/70" aria-hidden="true"></span>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden>⬇️</span>
              <span className={`font-semibold transition ${pulseDownloads ? "animate-pulse text-green-600 dark:text-green-300 scale-110" : ""}`}>{metrics.resume_downloads}</span>
              <span className="hidden sm:inline text-[11px] text-gray-500 dark:text-gray-400">downloads</span>
            </span>
          </div>
        </div>
        {/* Show hero section if not logged in */}
        {!session && (
          <div className="z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center mt-10 w-full max-w-6xl">
            {/* Left Column: Hero Text */}
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white !leading-tight">
                Build a <span className="text-blue-600">Professional</span> Resume <br /> in Minutes
              </h1>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto md:mx-0">
                Choose a template, fill in your details, and get a polished, professional resume ready for your next job application. No hidden fees, no data selling.
              </p>
              <div className="mt-8 flex items-center gap-4 justify-center md:justify-start">
                <button
                  aria-label="Get started building your resume"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-transform transform hover:scale-105"
                  onClick={() => setShowLogin(true)}
                >
                  Get Started for Free
                </button>
                <BuyMeCoffee />
                <Link href="/privacy" className="text-sm text-gray-600 dark:text-gray-300 hover:underline">Privacy</Link>
              </div>
              {showSupport && (
                <div className="mt-6 relative mx-auto md:mx-0 max-w-xl">
                  <div className="group p-4 rounded-lg border border-blue-200/60 dark:border-blue-800/50 bg-blue-50/70 dark:bg-blue-900/30 backdrop-blur supports-[backdrop-filter]:bg-blue-50/50 dark:supports-[backdrop-filter]:bg-blue-900/25 text-sm text-blue-900 dark:text-blue-200 leading-relaxed shadow-sm">
                    <p>
                      If this saves you time and you can afford it, a small contribution helps keep it <strong>free & privacy‑first</strong> for everyone.
                      <button
                        onClick={() => {
                          const el = document.querySelector('[data-bmc]') as HTMLElement | null;
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); else window.open('https://www.buymeacoffee.com/sevaverse', '_blank');
                        }}
                        className="ml-1 underline decoration-dotted font-medium hover:text-blue-700 dark:hover:text-blue-300"
                      >
                      </button>
                    </p>
                    <button
                      aria-label="Dismiss support message"
                      onClick={() => { try { localStorage.setItem('rb_support_dismissed_v1','1'); } catch {}; setShowSupport(false); }}
                      className="absolute -top-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow"
                    >×</button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Features */}
            <div className="p-6 rounded-xl border border-gray-200/80 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
              <div className="flex flex-col gap-5">
                {FEATURES.slice(0, 5).map((f) => (
                  <div key={f.id} className="flex items-start gap-4">
                    <div className="text-2xl mt-1">{f.icon ?? "✔️"}</div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">{f.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{f.description}</p>
                    </div>
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

        {/* After template selection: show form */}
        {session && selectedTemplate && !showPreview && (
          <Suspense fallback={<div className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg h-96 w-full max-w-4xl"></div>}>
            <ResumeForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleFormSubmit}
              score={score}
              badges={badges}
              challenges={challenges}
            />
          </Suspense>
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
              <label className="text-xs text-gray-600 dark:text-gray-300 font-medium">Security Check</label>
              <TurnstileWrapper
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
                onVerify={handleTurnstileVerify}
                onError={handleTurnstileError}
                theme="auto"
                size="compact"
              />
              {turnstileError && <p className="text-xs text-red-600">{turnstileError}</p>}
            </div>
            <button
              className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded transition flex items-center justify-center gap-2"
              onClick={handleLogin}
              disabled={isSendingLoginLink || !turnstileToken}
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
      <footer className="mt-16 w-full max-w-6xl flex flex-col items-center gap-3 text-gray-500 dark:text-gray-400 text-xs py-8">
        <div className="flex items-center flex-wrap gap-3 justify-center">
          <span className="text-sm">Made with ❤️ by Seva</span>
          <span className="hidden sm:inline">•</span>
          <Link href="/privacy" className="text-sm hover:underline">Privacy & Transparency</Link>
        </div>
        {!showSupport && !session && (
          <button
            onClick={() => { try { localStorage.removeItem('rb_support_dismissed_v1'); } catch {}; setShowSupport(true); }}
            className="text-[11px] underline decoration-dotted hover:text-blue-600 dark:hover:text-blue-300"
          >Show support message</button>
        )}
      </footer>
    </div>
  );
}