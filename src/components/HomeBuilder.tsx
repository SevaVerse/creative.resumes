"use client";
import type { ExperienceItem, SkillItem } from "@/types/resume";

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

type LocalDraft = {
  selectedTemplate: string | null;
  formData: FormData;
  showPreview: boolean;
  savedAt: string;
};
type TabsPreviewProps = {
  formData: FormData;
  initialTemplate: string | null;
  onExport: (tpl: string) => void | Promise<void>;
  onEdit: () => void;
  onTemplateChange?: (tpl: string) => void;
  isExporting?: boolean;
};

function ExportButton({ onClick, isExporting, compact = false }: { onClick: () => void; isExporting: boolean; compact?: boolean }) {
  return (
    <button
      data-export-button
      className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold ${compact ? "px-4 py-2 text-sm" : "px-6 py-2"} rounded-lg transition print:hidden disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg`}
      onClick={onClick}
      disabled={isExporting}
      title="Download PDF (Ctrl+E)"
      type="button"
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
        "Download PDF"
      )}
    </button>
  );
}

// Tabbed full-size preview for all templates
function TabsPreview({ formData, initialTemplate, onExport, onEdit, onTemplateChange, isExporting = false }: TabsPreviewProps) {
  const [tab, setTab] = useState<string>(getTemplateMeta(initialTemplate).id);
  const tpl = getTemplateMeta(tab);
  const TemplateComponent = tpl.Component;
  const selectTab = (id: string) => {
    setTab(id);
    onTemplateChange?.(id);
  };
  return (
    <div className="z-10 w-full max-w-4xl">
      <div className="flex gap-1 mb-0 -translate-y-px overflow-x-auto">
        {TEMPLATE_LIST.map((t) => (
          <button
            key={t.id}
            className={`px-4 py-2.5 rounded-t-lg font-semibold text-sm whitespace-nowrap transition-all duration-200 ${tab === t.id ? "bg-white/80 dark:bg-neutral-900/80 border-gray-200/80 dark:border-neutral-800 border-t border-x" : "bg-white/40 dark:bg-neutral-950/40 text-gray-600 dark:text-gray-400 border-transparent border-b"}`}
            onClick={() => selectTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="p-6 md:p-8 rounded-xl rounded-tl-none border border-gray-200/80 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white ${tpl.badgeColor}`}>Carbon Score: {carbonScore(tpl)}/10</span>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
              🌍 ≈ {carbonFootprint(tpl).totalG.toFixed(1)} g CO₂e / printed page
            </span>
            <span title={`Higher score = less ink, less energy, more eco-friendly. Footprint per printed A4 page: paper ${carbonFootprint(tpl).paperG} g + printer energy ${carbonFootprint(tpl).energyG} g + ink/toner ${carbonFootprint(tpl).inkG} g (~${carbonFootprint(tpl).coveragePct}% coverage). Sharing the PDF digitally is ~0 g.`} className="text-gray-500 dark:text-gray-400 cursor-help text-lg">&#9432;</span>
          </div>
          <div className="flex gap-3">
            <button
              className="bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 font-semibold px-6 py-2 rounded-lg transition"
              onClick={onEdit}
            >
              Edit Details
            </button>
            <ExportButton onClick={() => onExport(tpl.id)} isExporting={isExporting} />
          </div>
        </div>
        <div className="bg-white dark:bg-white/90 p-4 rounded-lg shadow-inner">
          <TemplateComponent {...formData} />
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState, useRef, type ReactNode } from "react";
import Link from "next/link";
import Confetti from "react-confetti";

import ResumeTemplates from "../components/ResumeTemplates";
import ScaledPreview from "@/components/ScaledPreview";
import { NEW_TEMPLATES, TEMPLATE_COUNT, TEMPLATE_LIST, carbonFootprint, carbonScore, getTemplateMeta } from "@/components/templates/registry";
import { SAMPLE_FRESHER } from "@/components/templates/sampleData";
import BuyMeCoffee from "../components/BuyMeCoffee";
import { AIRewriter } from "../components/AIRewriter";
import { useAuth } from "@/components/AuthProvider";
import { ResumeSaveButton } from "@/components/ResumeSaveButton";
import { ShareResumeLink } from "@/components/ShareResumeLink";
import { ResumeLoader } from "@/components/ResumeLoader";
import { AutosaveIndicator, type SaveStatus } from "@/components/AutosaveIndicator";
import { scheduleAutoSave, cancelAutoSave } from "@/lib/resumesClient";
import { trackDownload, trackPageView } from "@/lib/analytics";
import { Onboarding } from "@/components/Onboarding";
import { ResumeProgress } from "@/components/ResumeProgress";
import ResumeUploader from "@/components/ResumeUploader";
import type { Resume } from "@/types/database";

// Future-proof features list for the homepage tile (easy to extend)
type Feature = { id: string; title: string; description: string; icon?: string }
const FEATURES: Feature[] = [
  { id: "privacy", title: "Privacy‑first", description: "No ads or trackers. Your data stays yours; PDFs render on your client only when you export.", icon: "🔒" },
  { id: "free", title: "Forever Free", description: "All core features at no cost—no trials, no paywalls.", icon: "🆓" },
  {
    id: "templates",
    title: `${TEMPLATE_COUNT} Pro Templates`,
    description: `Including ${NEW_TEMPLATES.length} new designs like ${NEW_TEMPLATES.slice(0, 4).map((t) => t.label.replace(/ \(.*\)$/, "")).join(", ")} and more. Switch any time with a live preview.`,
    icon: "🎨",
  },
  { id: "ats", title: "Free ATS Checker", description: "Score your resume against any job description. Runs in your browser — nothing is uploaded.", icon: "🎯" },
  { id: "jobs", title: "Monthly Fresher Jobs", description: "Entry-level government and private openings, refreshed every month on the Jobs board.", icon: "💼" },
  { id: "ai-rewrite", title: "AI Rewrite Capabilities", description: "Enhance your resume content with AI-powered text rewriting for professional summary, experience, and projects.", icon: "🤖" },
  { id: "carbon-calculator", title: "Carbon Footprint per Template", description: "Every template shows an eco score and an estimated g CO₂e per printed page, so you can pick a lighter design.", icon: "🌱" },
  { id: "structured-data", title: "Structured Experience + Skills", description: "Work history with dates, and slider-based skill levels.", icon: "🧩" },
  { id: "pdf", title: "PDF Export", description: "One‑click PDF export, optimized for fast and reliable results.", icon: "🖨️" },
  { id: "gamification", title: "Gamified Builder", description: "Score, badges, and challenges to guide better resumes.", icon: "🏅" },
];

// Base challenges for gamification
type Challenge = { id: string; text: string; completed: boolean }
const BASE_CHALLENGES: Challenge[] = [
  { id: "ats", text: "Complete all required fields for ATS compatibility", completed: false },
  { id: "achievements", text: "Include quantifiable achievements (numbers) in experience", completed: false },
  { id: "creativity", text: "Mention creative projects", completed: false },
];

const LOCAL_DRAFT_KEY = "rb_local_resume_draft_v1";

function createEmptyFormData(): FormData {
  return {
    name: "",
    email: "",
    phone: "",
    website: "",
    linkedin: "",
    summary: "",
    experiences: [
      { company: "", title: "", startDate: "", endDate: "", current: false, details: "" },
    ],
    education: "",
    skills: [
      { name: "", level: 60 },
    ],
    certifications: "",
    projects: "",
    profilePicture: undefined,
    profilePictureUrl: "",
  };
}

function toSerializableFormData(formData: FormData): FormData {
  return {
    ...formData,
    profilePicture: undefined,
  };
}

function hasDraftContent(selectedTemplate: string | null, formData: FormData): boolean {
  return Boolean(
    selectedTemplate ||
    formData.name.trim() ||
    formData.email.trim() ||
    formData.phone.trim() ||
    formData.website.trim() ||
    formData.linkedin.trim() ||
    formData.summary.trim() ||
    formData.education.trim() ||
    formData.certifications.trim() ||
    formData.projects.trim() ||
    formData.profilePictureUrl ||
    formData.experiences.some((experience) =>
      experience.company.trim() ||
      experience.title.trim() ||
      experience.startDate.trim() ||
      (experience.endDate || "").trim() ||
      experience.details.trim()
    ) ||
    formData.skills.some((skill) => skill.name.trim())
  );
}

/** Builder UI. `landingContent` is server-rendered SEO copy shown only on the landing view. */
export default function HomeBuilder({ landingContent }: { landingContent?: ReactNode }) {
  const { user, loading } = useAuth();
  const [showSupport, setShowSupport] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(createEmptyFormData);
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

  // Resume persistence state
  const [currentResumeId, setCurrentResumeId] = useState<string | undefined>(undefined);
  const [currentResumeName, setCurrentResumeName] = useState<string | undefined>(undefined);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | undefined>(undefined);
  const hasUnsavedChanges = useRef(false);
  const [hasLocalDraft, setHasLocalDraft] = useState(false);
  const [localDraftSavedAt, setLocalDraftSavedAt] = useState<string | null>(null);

  // Resume upload state
  const [showUploader, setShowUploader] = useState(false);

  // Initialize support message visibility from localStorage
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem('rb_support_dismissed_v1');
      if (!dismissed) setShowSupport(true);
    } catch {}
  }, []);

  // Deep link: /?template=campus opens the builder with that template (used by /jobs).
  // Stored in a ref so the local-draft restore below does not override it.
  const deepLinkTemplate = useRef<string | null>(null);
  useEffect(() => {
    try {
      const requested = new URLSearchParams(window.location.search).get("template");
      if (requested && TEMPLATE_LIST.some((t) => t.id === requested)) {
        deepLinkTemplate.current = requested;
        setSelectedTemplate(requested);
        setShowBuilder(true);
      }
    } catch {}
  }, []);

  // Fetch current metrics on mount and track page view
  useEffect(() => {
    const metricsDisabled =
      process.env.ENABLE_METRICS === "false" ||
      process.env.NEXT_PUBLIC_ENABLE_METRICS === "false";
    if (metricsDisabled) return;
    
    const fire = async () => {
      // Track page view (first-party, anonymous count)
      const key = "rb_page_hit_once";
      if (!sessionStorage.getItem(key)) {
        trackPageView();
        sessionStorage.setItem(key, "1");
      }
      
      // Fetch current metrics for display
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

  useEffect(() => {
    if (loading || user) return;

    try {
      const rawDraft = localStorage.getItem(LOCAL_DRAFT_KEY);
      if (!rawDraft) {
        setHasLocalDraft(false);
        setLocalDraftSavedAt(null);
        return;
      }

      const draft = JSON.parse(rawDraft) as Partial<LocalDraft>;
      if (!draft.formData) {
        localStorage.removeItem(LOCAL_DRAFT_KEY);
        setHasLocalDraft(false);
        setLocalDraftSavedAt(null);
        return;
      }

      setFormData({
        ...createEmptyFormData(),
        ...draft.formData,
        profilePicture: undefined,
        profilePictureUrl: draft.formData.profilePictureUrl || "",
      });
      const restoredTemplate = deepLinkTemplate.current
        ?? (typeof draft.selectedTemplate === "string" ? draft.selectedTemplate : null);
      setSelectedTemplate(restoredTemplate);
      setShowPreview(Boolean(draft.showPreview && draft.selectedTemplate && !deepLinkTemplate.current));
      setShowBuilder(Boolean(restoredTemplate));
      setHasLocalDraft(true);
      setLocalDraftSavedAt(typeof draft.savedAt === "string" ? draft.savedAt : null);
    } catch {
      localStorage.removeItem(LOCAL_DRAFT_KEY);
      setHasLocalDraft(false);
      setLocalDraftSavedAt(null);
    }
  }, [loading, user]);

  useEffect(() => {
    if (loading || user) return;

    try {
      if (!hasDraftContent(selectedTemplate, formData)) {
        localStorage.removeItem(LOCAL_DRAFT_KEY);
        setHasLocalDraft(false);
        setLocalDraftSavedAt(null);
        return;
      }

      const savedAt = new Date().toISOString();
      const draft: LocalDraft = {
        selectedTemplate,
        formData: toSerializableFormData(formData),
        showPreview,
        savedAt,
      };

      localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(draft));
      setHasLocalDraft(true);
      setLocalDraftSavedAt(savedAt);
    } catch {
      // Ignore local storage write failures.
    }
  }, [loading, user, selectedTemplate, formData, showPreview]);

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





  // Autosave logic - triggers 30 seconds after last change
  useEffect(() => {
    if (!user || !currentResumeId || !hasUnsavedChanges.current) {
      return;
    }

    setSaveStatus('saving');
    scheduleAutoSave(
      currentResumeId,
      formData,
      () => {
        setSaveStatus('saved');
        setLastSaved(new Date());
        hasUnsavedChanges.current = false;
      },
      30000 // 30 seconds
    );

    return () => cancelAutoSave();
  }, [formData, currentResumeId, user]);

  // Mark changes as unsaved when form data changes
  useEffect(() => {
    if (currentResumeId) {
      hasUnsavedChanges.current = true;
    }
  }, [currentResumeId, formData]);

  // Warn user about unsaved changes before leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges.current && currentResumeId) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentResumeId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (user && showPreview) {
          // Trigger save by clicking the save button if it exists
          const saveButton = document.querySelector('[data-save-button]') as HTMLButtonElement;
          if (saveButton) {
            saveButton.click();
          }
        }
      }
      
      // Ctrl+E or Cmd+E to export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        if (showPreview && selectedTemplate) {
          // Trigger export by clicking the download button if it exists
          const exportButton = document.querySelector('[data-export-button]') as HTMLButtonElement;
          if (exportButton) {
            exportButton.click();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user, showPreview, selectedTemplate]);

  // Handle save success
  const handleSaveSuccess = (resumeId: string, name: string) => {
    setCurrentResumeId(resumeId);
    setCurrentResumeName(name);
    setSaveStatus('saved');
    setLastSaved(new Date());
    hasUnsavedChanges.current = false;
  };

  // Handle load resume
  const handleLoadResume = (resume: Resume) => {
    setCurrentResumeId(resume.id);
    setCurrentResumeName(resume.name);
    setShowBuilder(true);
    setSelectedTemplate(resume.template);
    setFormData(resume.data as typeof formData);
    setSaveStatus('saved');
    setLastSaved(new Date(resume.last_edited_at));
    hasUnsavedChanges.current = false;
    setShowPreview(true); // Show preview after loading
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

  const startBuilder = () => {
    setShowBuilder(true);
  };

  const goToLanding = () => {
    setShowBuilder(false);
  };

  const clearLocalDraft = () => {
    try {
      localStorage.removeItem(LOCAL_DRAFT_KEY);
    } catch {
      // Ignore local storage cleanup failures.
    }

    setSelectedTemplate(null);
    setFormData(createEmptyFormData());
    setShowPreview(false);
    setShowBuilder(false);
    setHasLocalDraft(false);
    setLocalDraftSavedAt(null);
  };

  const fillWithExample = () => {
    if (hasDraftContent(null, formData) && !confirm("Replace your current details with example content?")) return;
    setFormData({ ...createEmptyFormData(), ...SAMPLE_FRESHER, certifications: SAMPLE_FRESHER.certifications || "", projects: SAMPLE_FRESHER.projects || "", profilePictureUrl: "" });
  };

  const exportPdf = async (tpl: string) => {
    setIsExporting(true);
    try {
      // Same-origin request: the Auth.js session cookie (if any) raises the rate limit.
      const res = await fetch("/api/export-pdf", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, profilePicture: undefined, selectedTemplate: tpl }),
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
        await trackDownload(tpl, currentResumeId);
      } else {
        const error = await res.json().catch(() => ({ error: "Failed to export PDF" }));
        alert(error.error || "Failed to export PDF.");
      }
    } finally {
      setIsExporting(false);
    }
  };

  const activeTemplate = getTemplateMeta(selectedTemplate);
  const LivePreviewComponent = activeTemplate.Component;

  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-black flex flex-col items-center py-6 px-4">
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={300} />}
      <Onboarding />
      <main className="w-full max-w-6xl flex flex-col items-center gap-6">
        {/* Trust + Metrics summary */}
        {showBuilder && (
        <div className="w-full flex items-center justify-end">
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
        )}
        {/* Landing page */}
        {!showBuilder && (
          <div className="z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-4 w-full max-w-6xl">
            {/* Left Column: Hero Text */}
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white !leading-tight">
                Build a <span className="text-blue-600">Professional</span> Resume <br /> in Minutes
              </h1>
              <p className="mt-3 text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto md:mx-0">
                Choose a template, fill in your details, and get a polished, professional resume ready for your next job application. No hidden fees, no data selling.
              </p>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto md:mx-0">
                👉 Start now without signing up. Sign in later to save and sync across devices.
              </p>
              <div className="mt-5 flex items-center gap-3 justify-center md:justify-start">
                <button
                  type="button"
                  onClick={startBuilder}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-transform hover:scale-105 shadow-lg"
                >
                  {hasLocalDraft ? "Continue Building" : "Start Building"}
                </button>
                {hasLocalDraft && (
                  <button
                    type="button"
                    onClick={clearLocalDraft}
                    className="px-4 py-3 rounded-lg border border-gray-300/80 text-gray-700 hover:bg-gray-100 dark:border-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-800 text-sm"
                  >
                    Start Fresh
                  </button>
                )}
              </div>
              {hasLocalDraft && (
                <p className="mt-3 text-xs text-amber-700 dark:text-amber-300 max-w-2xl mx-auto md:mx-0">
                  Draft found on this browser{localDraftSavedAt ? ` • last updated ${new Date(localDraftSavedAt).toLocaleString()}` : ""}.
                </p>
              )}
              <Link
                href="/jobs"
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-teal-300/80 bg-teal-50/80 px-4 py-2 text-sm font-medium text-teal-900 hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-900/30 dark:text-teal-100 dark:hover:bg-teal-900/50"
              >
                💼 New: Monthly entry-level jobs for freshers (Govt + Private) →
              </Link>
              <div className="mt-4 flex items-center gap-4 justify-center md:justify-start">
                <BuyMeCoffee />
                <Link href="/privacy" className="text-sm text-gray-600 dark:text-gray-300 hover:underline">Privacy</Link>
              </div>
              {showSupport && (
                <div className="mt-4 relative mx-auto md:mx-0 max-w-xl">
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
                {FEATURES.slice(0, 6).map((f) => (
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

        {/* Template selection */}
        {showBuilder && (
          <div className="w-full max-w-6xl flex justify-start">
            <button
              type="button"
              onClick={goToLanding}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-300 hover:underline"
            >
              ← Back to landing page
            </button>
          </div>
        )}

        {showBuilder && !selectedTemplate && (
          <ResumeTemplates onSelect={setSelectedTemplate} />
        )}

        {/* After template selection: show builder */}
        
      {showBuilder && selectedTemplate && !showPreview && (
  <div className="z-10 w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
    {/* Left: editor */}
    <div className="w-full p-6 md:p-8 rounded-xl border border-gray-200/80 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
      {/* Score + challenges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
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
        <div className="p-4 rounded-lg bg-white/50 dark:bg-black/20 border border-gray-200/50 dark:border-neutral-800/50">
          <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Challenges</span>
          <ul className="list-none text-xs mt-2 space-y-1">
            {challenges.map(c => (
              <li key={c.id} className={`flex items-center gap-2 ${c.completed ? "text-green-600 dark:text-green-400 font-medium" : "text-gray-600 dark:text-gray-400"}`}>
                <span>{c.completed ? "✅" : "⬜️"}</span>
                <span>{c.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Template switcher + quick start */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <label htmlFor="template-switcher" className="text-sm font-medium text-gray-700 dark:text-gray-300">Template</label>
        <select
          id="template-switcher"
          value={activeTemplate.id}
          onChange={(e) => setSelectedTemplate(e.target.value)}
          className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-200"
        >
          {TEMPLATE_LIST.map((t) => (
            <option key={t.id} value={t.id}>{t.label}{t.isNew ? " (new)" : ""}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setSelectedTemplate(null)}
          className="text-sm px-3 py-1.5 rounded-lg border border-gray-300/80 dark:border-neutral-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800"
        >
          Browse gallery
        </button>
        <button
          type="button"
          onClick={fillWithExample}
          className="text-sm px-3 py-1.5 rounded-lg border border-teal-300/80 dark:border-teal-800 text-teal-800 dark:text-teal-200 bg-teal-50/70 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/40"
          title="Fill the form with a sample fresher resume you can edit"
        >
          ✨ Start from a fresher example
        </button>
      </div>

      <p className="mb-4 text-xs text-amber-700 dark:text-amber-300">
        Tip: templates are designed for single-page resumes — keep details concise. Freshers: lead with education and projects.
      </p>

      <div>
          <ResumeProgress formData={formData} />
          <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Enter Your Details</h2>
              {user && (
                <div className="flex items-center gap-2 flex-wrap">
                  <AutosaveIndicator 
                    status={saveStatus} 
                    lastSaved={lastSaved} 
                    resumeName={currentResumeName}
                  />
                  <ResumeLoader 
                    onLoadResume={handleLoadResume}
                    currentResumeId={currentResumeId}
                  />
                  <ResumeSaveButton
                    currentResumeId={currentResumeId}
                    currentResumeName={currentResumeName}
                    template={selectedTemplate || 'minimalist'}
                    data={formData}
                    onSaveSuccess={handleSaveSuccess}
                  />
                  {currentResumeId && <ShareResumeLink resumeId={currentResumeId} />}
                </div>
              )}
              {!user && (
                <div className="flex items-center gap-2 flex-wrap justify-end text-xs">
                  <span className="rounded-full border border-amber-200/80 bg-amber-50/80 px-3 py-1.5 text-amber-800 dark:border-amber-800/60 dark:bg-amber-900/30 dark:text-amber-200">
                    Saved only in this browser{localDraftSavedAt ? ` • updated ${new Date(localDraftSavedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : ''}. Sign in to sync across devices.
                  </span>
                  {hasLocalDraft && (
                    <button
                      type="button"
                      onClick={clearLocalDraft}
                      className="rounded-lg border border-gray-300/80 px-3 py-1.5 text-gray-700 transition hover:bg-gray-100 dark:border-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-800"
                    >
                      Clear local draft
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {/* Resume Upload Section */}
            {user && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setShowUploader(!showUploader)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 dark:text-white">Import from Existing Resume</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Upload a PDF or DOCX file to auto-fill your details</p>
                    </div>
                  </div>
                  <svg className={`w-5 h-5 text-gray-500 transition-transform ${showUploader ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showUploader && (
                  <div className="mt-4 p-6 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg">
                    <ResumeUploader 
                      onResumeImported={(parsedResume) => {
                        setFormData({
                          name: parsedResume.name || formData.name,
                          email: parsedResume.email || formData.email,
                          phone: parsedResume.phone || formData.phone,
                          website: parsedResume.website || formData.website,
                          linkedin: parsedResume.linkedin || formData.linkedin,
                          summary: parsedResume.summary || formData.summary,
                          experiences: parsedResume.experiences?.length ? parsedResume.experiences : formData.experiences,
                          education: parsedResume.education || formData.education,
                          skills: parsedResume.skills?.length ? parsedResume.skills : formData.skills,
                          certifications: parsedResume.certifications || formData.certifications,
                          projects: parsedResume.projects || formData.projects,
                          profilePicture: formData.profilePicture,
                          profilePictureUrl: formData.profilePictureUrl,
                        });
                        hasUnsavedChanges.current = true;
                        setShowUploader(false);
                      }}
                    />
                  </div>
                )}
              </div>
            )}
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" name="name" placeholder="Full Name" className="bg-white/50 dark:bg-black/20 border border-gray-300/50 dark:border-neutral-700/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none" required value={formData.name} onChange={handleFieldChange} />
              <input type="email" name="email" placeholder="Email" className="bg-white/50 dark:bg-black/20 border border-gray-300/50 dark:border-neutral-700/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none" required value={formData.email} onChange={handleFieldChange} />
              <input type="tel" name="phone" placeholder="Phone Number" className="bg-white/50 dark:bg-black/20 border border-gray-300/50 dark:border-neutral-700/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none" value={formData.phone} onChange={handleFieldChange} />
              <input type="text" inputMode="url" autoComplete="url" name="website" placeholder="Website / GitHub (e.g. github.com/you)" className="bg-white/50 dark:bg-black/20 border border-gray-300/50 dark:border-neutral-700/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none" value={formData.website} onChange={handleFieldChange} />
              <input type="text" inputMode="url" name="linkedin" placeholder="LinkedIn (e.g. linkedin.com/in/you)" className="sm:col-span-2 bg-white/50 dark:bg-black/20 border border-gray-300/50 dark:border-neutral-700/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none" value={formData.linkedin} onChange={handleFieldChange} />
            </div>
            
            {/* Professional Summary */}
            <div className="mt-4">
              <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-2">Professional Summary</h3>
              <div className="space-y-2">
                <textarea name="summary" placeholder="Brief overview of your professional background and key strengths" className="w-full bg-white/50 dark:bg-black/20 border border-gray-300/50 dark:border-neutral-700/50 rounded-lg px-4 py-2 min-h-[80px] focus:ring-2 focus:ring-blue-400 outline-none" value={formData.summary} onChange={handleFieldChange} />
                <AIRewriter
                  text={formData.summary}
                  type="summary"
                  onRewrite={(rewritten) => setFormData(prev => ({ ...prev, summary: rewritten }))}
                  disabled={!user}
                />
              </div>
            </div>

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
                      <div className="sm:col-span-2 space-y-2">
                        <textarea placeholder={"2-3 bullet lines (use line breaks). Include quantifiable impact, e.g., 'Increased X by 25%'."} className="w-full bg-white/50 dark:bg-black/20 border-gray-300/50 dark:border-neutral-700/50 rounded-md px-3 py-2 text-sm min-h-[60px] focus:ring-2 focus:ring-blue-400 outline-none" value={exp.details} onChange={(e) => handleExperienceChange(idx, "details", (e.target as HTMLTextAreaElement).value)} />
                        <AIRewriter
                          text={exp.details}
                          type="experience"
                          onRewrite={(rewritten) => handleExperienceChange(idx, "details", rewritten)}
                          disabled={!user}
                        />
                      </div>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <button type="button" onClick={() => removeExperience(idx)} className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 font-medium">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="mt-4">
              <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-2">Education</h3>
              <textarea name="education" placeholder="Education" className="w-full bg-white/50 dark:bg-black/20 border border-gray-300/50 dark:border-neutral-700/50 rounded-lg px-4 py-2 min-h-[60px] focus:ring-2 focus:ring-blue-400 outline-none" value={formData.education} onChange={handleFieldChange} />
            </div>

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

            {/* Certifications */}
            <div className="mt-4">
              <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-2">Certifications</h3>
              <textarea name="certifications" placeholder="Certifications (optional)" className="w-full bg-white/50 dark:bg-black/20 border border-gray-300/50 dark:border-neutral-700/50 rounded-lg px-4 py-2 min-h-[40px] focus:ring-2 focus:ring-blue-400 outline-none" value={formData.certifications} onChange={handleFieldChange} />
            </div>

            {/* Projects */}
            <div className="mt-4">
              <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-2">Projects</h3>
              <div className="space-y-2">
                <textarea name="projects" placeholder="Projects (optional)" className="w-full bg-white/50 dark:bg-black/20 border border-gray-300/50 dark:border-neutral-700/50 rounded-lg px-4 py-2 min-h-[40px] focus:ring-2 focus:ring-blue-400 outline-none" value={formData.projects} onChange={handleFieldChange} />
                <AIRewriter
                  text={formData.projects}
                  type="projects"
                  onRewrite={(rewritten) => setFormData(prev => ({ ...prev, projects: rewritten }))}
                  disabled={!user}
                />
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium text-sm text-gray-800 dark:text-gray-200">Profile Picture</label>
              <input type="file" name="profilePicture" accept="image/*" className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100/80 file:text-blue-700 hover:file:bg-blue-200/80 dark:file:bg-blue-900/50 dark:file:text-blue-300 dark:hover:file:bg-blue-900/80" onChange={handleFieldChange} />
            </div>
            <button type="submit" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-transform transform hover:scale-105 shadow-lg">Preview All Templates &amp; Download</button>
          </form>
      </div>
    </div>

    {/* Right: live preview (desktop) */}
    <aside className="hidden lg:block lg:sticky lg:top-20" aria-label="Live preview">
      <div className="rounded-xl border border-gray-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Live preview · {activeTemplate.label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Updates as you type</p>
          </div>
          <ExportButton compact onClick={() => exportPdf(activeTemplate.id)} isExporting={isExporting} />
        </div>
        <div className="rounded-lg bg-gray-100 dark:bg-neutral-800 p-3 max-h-[calc(100vh-11rem)] overflow-y-auto">
          <div className="shadow-md">
            <ScaledPreview>
              <LivePreviewComponent {...formData} />
            </ScaledPreview>
          </div>
        </div>
      </div>
    </aside>
  </div>
)}

{/* Show resume preview after form submit */}
{showBuilder && selectedTemplate && showPreview && (
  <div className="w-full mt-8 flex flex-col items-center">
    <TabsPreview
      formData={formData}
      initialTemplate={selectedTemplate}
      onTemplateChange={setSelectedTemplate}
      onExport={exportPdf}
      onEdit={() => setShowPreview(false)}
      isExporting={isExporting}
    />
  </div>
)}

        {!showBuilder && landingContent}


      </main>


      <footer className="mt-16 w-full max-w-6xl flex flex-col items-center gap-3 text-gray-500 dark:text-gray-400 text-xs py-8">
        <div className="flex items-center flex-wrap gap-3 justify-center">
          <span className="text-sm">Made with ❤️ by Seva</span>
          <span className="hidden sm:inline">•</span>
          <Link href="/privacy" className="text-sm hover:underline">Privacy & Transparency</Link>
          <span className="hidden sm:inline">•</span>
          <Link href="/blog/" className="text-sm hover:underline">Blog</Link>
          <span className="hidden sm:inline">•</span>
          <Link href="/jobs/" className="text-sm hover:underline">Fresher Jobs</Link>
          <span className="hidden sm:inline">•</span>
          <Link href="/resume-templates/" className="text-sm hover:underline">Resume Templates</Link>
          <span className="hidden sm:inline">•</span>
          <Link href="/ats-checker/" className="text-sm hover:underline">ATS Checker</Link>
          <span className="hidden sm:inline">•</span>
          <Link href="/roast-my-resume/" className="text-sm hover:underline">Roast My Resume</Link>
          <span className="hidden sm:inline">•</span>
          <a href="https://github.com/SevaVerse/creative.resumes" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">Open source on GitHub</a>
        </div>
        {!showSupport && (
          <button
            onClick={() => { try { localStorage.removeItem('rb_support_dismissed_v1'); } catch {}; setShowSupport(true); }}
            className="text-[11px] underline decoration-dotted hover:text-blue-600 dark:hover:text-blue-300"
          >Show support message</button>
        )}
      </footer>
    </div>
  );
}