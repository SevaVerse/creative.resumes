
"use client";
import React, { useState } from "react";
import MinimalistTemplate from "./MinimalistTemplate";
import OnyxTemplate from "./OnyxTemplate";
import AwesomeCVTemplate from "./AwesomeCVTemplate";
import SubtleElegantTemplate from "./SubtleElegantTemplate";

type ExperienceItem = {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  details: string;
};

type SkillItem = { 
  name: string; 
  level: number;
};

export type ResumeData = {
  name: string;
  email: string;
  phone: string;
  website: string;
  linkedin: string;
  summary: string;
  experiences: ExperienceItem[];
  education: string;
  skills: SkillItem[];
  certifications?: string;
  projects?: string;
  profilePictureUrl?: string;
};

export type ResumeTemplate = {
  id: string;
  name: string;
  description: string;
  Component: React.ComponentType<ResumeData>;
};

const templates: ResumeTemplate[] = [
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Minimalist Professional Template: One-column with sidebar, clean lines, best for corporate roles.",
    Component: MinimalistTemplate,
  },
  {
    id: "onyx",
    name: "Onyx",
    description: "Onyx: Community template with a light-blue sidebar, skill meters, and timeline.",
    Component: OnyxTemplate,
  },
  {
    id: "awesomecv",
    name: "AwesomeCV",
    description: "AwesomeCV: Inspired by the popular open-source LaTeX/React template.",
    Component: AwesomeCVTemplate,
  },
  {
    id: "subtleelegant",
    name: "Subtle & Elegant",
    description: "Subtle & Elegant: Clean serif typography, soft grays, and refined layout for a sophisticated look.",
    Component: SubtleElegantTemplate,
  },
];

// Sample resume data for preview
const sampleData: ResumeData = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  website: "johndoe.com",
  linkedin: "linkedin.com/in/johndoe",
  summary: "Experienced software engineer with 5+ years in full-stack development. Passionate about building scalable applications and leading teams.",
  experiences: [
    {
      company: "Tech Company Inc.",
      title: "Senior Software Engineer",
      startDate: "2021-01",
      endDate: "Present",
      current: true,
      details: "• Led development of microservices architecture\n• Mentored junior developers\n• Improved system performance by 40%",
    },
    {
      company: "Startup Co.",
      title: "Software Engineer",
      startDate: "2019-03",
      endDate: "2020-12",
      current: false,
      details: "• Built RESTful APIs using Node.js\n• Implemented CI/CD pipelines\n• Collaborated with cross-functional teams",
    },
  ],
  education: "B.S. Computer Science - University Name, 2019",
  skills: [
    { name: "JavaScript", level: 90 },
    { name: "TypeScript", level: 85 },
    { name: "React", level: 90 },
    { name: "Next.js", level: 85 },
    { name: "Node.js", level: 80 },
    { name: "Python", level: 75 },
    { name: "AWS", level: 70 },
    { name: "Docker", level: 75 },
  ],
  certifications: "AWS Certified Solutions Architect",
  projects: "Open-source contributor to popular JavaScript libraries",
};

export default function ResumeTemplates({ onSelect }: { onSelect: (id: string) => void }) {
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

  const handlePreview = (templateId: string) => {
    setPreviewTemplate(templateId);
  };

  const handleSelectPreview = () => {
    if (previewTemplate) {
      onSelect(previewTemplate);
      setPreviewTemplate(null);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 mt-8">
        <h2 className="text-lg font-semibold text-foreground mb-2">Choose a Resume Template</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {templates.map((tpl) => (
            <div key={tpl.id} className="border border-gray-300 dark:border-neutral-700 rounded-lg p-4 hover:border-blue-400 dark:hover:border-blue-500 transition-all group">
              <div className="mb-3">
                <div className="font-bold text-foreground mb-1">{tpl.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{tpl.description}</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onSelect(tpl.id)}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
                >
                  Use Template
                </button>
                <button
                  onClick={() => handlePreview(tpl.id)}
                  className="px-4 py-2 border border-gray-300 dark:border-neutral-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md transition-all"
                  title="Preview template"
                >
                  👁️ Preview
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-6xl w-full h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-neutral-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {templates.find((t) => t.id === previewTemplate)?.name} Preview
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={handleSelectPreview}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
                >
                  Use This Template
                </button>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-neutral-800 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-neutral-950">
              <div className="max-w-4xl mx-auto bg-white dark:bg-neutral-900 shadow-lg">
                {(() => {
                  const template = templates.find((t) => t.id === previewTemplate);
                  if (!template) return null;
                  const { Component } = template;
                  return <Component {...sampleData} />;
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
