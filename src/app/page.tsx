"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Confetti from "react-confetti";

import MinimalistTemplate from "../components/MinimalistTemplate";
import OnyxTemplate from "../components/OnyxTemplate";
import AwesomeCVTemplate from "../components/AwesomeCVTemplate";
import ResumeTemplates from "../components/ResumeTemplates";

const BASE_CHALLENGES = [
  { id: "achievements", text: "Add 3 quantifiable achievements to boost your score by 20%.", completed: false },
  { id: "ats", text: "Make your resume ATS-friendly for a badge!", completed: false },
  { id: "creativity", text: "Add a creative project for a creativity badge!", completed: false },
];

// Future-proof features list for the homepage tile (easy to extend)
type Feature = { id: string; title: string; description: string; icon?: string };
const FEATURES: Feature[] = [
  { id: "privacy", title: "Privacy‑first", description: "No ads or trackers. Your data stays yours; PDFs render on your client only when you export.", icon: "🔒" },
  { id: "free", title: "Forever Free", description: "All core features at no cost—no trials, no paywalls.", icon: "🆓" },
  { id: "templates", title: "3 Pro Templates", description: "Minimalist, Onyx, and AwesomeCV—pick the style that fits you.", icon: "🎨" },
  { id: "structured-data", title: "Structured Experience + Skills", description: "Work history with dates, and slider-based skill levels.", icon: "🧩" },
  { id: "pdf", title: "PDF Export", description: "One‑click PDF export, optimized for fast and reliable results.", icon: "🖨️" },
  { id: "carbon", title: "Carbon Footprint Score", description: "Choose eco‑friendlier templates with lower print impact.", icon: "🌱" },
  { id: "gamification", title: "Gamified Builder", description: "Score, badges, and challenges to guide better resumes.", icon: "🏅" },
];

export default function Home() {
  type ExperienceItem = {
    company: string;
    title: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    details: string;
  };
  type SkillItem = { name: string; level: number };
  const [session, setSession] = useState<{ email: string } | null>(null);
  const [showLogin, setShowLogin] = useState(false);

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
        }
      } catch {}
    };
    fire();
  }, []);

  // Sync email into form once session established
  useEffect(() => {
    if (session?.email) {
      setFormData((prev) => ({ ...prev, email: prev.email || session.email }));
    }
  }, [session]);

  const handleLogin = async () => {
    const emailInput = document.getElementById('login-email') as HTMLInputElement;
    if (emailInput && emailInput.value) {
      await fetch("/api/send-login-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.value }),
      });
      setShowLogin(false);
      alert("A login link has been sent to your email (check smtp4dev).");
    }
  };

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

  const handleExportServerPDF = async () => {
    if (!selectedTemplate) return;
    const payload = {
      selectedTemplate: selectedTemplate as "minimalist" | "onyx" | "awesomecv",
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      website: formData.website,
      linkedin: formData.linkedin,
      summary: formData.summary,
      experiences: formData.experiences,
      education: formData.education,
      skills: formData.skills,
      certifications: formData.certifications,
      projects: formData.projects,
      profilePictureUrl: formData.profilePictureUrl,
    };
    const res = await fetch("/api/export-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      alert("Failed to export PDF on server.");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    // Increment resume download metric and refresh
    try {
      await fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "resume_download" }),
      });
      const m = await fetch("/api/metrics");
      if (m.ok) {
        const data = await m.json();
        setMetrics({ page_hits: data.page_hits ?? 0, resume_downloads: data.resume_downloads ?? 0 });
      }
    } catch {}
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 dark:from-neutral-900 dark:to-neutral-950 px-4 py-12">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={300} />}
      {/* Top bar with email after login and logout button */}
      {session && (
        <div className="fixed top-0 right-0 p-4 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 z-40">
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
        <div className="w-full mt-2 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/privacy"
              className="underline-offset-2 hover:underline text-blue-600 dark:text-blue-400"
              aria-label="Read our Privacy & Transparency policy"
            >
              Privacy & Transparency
            </Link>
          </div>
          <div className="flex gap-4">
            <span>Page Hits: <strong>{metrics.page_hits}</strong></span>
            <span>Resumes Downloaded: <strong>{metrics.resume_downloads}</strong></span>
          </div>
        </div>
        {/* Show hero section if not logged in */}
        {!session && (
          <>
            <div className="w-full mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Left: Getting Started (shifted left by layout; left-aligned on md+) */}
              <div className="text-left md:pr-8">
                <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                  Build Your Resume Effortlessly
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                  Choose a template, fill in your details, and get a professional resume in minutes.
                </p>
                <div className="mb-6 flex flex-wrap gap-2 text-sm">
                  <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-green-800">
                    <span>🔒</span> Privacy‑first
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-blue-800">
                    <span>🆓</span> Forever free
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    aria-label="Get started building your resume"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition"
                    onClick={() => setShowLogin(true)}
                  >
                    Get Started
                  </button>
                  <Link
                    href="/privacy"
                    className="text-sm underline-offset-2 hover:underline text-blue-700 dark:text-blue-300"
                    aria-label="Learn how we handle your data"
                  >
                    Privacy & Transparency
                  </Link>
                </div>
              </div>

              {/* Right: Responsive features tile */}
              <div className="group relative">
                <div className="rounded-2xl border border-gray-200/80 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur shadow-md p-6 transition-transform duration-200 ease-out will-change-transform group-hover:-translate-y-1 group-hover:shadow-xl">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">What you get</h2>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">Evolving</span>
                  </div>
                  <ul className="space-y-3">
                    {FEATURES.map((f) => (
                      <li key={f.id} className="flex items-start gap-3">
                        <span className="text-lg select-none leading-6">{f.icon ?? "✔️"}</span>
                        <div>
                          <div className="font-medium text-gray-800 dark:text-gray-200">{f.title}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{f.description}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 text-[11px] text-gray-500 dark:text-gray-400">
                    We add new features regularly—this tile updates automatically.
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* After login: show template selection */}
        {session && !selectedTemplate && (
          <ResumeTemplates onSelect={setSelectedTemplate} />
        )}

        {/* After template selection: show placeholder for form */}
        
{session && selectedTemplate && !showPreview && (
  <div className="w-full mt-8 flex flex-col items-center">
    {/* Gamified Resume Score & Challenges */}
    <div className="w-full max-w-lg mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-gray-700">Resume Strength Score</span>
        <span className="font-bold text-blue-600">{score}/100</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
        <div className="bg-blue-500 h-3 rounded-full transition-all" style={{ width: `${score}%` }}></div>
      </div>
      <div className="flex gap-2 flex-wrap mb-2">
        {badges.map(badge => (
          <span key={badge} className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full border border-green-300">🏅 {badge}</span>
        ))}
      </div>
      <div className="mt-2">
        <span className="font-semibold text-gray-700">Challenges:</span>
        <ul className="list-disc list-inside text-sm mt-1">
          {challenges.map(c => (
            <li key={c.id} className={c.completed ? "text-green-600 font-semibold" : "text-gray-600"}>
              {c.completed ? "✔ " : ""}{c.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
    <form onSubmit={handleFormSubmit} className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-xl shadow p-8 flex flex-col gap-4">
      <h2 className="text-2xl font-bold mb-4">Enter Your Details</h2>
      <input type="text" name="name" placeholder="Full Name" className="border border-gray-300 dark:border-neutral-700 rounded px-4 py-2" required value={formData.name} onChange={handleFieldChange} />
      <input type="email" name="email" placeholder="Email" className="border border-gray-300 dark:border-neutral-700 rounded px-4 py-2" required value={formData.email} onChange={handleFieldChange} />
      <input type="tel" name="phone" placeholder="Phone Number" className="border border-gray-300 dark:border-neutral-700 rounded px-4 py-2" value={formData.phone} onChange={handleFieldChange} />
      <input type="url" name="website" placeholder="Website URL" className="border border-gray-300 dark:border-neutral-700 rounded px-4 py-2" value={formData.website} onChange={handleFieldChange} />
      <input type="url" name="linkedin" placeholder="LinkedIn URL" className="border border-gray-300 dark:border-neutral-700 rounded px-4 py-2" value={formData.linkedin} onChange={handleFieldChange} />
      <textarea name="summary" placeholder="Professional Summary" className="border border-gray-300 dark:border-neutral-700 rounded px-4 py-2 min-h-[60px]" value={formData.summary} onChange={handleFieldChange} />

      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Work Experience</h3>
          <button type="button" onClick={addExperience} className="text-sm px-3 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200">Add Job</button>
        </div>
        <div className="flex flex-col gap-4">
          {formData.experiences.map((exp, idx) => (
            <div key={idx} className="p-4 border border-gray-200 dark:border-neutral-700 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Title (e.g., Senior Developer)"
                  className="border border-gray-300 dark:border-neutral-700 rounded px-3 py-2"
                  value={exp.title}
                  onChange={(e) => handleExperienceChange(idx, "title", (e.target as HTMLInputElement).value)}
                />
                <input
                  type="text"
                  placeholder="Company"
                  className="border border-gray-300 dark:border-neutral-700 rounded px-3 py-2"
                  value={exp.company}
                  onChange={(e) => handleExperienceChange(idx, "company", (e.target as HTMLInputElement).value)}
                />
                <input
                  type="text"
                  placeholder="Start Date (e.g., Jan 2021)"
                  className="border border-gray-300 dark:border-neutral-700 rounded px-3 py-2"
                  value={exp.startDate}
                  onChange={(e) => handleExperienceChange(idx, "startDate", (e.target as HTMLInputElement).value)}
                />
                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <input
                    type="text"
                    placeholder="End Date (e.g., May 2023)"
                    className="sm:col-span-2 border border-gray-300 dark:border-neutral-700 rounded px-3 py-2 disabled:opacity-50"
                    value={exp.endDate || ""}
                    onChange={(e) => handleExperienceChange(idx, "endDate", (e.target as HTMLInputElement).value)}
                    disabled={!!exp.current}
                  />
                  <label className="flex items-center gap-2 text-xs select-none">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={!!exp.current}
                      onChange={(e) => handleExperienceChange(idx, "current", (e.target as HTMLInputElement).checked)}
                    />
                    <span>Current role</span>
                  </label>
                </div>
                <textarea
                  placeholder={"2-3 bullet lines (use line breaks). Include quantifiable impact, e.g., 'Increased X by 25%'."}
                  className="sm:col-span-2 border border-gray-300 dark:border-neutral-700 rounded px-3 py-2 min-h-[60px]"
                  value={exp.details}
                  onChange={(e) => handleExperienceChange(idx, "details", (e.target as HTMLTextAreaElement).value)}
                />
              </div>
              <div className="mt-2 flex justify-end">
                <button type="button" onClick={() => removeExperience(idx)} className="text-sm text-red-600 hover:text-red-700">Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <textarea name="education" placeholder="Education" className="border border-gray-300 dark:border-neutral-700 rounded px-4 py-2 min-h-[60px]" value={formData.education} onChange={handleFieldChange} />
      <div className="mt-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Skills</h3>
          <button type="button" onClick={addSkill} className="text-sm px-3 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200">Add Skill</button>
        </div>
        <div className="flex flex-col gap-3">
          {formData.skills.map((skill, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <input
                type="text"
                placeholder="Skill (e.g., React, SQL)"
                className="border border-gray-300 dark:border-neutral-700 rounded px-3 py-2"
                value={skill.name}
                onChange={(e) => updateSkill(idx, "name", (e.target as HTMLInputElement).value)}
              />
              <div className="sm:col-span-2 flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  className="flex-1"
                  value={skill.level}
                  onChange={(e) => updateSkill(idx, "level", Number((e.target as HTMLInputElement).value))}
                />
                <span className="text-xs w-10 text-right text-gray-600">{skill.level}%</span>
                <button type="button" onClick={() => removeSkill(idx)} className="text-xs text-red-600 hover:text-red-700">Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <textarea name="certifications" placeholder="Certifications (optional)" className="border border-gray-300 dark:border-neutral-700 rounded px-4 py-2 min-h-[40px]" value={formData.certifications} onChange={handleFieldChange} />
      <textarea name="projects" placeholder="Projects (optional)" className="border border-gray-300 dark:border-neutral-700 rounded px-4 py-2 min-h-[40px]" value={formData.projects} onChange={handleFieldChange} />
      <div>
        <label className="block mb-1 font-medium">Profile Picture</label>
        <input type="file" name="profilePicture" accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" onChange={handleFieldChange} />
      </div>
      <button type="submit" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded transition">Generate Resume</button>
    </form>
  </div>
)}

{/* Show resume preview after form submit */}
{session && selectedTemplate && showPreview && (
  <div className="w-full mt-8 flex flex-col items-center">
    {/* Show all three template previews horizontally with carbon scores */}
    <div className="flex flex-col gap-6 md:flex-row md:gap-4 justify-center items-start w-full">
      {["minimalist", "onyx", "awesomecv"].map((tpl) => {
        let carbonScore = 0;
        let color = "";
        let label = "";
        if (tpl === "minimalist") {
          carbonScore = 10;
          color = "bg-green-500";
          label = "Minimalist";
        } else if (tpl === "onyx") {
          carbonScore = 6;
          color = "bg-yellow-400";
          label = "Onyx";
        } else if (tpl === "awesomecv") {
          carbonScore = 4;
          color = "bg-red-500";
          label = "AwesomeCV";
        }
        const TemplateComponent = tpl === "minimalist" ? MinimalistTemplate : tpl === "onyx" ? OnyxTemplate : AwesomeCVTemplate;
        return (
          <div key={tpl} className="flex flex-col items-center w-full max-w-lg border border-gray-200 rounded-xl shadow bg-white">
            <div className="mt-4 mb-2 flex items-center gap-2">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white ${color}`}>Carbon Footprint Score: {carbonScore}/10</span>
              <span title="Lower = less ink, less energy, more eco-friendly. Score is based on template color, graphics, and print area." className="text-gray-400 cursor-help text-lg">&#9432;</span>
            </div>
            <div className="mb-2 text-xs font-semibold text-gray-600">{label}</div>
            <div className="w-full p-4">
              <TemplateComponent
                name={formData.name}
                email={formData.email}
                phone={formData.phone}
                website={formData.website}
                linkedin={formData.linkedin}
                summary={formData.summary}
                experiences={formData.experiences}
                education={formData.education}
                skills={formData.skills}
                certifications={formData.certifications}
                projects={formData.projects}
                profilePictureUrl={formData.profilePictureUrl}
              />
            </div>
          </div>
        );
      })}
    </div>
    <button
      className="mt-6 bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 font-semibold px-6 py-2 rounded transition"
      onClick={() => setShowPreview(false)}
    >
      Edit Details
    </button>
    <button
  className="mt-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded transition print:hidden"
      onClick={handleExportServerPDF}
    >
  Export to PDF
    </button>
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
            <button
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition"
              onClick={handleLogin}
            >
              Continue
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
      <footer className="mt-16 text-gray-400 text-xs text-center">
        &copy; {new Date().getFullYear()} Resume Builder. All rights reserved.
      </footer>
    </div>
  );
}