
"use client";
import React from "react";

export type ResumeTemplate = {
  id: string;
  name: string;
  description: string;
};

const templates: ResumeTemplate[] = [
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Minimalist Professional Template: One-column with sidebar, clean lines, best for corporate roles.",
  },
  {
    id: "onyx",
    name: "Onyx",
  description: "Onyx: Community template with a light-blue sidebar, skill meters, and timeline.",
  },
  {
    id: "awesomecv",
    name: "AwesomeCV",
    description: "AwesomeCV: Inspired by the popular open-source LaTeX/React template.",
  },
  {
    id: "subtleelegant",
    name: "Subtle & Elegant",
    description: "Subtle & Elegant: Clean serif typography, soft grays, and refined layout for a sophisticated look.",
  },
];

export default function ResumeTemplates({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-4 mt-8">
      <h2 className="text-lg font-semibold text-foreground mb-2">Choose a Resume Template</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {templates.map((tpl) => (
          <button
            key={tpl.id}
            className="border border-gray-300 dark:border-neutral-700 rounded-lg p-4 text-left hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
            onClick={() => onSelect(tpl.id)}
          >
            <div className="font-bold text-foreground mb-1">{tpl.name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{tpl.description}</div>
          </button>
        ))}
      </div>

      {/* Privacy Disclaimer */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              🔒 Privacy-First Approach
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
              We prioritize your privacy above all else. Since we don&apos;t maintain a backend database, your login session is valid only for the current browser session. We don&apos;t store your email address or any personal data. Please ensure you download your resume within this session to preserve your work.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
