"use client";

import { AIRewriter } from "./AIRewriter";
import type { ResumeFormData, ExperienceItem, SkillItem } from "@/types/resume";

type ResumeFormProps = {
  formData: ResumeFormData;
  setFormData: React.Dispatch<React.SetStateAction<ResumeFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  score: number;
  badges: string[];
  challenges: Array<{ id: string; text: string; completed: boolean }>;
};

export default function ResumeForm({ formData, setFormData, onSubmit, score, badges, challenges }: ResumeFormProps) {
  // Handle form field changes
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

  return (
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
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Enter Your Details</h2>
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" name="name" placeholder="Full Name" className="bg-white/50 dark:bg-black/20 border border-gray-300/50 dark:border-neutral-700/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none" required value={formData.name} onChange={handleFieldChange} />
                <input type="email" name="email" placeholder="Email" className="bg-white/50 dark:bg-black/20 border border-gray-300/50 dark:border-neutral-700/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none" required value={formData.email} onChange={handleFieldChange} />
                <input type="tel" name="phone" placeholder="Phone Number" className="bg-white/50 dark:bg-black/20 border border-gray-300/50 dark:border-neutral-700/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none" value={formData.phone} onChange={handleFieldChange} />
                <input type="url" name="website" placeholder="Website URL" className="bg-white/50 dark:bg-black/20 border border-gray-300/50 dark:border-neutral-700/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none" value={formData.website} onChange={handleFieldChange} />
                <input type="url" name="linkedin" placeholder="LinkedIn URL" className="sm:col-span-2 bg-white/50 dark:bg-black/20 border border-gray-300/50 dark:border-neutral-700/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none" value={formData.linkedin} onChange={handleFieldChange} />
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
                  />
                </div>
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
  );
}