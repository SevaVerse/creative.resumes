
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
    </div>
  );
}
